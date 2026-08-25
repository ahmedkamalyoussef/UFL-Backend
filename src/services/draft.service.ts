import { sequelize } from '../config/database';
import { Game, GameParticipant, DraftTurn, PlayerSelection, Player, Fixture, Team, User } from '../models';
import { socketServer } from '../infrastructure/socket/socket.server';
import { Op } from 'sequelize';

// Map of active 35s turn timeout timers
const turnTimersMap = new Map<string, NodeJS.Timeout>();

export class DraftService {
  /**
   * Initializes 8 Snake Draft turns for a 4-player game room
   * Order: P1 -> P2 -> P3 -> P4 -> P4 -> P3 -> P2 -> P1
   */
  public static async startDraft(gameId: string) {
    return await sequelize.transaction(async (t) => {
      const game = await Game.findByPk(gameId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!game) {
        throw { code: 'GAME_NOT_FOUND', message: 'Game room not found', statusCode: 404 };
      }

      if (game.status === 'CANCELLED') {
        throw { code: 'GAME_CANCELLED', message: 'Game is cancelled', statusCode: 400 };
      }

      const participants = await GameParticipant.findAll({
        where: { gameId },
        order: [['draftPosition', 'ASC']],
        transaction: t,
      });

      if (participants.length !== 4) {
        throw { code: 'INVALID_ROOM_CAPACITY', message: 'Game room must have exactly 4 participants to start draft', statusCode: 400 };
      }

      // Map Snake Draft turn order (P1, P2, P3, P4, P4, P3, P2, P1)
      const p1 = participants.find((p) => p.draftPosition === 1)!;
      const p2 = participants.find((p) => p.draftPosition === 2)!;
      const p3 = participants.find((p) => p.draftPosition === 3)!;
      const p4 = participants.find((p) => p.draftPosition === 4)!;

      const turnOrder = [
        { turnNumber: 1, round: 1, participant: p1 },
        { turnNumber: 2, round: 1, participant: p2 },
        { turnNumber: 3, round: 1, participant: p3 },
        { turnNumber: 4, round: 1, participant: p4 },
        { turnNumber: 5, round: 2, participant: p4 },
        { turnNumber: 6, round: 2, participant: p3 },
        { turnNumber: 7, round: 2, participant: p2 },
        { turnNumber: 8, round: 2, participant: p1 },
      ];

      // Clear existing turns for idempotency
      await DraftTurn.destroy({ where: { gameId }, transaction: t });

      const now = new Date();
      const firstTurnExpiresAt = new Date(now.getTime() + 35000); // 35 seconds timer

      const turns: DraftTurn[] = [];
      for (const item of turnOrder) {
        const turn = await DraftTurn.create(
          {
            gameId,
            turnNumber: item.turnNumber,
            round: item.round,
            participantId: item.participant.id,
            expiresAt: item.turnNumber === 1 ? firstTurnExpiresAt : now,
            status: 'PENDING',
          },
          { transaction: t }
        );
        turns.push(turn);
      }

      game.status = 'DRAFTING';
      game.currentDraftTurn = 1;
      await game.save({ transaction: t });

      // Schedule 35s server-side timeout worker for Turn 1
      this.scheduleTurnTimeout(gameId, 1, 35000);

      // Broadcast Socket.IO real-time events
      socketServer.broadcastToRoom(gameId, 'game:draft-start', {
        gameId,
        status: 'DRAFTING',
        currentTurn: 1,
        expiresAt: firstTurnExpiresAt.toISOString(),
      });

      socketServer.broadcastToRoom(gameId, 'game:draft-turn', {
        gameId,
        turnNumber: 1,
        round: 1,
        participantId: p1.id,
        userId: p1.userId,
        expiresAt: firstTurnExpiresAt.toISOString(),
      });

      return {
        gameId: game.id,
        status: game.status,
        currentDraftTurn: 1,
        firstTurnExpiresAt,
      };
    });
  }

