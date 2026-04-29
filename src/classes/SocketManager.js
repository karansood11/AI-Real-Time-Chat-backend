'use strict';

const userStore = require('./UserStore');

const MAX_HISTORY = 50;

class SocketManager {
  constructor(io) {
    this._io = io;
    this._messages = []; // { id, userId, name, picture, text, timestamp }
    this._init();
  }

  _init() {
    this._io.use(this._authenticate.bind(this));
    this._io.on('connection', (socket) => this._onConnection(socket));
  }

  _authenticate(socket, next) {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
      socket.userId = decoded.sub || decoded.id || decoded.userId;
      socket.userName = decoded.name;
      socket.userPicture = decoded.picture;
      socket.userEmail = decoded.email;

      // Upsert user in store
      userStore.upsert(socket.userId, {
        name: socket.userName,
        email: socket.userEmail,
        picture: socket.userPicture,
      });

      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  }

  _onConnection(socket) {
    const { userId, userName, userPicture } = socket;
    userStore.setSocketId(userId, socket.id);

    // Send last messages to new user
    socket.emit('history', this._messages);

    // Notify room of new user
    this._io.emit('user_joined', { userId, name: userName, picture: userPicture });

    socket.on('send_message', (data) => this._onMessage(socket, data));
    socket.on('disconnect', () => this._onDisconnect(socket));
  }

  _onMessage(socket, data) {
    if (!data || typeof data.text !== 'string') return;
    const text = data.text.trim().slice(0, 2000);
    if (!text) return;

    const message = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: socket.userId,
      name: socket.userName,
      picture: socket.userPicture,
      text,
      timestamp: new Date().toISOString(),
    };

    this._messages.push(message);
    if (this._messages.length > MAX_HISTORY) {
      this._messages.shift();
    }

    this._io.emit('new_message', message);
  }

  _onDisconnect(socket) {
    userStore.setSocketId(socket.userId, null);
    this._io.emit('user_left', { userId: socket.userId, name: socket.userName });
  }

  emitToUser(userId, event, data) {
    const socketId = userStore.getSocketId(userId);
    if (socketId) {
      this._io.to(socketId).emit(event, data);
    }
  }

  getMessages() {
    return this._messages;
  }
}

module.exports = SocketManager;
