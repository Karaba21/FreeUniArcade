// Wordle Game - Original implementation
// All code and art are original

class WordleGame {
    constructor() {
        this.ROWS = 6;
        this.COLS = 5;
        this.currentRow = 0;
        this.currentCol = 0;
        this.targetWord = '';
        this.validWords = [];
        this.wordList = [];
        this.gameOver = false;
        this.gameWon = false;
        this.letterStates = {};
        this.language = 'es'; // 'es' o 'en'
        this.startDate = new Date('2024-01-01'); // Fecha base para calcular días
        
        this.init();
    }
    
    async init() {
        this.setupUI();
        this.showLanguageScreen();
    }
    
    showLanguageScreen() {
        const langScreen = document.getElementById('languageScreen');
        const introScreen = document.getElementById('introScreen');
        const gameBoard = document.getElementById('gameBoard');
        const keyboard = document.getElementById('virtualKeyboard');
        
        // Ocultar todo excepto la pantalla de idioma
        if (langScreen) langScreen.classList.remove('hidden');
        if (introScreen) introScreen.classList.add('hidden');
        if (gameBoard) gameBoard.classList.add('hidden');
        if (keyboard) keyboard.classList.add('hidden');
        
        // Cargar idioma guardado si existe
        const savedLang = localStorage.getItem('wordle-language');
        if (savedLang) {
            this.language = savedLang;
        }
        
        // Configurar botones de idioma
        document.querySelectorAll('.language-button').forEach(btn => {
            btn.addEventListener('click', () => {
                this.language = btn.getAttribute('data-lang');
                localStorage.setItem('wordle-language', this.language);
                this.startGame();
            });
        });
    }
    
    async startGame() {
        await this.loadWords();
        this.createBoard();
        this.createKeyboard();
        this.selectDailyWord();
        
        // Ocultar pantalla de idioma y mostrar intro
        const langScreen = document.getElementById('languageScreen');
        const introScreen = document.getElementById('introScreen');
        if (langScreen) langScreen.classList.add('hidden');
        if (introScreen) introScreen.classList.remove('hidden');
    }
    
    async loadWords() {
        try {
            let wordsFile, validWordsFile;
            
            if (this.language === 'es') {
                wordsFile = 'palabras.txt';
                validWordsFile = 'palabrasvalidas.txt';
            } else {
                wordsFile = 'words.txt';
                validWordsFile = 'validwords.txt';
            }
            
            // Cargar lista de palabras válidas (para validar intentos)
            const validWordsResponse = await fetch(validWordsFile);
            const validWordsText = await validWordsResponse.text();
            this.validWords = validWordsText
                .split('\n')
                .map(word => word.trim().toUpperCase())
                .filter(word => word.length === 5 && word.length > 0);
            
            // Cargar lista de palabras objetivo (para la palabra del día)
            const wordsResponse = await fetch(wordsFile);
            const wordsText = await wordsResponse.text();
            this.wordList = wordsText
                .split('\n')
                .map(word => word.trim().toUpperCase())
                .filter(word => word.length === 5 && word.length > 0);
            
            console.log(`Cargadas ${this.wordList.length} palabras objetivo y ${this.validWords.length} palabras válidas`);
        } catch (error) {
            console.error('Error cargando palabras:', error);
            // Fallback: lista básica de palabras
            if (this.language === 'es') {
                this.validWords = ['PERRO', 'GATOS', 'CASA', 'MESA', 'SILLA', 'LAPIZ', 'LIBRO', 'AGUA', 'FUEGO', 'TIERRA'];
                this.wordList = this.validWords;
            } else {
                this.validWords = ['APPLE', 'TABLE', 'CHAIR', 'LIGHT', 'SOUND', 'WORLD', 'GAMES', 'LEVEL', 'SCORE', 'BRICK'];
                this.wordList = this.validWords;
            }
        }
    }
    
    // Selecciona la palabra del día basada en la fecha (en orden, con loop)
    selectDailyWord() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Calcular días desde la fecha base
        const diffTime = today - this.startDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        // Usar módulo para hacer loop
        const index = diffDays % this.wordList.length;
        this.targetWord = this.wordList[index];
        
