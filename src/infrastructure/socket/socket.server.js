"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketServer = void 0;
const socket_io_1 = require("socket.io");
const jwt_1 = require("../../utils/jwt");
const models_1 = require("../../models");
class SocketServer {
    io = null;
    initialize(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
            path: '/socket.io',
        });
        const gameNamespace = this.io.of('/game');
        // JWT Authentication Middleware for Socket.IO
        gameNamespace.use((socket, next) => {
            try {
                const token = socket.handshake.auth?.token ||
                    socket.handshake.headers?.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                const payload = (0, jwt_1.verifyToken)(token);
                socket.user = payload;
                next();
            }
            catch (err) {
                next(new Error('Invalid or expired token'));
            }
        });
        gameNamespace.on('connection', (socket) => {
            const userId = socket.user?.userId;
            console.log(`[Socket.IO] Client connected: socketId=${socket.id}, userId=${userId}`);
            if (userId) {
                // Automatically join private user room user:{userId}
                const userRoom = `user:${userId}`;
                socket.join(userRoom);
                console.log(`[Socket.IO] User ${userId} joined private room ${userRoom}`);
            }
            socket.on('game:join-room', async ({ gameId }) => {
                try {
                    if (!gameId || !userId)
                        return;
                    // Verify user is a participant in the game room
                    const participant = await models_1.GameParticipant.findOne({ where: { gameId, userId } });
                    if (!participant) {
                        socket.emit('error', { code: 'UNAUTHORIZED_ROOM_ACCESS', message: 'You are not a participant in this game room' });
                        return;
                    }
                    const roomName = `game:${gameId}`;
                    socket.join(roomName);
                    console.log(`[Socket.IO] User ${userId} joined room ${roomName}`);
                    socket.emit('game:joined-room', { gameId, success: true });
                }
                catch (err) {
                    console.error('[Socket.IO Join Room Error]', err);
                }
            });
            socket.on('game:leave-room', ({ gameId }) => {
                if (!gameId)
                    return;
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
    getIO() {
        if (!this.io) {
            throw new Error('Socket.IO has not been initialized!');
        }
        return this.io;
    }
    // Broadcast to game room
    broadcastToRoom(gameId, event, payload) {
        if (!this.io)
            return;
        this.io.of('/game').to(`game:${gameId}`).emit(event, payload);
    }
    // Send to private user room
    sendToUser(userId, event, payload) {
        if (!this.io)
            return;
        this.io.of('/game').to(`user:${userId}`).emit(event, payload);
    }
}
exports.socketServer = new SocketServer();
