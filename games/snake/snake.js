// Snake Game - Original implementation
// All code and art are original

class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // Game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = { x: 15, y: 15 };
        this.dx = 0;
        this.dy = 0;
        this.nextDx = 0; // Pending direction change
        this.nextDy = 0; // Pending direction change
        this.score = 0;
        this.highScore = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.lastTime = 0;
        this.gameSpeed = 150; // milliseconds
        
        // Touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.minSwipeDistance = 30;
        
        this.init();
    }
    
    init() {
        this.loadHighScore();
        this.setupCanvas();
        this.setupControls();
        this.setupUI();
        this.startGame();
    }
    
    setupCanvas() {
        // Responsive canvas that maintains aspect ratio - Desktop First
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            const isDesktop = window.innerWidth >= 1024;
            
            if (isDesktop) {
                // Desktop: larger canvas (620x620)
                const desktopSize = 620;
                this.canvas.width = desktopSize;
                this.canvas.height = desktopSize;
                this.canvas.style.width = desktopSize + 'px';
                this.canvas.style.height = desktopSize + 'px';
            } else {
                // Mobile: smaller canvas, responsive
                const maxWidth = Math.min(400, window.innerWidth - 40);
                const maxHeight = Math.min(400, window.innerHeight - 200);
                const size = Math.min(maxWidth, maxHeight);
                
                this.canvas.style.width = size + 'px';
                this.canvas.style.height = size + 'px';
                this.canvas.width = 400;
                this.canvas.height = 400;
            }
            
            this.tileCount = this.canvas.width / this.gridSize;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }
    
    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (this.gamePaused && e.key !== ' ' && e.key !== 'p' && e.key !== 'P') {
                return;
            }
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W': {
                    // Check both current and pending direction
                    const currentDy = (this.nextDy !== 0) ? this.nextDy : this.dy;
                    if (currentDy !== 1) {
                        this.nextDx = 0;
                        this.nextDy = -1;
                    }
                    e.preventDefault();
                    break;
                }
                case 'ArrowDown':
                case 's':
                case 'S': {
                    const currentDy = (this.nextDy !== 0) ? this.nextDy : this.dy;
                    if (currentDy !== -1) {
                        this.nextDx = 0;
                        this.nextDy = 1;
                    }
                    e.preventDefault();
                    break;
                }
                case 'ArrowLeft':
                case 'a':
                case 'A': {
                    const currentDx = (this.nextDx !== 0) ? this.nextDx : this.dx;
                    if (currentDx !== 1) {
                        this.nextDx = -1;
                        this.nextDy = 0;
                    }
                    e.preventDefault();
                    break;
                }
                case 'ArrowRight':
                case 'd':
                case 'D': {
                    const currentDx = (this.nextDx !== 0) ? this.nextDx : this.dx;
                    if (currentDx !== -1) {
                        this.nextDx = 1;
                        this.nextDy = 0;
                    }
                    e.preventDefault();
                    break;
                }
                case ' ':
                case 'p':
                case 'P':
                    this.togglePause();
                    e.preventDefault();
                    break;
            }
        });
        
        // Touch controls - D-pad buttons
        const dPadButtons = document.querySelectorAll('.d-pad-btn');
        dPadButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const direction = btn.getAttribute('data-direction');
                this.handleDirection(direction);
            });
        });
        
        // Touch controls - Swipe gestures
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartX = touch.clientX;
            this.touchStartY = touch.clientY;
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.touchStartX || !this.touchStartY) return;
            
            const touch = e.changedTouches[0];
            const deltaX = touch.clientX - this.touchStartX;
            const deltaY = touch.clientY - this.touchStartY;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > this.minSwipeDistance) {
                    this.handleDirection(deltaX > 0 ? 'right' : 'left');
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > this.minSwipeDistance) {
                    this.handleDirection(deltaY > 0 ? 'down' : 'up');
                }
            }
            
            this.touchStartX = 0;
            this.touchStartY = 0;
        }, { passive: false });
    }
    
    handleDirection(direction) {
        if (this.gamePaused) return;
        
        switch(direction) {
            case 'up': {
                const currentDy = (this.nextDy !== 0) ? this.nextDy : this.dy;
                if (currentDy !== 1) {
                    this.nextDx = 0;
                    this.nextDy = -1;
                }
                break;
            }
            case 'down': {
                const currentDy = (this.nextDy !== 0) ? this.nextDy : this.dy;
                if (currentDy !== -1) {
                    this.nextDx = 0;
                    this.nextDy = 1;
                }
                break;
            }
            case 'left': {
                const currentDx = (this.nextDx !== 0) ? this.nextDx : this.dx;
                if (currentDx !== 1) {
                    this.nextDx = -1;
                    this.nextDy = 0;
                }
                break;
            }
            case 'right': {
                const currentDx = (this.nextDx !== 0) ? this.nextDx : this.dx;
                if (currentDx !== -1) {
                    this.nextDx = 1;
                    this.nextDy = 0;
                }
                break;
            }
        }
    }
    
    setupUI() {
        const restartBtn = document.getElementById('restartBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        
        restartBtn.addEventListener('click', () => {
            this.startGame();
        });
        
        resumeBtn.addEventListener('click', () => {
            this.togglePause();
        });
    }
    
    startGame() {
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.dx = 0;
        this.dy = 0;
        this.nextDx = 0;
        this.nextDy = 0;
        this.score = 0;
        this.gameRunning = true;
        this.gamePaused = false;
        this.updateScore();
        this.hideGameOver();
        this.hidePaused();
        this.gameLoop(0);
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
        
        if (currentTime - this.lastTime >= this.gameSpeed) {
            this.update();
            this.draw();
            this.lastTime = currentTime;
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update() {
        // Apply pending direction change only once per update
        if (this.nextDx !== 0 || this.nextDy !== 0) {
            // Only apply if it's a valid direction (not opposite to current)
            // If game hasn't started (dx=0, dy=0), apply any direction
            // Otherwise, only apply if not opposite to current direction
            if ((this.dx === 0 && this.dy === 0) ||
                !(this.nextDx === -this.dx && this.nextDy === -this.dy)) {
                this.dx = this.nextDx;
                this.dy = this.nextDy;
            }
            // Reset pending direction
            this.nextDx = 0;
            this.nextDy = 0;
        }
        
        // Don't move if direction is still zero (game hasn't started)
        if (this.dx === 0 && this.dy === 0) {
            return;
        }
        
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision (skip the head itself)
        for (let i = 1; i < this.snake.length; i++) {
            if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
            // Increase speed slightly
            this.gameSpeed = Math.max(100, this.gameSpeed - 2);
        } else {
            this.snake.pop();
        }
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        return newFood;
    }
    
    draw() {
        // Clear canvas - Use site's primary background color
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--bg-primary') || 
                             getComputedStyle(document.documentElement).getPropertyValue('--bg-color') || 
                             '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (subtle) - Use a visible color that contrasts with background
        const isLightTheme = document.body.classList.contains('light-theme');
        this.ctx.strokeStyle = isLightTheme ? 
                              '#e0e0e0' : // Light gray for light theme
                              '#2a2a3e'; // Dark gray-blue for dark theme (visible on black)
        this.ctx.lineWidth = 1;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // Draw food
        this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--food-color') || '#ff4444';
        this.ctx.fillRect(this.food.x * this.gridSize + 2, this.food.y * this.gridSize + 2, this.gridSize - 4, this.gridSize - 4);
        
        // Draw snake
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // Head
                this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--snake-head-color') || '#4ade80';
            } else {
                // Body
                this.ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--snake-color') || '#22c55e';
            }
            this.ctx.fillRect(segment.x * this.gridSize + 1, segment.y * this.gridSize + 1, this.gridSize - 2, this.gridSize - 2);
        });
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        
        // Save high score if it's a new record
        if (typeof saveHighScore === 'function' && this.score > this.highScore) {
            if (saveHighScore('snake', this.score)) {
                this.highScore = this.score;
                this.updateHighScoreDisplay();
            }
        }
        
        this.showGameOver();
    }
    
    loadHighScore() {
        if (typeof getHighScore === 'function') {
            this.highScore = getHighScore('snake');
            this.updateHighScoreDisplay();
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
        
        // Update high score display if current score exceeds it
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.updateHighScoreDisplay();
        }
    }
    
    updateHighScoreDisplay() {
        const highScoreElement = document.getElementById('highScore');
        if (highScoreElement) {
            highScoreElement.textContent = this.highScore;
        }
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
        new SnakeGame();
    });
} else {
    new SnakeGame();
}

