'use strict';

const authenticateSocket = require('./authenticateSocket');

function setupChatSocket(io) {
  const chatNs = io.of('/chat');

  chatNs.use(authenticateSocket);

  chatNs.on('connection', (socket) => {
    console.log(`[Socket/Chat] User connected: ${socket.user?.name} (${socket.user?.rollNo || 'Admin'}) [Socket: ${socket.id}]`);

    // Listen for client joining a specific chat space room
    socket.on('join-space', (data) => {
      const spaceId = typeof data === 'object' ? data.spaceId : data;
      if (spaceId) {
        socket.join(spaceId);
        console.log(`[Socket/Chat] ${socket.user?.name} joined room space: ${spaceId}`);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket/Chat] User disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupChatSocket;
