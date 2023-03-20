import express, { json } from "express";
export const app = express();
import { createServer } from "http";
export const server = createServer(app);
import { Server } from "socket.io";
import cors from "cors";

export const io = new Server(server, { cors: { origin: "*" } });
app.use(json());
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
