const { Server } = require("socket.io");

function initializeWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*", // Allow all origins (change this for security)
            methods: ["GET", "POST"]
        }
    });

    let rooms = {}; // Store active rooms and players

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        // Handle room creation
        socket.on("createRoom", (playerName) => {
            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase(); // Generate a random 6-character code
            rooms[roomCode] = { players: [{ id: socket.id, name: playerName, color: "white" }] };
            socket.join(roomCode);
            socket.emit("roomCreated", roomCode);
            console.log(`Room ${roomCode} created by ${playerName}`);
        });

        // Handle joining a room
        socket.on("joinRoom", ({ roomCode, playerName }) => {
            if (rooms[roomCode] && rooms[roomCode].players.length === 1) {
                rooms[roomCode].players.push({ id: socket.id, name: playerName, color: "black" });
                socket.join(roomCode);
                io.to(roomCode).emit("gameStart", rooms[roomCode].players);
                console.log(`${playerName} joined room ${roomCode}`);
            } else {
                socket.emit("roomError", "Room is full or does not exist!");
            }
        });

        // Handle player moves
        socket.on("move", ({ roomCode, move }) => {
            socket.to(roomCode).emit("opponentMove", move);
        });

        // Handle player disconnection
        socket.on("disconnect", () => {
            for (const roomCode in rooms) {
                rooms[roomCode].players = rooms[roomCode].players.filter(player => player.id !== socket.id);
                if (rooms[roomCode].players.length === 0) {
                    delete rooms[roomCode]; // Delete empty room
                }
            }
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
}

module.exports = initializeWebSocket;
