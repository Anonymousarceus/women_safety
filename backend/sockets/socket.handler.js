const jwt = require('jsonwebtoken');

const initSocketHandlers = (io) => {
  // Authentication middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.userId}`);

    // Join user's personal room
    socket.join(`user-${socket.userId}`);

    // Journey tracking room
    socket.on('join-journey', (journeyId) => {
      socket.join(`journey-${journeyId}`);
      console.log(`User ${socket.userId} joined journey room: ${journeyId}`);
    });

    socket.on('leave-journey', (journeyId) => {
      socket.leave(`journey-${journeyId}`);
    });

    // Live location broadcast for journey
    socket.on('location-update', (data) => {
      const { journeyId, latitude, longitude } = data;
      io.to(`journey-${journeyId}`).emit('location-update', {
        journeyId,
        latitude,
        longitude,
        userId: socket.userId,
        timestamp: new Date(),
      });
    });

    // SOS relay
    socket.on('sos-trigger', (data) => {
      io.emit('sos-alert', {
        ...data,
        userId: socket.userId,
        timestamp: new Date(),
      });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.userId}`);
    });
  });
};

module.exports = { initSocketHandlers };
