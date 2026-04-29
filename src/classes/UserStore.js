'use strict';

/**
 * In-memory store for user profiles and premium status.
 * Singleton via module caching.
 */
class UserStore {
  constructor() {
    /** @type {Map<string, {name: string, email: string, picture: string, isPremium: boolean, socketId: string|null}>} */
    this._users = new Map();
  }

  upsert(userId, profile) {
    const existing = this._users.get(userId) || {};
    this._users.set(userId, {
      name: profile.name || existing.name || '',
      email: profile.email || existing.email || '',
      picture: profile.picture || existing.picture || '',
      isPremium: existing.isPremium || false,
      socketId: existing.socketId || null,
    });
  }

  get(userId) {
    return this._users.get(userId) || null;
  }

  setSocketId(userId, socketId) {
    const user = this._users.get(userId);
    if (user) {
      user.socketId = socketId;
      this._users.set(userId, user);
    }
  }

  setPremium(userId) {
    const user = this._users.get(userId);
    if (user) {
      user.isPremium = true;
      this._users.set(userId, user);
    }
  }

  isPremium(userId) {
    const user = this._users.get(userId);
    return user ? user.isPremium : false;
  }

  getSocketId(userId) {
    const user = this._users.get(userId);
    return user ? user.socketId : null;
  }
}

module.exports = new UserStore();
