// Minesweeper Game - Original implementation
// All code and art are original

class MinesweeperGame {
    constructor() {
        this.difficulties = {
            easy: { rows: 9, cols: 9, mines: 10 },
            medium: { rows: 16, cols: 16, mines: 40 },
            hard: { rows: 16, cols: 30, mines: 99 }
        };
        
        this.currentDifficulty = 'easy';
        this.rows = this.difficulties[this.currentDifficulty].rows;
        this.cols = this.difficulties[this.currentDifficulty].cols;
        this.mines = this.difficulties[this.currentDifficulty].mines;
        
        this.board = [];
        this.revealed = [];
        this.flagged = [];
        this.gameStarted = false;
        this.gameOver = false;
        this.gameWon = false;
        this.timer = 0;
        this.timerInterval = null;
        this.firstClick = true;
        
        this.init();
    }
    
    init() {
        this.setupUI();
        this.createBoard();
        this.renderBoard();
    }
    
    setupUI() {
        const restartBtn = document.getElementById('restartBtn');
        const restartGameBtn = document.getElementById('restartGameBtn');
        const restartWinBtn = document.getElementById('restartWinBtn');
        const difficultyBtn = document.getElementById('difficultyBtn');
        
        restartBtn.addEventListener('click', () => this.resetGame());
        restartGameBtn.addEventListener('click', () => this.resetGame());
        restartWinBtn.addEventListener('click', () => this.resetGame());
        
        difficultyBtn.addEventListener('click', () => this.toggleDifficulty());
    }
    
    toggleDifficulty() {
        const difficulties = ['easy', 'medium', 'hard'];
        const difficultyNames = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };
        const currentIndex = difficulties.indexOf(this.currentDifficulty);
        const nextIndex = (currentIndex + 1) % difficulties.length;
        
        this.currentDifficulty = difficulties[nextIndex];
        this.rows = this.difficulties[this.currentDifficulty].rows;
        this.cols = this.difficulties[this.currentDifficulty].cols;
        this.mines = this.difficulties[this.currentDifficulty].mines;
        
