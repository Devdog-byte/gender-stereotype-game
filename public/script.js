const socket = io();
const board = document.getElementById('board');
const questionInput = document.getElementById('questionInput');
const askButton = document.getElementById('askButton');
const guessInput = document.getElementById('guessInput');
const guessButton = document.getElementById('guessButton');
const messages = document.getElementById('messages');

let selectedQuote = null;

// When the game starts, display the quotes on the board
socket.on('startGame', (quotes) => {
    quotes.forEach(quote => {
        const card = document.createElement('div');
        card.className = 'quote-card';
        card.textContent = quote;
        card.addEventListener('click', () => selectQuote(quote, card));
        board.appendChild(card);
    });
});

// Handle selecting a quote
function selectQuote(quote, card) {
    if (selectedQuote === null) {
        selectedQuote = quote;
        card.classList.add('flipped');
        socket.emit('selectQuote', quote);
    }
}

// Handle asking a question
askButton.addEventListener('click', () => {
    const question = questionInput.value;
    if (question.trim() !== '') {
        socket.emit('askQuestion', question);
        questionInput.value = '';
    }
});

// Receive and display a question from the opponent
socket.on('receiveQuestion', (question) => {
    messages.textContent = `Opponent asked: ${question}`;
});

// Handle making a guess
guessButton.addEventListener('click', () => {
    const guess = guessInput.value;
    if (guess.trim() !== '') {
        socket.emit('submitGuess', guess);
        guessInput.value = '';
    }
});

// Display messages from the server (e.g., win/lose, incorrect guess)
socket.on('message', (message) => {
    messages.textContent = message;
});

// Join the game when the page loads
socket.emit('joinGame');