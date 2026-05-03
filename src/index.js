"use strict";

require("dotenv").config();
const http = require("http");
const express = require("express");
const cors = require("cors");
const { Server: SocketIOServer } = require("socket.io");
const SocketManager = require("./classes/SocketManager");
const paymentRoutes = require("./routes/payment");
const aiRoutes = require("./routes/ai");

class Server {
  constructor() {
    this._app = express();
    this._httpServer = http.createServer(this._app);
    this._io = new SocketIOServer(this._httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });
    this._port = process.env.PORT || 4000;
  }

  _setupMiddleware() {
    this._app.use(
      cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      }),
    );
    this._app.use(express.json());
  }

  _setupRoutes() {
    this._app.get("/", (_req, res) => {
      res.send("Backend is running 🚀");
    });
    this._app.get("/health", (_req, res) => res.json({ status: "ok" }));
    this._app.use("/api/payment", paymentRoutes);
    this._app.use("/api/ai", aiRoutes);
  }

  _setupSockets() {
    const socketManager = new SocketManager(this._io);
    // Make socketManager accessible to routes via app
    this._app.set("socketManager", socketManager);
  }

  async start() {
    this._setupMiddleware();
    this._setupRoutes();
    this._setupSockets();

    this._httpServer.listen(this._port, () => {
      console.log(`Server running on port ${this._port}`);
    });
  }
}

const server = new Server();
server.start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
