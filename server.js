const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Store player information and quotes
let players = {};
let quotes = [
    "A woman’s place is in the home.",
    "Women are more emotional and sensitive.",
    "Girls are supposed to be nurturing and caring.",
    "Women are natural multitaskers.",
    "A woman’s worth is tied to her beauty and appearance.",
    "Women should prioritize family over career.",
    "Girls are better at communication and relationships.",
    "Women express their feelings.",
    "Women are for cooking and cleaning.",
    "Women aren’t as interested in science, technology, or math.",
    "Real men don’t cry.",
    "Men should be tough and stoic.",
    "A man’s worth is measured by his career and financial success.",
    "Men are natural leaders and providers.",
    "Men are supposed to be good at fixing things.",
    "A real man always controls his emotions.",
    "Men are supposed to be dominant in relationships.",
    "Men are less nurturing and more focused on achievement.",
    "Men don't need help or support; they should handle things on their own.",
    "Men are always interested in sports and mechanical things."
];

// Handle a new player connection
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Handle a player joining the game
    socket.on('joinGame', () => {
        if (Object.keys(players).length < 2) {
            players[socket.id] = {
                id: socket.id,
                quote: null,
                opponentId: null,
            };

            // If there are two players, link them as opponents
            if (Object.keys(players).length === 2) {
                const ids = Object.keys(players);
                players[ids[0]].opponentId = ids[1];
                players[ids[1]].opponentId = ids[0];
                io.to(ids[0]).emit('startGame', quotes);
                io.to(ids[1]).emit('startGame', quotes);
            }
        } else {
            socket.emit('message', 'Game is full. Try again later.');
        }
    });

    // Handle a player selecting a quote
    socket.on('selectQuote', (quote) => {
        if (players[socket.id]) {
            players[socket.id].quote = quote;
            socket.emit('message', `You selected: "${quote}"`);
        }
    });

    // Handle a player asking a question
    socket.on('askQuestion', (question) => {
        const opponentId = players[socket.id].opponentId;
        if (opponentId) {
            io.to(opponentId).emit('receiveQuestion', question);
        }
    });

    // Handle a player submitting a guess
    socket.on('submitGuess', (guess) => {
        const opponentId = players[socket.id].opponentId;
        if (opponentId) {
            if (guess === players[opponentId].quote) {
                io.to(socket.id).emit('message', 'You guessed correctly! You win!');
                io.to(opponentId).emit('message', 'Your opponent guessed correctly. You lose.');
            } else {
                io.to(socket.id).emit('message', 'Incorrect guess. Try again.');
            }
        }
    });

    // Handle a player disconnecting
    socket.on('disconnect', () => {
        console.log(`Player disconnected: ${socket.id}`);
        delete players[socket.id];
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));