import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken, JwtPayload } from '../../utils/jwt';
import { GameParticipant } from '../../models';

export interface AuthenticatedSocket extends Socket {
  user?: JwtPayload;
}

class SocketServer {
  private io: Server | null = null;

  public initialize(httpServer: HttpServer): Server {
    this.io = new Server(httpServer, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
      path: '/socket.io',
    });

    const gameNamespace = this.io.of('/game');

    // JWT Authentication Middleware for Socket.IO
    gameNamespace.use((socket: AuthenticatedSocket, next) => {
      try {
        const token =
          socket.handshake.auth?.token ||
          socket.handshake.headers?.authorization?.replace('Bearer ', '');

        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const payload = verifyToken(token);
        socket.user = payload;
        next();
      } catch (err) {
        next(new Error('Invalid or expired token'));
      }
    });

    gameNamespace.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.user?.userId;
      console.log(`[Socket.IO] Client connected: socketId=${socket.id}, userId=${userId}`);

      if (userId) {
        // Automatically join private user room user:{userId}
        const userRoom = `user:${userId}`;
        socket.join(userRoom);
        console.log(`[Socket.IO] User ${userId} joined private room ${userRoom}`);
      }

      socket.on('game:join-room', async ({ gameId }: { gameId: string }) => {
        try {
          if (!gameId || !userId) return;

          // Verify user is a participant in the game room
          const participant = await GameParticipant.findOne({ where: { gameId, userId } });
          if (!participant) {
            socket.emit('error', { code: 'UNAUTHORIZED_ROOM_ACCESS', message: 'You are not a participant in this game room' });
            return;
          }

          const roomName = `game:${gameId}`;
          socket.join(roomName);
          console.log(`[Socket.IO] User ${userId} joined room ${roomName}`);
          socket.emit('game:joined-room', { gameId, success: true });
        } catch (err) {
          console.error('[Socket.IO Join Room Error]', err);
        }
      });

      socket.on('game:leave-room', ({ gameId }: { gameId: string }) => {
        if (!gameId) return;
        const roomName = `game:${gameId}`;
        socket.leave(roomName);
        console.log(`[Socket.IO] User ${userId} left room ${roomName}`);
      });

      socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: socketId=${socket.id}`);
      });
    });

    return this.io;
  }

  public getIO(): Server {
    if (!this.io) {
      throw new Error('Socket.IO has not been initialized!');
    }
    return this.io;
  }

  // Broadcast to game room
  public broadcastToRoom(gameId: string, event: string, payload: any): void {
    if (!this.io) return;
    this.io.of('/game').to(`game:${gameId}`).emit(event, payload);
  }

  // Send to private user room
  public sendToUser(userId: string, event: string, payload: any): void {
    if (!this.io) return;
    this.io.of('/game').to(`user:${userId}`).emit(event, payload);
  }
}

export const socketServer = new SocketServer();
