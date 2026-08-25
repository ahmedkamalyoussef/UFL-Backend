import app from './app';
import { env } from './config/env';
import { socketServer } from './infrastructure/socket/socket.server';

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`[UFL Backend] Server running on http://localhost:${PORT} in ${env.NODE_ENV} mode`);
});

socketServer.initialize(server);

export default server;
