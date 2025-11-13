// Pong Game - Original implementation
// All code and art are original

class PongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game constants
        this.paddleWidth = 15;
        this.paddleHeight = 100;
        this.ballSize = 15;
        this.ballSpeed = 5;
        this.paddleSpeed = 6;
        
        // Difficulty settings
        // Ball speed is fast (6) for all difficulties
        this.difficulties = {
            easy: {
                aiSpeed: 3,           // Very slow movement
                aiReaction: 0.2,      // Very low reaction - reacts late
                aiAccuracy: 0.2,      // Only 20% accurate - very imprecise
                aiMissChance: 0.25,   // 20% chance to miss completely
                aiWrongDirectionChance: 0.6, // 25% chance to move wrong direction
                aiReactionDelay: 0.6, // Only reacts when ball is 60% of the way
                ballSpeed: 6
            },
            medium: {
                aiSpeed: 4,           // Moderate speed
                aiReaction: 0.3,      // Medium reaction
                aiAccuracy: 0.3,      // 60% accurate predictions
                aiMissChance: 0.3,   // 25% chance to miss
                aiWrongDirectionChance: 0.6, // 10% chance to move wrong direction
                aiReactionDelay: 0.3, // Reacts when ball is 30% of the way
                ballSpeed: 8
            },
            hard: {
                aiSpeed: 5,           // Fast movement
                aiReaction: 0.4,      // High reaction
                aiAccuracy: 0.3,     // 30% accurate predictions
                aiMissChance: 0.3,   // 30% chance to miss
                aiWrongDirectionChance: 0.5, // 50% chance to move wrong direction
                aiReactionDelay: 0.3, // Reacts early
                ballSpeed: 11
            }
        };
        
        this.currentDifficulty = 'medium';
        this.gameMode = null; // 'pvc' (Player vs CPU) or 'pvp' (Player vs Player)
        
        // Game state
        this.playerPaddle = {
            x: 50,
            y: 0,
            width: this.paddleWidth,
            height: this.paddleHeight
        };
        this.aiPaddle = {
            x: 0,
            y: 0,
            width: this.paddleWidth,
            height: this.paddleHeight
        };
        this.player2Paddle = {
            x: 0,
            y: 0,
            width: this.paddleWidth,
            height: this.paddleHeight
        };
        this.ball = {
            x: 0,
            y: 0,
            width: this.ballSize,
            height: this.ballSize,
            velocityX: 0,
            velocityY: 0
        };
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameRunning = false;
        this.gameStarted = false;
        this.gamePaused = false;
        this.lastTime = 0;
        
        // Input state
        this.keys = {
            up: false,      // W key
            down: false,    // S key
            arrowUp: false, // Arrow up
            arrowDown: false // Arrow down
        };
        
        // Touch controls
        this.touchY = 0;
        this.touchActive = false;
        
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.setupControls();
        this.setupUI();
        this.setupThemeListener();
        this.showStartScreen();
        this.draw();
    }
    
    setupThemeListener() {
        // Listen for theme changes to update colors
        const observer = new MutationObserver(() => {
            if (this.gameRunning) {
                setTimeout(() => {
                    this.draw();
                }, 10);
            }
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class']
        });
    }
    
    setupCanvas() {
        // Responsive canvas that maintains aspect ratio - Desktop First
        const resizeCanvas = () => {
            const isDesktop = window.innerWidth >= 1024;
            
            if (isDesktop) {
                // Desktop: larger canvas (900x600)
                const desktopWidth = 900;
                const desktopHeight = 600;
                this.canvas.width = desktopWidth;
                this.canvas.height = desktopHeight;
                this.canvas.style.width = desktopWidth + 'px';
                this.canvas.style.height = desktopHeight + 'px';
            } else {
                // Mobile: smaller canvas, responsive
                const maxWidth = Math.min(350, window.innerWidth - 40);
                const maxHeight = Math.min(525, window.innerHeight - 200);
                const aspectRatio = 900 / 600;
                
                let width, height;
                if (maxWidth / maxHeight > aspectRatio) {
                    height = maxHeight;
                    width = height * aspectRatio;
                } else {
                    width = maxWidth;
                    height = width / aspectRatio;
                }
                
                this.canvas.style.width = width + 'px';
                this.canvas.style.height = height + 'px';
                this.canvas.width = 900;
                this.canvas.height = 600;
            }
            
            // Reset positions
            this.resetPositions();
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
    
    resetPositions() {
        this.playerPaddle.x = 50;
        this.playerPaddle.y = (this.canvas.height - this.paddleHeight) / 2;
        
        if (this.gameMode === 'pvp') {
            // Player 2 on the right
            this.player2Paddle.x = this.canvas.width - 50 - this.paddleWidth;
            this.player2Paddle.y = (this.canvas.height - this.paddleHeight) / 2;
        } else {
            // AI on the right
            this.aiPaddle.x = this.canvas.width - 50 - this.paddleWidth;
            this.aiPaddle.y = (this.canvas.height - this.paddleHeight) / 2;
        }
        
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
    }
    
    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gamePaused && e.key !== 'p' && e.key !== 'P') {
                return;
            }
            
            switch(e.key) {
                case 'w':
                case 'W':
                    this.keys.up = true;
                    e.preventDefault();
                    break;
                case 's':
                case 'S':
                    this.keys.down = true;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    if (this.gameMode === 'pvp') {
                        this.keys.arrowUp = true;
                    }
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    if (this.gameMode === 'pvp') {
                        this.keys.arrowDown = true;
                    }
                    e.preventDefault();
                    break;
                case 'p':
                case 'P':
                    this.togglePause();
                    e.preventDefault();
                    break;
            }
        });
        
        document.addEventListener('keyup', (e) => {
            switch(e.key) {
                case 'w':
                case 'W':
                    this.keys.up = false;
                    e.preventDefault();
                    break;
                case 's':
                case 'S':
                    this.keys.down = false;
                    e.preventDefault();
                    break;
                case 'ArrowUp':
                    if (this.gameMode === 'pvp') {
                        this.keys.arrowUp = false;
                    }
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                    if (this.gameMode === 'pvp') {
                        this.keys.arrowDown = false;
                    }
                    e.preventDefault();
                    break;
            }
        });
        
        // Mouse/Touch controls
        this.canvas.addEventListener('mousemove', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            const rect = this.canvas.getBoundingClientRect();
            const y = e.clientY - rect.top;
            this.movePlayerPaddle(y);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.gamePaused) return;
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const y = touch.clientY - rect.top;
            this.movePlayerPaddle(y);
        }, { passive: false });
    }
    
    movePlayerPaddle(targetY) {
        const paddleCenter = this.playerPaddle.y + this.paddleHeight / 2;
        const targetCenter = targetY;
        
        if (targetCenter < paddleCenter - 5) {
            this.playerPaddle.y = Math.max(0, this.playerPaddle.y - this.paddleSpeed);
        } else if (targetCenter > paddleCenter + 5) {
            this.playerPaddle.y = Math.min(
                this.canvas.height - this.paddleHeight,
                this.playerPaddle.y + this.paddleSpeed
            );
        }
    }
    
    setupUI() {
        const restartBtn = document.getElementById('restartBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        const modeBtns = document.querySelectorAll('.mode-btn');
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        
        modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.getAttribute('data-mode');
                this.selectMode(mode);
            });
        });
        
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const difficulty = btn.getAttribute('data-difficulty');
                this.selectDifficulty(difficulty);
            });
        });
        
        restartBtn.addEventListener('click', () => {
            this.startGame();
        });
        
        resumeBtn.addEventListener('click', () => {
            this.togglePause();
        });
    }
    
    selectMode(mode) {
        this.gameMode = mode;
        const modeSelector = document.getElementById('modeSelector');
        const difficultySelector = document.getElementById('difficultySelector');
        const controlsPvC = document.getElementById('controlsPvC');
        const controlsPvP = document.getElementById('controlsPvP');
        const opponentLabel = document.getElementById('opponentLabel');
        
        if (mode === 'pvc') {
            // Show difficulty selector for CPU mode
            modeSelector.classList.add('hidden');
            difficultySelector.classList.remove('hidden');
            controlsPvC.classList.remove('hidden');
            controlsPvP.classList.add('hidden');
            opponentLabel.textContent = 'Máquina';
        } else if (mode === 'pvp') {
            // Start game directly for PvP mode
            modeSelector.classList.add('hidden');
            controlsPvC.classList.add('hidden');
            controlsPvP.classList.remove('hidden');
            opponentLabel.textContent = 'Jugador 2';
            this.hideStartScreen();
            this.startGame();
        }
    }
    
    selectDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.hideStartScreen();
        this.startGame();
    }
    
    showStartScreen() {
        document.getElementById('gameStart').classList.remove('hidden');
        document.getElementById('modeSelector').classList.remove('hidden');
        document.getElementById('difficultySelector').classList.add('hidden');
        document.getElementById('controlsPvC').classList.remove('hidden');
        document.getElementById('controlsPvP').classList.add('hidden');
        document.getElementById('opponentLabel').textContent = 'Máquina';
        this.gameRunning = false;
        this.gameStarted = false;
        this.gameMode = null;
    }
    
    hideStartScreen() {
        document.getElementById('gameStart').classList.add('hidden');
    }
    
    startGame() {
        this.resetPositions();
        this.playerScore = 0;
        this.aiScore = 0;
        this.gameRunning = true;
        this.gameStarted = true;
        this.gamePaused = false;
        this.updateScore();
        this.hideGameOver();
        this.hidePaused();
        
        // Reset ball with random direction
        this.resetBall();
        
        this.gameLoop(0);
    }
    
    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        
        // Random direction
        const angle = (Math.random() * Math.PI / 3) - Math.PI / 6; // -30 to 30 degrees
        
        // Use speed based on game mode
        let speed;
        if (this.gameMode === 'pvp') {
            speed = 8; // Fixed speed for PvP
        } else {
            speed = this.difficulties[this.currentDifficulty].ballSpeed;
        }
        
        this.ball.velocityX = Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.velocityY = Math.sin(angle) * speed;
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        if (this.gamePaused) {
            this.showPaused();
        } else {
            this.hidePaused();
            this.gameLoop(performance.now());
        }
    }
    
    gameLoop(currentTime) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update();
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Update player 1 paddle (W/S)
        if (this.keys.up) {
            this.playerPaddle.y = Math.max(0, this.playerPaddle.y - this.paddleSpeed);
        }
        if (this.keys.down) {
            this.playerPaddle.y = Math.min(
                this.canvas.height - this.paddleHeight,
                this.playerPaddle.y + this.paddleSpeed
            );
        }
        
        // Update player 2 paddle or AI
        if (this.gameMode === 'pvp') {
            // Player 2 controls (Arrow keys)
            if (this.keys.arrowUp) {
                this.player2Paddle.y = Math.max(0, this.player2Paddle.y - this.paddleSpeed);
            }
            if (this.keys.arrowDown) {
                this.player2Paddle.y = Math.min(
                    this.canvas.height - this.paddleHeight,
                    this.player2Paddle.y + this.paddleSpeed
                );
            }
        } else {
            // AI controls
            this.updateAI();
        }
        
        // Update ball
        this.ball.x += this.ball.velocityX;
        this.ball.y += this.ball.velocityY;
        
        // Ball collision with top and bottom walls
        if (this.ball.y <= 0 || this.ball.y + this.ball.height >= this.canvas.height) {
            this.ball.velocityY = -this.ball.velocityY;
            this.ball.y = Math.max(0, Math.min(this.canvas.height - this.ball.height, this.ball.y));
        }
        
        // Ball collision with player paddle
        if (this.checkCollision(this.ball, this.playerPaddle)) {
            const hitPos = (this.ball.y + this.ball.height / 2) - (this.playerPaddle.y + this.paddleHeight / 2);
            const normalizedHit = hitPos / (this.paddleHeight / 2);
            const angle = normalizedHit * Math.PI / 3; // Max 60 degrees
            const speed = Math.sqrt(this.ball.velocityX ** 2 + this.ball.velocityY ** 2);
            
            this.ball.velocityX = Math.abs(Math.cos(angle)) * speed;
            this.ball.velocityY = Math.sin(angle) * speed;
            
            // Ensure ball moves right
            if (this.ball.velocityX < 0) {
                this.ball.velocityX = -this.ball.velocityX;
            }
            
            this.ball.x = this.playerPaddle.x + this.paddleWidth;
        }
        
        // Ball collision with AI paddle or Player 2 paddle
        const rightPaddle = this.gameMode === 'pvp' ? this.player2Paddle : this.aiPaddle;
        if (this.checkCollision(this.ball, rightPaddle)) {
            const hitPos = (this.ball.y + this.ball.height / 2) - (rightPaddle.y + this.paddleHeight / 2);
            const normalizedHit = hitPos / (this.paddleHeight / 2);
            const angle = normalizedHit * Math.PI / 3; // Max 60 degrees
            const speed = Math.sqrt(this.ball.velocityX ** 2 + this.ball.velocityY ** 2);
            
            this.ball.velocityX = -Math.abs(Math.cos(angle)) * speed;
            this.ball.velocityY = Math.sin(angle) * speed;
            
            // Ensure ball moves left
            if (this.ball.velocityX > 0) {
                this.ball.velocityX = -this.ball.velocityX;
            }
            
            this.ball.x = rightPaddle.x - this.ball.width;
        }
        
        // Check for scoring
        if (this.ball.x < 0) {
            // Ball went past player 1's side
            if (this.gameMode === 'pvp') {
                // Player 2 scores
                this.aiScore++; // Using aiScore for player 2 in PvP
            } else {
                // AI scores
                this.aiScore++;
            }
            this.updateScore();
            if (this.aiScore >= 10) {
                this.gameWon(this.gameMode === 'pvp' ? 'player2' : 'ai');
                return;
            }
            this.resetBall();
            // Ball goes to player 1
            this.ball.velocityX = Math.abs(this.ball.velocityX);
        } else if (this.ball.x > this.canvas.width) {
            // Ball went past right side
            if (this.gameMode === 'pvp') {
                // Player 1 scores
                this.playerScore++;
            } else {
                // Player scores against AI
                this.playerScore++;
            }
            this.updateScore();
            if (this.playerScore >= 10) {
                this.gameWon('player');
                return;
            }
            this.resetBall();
            // Ball goes to right side
            this.ball.velocityX = -Math.abs(this.ball.velocityX);
        }
    }
    
    updateAI() {
        const difficulty = this.difficulties[this.currentDifficulty];
        const aiCenter = this.aiPaddle.y + this.paddleHeight / 2;
        
        // Random chance to miss completely (AI doesn't react)
        if (Math.random() < difficulty.aiMissChance) {
            // AI doesn't move - it misses the ball
            return;
        }
        
        // Only move if ball is coming towards AI
        if (this.ball.velocityX > 0) {
            // Check if ball is close enough for AI to react (reaction delay)
            const distanceToPaddle = this.aiPaddle.x - this.ball.x;
            const totalDistance = this.canvas.width;
            const ballProgress = 1 - (distanceToPaddle / totalDistance);
            
            // AI only starts reacting when ball has traveled enough distance
            if (ballProgress < difficulty.aiReactionDelay) {
                // Too early - AI doesn't react yet (especially in easy mode)
                return;
            }
            
            // Predict ball position
            const timeToReach = (this.aiPaddle.x - this.ball.x) / this.ball.velocityX;
            let predictedY = this.ball.y + this.ball.velocityY * timeToReach;
            
            // Account for ball bouncing off walls (but only in harder modes)
            if (difficulty.aiAccuracy > 0.5) {
                while (predictedY < 0 || predictedY > this.canvas.height) {
                    if (predictedY < 0) {
                        predictedY = -predictedY;
                    } else {
                        predictedY = 2 * this.canvas.height - predictedY;
                    }
                }
            }
            
            const targetY = predictedY - this.paddleHeight / 2;
            
            // Add large imperfection based on difficulty
            // Lower accuracy = much more error in prediction
            const accuracy = difficulty.aiAccuracy;
            const maxError = (1 - accuracy) * 200; // Larger max error
            const error = (Math.random() - 0.5) * maxError;
            
            // Add reaction delay error - AI reacts slower in easier modes
            const reactionDelay = (1 - difficulty.aiReaction) * 50;
            const reactionError = (Math.random() - 0.5) * reactionDelay;
            
            // Sometimes AI moves in completely wrong direction (especially in easy)
            let directionMultiplier = 1;
            if (Math.random() < difficulty.aiWrongDirectionChance) {
                directionMultiplier = -1; // Move opposite direction!
            }
            
            const finalTarget = targetY + (error * directionMultiplier) + reactionError;
            
            // Clamp target to valid range
            const clampedTarget = Math.max(0, Math.min(
                this.canvas.height - this.paddleHeight,
                finalTarget
            ));
            
            // Move towards target with limited speed (much slower in easy)
            const distance = clampedTarget - this.aiPaddle.y;
            const maxMove = difficulty.aiSpeed;
            
            // In easy mode, sometimes just don't move even if there's distance
            if (this.currentDifficulty === 'easy' && Math.random() < 0.3) {
                return; // Sometimes just freeze
            }
            
            if (Math.abs(distance) > 8) { // Larger threshold
                if (distance > 0) {
                    this.aiPaddle.y = Math.min(
                        this.canvas.height - this.paddleHeight,
                        this.aiPaddle.y + Math.min(maxMove, distance * 0.8) // Slower movement
                    );
                } else {
                    this.aiPaddle.y = Math.max(
                        0,
                        this.aiPaddle.y - Math.min(maxMove, Math.abs(distance) * 0.8) // Slower movement
                    );
                }
            }
        } else {
            // Return to center when ball is moving away (slower return)
            const centerY = (this.canvas.height - this.paddleHeight) / 2;
            const distance = centerY - this.aiPaddle.y;
            
            if (Math.abs(distance) > 5) {
                const returnSpeed = difficulty.aiSpeed * 0.2; // Even slower return
                if (distance > 0) {
                    this.aiPaddle.y = Math.min(
                        this.canvas.height - this.paddleHeight,
                        this.aiPaddle.y + returnSpeed
                    );
                } else {
                    this.aiPaddle.y = Math.max(0, this.aiPaddle.y - returnSpeed);
                }
            }
        }
    }
    
    checkCollision(ball, paddle) {
        return ball.x < paddle.x + paddle.width &&
               ball.x + ball.width > paddle.x &&
               ball.y < paddle.y + paddle.height &&
               ball.y + ball.height > paddle.y;
    }
    
    draw() {
        // Get theme-aware colors
        const isLightTheme = document.body.classList.contains('light-theme');
        const rootStyles = getComputedStyle(document.documentElement);
        
        // Clear canvas
        const bgColor = rootStyles.getPropertyValue('--bg-primary')?.trim() || 
                       rootStyles.getPropertyValue('--bg-color')?.trim() || 
                       (isLightTheme ? '#f5f5f7' : '#0a0a0f');
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        const lineColor = rootStyles.getPropertyValue('--border-color')?.trim() || 
                         (isLightTheme ? '#d1d5db' : '#2d2d44');
        this.ctx.strokeStyle = lineColor;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Only draw game elements if game has started
        if (this.gameStarted) {
            // Draw paddles
            const paddleColor = rootStyles.getPropertyValue('--accent-color')?.trim() || 
                               (isLightTheme ? '#8b5cf6' : '#14b8a6');
            this.ctx.fillStyle = paddleColor;
            
            // Player 1 paddle (left)
            this.ctx.fillRect(
                this.playerPaddle.x,
                this.playerPaddle.y,
                this.playerPaddle.width,
                this.playerPaddle.height
            );
            
            // Player 2 paddle or AI paddle (right)
            const rightPaddle = this.gameMode === 'pvp' ? this.player2Paddle : this.aiPaddle;
            this.ctx.fillRect(
                rightPaddle.x,
                rightPaddle.y,
                rightPaddle.width,
                rightPaddle.height
            );
            
            // Draw ball
            const ballColor = rootStyles.getPropertyValue('--snake-color')?.trim() || 
                            (isLightTheme ? '#16a34a' : '#22c55e');
            this.ctx.fillStyle = ballColor;
            this.ctx.fillRect(
                this.ball.x,
                this.ball.y,
                this.ball.width,
                this.ball.height
            );
        }
    }
    
    gameWon(winner) {
        this.gameRunning = false;
        this.gameStarted = false;
        
        const titleElement = document.getElementById('gameOverTitle');
        const messageElement = document.getElementById('gameOverMessage');
        
        if (this.gameMode === 'pvp') {
            if (winner === 'player') {
                titleElement.textContent = '¡Jugador 1 Gana!';
                messageElement.textContent = `Jugador 1: ${this.playerScore} - Jugador 2: ${this.aiScore}`;
            } else {
                titleElement.textContent = '¡Jugador 2 Gana!';
                messageElement.textContent = `Jugador 1: ${this.playerScore} - Jugador 2: ${this.aiScore}`;
            }
        } else {
            if (winner === 'player') {
                titleElement.textContent = '¡Ganaste!';
                messageElement.textContent = `Has ganado ${this.playerScore} - ${this.aiScore}`;
            } else {
                titleElement.textContent = '¡Game Over!';
                messageElement.textContent = `Has perdido ${this.playerScore} - ${this.aiScore}`;
            }
        }
        
        this.showGameOver();
    }
    
    updateScore() {
        document.getElementById('playerScore').textContent = this.playerScore;
        document.getElementById('aiScore').textContent = this.aiScore;
    }
    
    showGameOver() {
        document.getElementById('gameOver').classList.remove('hidden');
    }
    
    hideGameOver() {
        document.getElementById('gameOver').classList.add('hidden');
    }
    
    showPaused() {
        document.getElementById('gamePaused').classList.remove('hidden');
    }
    
    hidePaused() {
        document.getElementById('gamePaused').classList.add('hidden');
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PongGame();
    });
} else {
    new PongGame();
}

