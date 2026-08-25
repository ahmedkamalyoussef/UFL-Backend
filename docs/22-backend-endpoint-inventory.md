# UFL Backend — Complete Endpoint & System Inventory

This document maps the complete inventory of all 33 Express REST API routes, Socket.IO namespaces, middleware, models, business rules, and error codes implemented in the UFL Fantasy Football Backend platform.

---

## 1. Express Route & API Inventory

| Domain | HTTP Method | Full Path | Auth Requirement | Controller & Handler | Summary Description |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Public | `AuthController.register` | Register user, hashed password, JWT, +500 Coins welcome bonus. |
| **Auth** | `POST` | `/api/v1/auth/login` | Public | `AuthController.login` | Authenticate user credentials, return JWT token. |
| **User** | `GET` | `/api/v1/me` | Bearer JWT | `UserController.getProfile` | Get authenticated user profile, wallet balance, and season stats. |
| **User** | `GET` | `/api/v1/users/me/games` | Bearer JWT | `UserController.getGameHistory` | Get paginated game history for authenticated user. |
| **Wallet** | `GET` | `/api/v1/wallet` | Bearer JWT | `WalletController.getWallet` | Get user wallet balance & rewarded ad eligibility. |
| **Wallet** | `GET` | `/api/v1/wallet/transactions` | Bearer JWT | `WalletController.getTransactions` | Get paginated coin transactions history. |
| **Wallet** | `POST` | `/api/v1/wallet/claim-rewarded-ad` | Bearer JWT | `WalletController.claimRewardedAd` | Claim +500 Coins when balance == 0 (`REWARDED_AD`). |
| **Football** | `GET` | `/api/v1/competitions` | Public | `FootballController.getCompetitions` | List supported competitions (`EPL`, `LALIGA`, `SPL`, `UCL`, `ACL`). |
| **Football** | `GET` | `/api/v1/matches` | Public | `FootballController.getMatches` | List fixtures by competition or match status (`SCHEDULED`, `LIVE`, `FINISHED`). |
| **Football** | `GET` | `/api/v1/matches/:id` | Public | `FootballController.getMatchById` | Get match details and open game rooms. |
| **Game** | `GET` | `/api/v1/games` | Public | `GameController.getGames` | List game rooms with optional fixtureId & status filters. |
| **Game** | `POST` | `/api/v1/games` | Public/Admin | `GameController.createGame` | Create a new 4-player game room for a fixture. |
| **Game** | `GET` | `/api/v1/games/:id` | Public | `GameController.getGameById` | Get game room details and participant slots. |
| **Game** | `POST` | `/api/v1/games/:id/join` | Bearer JWT | `GameController.joinGame` | Atomic game room join (500 Coins entry fee). |
| **Game** | `POST` | `/api/v1/games/:id/cancel` | Public/Admin | `GameController.cancelGame` | Cancel game room & issue +500 Coins refund (`GAME_REFUND`). |
| **Draft** | `GET` | `/api/v1/games/:id/draft` | Bearer JWT | `DraftController.getDraftState` | Get draft state, selections, turn timer, available players. |
| **Draft** | `POST` | `/api/v1/games/:id/draft/start` | Public/Admin | `DraftController.startDraft` | Initialize 8-turn Snake Draft sequence. |
| **Draft** | `POST` | `/api/v1/games/:id/draft/select` | Bearer JWT | `DraftController.selectPlayer` | Select player during active turn. |
| **Scoring** | `GET` | `/api/v1/games/:id/ranking` | Bearer JWT | `ScoringController.getGameRankings` | Get live fantasy points ranking for room participants. |
| **Scoring** | `GET` | `/api/v1/games/:id/players/:playerId/points` | Bearer JWT | `ScoringController.getPlayerPointsBreakdown` | Get fantasy scoring breakdown for selected player. |
| **Settlement**| `GET` | `/api/v1/games/:id/result` | Bearer JWT | `SettlementController.getGameResult` | Get final game room settlement results & rewards. |
| **Settlement**| `POST` | `/api/v1/games/:id/settle` | Public/Admin | `SettlementController.settleGame` | Finalize game room settlement & distribute rewards/RP. |
| **Sync** | `POST` | `/api/v1/sync/run` | Admin Secret | `SyncController.triggerSync` | Trigger manual football data sync and unfilled room refunds. |
| **Ranking** | `GET` | `/api/v1/ranking` | Public | `RankingController.getGlobalLeaderboard` | Get active season global RP leaderboard. |
| **Ranking** | `GET` | `/api/v1/ranking/me` | Bearer JWT | `RankingController.getCurrentUserRank` | Get authenticated user rank and RP standings. |
| **Seasons** | `GET` | `/api/v1/seasons` | Public | `RankingController.getSeasons` | List all historical and active seasons. |
| **Seasons** | `GET` | `/api/v1/seasons/:seasonId/ranking` | Public | `RankingController.getSeasonLeaderboard` | Get historical leaderboard for specific season. |
| **Seasons** | `POST` | `/api/v1/seasons` | Admin Secret | `RankingController.createSeason` | Create new football season. |
| **Seasons** | `POST` | `/api/v1/seasons/:seasonId/activate` | Admin Secret | `RankingController.activateSeason` | Activate target season as the current global active season. |
| **Notifs** | `GET` | `/api/v1/notifications` | Bearer JWT | `NotificationController.getUserNotifications` | Get user notifications with unread count. |
| **Notifs** | `PATCH` | `/api/v1/notifications/read-all` | Bearer JWT | `NotificationController.markAllAsRead` | Mark all notifications as read for current user. |
| **Notifs** | `PATCH` | `/api/v1/notifications/:id/read` | Bearer JWT | `NotificationController.markAsRead` | Mark specific notification as read. |
| **Health** | `GET` | `/health` | Public | Inline handler | Health check returning `{ status: "ok" }`. |

