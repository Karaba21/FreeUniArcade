document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const finalScoreElement = document.getElementById('finalScore');
    const winScoreElement = document.getElementById('winScore');
    const gameOverScreen = document.getElementById('gameOver');
    const gameWonScreen = document.getElementById('gameWon');
    const gamePausedScreen = document.getElementById('gamePaused');
    const restartBtn = document.getElementById('restartBtn');
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    const resumeBtn = document.getElementById('resumeBtn');

    // Game constants
    const PADDLE_HEIGHT = 10;
    const PADDLE_WIDTH = 75;
    const BALL_RADIUS = 6;
    const BRICK_ROW_COUNT = 5;
    const BRICK_COLUMN_COUNT = 9;
    const BRICK_PADDING = 10;
    const BRICK_OFFSET_TOP = 30;
    const BRICK_OFFSET_LEFT = 35;
    const BRICK_WIDTH = (canvas.width - (BRICK_OFFSET_LEFT * 2) - (BRICK_PADDING * (BRICK_COLUMN_COUNT - 1))) / BRICK_COLUMN_COUNT;
    const BRICK_HEIGHT = 20;

    // Game state
    let score = 0;
    let highScore = localStorage.getItem('breakoutHighScore') || 0;
    let gameLoop;
    let isGameRunning = false;
    let isPaused = false;
    let rightPressed = false;
    let leftPressed = false;

    // Paddle
    let paddleX = (canvas.width - PADDLE_WIDTH) / 2;

    // Ball
    let x = canvas.width / 2;
    let y = canvas.height - 30;
    let dx = 4;
    let dy = -4;

    // Bricks
    const bricks = [];

    // Initialize bricks
    function initBricks() {
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            bricks[c] = [];
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }
    }

    // Initialize high score display
    highScoreElement.textContent = highScore;

    // Event listeners
    document.addEventListener('keydown', keyDownHandler, false);
    document.addEventListener('keyup', keyUpHandler, false);
    document.addEventListener('mousemove', mouseMoveHandler, false);
    
    // Touch controls
    const leftBtn = document.querySelector('.d-pad-left');
    const rightBtn = document.querySelector('.d-pad-right');

    if (leftBtn && rightBtn) {
        leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); leftPressed = true; });
        leftBtn.addEventListener('touchend', (e) => { e.preventDefault(); leftPressed = false; });
        rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); rightPressed = true; });
        rightBtn.addEventListener('touchend', (e) => { e.preventDefault(); rightPressed = false; });
        
        // Mouse events for testing on desktop with touch controls
        leftBtn.addEventListener('mousedown', (e) => { leftPressed = true; });
        leftBtn.addEventListener('mouseup', (e) => { leftPressed = false; });
        rightBtn.addEventListener('mousedown', (e) => { rightPressed = true; });
        rightBtn.addEventListener('mouseup', (e) => { rightPressed = false; });
    }

    restartBtn.addEventListener('click', startGame);
    nextLevelBtn.addEventListener('click', startGame);
    resumeBtn.addEventListener('click', togglePause);

    function keyDownHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            rightPressed = true;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            leftPressed = true;
        } else if (e.key === 'p' || e.key === 'P' || e.key === ' ') {
            if (isGameRunning) {
                togglePause();
            }
        }
    }

    function keyUpHandler(e) {
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            rightPressed = false;
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            leftPressed = false;
        }
    }

    function mouseMoveHandler(e) {
        if (!isGameRunning || isPaused) return;
        
        const relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - PADDLE_WIDTH / 2;
            
            // Keep paddle within bounds
            if (paddleX < 0) paddleX = 0;
            if (paddleX + PADDLE_WIDTH > canvas.width) paddleX = canvas.width - PADDLE_WIDTH;
        }
    }

    function togglePause() {
        isPaused = !isPaused;
        if (isPaused) {
            gamePausedScreen.classList.remove('hidden');
            cancelAnimationFrame(gameLoop);
        } else {
            gamePausedScreen.classList.add('hidden');
            draw();
        }
    }

    function collisionDetection() {
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                const b = bricks[c][r];
                if (b.status === 1) {
                    if (x > b.x && x < b.x + BRICK_WIDTH && y > b.y && y < b.y + BRICK_HEIGHT) {
                        dy = -dy;
                        b.status = 0;
                        score += 10;
                        scoreElement.textContent = score;
                        
                        // Increase speed slightly
                        if (score % 50 === 0) {
                            dx = dx > 0 ? dx + 0.5 : dx - 0.5;
                            dy = dy > 0 ? dy + 0.5 : dy - 0.5;
                        }

                        if (score === BRICK_ROW_COUNT * BRICK_COLUMN_COUNT * 10) {
                            gameWin();
                        }
                    }
                }
            }
        }
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#00ff88';
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - PADDLE_HEIGHT, PADDLE_WIDTH, PADDLE_HEIGHT);
        ctx.fillStyle = '#00ff88';
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (let c = 0; c < BRICK_COLUMN_COUNT; c++) {
            for (let r = 0; r < BRICK_ROW_COUNT; r++) {
                if (bricks[c][r].status === 1) {
                    const brickX = (c * (BRICK_WIDTH + BRICK_PADDING)) + BRICK_OFFSET_LEFT;
                    const brickY = (r * (BRICK_HEIGHT + BRICK_PADDING)) + BRICK_OFFSET_TOP;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, BRICK_WIDTH, BRICK_HEIGHT);
                    
                    // Gradient color for bricks based on row
                    const hue = 120 + (r * 20); // Green to Blueish
                    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function draw() {
        if (!isGameRunning || isPaused) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawBricks();
        drawBall();
        drawPaddle();
        collisionDetection();

        // Wall collision
        if (x + dx > canvas.width - BALL_RADIUS || x + dx < BALL_RADIUS) {
            dx = -dx;
        }
        if (y + dy < BALL_RADIUS) {
            dy = -dy;
        } else if (y + dy > canvas.height - BALL_RADIUS) {
            if (x > paddleX && x < paddleX + PADDLE_WIDTH) {
                // Paddle collision logic to add some angle control
                let collidePoint = x - (paddleX + PADDLE_WIDTH / 2);
                collidePoint = collidePoint / (PADDLE_WIDTH / 2);
                
                let angle = collidePoint * (Math.PI / 3); // Max 60 degree angle
                
                let speed = Math.sqrt(dx*dx + dy*dy);
                dx = speed * Math.sin(angle);
                dy = -speed * Math.cos(angle);
            } else {
                gameOver();
                return;
            }
        }

        // Paddle movement
        if (rightPressed && paddleX < canvas.width - PADDLE_WIDTH) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        x += dx;
        y += dy;

        gameLoop = requestAnimationFrame(draw);
    }

    function startGame() {
        isGameRunning = true;
        isPaused = false;
        score = 0;
        scoreElement.textContent = score;
        
        // Reset positions
        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = 4;
        dy = -4;
        paddleX = (canvas.width - PADDLE_WIDTH) / 2;
        
        initBricks();
        
        gameOverScreen.classList.add('hidden');
        gameWonScreen.classList.add('hidden');
        gamePausedScreen.classList.add('hidden');
        
        draw();
    }

    function gameOver() {
        isGameRunning = false;
        cancelAnimationFrame(gameLoop);
        finalScoreElement.textContent = score;
        gameOverScreen.classList.remove('hidden');
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('breakoutHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
    }

    function gameWin() {
        isGameRunning = false;
        cancelAnimationFrame(gameLoop);
        winScoreElement.textContent = score;
        gameWonScreen.classList.remove('hidden');
        
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('breakoutHighScore', highScore);
            highScoreElement.textContent = highScore;
        }
    }

    // Initial draw (static)
    initBricks();
    drawBricks();
    drawPaddle();
    drawBall();
    
    // Show start prompt or just wait for user to click play/restart
    // For now, we can auto-start or wait for a button. 
    // The UI has a "Jugar de Nuevo" button which calls startGame.
    // Let's add a "Click to Start" overlay or just start immediately?
    // The current design implies the game starts when loaded or via a button.
    // Let's auto-start for simplicity as per other games, or maybe better add a "Start" overlay.
    // Given the other games, let's just start it.
    startGame();
});
