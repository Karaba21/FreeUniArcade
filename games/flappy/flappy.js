// Flappy Bird Game - Original implementation
// All code and art are original

class FlappyBirdGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game constants
        this.gravity = 0.5;
        this.jumpStrength = -8;
        this.pipeSpeed = 2;
        this.pipeGap = 150;
        this.pipeWidth = 60;
        this.pipeSpacing = 200;
        
        // Game state
        this.bird = {
            x: 100,
            y: 250,
            width: 30,
            height: 30,
            velocity: 0,
            rotation: 0
        };
        this.pipes = [];
        this.score = 0;
        this.highScore = 0;
        this.gameRunning = false;
        this.gameStarted = false;
        this.gamePaused = false;
        this.lastTime = 0;
        this.frameCount = 0;
        
        this.init();
    }
    
    init() {
        this.loadHighScore();
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
            // Force redraw when theme changes
            if (this.gameRunning) {
                // Small delay to ensure CSS variables are updated
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
            const container = this.canvas.parentElement;
            const isDesktop = window.innerWidth >= 1024;
            
            if (isDesktop) {
                // Desktop: larger canvas (600x900)
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
            
            // Reset bird position relative to canvas
            this.bird.y = this.canvas.height / 2;
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
                case ' ':
                    if (!this.gamePaused) {
                        this.jump();
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
        
        // Mouse/Click controls
        this.canvas.addEventListener('click', (e) => {
            if (!this.gamePaused && this.gameRunning) {
                this.jump();
            }
        });
        
        // Touch controls
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.gamePaused && this.gameRunning) {
                this.jump();
            }
        }, { passive: false });
    }
    
    setupUI() {
        const restartBtn = document.getElementById('restartBtn');
        const resumeBtn = document.getElementById('resumeBtn');
        const playBtn = document.getElementById('playBtn');
        
        playBtn.addEventListener('click', () => {
            this.beginGame();
        });
        
        restartBtn.addEventListener('click', () => {
            this.startGame();
        });
        
        resumeBtn.addEventListener('click', () => {
            this.togglePause();
        });
    }
    
    showStartScreen() {
        document.getElementById('gameStart').classList.remove('hidden');
        this.gameRunning = false;
        this.gameStarted = false;
    }
    
    hideStartScreen() {
        document.getElementById('gameStart').classList.add('hidden');
    }
    
    beginGame() {
        this.hideStartScreen();
        this.startGame();
    }
    
    startGame() {
        this.bird = {
            x: 100,
            y: this.canvas.height / 2,
            width: 30,
            height: 30,
            velocity: 0,
            rotation: 0
        };
        this.pipes = [];
        this.score = 0;
        this.gameRunning = true;
        this.gameStarted = true;
        this.gamePaused = false;
        this.frameCount = 0;
        this.updateScore();
        this.hideGameOver();
        this.hidePaused();
        
        // Create initial pipes
        this.createPipe();
        
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
    
    jump() {
        if (!this.gameRunning || this.gamePaused) return;
        this.bird.velocity = this.jumpStrength;
    }
    
    createPipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight;
        const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            topHeight: topHeight,
            bottomY: topHeight + this.pipeGap,
            bottomHeight: this.canvas.height - (topHeight + this.pipeGap),
            passed: false
        });
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
        
        this.frameCount++;
        
        // Update bird
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;
        
        // Rotate bird based on velocity
        this.bird.rotation = Math.min(Math.max(this.bird.velocity * 3, -30), 90);
        
        // Check boundaries
        if (this.bird.y < 0 || this.bird.y + this.bird.height > this.canvas.height) {
            this.gameOver();
            return;
        }
        
        // Update pipes
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;
            
            // Check collision
            if (this.checkCollision(pipe)) {
                this.gameOver();
                return;
            }
            
            // Check if bird passed the pipe
            if (!pipe.passed && this.bird.x > pipe.x + this.pipeWidth) {
                pipe.passed = true;
                this.score++;
                this.updateScore();
            }
            
            // Remove pipes that are off screen
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
        
        // Create new pipes
        if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - this.pipeSpacing) {
            this.createPipe();
        }
    }
    
    checkCollision(pipe) {
        const birdLeft = this.bird.x;
        const birdRight = this.bird.x + this.bird.width;
        const birdTop = this.bird.y;
        const birdBottom = this.bird.y + this.bird.height;
        
        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + this.pipeWidth;
        
        // Check if bird is within pipe's x range
        if (birdRight > pipeLeft && birdLeft < pipeRight) {
            // Check if bird hits top or bottom pipe
            if (birdTop < pipe.topHeight || birdBottom > pipe.bottomY) {
                return true;
            }
        }
        
        return false;
    }
    
    draw() {
        // Get theme-aware colors
        const isLightTheme = document.body.classList.contains('light-theme');
        const rootStyles = getComputedStyle(document.documentElement);
        
        // Clear canvas - Use site's primary background color
        const bgColor = rootStyles.getPropertyValue('--bg-primary')?.trim() || 
                       rootStyles.getPropertyValue('--bg-color')?.trim() || 
                       (isLightTheme ? '#f5f5f7' : '#0a0a0f');
        this.ctx.fillStyle = bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Only draw game elements if game has started
        if (this.gameStarted) {
            // Draw pipes - Use accent color from theme (purple in light, teal in dark)
            let pipeColor = rootStyles.getPropertyValue('--accent-color')?.trim();
            if (!pipeColor) {
                pipeColor = isLightTheme ? '#8b5cf6' : '#14b8a6';
            }
            this.ctx.fillStyle = pipeColor;
            
            for (const pipe of this.pipes) {
                // Top pipe
                this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
                
                // Bottom pipe
                this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, pipe.bottomHeight);
                
                // Pipe caps (optional visual enhancement)
                this.ctx.fillRect(pipe.x - 5, pipe.topHeight - 20, this.pipeWidth + 10, 20);
                this.ctx.fillRect(pipe.x - 5, pipe.bottomY, this.pipeWidth + 10, 20);
            }
            
            // Draw bird - Use snake color from theme (changes with theme)
            let birdColor = rootStyles.getPropertyValue('--snake-color')?.trim();
            if (!birdColor) {
                birdColor = isLightTheme ? '#16a34a' : '#22c55e';
            }
            this.ctx.save();
            this.ctx.translate(this.bird.x + this.bird.width / 2, this.bird.y + this.bird.height / 2);
            this.ctx.rotate((this.bird.rotation * Math.PI) / 180);
            
            this.ctx.fillStyle = birdColor;
            this.ctx.fillRect(-this.bird.width / 2, -this.bird.height / 2, this.bird.width, this.bird.height);
            
            // Bird eye - Use white in dark theme, dark in light theme
            const eyeColor = isLightTheme ? '#1d1d1f' : '#ffffff';
            this.ctx.fillStyle = eyeColor;
            this.ctx.beginPath();
            this.ctx.arc(this.bird.width / 4, -this.bird.height / 4, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gameStarted = false;
        document.getElementById('finalScore').textContent = this.score;
        
        // Save high score if it's a new record
        if (typeof saveHighScore === 'function' && this.score > this.highScore) {
            if (saveHighScore('flappy', this.score)) {
                this.highScore = this.score;
                this.updateHighScoreDisplay();
            }
        }
        
        this.showGameOver();
    }
    
    loadHighScore() {
        if (typeof getHighScore === 'function') {
            this.highScore = getHighScore('flappy');
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
        new FlappyBirdGame();
    });
} else {
    new FlappyBirdGame();
}

