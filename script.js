if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(() => console.log("Service Worker Registered"));
}
const socket = io("https://chess-multiplayer-8w28.onrender.com");
let playerName = "";
let roomCode = "";

document.getElementById("createRoomBtn").addEventListener("click", () => {
    playerName = document.getElementById("playerName").value.trim();
    if (playerName) {
        socket.emit("createRoom", playerName);
    } else {
        alert("Enter your name first!");
    }
});

document.getElementById("joinRoomBtn").addEventListener("click", () => {
    playerName = document.getElementById("playerName").value.trim();
    roomCode = document.getElementById("roomCode").value.trim();
    if (playerName && roomCode) {
        socket.emit("joinRoom", { roomCode, playerName });
    } else {
        alert("Enter your name and room code!");
    }
});

socket.on("roomCreated", (code) => {
    roomCode = code;
    document.getElementById("roomInfo").textContent = `Room Code: ${roomCode} (Share this with your friend!)`;
});

socket.on("startGame", (players) => {
    document.getElementById("menu").style.display = "none";
    document.getElementById("gameContainer").style.display = "block";
    document.getElementById("playerInfo").textContent = `Players: ${players[0]} vs ${players[1]}`;
    
    // Initialize Chess Game Here
});

// Handle Room Errors
socket.on("roomError", (message) => {
    alert(message);
});