  public static async getDraftState(gameId: string, userId?: string) {
    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: Fixture,
          as: 'fixture',
          include: [
            { model: Team, as: 'homeTeam' },
            { model: Team, as: 'awayTeam' },
          ],
        },
        {
          model: GameParticipant,
          as: 'participants',
          include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatarUrl'] }],
        },
        {
          model: DraftTurn,
          as: 'draftTurns',
          order: [['turnNumber', 'ASC']],
        },
        {
          model: PlayerSelection,
          as: 'playerSelections',
          include: [{ model: Player, as: 'player' }],
          order: [['turnNumber', 'ASC']],
        },
      ],
    });

    if (!game) {
      throw { code: 'GAME_NOT_FOUND', message: 'Game room not found', statusCode: 404 };
    }

    const fixture = game.get('fixture') as Fixture | null;
    const homeTeamId = fixture?.homeTeamId;
    const awayTeamId = fixture?.awayTeamId;

    // Taken player IDs in this game room
    const selections = (game.get('playerSelections') as PlayerSelection[]) || [];
    const takenPlayerIds = selections.map((s) => s.playerId);

    // Fetch available players from home & away teams
    const availablePlayers = await Player.findAll({
      where: {
        teamId: {
          [Op.in]: [homeTeamId, awayTeamId].filter((id): id is string => Boolean(id)),
        },
        id: {
          [Op.notIn]: takenPlayerIds.length > 0 ? takenPlayerIds : ['none'],
        },
      },
      order: [
        ['avgPoints', 'DESC'],
        ['id', 'ASC'],
      ],
    });

    const turns = (game.get('draftTurns') as DraftTurn[]) || [];
    const activeTurn = turns.find((t) => t.turnNumber === game.currentDraftTurn);

    return {
      gameId: game.id,
      status: game.status,
      currentDraftTurn: game.currentDraftTurn,
      activeTurn: activeTurn
        ? {
            turnNumber: activeTurn.turnNumber,
            round: activeTurn.round,
            participantId: activeTurn.participantId,
            expiresAt: activeTurn.expiresAt,
            status: activeTurn.status,
          }
        : null,
      turns: turns.map((t) => ({
        turnNumber: t.turnNumber,
        round: t.round,
        participantId: t.participantId,
        status: t.status,
        expiresAt: t.expiresAt,
      })),
      selections: selections.map((s) => {
        const p = s.get('player') as Player | null;
        return {
          id: s.id,
          turnNumber: s.turnNumber,
          participantId: s.participantId,
          playerId: s.playerId,
          playerName: p?.name || 'Player',
          playerPosition: p?.position,
          isAutoPick: s.isAutoPick,
          selectedAt: s.selectedAt,
        };
      }),
      availablePlayers: availablePlayers.map((p) => ({
        id: p.id,
        name: p.name,
        position: p.position,
        photoUrl: p.photoUrl,
        isStar: p.isStar,
        avgPoints: p.avgPoints,
      })),
    };
  }

  public static async selectPlayer(gameId: string, userId: string, playerId: string, turnNumber: number) {
    return await sequelize.transaction(async (t) => {
      // 1. Lock Game
      const game = await Game.findByPk(gameId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!game) {
        throw { code: 'GAME_NOT_FOUND', message: 'Game room not found', statusCode: 404 };
      }

      if (game.status !== 'DRAFTING') {
        throw { code: 'INVALID_GAME_STATE', message: 'Game room is not in DRAFTING mode', statusCode: 400 };
      }

      if (game.currentDraftTurn !== turnNumber) {
        throw { code: 'WRONG_TURN', message: `Current turn is #${game.currentDraftTurn}, not #${turnNumber}`, statusCode: 400 };
      }

      // 2. Lock & Verify active DraftTurn
      const draftTurn = await DraftTurn.findOne({
        where: { gameId, turnNumber },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!draftTurn || draftTurn.status !== 'PENDING') {
        throw { code: 'TURN_EXPIRED', message: 'This turn is no longer pending', statusCode: 400 };
      }

      if (new Date() > draftTurn.expiresAt) {
        throw { code: 'TURN_TIMEOUT', message: 'Turn has expired', statusCode: 400 };
      }

      // 3. Verify user is the assigned participant for this turn
      const participant = await GameParticipant.findOne({
        where: { id: draftTurn.participantId, userId },
        transaction: t,
      });

      if (!participant) {
        throw { code: 'WRONG_TURN', message: 'It is not your turn to draft', statusCode: 400 };
      }

      // 4. Lock & Verify Player Uniqueness in Room
      const existingSelection = await PlayerSelection.findOne({
        where: { gameId, playerId },
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (existingSelection) {
        throw { code: 'PLAYER_ALREADY_TAKEN', message: 'This player has already been selected by another participant', statusCode: 400 };
      }

      const player = await Player.findByPk(playerId, { transaction: t });
      if (!player) {
        throw { code: 'PLAYER_NOT_FOUND', message: 'Football player not found', statusCode: 404 };
      }

      // 5. Create PlayerSelection
      const selection = await PlayerSelection.create(
        {
          gameId,
          participantId: participant.id,
          playerId: player.id,
          turnNumber,
          isAutoPick: false,
        },
        { transaction: t }
      );

      // 6. Complete current turn
      draftTurn.status = 'COMPLETED';
      await draftTurn.save({ transaction: t });

      // Clear existing 35s timer for completed turn
      this.clearTurnTimeout(gameId, turnNumber);

      // 7. Advance Turn / Complete Draft
      let nextTurnExpiresAt: Date | null = null;

      if (turnNumber < 8) {
        const nextTurnNumber = turnNumber + 1;
        const nextTurn = await DraftTurn.findOne({
          where: { gameId, turnNumber: nextTurnNumber },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (nextTurn) {
          const now = new Date();
          nextTurnExpiresAt = new Date(now.getTime() + 35000);
          nextTurn.expiresAt = nextTurnExpiresAt;
          nextTurn.status = 'PENDING';
          await nextTurn.save({ transaction: t });
        }

        game.currentDraftTurn = nextTurnNumber;
        await game.save({ transaction: t });

        // Schedule timer for next turn
        this.scheduleTurnTimeout(gameId, nextTurnNumber, 35000);

        // Broadcast events
        socketServer.broadcastToRoom(gameId, 'game:player-selected', {
          gameId,
          turnNumber,
          participantId: participant.id,
          playerId: player.id,
          playerName: player.name,
          isAutoPick: false,
        });

        if (nextTurn && nextTurnExpiresAt) {
          socketServer.broadcastToRoom(gameId, 'game:draft-turn', {
            gameId,
            turnNumber: nextTurnNumber,
            round: nextTurn.round,
            participantId: nextTurn.participantId,
            expiresAt: nextTurnExpiresAt.toISOString(),
          });
        }
      } else {
        // 8th selection complete -> Draft Finished, Game becomes LIVE
        game.status = 'LIVE';
        await game.save({ transaction: t });

        socketServer.broadcastToRoom(gameId, 'game:player-selected', {
          gameId,
          turnNumber: 8,
          participantId: participant.id,
          playerId: player.id,
          playerName: player.name,
          isAutoPick: false,
        });

        socketServer.broadcastToRoom(gameId, 'game:draft-completed', {
          gameId,
          status: 'LIVE',
        });
      }

      return {
        selectionId: selection.id,
        gameId,
        turnNumber,
        playerId: player.id,
        playerName: player.name,
        isAutoPick: false,
        nextTurnNumber: turnNumber < 8 ? turnNumber + 1 : null,
      };
    });
  }

  /**
   * Automated server-side 35-second turn timeout handler & deterministic auto-pick
   */
  public static async handleTurnTimeout(gameId: string, turnNumber: number) {
    try {
      await sequelize.transaction(async (t) => {
        const game = await Game.findByPk(gameId, {
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!game || game.status !== 'DRAFTING' || game.currentDraftTurn !== turnNumber) {
          return;
        }

        const draftTurn = await DraftTurn.findOne({
          where: { gameId, turnNumber },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!draftTurn || draftTurn.status !== 'PENDING') {
          return; // Already completed manually or by another timeout worker
        }

        // Fetch taken players
        const selections = await PlayerSelection.findAll({
          where: { gameId },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });
        const takenPlayerIds = selections.map((s) => s.playerId);

        // Fetch fixture teams
        const fixture = await Fixture.findByPk(game.fixtureId, { transaction: t });
        const homeTeamId = fixture?.homeTeamId;
        const awayTeamId = fixture?.awayTeamId;

        // Query highest-rated available player (deterministic sorting by avgPoints DESC, id ASC)
        const autoPickPlayer = await Player.findOne({
          where: {
            teamId: { [Op.in]: [homeTeamId, awayTeamId].filter((id): id is string => Boolean(id)) },
            id: { [Op.notIn]: takenPlayerIds.length > 0 ? takenPlayerIds : ['none'] },
          },
          order: [
            ['avgPoints', 'DESC'],
            ['id', 'ASC'],
          ],
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (!autoPickPlayer) {
          // Failure recovery if no players remain
          draftTurn.status = 'TIMED_OUT';
          await draftTurn.save({ transaction: t });
          return;
        }

        // Create Auto-Pick Selection
        await PlayerSelection.create(
          {
            gameId,
            participantId: draftTurn.participantId,
            playerId: autoPickPlayer.id,
            turnNumber,
            isAutoPick: true,
          },
          { transaction: t }
        );

        draftTurn.status = 'TIMED_OUT';
        await draftTurn.save({ transaction: t });

        // Advance Turn / Complete Draft
        if (turnNumber < 8) {
          const nextTurnNumber = turnNumber + 1;
          const nextTurn = await DraftTurn.findOne({
            where: { gameId, turnNumber: nextTurnNumber },
            transaction: t,
            lock: t.LOCK.UPDATE,
          });

          const now = new Date();
          const nextTurnExpiresAt = new Date(now.getTime() + 35000);

          if (nextTurn) {
            nextTurn.expiresAt = nextTurnExpiresAt;
            nextTurn.status = 'PENDING';
            await nextTurn.save({ transaction: t });
          }

          game.currentDraftTurn = nextTurnNumber;
          await game.save({ transaction: t });

          this.scheduleTurnTimeout(gameId, nextTurnNumber, 35000);

          // Broadcast Socket.IO events
          socketServer.broadcastToRoom(gameId, 'game:auto-pick', {
            gameId,
            turnNumber,
            participantId: draftTurn.participantId,
            playerId: autoPickPlayer.id,
            playerName: autoPickPlayer.name,
            isAutoPick: true,
            reason: 'TURN_TIMEOUT',
          });

          if (nextTurn) {
            socketServer.broadcastToRoom(gameId, 'game:draft-turn', {
              gameId,
              turnNumber: nextTurnNumber,
              round: nextTurn.round,
              participantId: nextTurn.participantId,
              expiresAt: nextTurnExpiresAt.toISOString(),
            });
          }
        } else {
          game.status = 'LIVE';
          await game.save({ transaction: t });

          socketServer.broadcastToRoom(gameId, 'game:auto-pick', {
            gameId,
            turnNumber: 8,
            participantId: draftTurn.participantId,
            playerId: autoPickPlayer.id,
            playerName: autoPickPlayer.name,
            isAutoPick: true,
            reason: 'TURN_TIMEOUT',
          });

          socketServer.broadcastToRoom(gameId, 'game:draft-completed', {
            gameId,
            status: 'LIVE',
          });
        }
      });
    } catch (err) {
      console.error('[Draft Timeout Error]', err);
    }
  }

  private static scheduleTurnTimeout(gameId: string, turnNumber: number, delayMs: number) {
    this.clearTurnTimeout(gameId, turnNumber);
    const key = `${gameId}:${turnNumber}`;
    const timer = setTimeout(() => {
      this.handleTurnTimeout(gameId, turnNumber);
    }, delayMs);
    turnTimersMap.set(key, timer);
  }

  private static clearTurnTimeout(gameId: string, turnNumber: number) {
    const key = `${gameId}:${turnNumber}`;
    const existing = turnTimersMap.get(key);
    if (existing) {
      clearTimeout(existing);
      turnTimersMap.delete(key);
    }
  }
}
