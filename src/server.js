"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const socket_server_1 = require("./infrastructure/socket/socket.server");
const PORT = env_1.env.PORT;
const server = app_1.default.listen(PORT, () => {
    console.log(`[UFL Backend] Server running on http://localhost:${PORT} in ${env_1.env.NODE_ENV} mode`);
});
socket_server_1.socketServer.initialize(server);
exports.default = server;
