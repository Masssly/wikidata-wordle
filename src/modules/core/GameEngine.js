import { WikidataAPI } from '../data/WikidataAPI.js';
import { GAME_CONSTANTS } from '../config/constants.js';

export class GameEngine {
    constructor() {
        this.wikidataAPI = new WikidataAPI();
        this.resetGame();
    }

    resetGame() {
        this.currentLexeme = null;
        this.targetWord = '';
        this.guesses = [];
        this.currentGuess = '';
        this.gameState = 'idle'; // 'idle', 'playing', 'won', 'lost'
        this.hintsUsed = new Set();
    }

    async initializeGame(language, wordType = 'nouns') {
        try {
            this.resetGame();
            this.gameState = 'loading';

            const lexemes = await this.wikidataAPI.fetchLexemes(language, wordType, {
                limit: 100,
                minLength: GAME_CONSTANTS.WORD_LENGTH.MIN,
                maxLength: GAME_CONSTANTS.WORD_LENGTH.MAX
            });

            if (lexemes.length === 0) {
                throw new Error('No lexemes found for the selected language and filters');
            }

            // Select a random lexeme
            this.currentLexeme = lexemes[Math.floor(Math.random() * lexemes.length)];
            this.targetWord = this.currentLexeme.lemma.toLowerCase();
            this.gameState = 'playing';

            return {
                success: true,
                lexeme: this.currentLexeme,
                wordLength: this.targetWord.length
            };

        } catch (error) {
            this.gameState = 'error';
            return {
                success: false,
                error: error.message
            };
        }
    }

    submitGuess(guess) {
        if (this.gameState !== 'playing') {
            return { error: 'Game is not in playing state' };
        }

        if (guess.length !== this.targetWord.length) {
            return { error: `Guess must be ${this.targetWord.length} letters long` };
        }

        this.guesses.push(guess);
        this.currentGuess = '';

        const evaluation = this.evaluateGuess(guess);
        const gameOver = this.checkGameOver();

        return {
            guess,
            evaluation,
            gameOver,
            guessesRemaining: GAME_CONSTANTS.MAX_ATTEMPTS - this.guesses.length
        };
    }

    evaluateGuess(guess) {
        const evaluation = [];
        const targetLetters = this.targetWord.split('');
        const guessLetters = guess.toLowerCase().split('');

        // First pass: find correct positions
        const correctPositions = new Set();
        const remainingTargetLetters = [];

        for (let i = 0; i < targetLetters.length; i++) {
            if (guessLetters[i] === targetLetters[i]) {
                correctPositions.add(i);
                evaluation[i] = { letter: guessLetters[i], status: 'correct' };
            } else {
                remainingTargetLetters.push(targetLetters[i]);
            }
        }

        // Second pass: find present but wrong position letters
        for (let i = 0; i < guessLetters.length; i++) {
            if (correctPositions.has(i)) continue;

            const targetIndex = remainingTargetLetters.indexOf(guessLetters[i]);
            if (targetIndex !== -1) {
                evaluation[i] = { letter: guessLetters[i], status: 'present' };
                remainingTargetLetters.splice(targetIndex, 1);
            } else {
                evaluation[i] = { letter: guessLetters[i], status: 'absent' };
            }
        }

        return evaluation;
    }

    checkGameOver() {
        const lastGuess = this.guesses[this.guesses.length - 1];
        
        if (lastGuess === this.targetWord) {
            this.gameState = 'won';
            return { won: true, message: 'Congratulations! You won!' };
        }

        if (this.guesses.length >= GAME_CONSTANTS.MAX_ATTEMPTS) {
            this.gameState = 'lost';
            return { won: false, message: `Game over! The word was: ${this.targetWord}` };
        }

        return null;
    }

    useHint(hintType) {
        if (!this.hintsUsed.has(hintType)) {
            this.hintsUsed.add(hintType);
            return this.getHint(hintType);
        }
        return null;
    }

    getHint(hintType) {
        if (!this.currentLexeme) return null;

        switch (hintType) {
            case GAME_CONSTANTS.HINTS.GRAMMATICAL_FEATURES:
                return {
                    type: 'grammatical_features',
                    data: this.currentLexeme.grammaticalFeatures
                };
            
            case GAME_CONSTANTS.HINTS.DEFINITION:
                return {
                    type: 'definition',
                    data: this.currentLexeme.description || 'No description available'
                };
            
            case GAME_CONSTANTS.HINTS.IMAGE:
                return this.currentLexeme.image ? {
                    type: 'image',
                    data: this.currentLexeme.image
                } : null;
            
            case GAME_CONSTANTS.HINTS.PRONUNCIATION:
                return this.currentLexeme.audio ? {
                    type: 'pronunciation',
                    data: this.currentLexeme.audio
                } : null;
            
            default:
                return null;
        }
    }

    getGameState() {
        return {
            gameState: this.gameState,
            currentLexeme: this.currentLexeme,
            targetWord: this.targetWord,
            guesses: this.guesses,
            hintsUsed: Array.from(this.hintsUsed),
            guessesRemaining: GAME_CONSTANTS.MAX_ATTEMPTS - this.guesses.length
        };
    }
}
