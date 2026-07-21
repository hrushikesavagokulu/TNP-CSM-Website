'use strict';

const { Server } = require('socket.io');
const setupNotifySocket = require('./notify.socket');
const setupChatSocket   = require('./chat.socket');

let ioInstance = null;

function initSockets(httpServer) {
  if (ioInstance) {
    return ioInstance;
  }

  const io = new Server(httpServer, {
    path: '/socket.io/',
    cors: {
      origin: process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Setup per-namespace socket listeners on the SAME IO instance
  setupNotifySocket(io);
  setupChatSocket(io);

  ioInstance = io;
  console.log('[Sockets] Socket.io initialized with /notify and /chat namespaces.');
  return io;
}

function getIO() {
  return ioInstance;
}

module.exports = { initSockets, getIO };
