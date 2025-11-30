import { GameEngine } from './modules/core/GameEngine.js';
import { LanguageSelector } from './modules/ui/LanguageSelector.js';
import { GameBoard } from './modules/ui/GameBoard.js';
import { Keyboard } from './modules/ui/Keyboard.js';
import { HintSystem } from './modules/ui/HintSystem.js';
import { GameSettings } from './modules/config/gameSettings.js';

class WikidataWordle {
    constructor() {
        this.gameEngine = new GameEngine();
        this.settings = new GameSettings();
        this.currentGuess = '';
        this.isGameActive = false;
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            // Create main app container
            this.appContainer = document.getElementById('app');
            if (!this.appContainer) {
                throw new Error('App container not found');
            }

            this.renderAppShell();
            this.initializeModules();
            this.attachGlobalEventListeners();

            console.log('Wikidata Wordle initialized successfully');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the game. Please refresh the page.');
        }
    }

    renderAppShell() {
        this.appContainer.innerHTML = `
            <div class="app-container">
                <header class="app-header">
                    <h1>🌍 Wikidata Wordle</h1>
                    <p>Guess words from Wikidata in different languages!</p>
                </header>
                
                <main class="app-main">
                    <div class="control-panel">
                        <div id="languageSelectorContainer"></div>
                        <div id="hintSystemContainer"></div>
                    </div>
                    
                    <div class="game-area">
                        <div id="gameBoardContainer"></div>
                        <div id="keyboardContainer"></div>
                    </div>
                </main>
                
                <footer class="app-footer">
                    <p>Powered by Wikidata • Made with ♥ for language learners</p>
                </footer>
                
                <div id="loadingOverlay" class="loading-overlay hidden">
                    <div class="loading-spinner"></div>
                    <p>Loading game data from Wikidata...</p>
                </div>
            </div>
        `;
    }

    initializeModules() {
        // Initialize language selector
        this.languageSelector = new LanguageSelector(
            (langCode) => this.onLanguageChange(langCode)
        );
        this.languageSelector.render(
            this.appContainer.querySelector('#languageSelectorContainer')
        );

        // Initialize game board
        this.gameBoard = new GameBoard(
            (guess) => this.onGuessSubmit(guess),
            () => this.startNewGame()
        );
        this.gameBoard.render(
            this.appContainer.querySelector('#gameBoardContainer')
        );

        // Initialize keyboard
        this.keyboard = new Keyboard(
            (key) => this.onKeyPress(key)
        );
        this.keyboard.render(
            this.appContainer.querySelector('#keyboardContainer')
        );

        // Initialize hint system
        this.hintSystem = new HintSystem(
            (hintType) => this.onHintRequest(hintType)
        );
        this.hintSystem.render(
            this.appContainer.querySelector('#hintSystemContainer')
        );
    }

    async onLanguageChange(languageCode) {
        if (this.isGameActive) {
            const confirmChange = confirm(
                'Changing language will start a new game. Continue?'
            );
            if (!confirmChange) return;
        }

        await this.startNewGame(languageCode);
    }

    async startNewGame(languageCode = null) {
        try {
            this.showLoading(true);
            
            const targetLanguage = languageCode ? 
                this.languageSelector.selectLanguage(languageCode) :
                this.languageSelector.getCurrentLanguage();

            if (!targetLanguage) {
                throw new Error('No language selected');
            }

            const result = await this.gameEngine.initializeGame(
                targetLanguage, 
                'nouns'
            );

            if (!result.success) {
                throw new Error(result.error);
            }

            // Initialize UI components
            this.gameBoard.initializeBoard(result.wordLength);
            this.keyboard.reset();
            this.hintSystem.initializeHints(this.settings.getSettings().difficulty);
            this.hintSystem.clearHints();

            this.currentGuess = '';
            this.isGameActive = true;

            this.showMessage(`New game started! Guess the ${targetLanguage.name} word.`, 'success');

        } catch (error) {
            console.error('Failed to start new game:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    onKeyPress(key) {
        if (!this.isGameActive) return;

        if (key === 'Enter') {
            this.submitCurrentGuess();
        } else if (key === 'Backspace') {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateCurrentGuessDisplay();
        } else if (/^[a-z]$/.test(key) && this.currentGuess.length < this.gameEngine.targetWord.length) {
            this.currentGuess += key;
            this.updateCurrentGuessDisplay();
        }
    }

    updateCurrentGuessDisplay() {
        // This would update the current row in the game board
        // For now, we'll just log it
        console.log('Current guess:', this.currentGuess);
    }

    async submitCurrentGuess() {
        if (!this.isGameActive || this.currentGuess.length !== this.gameEngine.targetWord.length) {
            return;
        }

        try {
            const result = this.gameEngine.submitGuess(this.currentGuess);
            
            if (result.error) {
                this.showMessage(result.error, 'error');
                return;
            }

            // Update game board with the result
            this.gameBoard.updateBoard(result);
            
            // Update keyboard with letter states
            this.keyboard.updateKeyStates(result.evaluation);

            if (result.gameOver) {
                this.isGameActive = false;
                this.languageSelector.enable();
            }

            this.currentGuess = '';
            this.updateCurrentGuessDisplay();

        } catch (error) {
            console.error('Error submitting guess:', error);
            this.showMessage('Error submitting guess', 'error');
        }
    }

    async onHintRequest(hintType) {
        if (!this.isGameActive) return null;

        try {
            const hintData = this.gameEngine.useHint(hintType);
            return hintData;
        } catch (error) {
            console.error('Error getting hint:', error);
            this.showMessage('Error getting hint', 'error');
            return null;
        }
    }

    showLoading(show) {
        const loadingOverlay = this.appContainer.querySelector('#loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.toggle('hidden', !show);
        }
    }

    showMessage(message, type = 'info') {
        // Use the game board's message system
        this.gameBoard.showMessage(message, type);
        
        // Also log to console for debugging
        console.log(`[${type}] ${message}`);
    }

    attachGlobalEventListeners() {
        // Handle physical keyboard
        document.addEventListener('keydown', (event) => {
            if (this.isGameActive && !event.ctrlKey && !event.altKey && !event.metaKey) {
                this.onKeyPress(event.key.toLowerCase());
            }
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            // Could add responsive behavior here
        });
    }

    showError(message) {
        this.appContainer.innerHTML = `
            <div class="error-container">
                <h2>😕 Something went wrong</h2>
                <p>${message}</p>
                <button onclick="location.reload()">Reload Game</button>
            </div>
        `;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WikidataWordle();
});

// Export for potential debugging
window.WikidataWordleApp = WikidataWordle;
