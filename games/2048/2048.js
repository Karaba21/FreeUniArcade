document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.querySelector('.grid-container');
    const tileContainer = document.querySelector('.tile-container');
    const scoreElement = document.getElementById('score');
    const highScoreElement = document.getElementById('highScore');
    const finalScoreElement = document.getElementById('finalScore');
    const winScoreElement = document.getElementById('winScore');
    const gameOverScreen = document.getElementById('gameOver');
    const gameWonScreen = document.getElementById('gameWon');
    const restartBtn = document.getElementById('restartBtn');
    const restartWonBtn = document.getElementById('restartWonBtn');
    const continueBtn = document.getElementById('continueBtn');
    const newGameBtn = document.getElementById('newGameBtn');

    // Game constants
    const GRID_SIZE = 4;

    // Game state
    let grid = [];
    let score = 0;
    let highScore = localStorage.getItem('2048HighScore') || 0;
    let won = false;
    let keepPlaying = false;
    let startX, startY;

    // Initialize high score display
    highScoreElement.textContent = highScore;

    // Initialize game
    function initGame() {
        grid = Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(null));
        score = 0;
        won = false;
        keepPlaying = false;
        updateScore(0);

        // Clear tiles
        tileContainer.innerHTML = '';

        // Hide screens
        gameOverScreen.classList.add('hidden');
        gameWonScreen.classList.add('hidden');

        // Add initial tiles
        addRandomTile();
        addRandomTile();

        updateView();
    }

    function addRandomTile() {
        const emptyCells = [];
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (!grid[r][c]) {
                    emptyCells.push({ r, c });
                }
            }
        }

        if (emptyCells.length > 0) {
            const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            grid[r][c] = {
                value: Math.random() < 0.9 ? 2 : 4,
                id: Math.random().toString(36).substr(2, 9),
                new: true
            };
        }
    }

    function getTilePosition(r, c) {
        // Calculate position based on CSS values
        // Cell size: 106.25px, Gap: 15px
        // For mobile (max-width: 520px): Cell: 57.5px, Gap: 10px

        const isMobile = window.innerWidth <= 520;
        const cellSize = isMobile ? 57.5 : 106.25;
        const gap = isMobile ? 10 : 15;

        const x = gap + c * (cellSize + gap);
        const y = gap + r * (cellSize + gap);
        return { x, y };
    }

    function updateView() {
        // We will reuse existing DOM elements for tiles to allow CSS transitions
        const tilesToRemove = new Set(Array.from(tileContainer.children).map(el => el.dataset.id));

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                const tile = grid[r][c];
                if (tile) {
                    let tileElement = document.querySelector(`.tile[data-id="${tile.id}"]`);
                    const pos = getTilePosition(r, c);

                    if (!tileElement) {
                        tileElement = document.createElement('div');
                        tileElement.classList.add('tile');
                        tileElement.dataset.id = tile.id;

                        const inner = document.createElement('div');
                        inner.classList.add('tile-inner');
                        tileElement.appendChild(inner);

                        tileContainer.appendChild(tileElement);

                        // Set initial position immediately (no transition for new tiles appearing)
                        tileElement.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
                    } else {
                        // Update position (CSS transition handles the movement)
                        tileElement.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
                        tilesToRemove.delete(tile.id);
                    }

                    // Update classes and value
                    tileElement.className = `tile tile-${tile.value}`;
                    if (tile.new) {
                        tileElement.classList.add('tile-new');
                        tile.new = false; // Reset flag
                    }
                    if (tile.merged) {
                        tileElement.classList.add('tile-merged');
                        tile.merged = false; // Reset flag
                    }

                    tileElement.querySelector('.tile-inner').textContent = tile.value;
                }
            }
        }

        // Remove tiles that are no longer in the grid
        tilesToRemove.forEach(id => {
            const el = document.querySelector(`.tile[data-id="${id}"]`);
            if (el) {
                el.remove();
            }
        });
    }

    function move(direction) {
        // 0: Up, 1: Right, 2: Down, 3: Left
        if (won && !keepPlaying) return;

        let moved = false;
        const vector = getVector(direction);
        const traversals = buildTraversals(vector);

        // Reset merge flags
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c]) grid[r][c].mergedFrom = null;
            }
        }

        traversals.x.forEach(r => {
            traversals.y.forEach(c => {
                const tile = grid[r][c];
                if (tile) {
                    const positions = findFarthestPosition(r, c, vector);
                    const next = grid[positions.next.r] && grid[positions.next.r][positions.next.c];

                    if (next && next.value === tile.value && !next.mergedFrom) {
                        // Merge
                        const mergedValue = tile.value * 2;
                        const newTile = {
                            value: mergedValue,
                            id: Math.random().toString(36).substr(2, 9),
                            merged: true,
                            mergedFrom: [tile, next] // Keep track if we want complex animations
                        };

                        grid[positions.next.r][positions.next.c] = newTile;
                        grid[r][c] = null;

                        // Update score
                        score += mergedValue;
                        updateScore(score);

                        if (mergedValue === 2048 && !won && !keepPlaying) {
                            won = true;
                            gameWin();
                        }
                        moved = true;
                    } else {
                        // Move
                        if (positions.farthest.r !== r || positions.farthest.c !== c) {
                            grid[positions.farthest.r][positions.farthest.c] = tile;
                            grid[r][c] = null;
                            moved = true;
                        }
                    }
                }
            });
        });

        if (moved) {
            addRandomTile();
            updateView();

            if (!movesAvailable()) {
                gameOver();
            }
        }
    }

    function getVector(direction) {
        const map = {
            0: { r: -1, c: 0 }, // Up
            1: { r: 0, c: 1 },  // Right
            2: { r: 1, c: 0 },  // Down
            3: { r: 0, c: -1 }  // Left
        };
        return map[direction];
    }

    function buildTraversals(vector) {
        const traversals = { x: [], y: [] };
        for (let pos = 0; pos < GRID_SIZE; pos++) {
            traversals.x.push(pos);
            traversals.y.push(pos);
        }

        // Always traverse from the farthest cell in the chosen direction
        if (vector.r === 1) traversals.x = traversals.x.reverse();
        if (vector.c === 1) traversals.y = traversals.y.reverse();

        return traversals;
    }

    function findFarthestPosition(r, c, vector) {
        let previous;

        // Progress towards the vector direction until an obstacle is found
        do {
            previous = { r, c };
            r += vector.r;
            c += vector.c;
        } while (withinBounds(r, c) && !grid[r][c]);

        return {
            farthest: previous,
            next: { r, c } // Used to check if a merge is possible
        };
    }

    function withinBounds(r, c) {
        return r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE;
    }

    function movesAvailable() {
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (!grid[r][c]) return true;

                const directions = [0, 1, 2, 3];
                for (let d of directions) {
                    const vector = getVector(d);
                    const otherR = r + vector.r;
                    const otherC = c + vector.c;

                    if (withinBounds(otherR, otherC)) {
                        const other = grid[otherR][otherC];
                        if (other && other.value === grid[r][c].value) return true;
                    }
                }
            }
        }
        return false;
    }

    function updateScore(newScore) {
        scoreElement.textContent = newScore;
        if (newScore > highScore) {
            highScore = newScore;
            highScoreElement.textContent = highScore;
            localStorage.setItem('2048HighScore', highScore);
        }
    }

    function gameOver() {
        finalScoreElement.textContent = score;
        gameOverScreen.classList.remove('hidden');
    }

    function gameWin() {
        winScoreElement.textContent = score;
        gameWonScreen.classList.remove('hidden');
    }

    // Event Listeners
    document.addEventListener('keydown', (e) => {
        const map = {
            38: 0, // Up
            39: 1, // Right
            40: 2, // Down
            37: 3, // Left
            87: 0, // W
            68: 1, // D
            83: 2, // S
            65: 3  // A
        };

        if (map[e.keyCode] !== undefined) {
            e.preventDefault();
            move(map[e.keyCode]);
        }
    });

    // Touch events
    const gameBoard = document.querySelector('.game-2048-board');

    gameBoard.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        e.preventDefault();
    }, { passive: false });

    gameBoard.addEventListener('touchend', (e) => {
        if (!startX || !startY) return;

        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;

        const diffX = endX - startX;
        const diffY = endY - startY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal
            if (Math.abs(diffX) > 30) { // Threshold
                move(diffX > 0 ? 1 : 3);
            }
        } else {
            // Vertical
            if (Math.abs(diffY) > 30) {
                move(diffY > 0 ? 2 : 0);
            }
        }

        startX = null;
        startY = null;
        e.preventDefault();
    }, { passive: false });

    // D-Pad controls
    const dPadUp = document.querySelector('.d-pad-up');
    const dPadRight = document.querySelector('.d-pad-right');
    const dPadDown = document.querySelector('.d-pad-down');
    const dPadLeft = document.querySelector('.d-pad-left');

    if (dPadUp) {
        dPadUp.addEventListener('click', () => move(0));
        dPadRight.addEventListener('click', () => move(1));
        dPadDown.addEventListener('click', () => move(2));
        dPadLeft.addEventListener('click', () => move(3));
    }

    restartBtn.addEventListener('click', initGame);
    restartWonBtn.addEventListener('click', initGame);
    newGameBtn.addEventListener('click', initGame);

    continueBtn.addEventListener('click', () => {
        keepPlaying = true;
        gameWonScreen.classList.add('hidden');
    });

    // Handle window resize to update positions
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateView, 100);
    });

    // Start game
    initGame();
});