---

## 2. Middleware & Guard Architecture

1. **`authenticate` (`src/middleware/auth.middleware.ts`)**:
   - Parses `Authorization: Bearer <JWT_TOKEN>` header.
   - Verifies JWT using `JWT_SECRET`.
   - Attaches decoded user payload (`req.user = { id, email, username }`) to Request object.
   - Rejects unauthenticated or malformed requests with `HTTP 401 UNAUTHORIZED`.
2. **`adminGuard` (Inline in `ranking.routes.ts` & `sync.routes.ts`)**:
   - Checks `x-admin-key` header against `ufl-dev-admin-secret` or verifies `NODE_ENV === 'development'`.
   - Rejects unauthorized requests with `HTTP 403 FORBIDDEN`.
3. **`errorHandler` (`src/middleware/error.middleware.ts`)**:
   - Catches all unhandled controller exceptions.
   - Formats error payloads to standard JSON structure `{ success: false, error: { code, message } }`.
   - Prevents stack trace and SQL query leaks.

---

## 3. Socket.IO Namespaces & Events Architecture

- **Namespace**: `/game`
- **Path**: `/socket.io`
- **Handshake Authentication**: Verifies JWT token passed in `auth: { token: 'JWT' }`.
- **Rooms**:
  - `user:{userId}`: Private user room automatically joined upon connection.
  - `game:{gameId}`: Game room joined via `game:join-room` event.
- **Server Events**: `game:draft-start`, `game:draft-turn`, `game:player-selected`, `game:auto-pick`, `game:draft-completed`, `game:live-event`, `game:ranking`, `game:finished`, `ranking:updated`, `notification:new`.

---

## 4. Database Models & Schema

1. `User`: User profile credentials & career statistics.
2. `Wallet`: Balance & career coins tracking (`User.hasOne(Wallet)`).
3. `WalletTransaction`: Financial audit trail (`Wallet.hasMany(WalletTransaction)`).
4. `Competition`: Supported leagues (`EPL`, `LALIGA`, `SPL`, `UCL`, `ACL`).
5. `Team`: Football clubs attached to competitions.
6. `Fixture`: Football matches with status (`SCHEDULED`, `LIVE`, `FINISHED`, `CANCELLED`, `POSTPONED`, `SUSPENDED`).
7. `Game`: 4-player fantasy contest rooms (`Fixture.hasMany(Game)`).
8. `GameParticipant`: User slots in game rooms (`Game.hasMany(GameParticipant)`).
9. `Player`: Real football players.
10. `PlayerSelection`: Draft selections per room participant.
11. `DraftTurn`: Turn state tracking.
12. `FixtureEvent`: Real match events (goals, assists, cards, saves).
13. `PlayerMatchStatistic`: Calculated player performance stats.
14. `Season`: Season duration & active status (`ACTIVE`, `COMPLETED`).
15. `GlobalRanking`: Season-scoped user Ranking Points (`Season.hasMany(GlobalRanking)`).
16. `Notification`: User notifications (`User.hasMany(Notification)`).

---

## 5. Complete Standard Error Code Matrix

- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `INVALID_CREDENTIALS` (401)
- `EMAIL_ALREADY_EXISTS` (409)
- `INSUFFICIENT_FUNDS` (400)
- `NOT_ELIGIBLE` (400)
- `ROOM_FULL` (400)
- `ALREADY_JOINED` (400)
- `GAME_FINISHED` (400)
- `GAME_CANCELLED` (400)
- `NOT_YOUR_TURN` (400)
- `PLAYER_ALREADY_TAKEN` (400)
- `GAME_NOT_FOUND` (404)
- `FIXTURE_NOT_FINISHED` (400)
- `NOTIFICATION_NOT_FOUND` (404)
- `SEASON_NOT_FOUND` (404)
- `USER_NOT_FOUND` (404)
- `INVALID_INPUT` (400)
