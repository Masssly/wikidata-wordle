import { WikidataAPI } from '../data/WikidataAPI.js';
// Import individual constants
import { MAX_ATTEMPTS, WORD_LENGTH, HINTS } from '../config/constants.js';

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
        this.gameState = 'idle';
        this.hintsUsed = new Set();
        this.maxAttempts = MAX_ATTEMPTS;
    }

    async initializeGame(language, wordType = 'nouns') {
        try {
            this.resetGame();
            this.gameState = 'loading';

            const lexemes = await this.wikidataAPI.fetchLexemes(language, wordType, {
                limit: 100,
                minLength: WORD_LENGTH.MIN,
                maxLength: WORD_LENGTH.MAX
            });

            if (lexemes.length === 0) {
                throw new Error('No lexemes found for the selected language and filters');
            }

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
            guessesRemaining: this.maxAttempts - this.guesses.length
        };
    }

    evaluateGuess(guess) {
        const evaluation = [];
        const targetLetters = this.targetWord.split('');
        const guessLetters = guess.toLowerCase().split('');

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

        if (this.guesses.length >= this.maxAttempts) {
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
            case HINTS.GRAMMATICAL_FEATURES:
                return {
                    type: 'grammatical_features',
                    data: this.currentLexeme.grammaticalFeatures
                };
            
            case HINTS.DEFINITION:
                return {
                    type: 'definition',
                    data: this.currentLexeme.description || 'No description available'
                };
            
            case HINTS.IMAGE:
                return this.currentLexeme.image ? {
                    type: 'image',
                    data: this.currentLexeme.image
                } : null;
            
            case HINTS.PRONUNCIATION:
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
            guessesRemaining: this.maxAttempts - this.guesses.length
        };
    }
}
