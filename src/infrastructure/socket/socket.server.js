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

        const authMiddleware = (socket, next) => {
            try {
                const token = socket.handshake.auth?.token ||
                    socket.handshake.headers?.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                const payload = (0, jwt_1.verifyToken)(token);
                socket.user = payload;
                next();
            } catch (err) {
                next(new Error('Invalid or expired token'));
            }
        };

        const setupSocketEvents = (socket, namespaceName) => {
            const userId = socket.user?.userId;
            console.log(`[Socket.IO ${namespaceName}] Client connected: socketId=${socket.id}, userId=${userId}`);

            if (userId) {
                const userRoom = `user:${userId}`;
                socket.join(userRoom);
            }

            const handleJoinRoom = async (rawPayload) => {
                try {
                    const gameId = (typeof rawPayload === 'string')
                        ? rawPayload
                        : (rawPayload?.gameId || rawPayload?.room);

                    if (!gameId || !userId) return;

                    const participant = await models_1.GameParticipant.findOne({ where: { gameId, userId } });
                    if (!participant) {
                        socket.emit('error', { code: 'UNAUTHORIZED_ROOM_ACCESS', message: 'You are not a participant in this game room' });
                        return;
                    }

                    const roomName = `game:${gameId}`;
                    socket.join(roomName);
                    console.log(`[Socket.IO ${namespaceName}] User ${userId} joined room ${roomName}`);
                    socket.emit('game:joined-room', { gameId, success: true });
                    socket.emit('joined:room', { gameId, success: true });
                } catch (err) {
                    console.error('[Socket.IO Join Room Error]', err);
                }
            };

            socket.on('game:join-room', handleJoinRoom);
            socket.on('join:room', handleJoinRoom);
            socket.on('join', handleJoinRoom);

            socket.on('game:leave-room', ({ gameId }) => {
                if (!gameId) return;
                const roomName = `game:${gameId}`;
                socket.leave(roomName);
            });

            socket.on('disconnect', () => {
                console.log(`[Socket.IO ${namespaceName}] Client disconnected: socketId=${socket.id}`);
            });
        };

        // 1. Root namespace '/'
        this.io.use(authMiddleware);
        this.io.on('connection', (socket) => setupSocketEvents(socket, 'ROOT'));

        // 2. '/game' namespace
        const gameNamespace = this.io.of('/game');
        gameNamespace.use(authMiddleware);
        gameNamespace.on('connection', (socket) => setupSocketEvents(socket, '/game'));

        return this.io;
    }

    getIO() {
        if (!this.io) {
            throw new Error('Socket.IO has not been initialized!');
        }
        return this.io;
    }

    // Broadcast to game room in both namespaces
    broadcastToRoom(gameId, event, payload) {
        if (!this.io) return;
        const roomName = `game:${gameId}`;
        this.io.of('/game').to(roomName).emit(event, payload);
        this.io.to(roomName).emit(event, payload);
    }

    // Send to private user room in both namespaces
    sendToUser(userId, event, payload) {
        if (!this.io) return;
        const userRoom = `user:${userId}`;
        this.io.of('/game').to(userRoom).emit(event, payload);
        this.io.to(userRoom).emit(event, payload);
    }
}

exports.socketServer = new SocketServer();
