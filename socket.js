const { Server } = require("socket.io");
const { corsOrigin, corsMethods } = require("./Utils/enum");

let io;

const init = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: corsMethods,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("connected");
    socket.on("chat message", (msg) => {});
  });
  return io; // Return the io instance
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { init, getIO };