        document.getElementById('difficultyBtn').textContent = difficultyNames[this.currentDifficulty];
        this.resetGame();
    }
    
    createBoard() {
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        this.revealed = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
        this.flagged = Array(this.rows).fill(null).map(() => Array(this.cols).fill(false));
    }
    
    placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // Don't place mine on first click or if already has mine
            if (this.board[row][col] === -1 || (row === excludeRow && col === excludeCol)) {
                continue;
            }
            
            this.board[row][col] = -1; // -1 represents a mine
            minesPlaced++;
        }
        
        // Calculate numbers for each cell
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.board[row][col] !== -1) {
                    this.board[row][col] = this.countAdjacentMines(row, col);
                }
            }
        }
    }
    
    countAdjacentMines(row, col) {
        let count = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                    if (this.board[newRow][newCol] === -1) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
    
    renderBoard() {
        const boardElement = document.getElementById('gameBoard');
        boardElement.innerHTML = '';
        boardElement.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        boardElement.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                
                if (this.revealed[row][col]) {
                    cell.classList.add('revealed');
                    if (this.board[row][col] === -1) {
                        cell.classList.add('mine');
                        cell.textContent = '💣';
                    } else if (this.board[row][col] > 0) {
                        cell.textContent = this.board[row][col];
                        cell.classList.add(`number-${this.board[row][col]}`);
                    }
                } else if (this.flagged[row][col]) {
                    cell.classList.add('flagged');
                    cell.textContent = '🚩';
                }
                
                // Event listeners
                cell.addEventListener('click', (e) => this.handleCellClick(row, col, e));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleRightClick(row, col);
                });
                
                // Double click for revealing adjacent cells
                cell.addEventListener('dblclick', (e) => this.handleDoubleClick(row, col, e));
                
                boardElement.appendChild(cell);
            }
        }
    }
    
    handleCellClick(row, col, event) {
        if (this.gameOver || this.gameWon || this.flagged[row][col]) {
            return;
        }
        
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.gameStarted = true;
            this.startTimer();
        }
        
        if (this.revealed[row][col]) {
            return;
        }
        
        this.revealCell(row, col);
        this.renderBoard();
        this.checkWin();
    }
    
    handleRightClick(row, col) {
        if (this.gameOver || this.gameWon || this.revealed[row][col]) {
            return;
        }
        
        this.flagged[row][col] = !this.flagged[row][col];
        this.updateMinesLeft();
        this.renderBoard();
    }
    
    handleDoubleClick(row, col, event) {
        if (this.gameOver || this.gameWon || !this.revealed[row][col] || this.board[row][col] === -1) {
            return;
        }
        
        // Count flagged adjacent cells
        let flaggedCount = 0;
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const newRow = row + dr;
                const newCol = col + dc;
                if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                    if (this.flagged[newRow][newCol]) {
                        flaggedCount++;
                    }
                }
            }
        }
        
        // If flagged count matches the number, reveal adjacent cells
        if (flaggedCount === this.board[row][col]) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                        if (!this.revealed[newRow][newCol] && !this.flagged[newRow][newCol]) {
                            this.revealCell(newRow, newCol);
                        }
                    }
                }
            }
            this.renderBoard();
            this.checkWin();
        }
    }
    
    revealCell(row, col) {
        if (this.revealed[row][col] || this.flagged[row][col]) {
            return;
        }
        
        this.revealed[row][col] = true;
        
        if (this.board[row][col] === -1) {
            // Game over - reveal all mines
            this.endGame(false);
            return;
        }
        
        // If cell is empty (0), reveal adjacent cells
        if (this.board[row][col] === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                        if (!this.revealed[newRow][newCol] && !this.flagged[newRow][newCol]) {
                            this.revealCell(newRow, newCol);
                        }
                    }
                }
            }
        }
    }
    
    checkWin() {
        let revealedCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.revealed[row][col]) {
                    revealedCount++;
                }
            }
        }
        
        const totalCells = this.rows * this.cols;
        if (revealedCount === totalCells - this.mines) {
            this.endGame(true);
        }
    }
    
    endGame(won) {
        this.gameOver = !won;
        this.gameWon = won;
        this.gameStarted = false;
        this.stopTimer();
        
        if (won) {
            // Reveal all mines as flagged
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.board[row][col] === -1 && !this.flagged[row][col]) {
                        this.flagged[row][col] = true;
                    }
                }
            }
            document.getElementById('finalTime').textContent = this.timer;
            document.getElementById('gameWin').classList.remove('hidden');
            
            // Save high score if applicable
            if (typeof saveHighScore === 'function') {
                const difficultyKey = `minesweeper_${this.currentDifficulty}`;
                const currentBest = typeof getHighScore === 'function' ? getHighScore(difficultyKey) : null;
                if (!currentBest || this.timer < currentBest) {
                    saveHighScore(difficultyKey, this.timer);
                }
            }
        } else {
            // Reveal all mines
            for (let row = 0; row < this.rows; row++) {
                for (let col = 0; col < this.cols; col++) {
                    if (this.board[row][col] === -1) {
                        this.revealed[row][col] = true;
                    }
                }
            }
            document.getElementById('gameOver').classList.remove('hidden');
        }
        
        this.renderBoard();
    }
    
    startTimer() {
        this.timer = 0;
        this.timerInterval = setInterval(() => {
            this.timer++;
            document.getElementById('timer').textContent = this.timer;
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateMinesLeft() {
        let flaggedCount = 0;
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.flagged[row][col]) {
                    flaggedCount++;
                }
            }
        }
        document.getElementById('minesLeft').textContent = this.mines - flaggedCount;
    }
    
    resetGame() {
        this.gameStarted = false;
        this.gameOver = false;
        this.gameWon = false;
        this.firstClick = true;
        this.timer = 0;
        this.stopTimer();
        document.getElementById('timer').textContent = '0';
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('gameWin').classList.add('hidden');
        this.createBoard();
        this.updateMinesLeft();
        this.renderBoard();
    }
}

// Initialize game when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MinesweeperGame();
    });
} else {
    new MinesweeperGame();
}

