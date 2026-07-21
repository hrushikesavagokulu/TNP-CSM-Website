'use strict';

const authenticateSocket = require('./authenticateSocket');

function setupNotifySocket(io) {
  const notifyNs = io.of('/notify');

  notifyNs.use(authenticateSocket);

  notifyNs.on('connection', (socket) => {
    console.log(`[Socket/Notify] User connected: ${socket.user?.name} (${socket.id})`);

    // Join personal user room for badge & unread updates
    socket.join(`user:${socket.user._id}`);

    socket.on('disconnect', () => {
      console.log(`[Socket/Notify] User disconnected: ${socket.id}`);
    });
  });
}

module.exports = setupNotifySocket;
