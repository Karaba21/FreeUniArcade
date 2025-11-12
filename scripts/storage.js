// Storage utilities for games
// All code is original

/**
 * Get high score from localStorage for a specific game
 * @param {string} gameName - Name of the game (e.g., 'snake')
 * @returns {number} High score, or 0 if not found
 */
function getHighScore(gameName) {
    try {
        const key = `highScore_${gameName}`;
        const stored = localStorage.getItem(key);
        return stored ? parseInt(stored, 10) : 0;
    } catch (error) {
        console.error('Error getting high score:', error);
        return 0;
    }
}

/**
 * Save high score to localStorage for a specific game
 * @param {string} gameName - Name of the game (e.g., 'snake')
 * @param {number} score - Score to save
 * @returns {boolean} True if saved successfully, false otherwise
 */
function saveHighScore(gameName, score) {
    try {
        const key = `highScore_${gameName}`;
        const currentHighScore = getHighScore(gameName);
        
        // Only save if the new score is higher
        if (score > currentHighScore) {
            localStorage.setItem(key, score.toString());
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error saving high score:', error);
        return false;
    }
}

