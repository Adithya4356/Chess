const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000; // Use Render's provided port or default to 3000

app.get("/", (req, res) => {
    res.send("Server is running!");
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid"); // For generating unique room codes
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

let rooms = {}; // Store active rooms

io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // Create a new room and generate a room code
    socket.on("createRoom", (playerName) => {
        const roomCode = uuidv4().slice(0, 6); // Generate a short room code
        rooms[roomCode] = { players: [socket.id], names: [playerName] };
        socket.join(roomCode);
        socket.emit("roomCreated", roomCode);
        console.log(`Room ${roomCode} created by ${playerName}`);
    });

    // Join an existing room
    socket.on("joinRoom", ({ roomCode, playerName }) => {
        if (rooms[roomCode] && rooms[roomCode].players.length < 2) {
            rooms[roomCode].players.push(socket.id);
            rooms[roomCode].names.push(playerName);
            socket.join(roomCode);

            // Notify both players that the game can start
            io.to(roomCode).emit("startGame", rooms[roomCode].names);
            console.log(`${playerName} joined room ${roomCode}`);
        } else {
            socket.emit("roomError", "Room full or does not exist!");
        }
    });

    // Handle chess moves
    socket.on("move", ({ roomCode, move }) => {
        socket.to(roomCode).emit("opponentMove", move);
    });

    // Handle disconnections
    socket.on("disconnect", () => {
        for (let roomCode in rooms) {
            let index = rooms[roomCode].players.indexOf(socket.id);
            if (index !== -1) {
                rooms[roomCode].players.splice(index, 1);
                rooms[roomCode].names.splice(index, 1);
                io.to(roomCode).emit("playerDisconnected");
                if (rooms[roomCode].players.length === 0) {
                    delete rooms[roomCode]; // Remove empty rooms
                }
                break;
            }
        }
        console.log("A user disconnected:", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on https://chess-multiplayer-8w28.onrender.com");
});

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000; // Use Render's assigned port or fallback to 3000

app.get('/', (req, res) => {
    res.send("Server is running...");
});

io.on('connection', (socket) => {
    console.log('A user connected');
    
    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
