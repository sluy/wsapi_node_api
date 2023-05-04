const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const cors = require("cors");

const io = new Server(server, { cors: { origin: "*" } });
app.use(express.json());
app.use(
  cors({
    methods: "*",
    origin: "*",
  })
);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

module.exports = { app, server, io };