        console.log(`Día ${diffDays}, Palabra del día (índice ${index}):`, this.targetWord);
    }
    
    setupUI() {
        const startBtn = document.getElementById('startGameBtn');
        const restartBtn = document.getElementById('restartGameBtn');
        const restartWinBtn = document.getElementById('restartWinBtn');
        const introScreen = document.getElementById('introScreen');
        const gameBoard = document.getElementById('gameBoard');
        const keyboard = document.getElementById('virtualKeyboard');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                if (introScreen) introScreen.classList.add('hidden');
                if (gameBoard) gameBoard.classList.remove('hidden');
                if (keyboard) keyboard.classList.remove('hidden');
                this.focusFirstTile();
            });
        }
        
        if (restartBtn) {
            restartBtn.addEventListener('click', () => this.resetGame());
        }
        
        if (restartWinBtn) {
            restartWinBtn.addEventListener('click', () => this.resetGame());
        }
        
        // Manejar entrada de teclado
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    createBoard() {
        const board = document.getElementById('gameBoard');
        if (!board) return;
        
        board.innerHTML = '';
        
        for (let row = 0; row < this.ROWS; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'wordle-row';
            
            for (let col = 0; col < this.COLS; col++) {
                const tile = document.createElement('div');
                tile.className = 'wordle-tile';
                tile.id = `tile-${row}-${col}`;
                rowElement.appendChild(tile);
            }
            
            board.appendChild(rowElement);
        }
    }
    
    createKeyboard() {
        const keyboard = document.getElementById('virtualKeyboard');
        if (!keyboard) return;
        
        keyboard.innerHTML = '';
        
        // Teclado en español o inglés
        const layout = this.language === 'es' 
            ? [
                ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
                ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
              ]
            : [
                ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
                ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
                ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '⌫']
              ];
        
        layout.forEach(row => {
            const rowElement = document.createElement('div');
            rowElement.className = 'keyboard-row';
            
            row.forEach(key => {
                const keyElement = document.createElement('button');
                keyElement.className = 'keyboard-key';
                keyElement.textContent = key;
                
                if (key === 'ENTER' || key === '⌫') {
                    keyElement.classList.add('wide');
                    keyElement.addEventListener('click', () => {
                        if (key === 'ENTER') {
                            this.submitWord();
                        } else {
                            this.deleteLetter();
                        }
                    });
                } else {
                    keyElement.addEventListener('click', () => this.addLetter(key));
                }
                
                keyElement.id = `key-${key}`;
                rowElement.appendChild(keyElement);
            });
            
            keyboard.appendChild(rowElement);
        });
    }
    
    handleKeyPress(e) {
        if (this.gameOver || this.gameWon) return;
        
        const key = e.key.toUpperCase();
        
        // Permitir Ñ en español
        if (this.language === 'es' && (e.key === 'ñ' || e.key === 'Ñ')) {
            this.addLetter('Ñ');
            return;
        }
        
        if (key === 'ENTER') {
            this.submitWord();
        } else if (key === 'BACKSPACE' || key === 'DELETE') {
            this.deleteLetter();
        } else if (/^[A-ZÑ]$/.test(key)) {
            this.addLetter(key);
        }
    }
    
    addLetter(letter) {
        if (this.currentCol >= this.COLS) return;
        
        const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
        if (tile) {
            tile.textContent = letter;
            tile.classList.add('filled');
            this.currentCol++;
            this.focusCurrentTile();
        }
    }
    
    deleteLetter() {
        if (this.currentCol <= 0) return;
        
        this.currentCol--;
        const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
        if (tile) {
            tile.textContent = '';
            tile.classList.remove('filled');
            this.focusCurrentTile();
        }
    }
    
    clearCurrentRow() {
        // Borrar todas las letras de la fila actual
        for (let col = 0; col < this.COLS; col++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${col}`);
            if (tile) {
                tile.textContent = '';
                tile.classList.remove('filled', 'correct', 'present', 'absent', 'active');
            }
        }
        // Resetear la columna actual al inicio
        this.currentCol = 0;
        this.focusCurrentTile();
    }
    
    async submitWord() {
        if (this.currentCol !== this.COLS) return;
        
        // Obtener la palabra actual
        let word = '';
        for (let col = 0; col < this.COLS; col++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${col}`);
            if (tile) {
                word += tile.textContent;
            }
        }
        
        // Validar palabra
        if (!this.validWords.includes(word)) {
            const errorMsg = this.language === 'es' 
                ? 'Palabra no válida' 
                : 'Invalid word';
            this.showError(errorMsg);
            // Borrar todas las letras de la fila actual
            this.clearCurrentRow();
            return;
        }
        
        // Evaluar palabra
        const evaluation = this.evaluateWord(word);
        this.updateTiles(evaluation);
        this.updateKeyboard(evaluation);
        
        // Verificar si ganó
        if (word === this.targetWord) {
            this.gameWon = true;
            setTimeout(() => this.showWin(), 500);
            return;
        }
        
        // Avanzar a la siguiente fila
        this.currentRow++;
        this.currentCol = 0;
        
        // Verificar si perdió
        if (this.currentRow >= this.ROWS) {
            this.gameOver = true;
            setTimeout(() => this.showGameOver(), 500);
            return;
        }
        
        this.focusCurrentTile();
        this.updateAttemptCounter();
    }
    
    evaluateWord(word) {
        const evaluation = Array(this.COLS).fill('absent');
        const targetLetters = this.targetWord.split('');
        const wordLetters = word.split('');
        const used = Array(this.COLS).fill(false);
        
        // Primero marcar las correctas (verde)
        for (let i = 0; i < this.COLS; i++) {
            if (wordLetters[i] === targetLetters[i]) {
                evaluation[i] = 'correct';
                used[i] = true;
            }
        }
        
        // Luego marcar las presentes (amarillo)
        for (let i = 0; i < this.COLS; i++) {
            if (evaluation[i] === 'correct') continue;
            
            for (let j = 0; j < this.COLS; j++) {
                if (!used[j] && wordLetters[i] === targetLetters[j]) {
                    evaluation[i] = 'present';
                    used[j] = true;
                    break;
                }
            }
        }
        
        return evaluation;
    }
    
    updateTiles(evaluation) {
        for (let col = 0; col < this.COLS; col++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${col}`);
            if (tile) {
                tile.classList.remove('filled', 'active');
                tile.classList.add(evaluation[col]);
            }
        }
    }
    
    updateKeyboard(evaluation) {
        for (let col = 0; col < this.COLS; col++) {
            const tile = document.getElementById(`tile-${this.currentRow}-${col}`);
            if (!tile) continue;
            
            const letter = tile.textContent;
            const key = document.getElementById(`key-${letter}`);
            
            if (!key) continue;
            
            const state = evaluation[col];
            const currentState = this.letterStates[letter];
            
            // Prioridad: correct > present > absent
            if (!currentState || 
                (currentState === 'absent' && state !== 'absent') ||
                (currentState === 'present' && state === 'correct')) {
                this.letterStates[letter] = state;
                key.classList.remove('correct', 'present', 'absent');
                key.classList.add(state);
            }
        }
    }
    
    showError(message) {
        // Animación de error
        const firstTile = document.querySelector(`#tile-${this.currentRow}-0`);
        if (firstTile) {
            const row = firstTile.parentElement;
            row.style.animation = 'shake 0.5s';
            setTimeout(() => {
                row.style.animation = '';
            }, 500);
        }
        
        // Mostrar mensaje temporal
        const errorDiv = document.createElement('div');
        errorDiv.textContent = message;
        errorDiv.style.cssText = 'position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #ff4444; color: white; padding: 1rem 2rem; border-radius: 8px; z-index: 1000; font-weight: 600; box-shadow: 0 4px 15px rgba(255, 68, 68, 0.4);';
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 2000);
        
        // Permitir que el usuario borre y reescriba
        // No hacer nada más, solo mostrar el error y permitir continuar escribiendo
    }
    
    showWin() {
        const modal = document.getElementById('gameWin');
        const winWord = document.getElementById('winWord');
        const winMessage = document.getElementById('winMessage');
        
        if (!modal || !winWord || !winMessage) return;
        
        winWord.textContent = this.targetWord;
        
        const attempts = this.currentRow + 1;
        if (this.language === 'es') {
            winMessage.textContent = `¡Felicidades! Adivinaste la palabra en ${attempts} intento${attempts > 1 ? 's' : ''}`;
        } else {
            winMessage.textContent = `Congratulations! You guessed the word in ${attempts} attempt${attempts > 1 ? 's' : ''}`;
        }
        
        modal.classList.remove('hidden');
    }
    
    showGameOver() {
        const modal = document.getElementById('gameOver');
        const revealedWord = document.getElementById('revealedWord');
        const gameOverMessage = document.getElementById('gameOverMessage');
        
        if (!modal || !revealedWord) return;
        
        revealedWord.textContent = this.targetWord;
        
        if (gameOverMessage) {
            if (this.language === 'es') {
                gameOverMessage.textContent = 'Se acabaron los intentos';
            } else {
                gameOverMessage.textContent = 'Out of attempts';
            }
        }
        
        modal.classList.remove('hidden');
    }
    
    focusCurrentTile() {
        // Remover focus de todos los tiles
        document.querySelectorAll('.wordle-tile').forEach(tile => {
            tile.classList.remove('active');
        });
        
        if (this.currentRow < this.ROWS && this.currentCol < this.COLS) {
            const tile = document.getElementById(`tile-${this.currentRow}-${this.currentCol}`);
            if (tile) {
                tile.classList.add('active');
            }
        }
    }
    
    focusFirstTile() {
        this.currentRow = 0;
        this.currentCol = 0;
        this.focusCurrentTile();
    }
    
    updateAttemptCounter() {
        const counter = document.getElementById('currentAttempt');
        if (counter) {
            counter.textContent = this.currentRow + 1;
        }
    }
    
    resetGame() {
        // Ocultar modales
        const gameOver = document.getElementById('gameOver');
        const gameWin = document.getElementById('gameWin');
        if (gameOver) gameOver.classList.add('hidden');
        if (gameWin) gameWin.classList.add('hidden');
        
        // Volver a la pantalla de idioma
        this.showLanguageScreen();
        
        // Resetear estado
        this.currentRow = 0;
        this.currentCol = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.letterStates = {};
        
        // Seleccionar nueva palabra del día (puede ser la misma si es el mismo día)
        this.selectDailyWord();
        
        // Limpiar tablero
        this.createBoard();
        
        // Resetear teclado
        document.querySelectorAll('.keyboard-key').forEach(key => {
            key.classList.remove('correct', 'present', 'absent');
        });
    }
}

// Inicializar juego cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new WordleGame();
    });
} else {
    new WordleGame();
}

