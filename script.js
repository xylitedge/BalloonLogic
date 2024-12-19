const gameContainer = document.getElementById('game-container');
const resultDisplay = document.getElementById('result');
const gameOverDiv = document.getElementById('game-over');
const resultMessage = document.getElementById('result-message');
const restartButton = document.getElementById('restart');
const timerDisplay = document.getElementById('timer'); // Timer element

let selectedNumbers = [];
let selectedOperator = null;
let totalBalloons = 0;
let balloonLimit = 100;
let lastBalloonX = -1; // Track the last horizontal position
let minBalloonSpacing = 100; // Minimum spacing between balloons
let gameOver = false;
let inactivityTimer = null; // Timer for inactivity
let countdown = 60; // Timer in seconds

// Start game
function startGame() {
    // Reset game state
    selectedNumbers = [];
    selectedOperator = null;
    totalBalloons = 0;
    lastBalloonX = -1;
    gameOver = false;

    // Reset UI
    resultDisplay.textContent = "0";
    timerDisplay.textContent = "Time: 1:00";
    gameOverDiv.classList.add('hidden');

    // Start spawning balloons
    spawnBalloons();

    // Start countdown timer
    startCountdown();
}

// Generate random horizontal position with spacing
function getRandomPosition() {
    let x;
    do {
        x = Math.random() * (window.innerWidth - 80); // Balloon width is 80px
    } while (Math.abs(x - lastBalloonX) < minBalloonSpacing); // Ensure spacing
    lastBalloonX = x;
    return x;
}

function spawnBalloons() {
    if (gameOver || totalBalloons >= balloonLimit) {
        endGame(false);
        return;
    }

    totalBalloons++;

    // Decide whether to spawn a number or operator balloon
    const isOperator = Math.random() > 0.5;
    const balloon = document.createElement('div');
    balloon.classList.add('balloon');

    if (isOperator) {
        const operators = ['+', '-', '*', '%'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        balloon.textContent = operator;
        balloon.classList.add('operator');
        balloon.dataset.value = operator;
    } else {
        const number = Math.floor(Math.random() * 50) * 2; // Even numbers only
        balloon.textContent = number;
        balloon.classList.add('number');
        balloon.dataset.value = number;
    }

    // Set position with spacing
    balloon.style.left = `${getRandomPosition()}px`;
    balloon.style.bottom = '-100px';

    // Move balloon upward
    const riseSpeed = 1;
    let riseInterval = setInterval(() => {
        if (parseInt(balloon.style.bottom) > window.innerHeight || gameOver) {
            clearInterval(riseInterval);
            balloon.remove();
        } else if (balloon.classList.contains('frozen')) {
            clearInterval(riseInterval); // Stop movement when frozen
        } else {
            balloon.style.bottom = `${parseInt(balloon.style.bottom) + riseSpeed}px`;
        }
    }, 20);

    // Balloon click logic
    balloon.addEventListener('click', () => {
        if (balloon.classList.contains('frozen')) return; // Prevent re-tapping

        balloon.classList.add('frozen'); // Freeze the balloon
        balloon.style.transition = "none"; // Stop any transitions
        if (balloon.classList.contains('number')) {
            selectedNumbers.push(parseInt(balloon.dataset.value));
        } else if (balloon.classList.contains('operator')) {
            selectedOperator = balloon.dataset.value;
        }

        checkMathOperation();
        resetCountdown(); // Reset countdown timer on user action
    });

    gameContainer.appendChild(balloon);

    // Continue spawning balloons
    setTimeout(spawnBalloons, 2000);
}

function checkMathOperation() {
    if (selectedNumbers.length === 2 && selectedOperator) {
        const [num1, num2] = selectedNumbers;

        let result;
        switch (selectedOperator) {
            case '+':
                result = num1 + num2;
                break;
            case '-':
                result = num1 - num2;
                break;
            case '*':
                result = num1 * num2;
                break;
            case '%':
                result = num1 % num2;
                break;
            default:
                result = null;
        }

        // Update result display
        if (result !== null) {
            resultDisplay.textContent = `${num1} ${selectedOperator} ${num2} = ${result}`;
        } else {
            resultDisplay.textContent = "Error";
        }

        // Reset for next operation
        selectedNumbers = [];
        selectedOperator = null;
    }
}

// Start the countdown timer
function startCountdown() {
    countdown = 60; // Reset timer to 1 minute
    updateTimerDisplay();

    inactivityTimer = setInterval(() => {
        countdown--;
        updateTimerDisplay();

        if (countdown <= 0) {
            clearInterval(inactivityTimer);
            endGame(true); // End game due to timeout
        }
    }, 1000); // Decrease by 1 second
}

// Reset the countdown timer
function resetCountdown() {
    clearInterval(inactivityTimer);
    startCountdown();
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    timerDisplay.textContent = `Time: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

// End game with a specific message
function endGame(timeout) {
    gameOver = true;
    resultMessage.textContent = timeout ? 'Time Out! Try Again?' : 'Game Over!';
    gameOverDiv.classList.remove('hidden');

    // Clear remaining balloons
    document.querySelectorAll('.balloon').forEach(balloon => balloon.remove());

    // Clear inactivity timer
    clearInterval(inactivityTimer);
}

// Restart game
restartButton.addEventListener('click', startGame);

// Start game on page load
startGame();
