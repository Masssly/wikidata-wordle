import { GameEngine } from './modules/core/GameEngine.js';
import { LanguageSelector } from './modules/ui/LanguageSelector.js';
import { GameBoard } from './modules/ui/GameBoard.js';
import { Keyboard } from './modules/ui/Keyboard.js';
import { HintSystem } from './modules/ui/HintSystem.js';
import { SUPPORTED_LANGUAGES } from './modules/config/supportedLanguages.js';

class WikidataWordle {
    constructor() {
        this.gameEngine = new GameEngine();
        this.currentGuess = '';
        this.isGameActive = false;
        
        this.initializeApp();
    }

    async initializeApp() {
        try {
            console.log("Initializing Wikidata Wordle...");
            
            this.appContainer = document.getElementById('app');
            if (!this.appContainer) {
                throw new Error('App container not found');
            }

            // Render the main app structure
            this.renderAppStructure();
            
            // Initialize all UI components
            this.initializeUIComponents();
            
            // Start with a default language
            await this.startNewGame('we'); // Start with Welsh
            
            console.log('Wikidata Wordle initialized successfully!');

        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the game: ' + error.message);
        }
    }

    renderAppStructure() {
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
                        <div id="messageArea" class="message-area"></div>
                    </div>
                </main>
                
                <div id="loadingOverlay" class="loading-overlay hidden">
                    <div class="loading-spinner"></div>
                    <p>Loading game data from Wikidata...</p>
                </div>
            </div>
        `;
    }

    initializeUIComponents() {
        console.log("Initializing UI components...");
        
        // Initialize language selector
        this.languageSelector = new LanguageSelector(
            (langCode) => this.onLanguageChange(langCode)
        );
        this.languageSelector.render(
            document.getElementById('languageSelectorContainer')
        );

        // Initialize game board
        this.gameBoard = new GameBoard(
            (guess) => this.onGuessSubmit(guess),
            () => this.startNewGame()
        );
        this.gameBoard.render(
            document.getElementById('gameBoardContainer')
        );

        // Initialize keyboard
        this.keyboard = new Keyboard(
            (key) => this.onKeyPress(key)
        );
        this.keyboard.render(
            document.getElementById('keyboardContainer')
        );

        // Initialize hint system
        this.hintSystem = new HintSystem(
            (hintType) => this.onHintRequest(hintType)
        );
        this.hintSystem.render(
            document.getElementById('hintSystemContainer')
        );

        console.log("UI components initialized!");
    }

    async onLanguageChange(languageCode) {
        console.log("Language changed to:", languageCode);
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
            this.showMessage('Starting new game...', 'info');
            
            const targetLanguage = languageCode ? 
                SUPPORTED_LANGUAGES[languageCode] : 
                this.languageSelector.getCurrentLanguage();

            if (!targetLanguage) {
                throw new Error('No language selected');
            }

            console.log("Starting game with language:", targetLanguage.name);
            
            const result = await this.gameEngine.initializeGame(targetLanguage, 'nouns');

            if (!result.success) {
                throw new Error(result.error);
            }

            // Initialize UI components with the new game
            this.gameBoard.initializeBoard(result.wordLength);
            this.keyboard.reset();
            this.hintSystem.initializeHints('medium');
            this.hintSystem.clearHints();

            this.currentGuess = '';
            this.isGameActive = true;

            this.showMessage(`New ${targetLanguage.name} game started! Guess the word.`, 'success');
            console.log("Game started successfully!");

        } catch (error) {
            console.error('Failed to start new game:', error);
            this.showMessage(`Error: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    onKeyPress(key) {
        if (!this.isGameActive) return;

        console.log("Key pressed:", key);
        
        if (key === 'Enter') {
            this.submitCurrentGuess();
        } else if (key === 'Backspace') {
            this.currentGuess = this.currentGuess.slice(0, -1);
            this.updateCurrentGuessDisplay();
        } else if (/^[a-z]$/.test(key)) {
            // Only allow letters and respect word length
            const wordLength = this.gameEngine.targetWord?.length || 0;
            if (this.currentGuess.length < wordLength) {
                this.currentGuess += key;
                this.updateCurrentGuessDisplay();
            }
        }
    }

    updateCurrentGuessDisplay() {
        // For now, we'll just log the current guess
        // In a full implementation, this would update the visual game board
        console.log("Current guess:", this.currentGuess);
    }

    async submitCurrentGuess() {
        if (!this.isGameActive) return;

        const wordLength = this.gameEngine.targetWord?.length || 0;
        if (this.currentGuess.length !== wordLength) {
            this.showMessage(`Please enter a ${wordLength}-letter word`, 'error');
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
                if (this.languageSelector.enable) {
                    this.languageSelector.enable();
                }
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
            if (hintData) {
                this.gameBoard.showHint(hintData);
            }
            return hintData;
        } catch (error) {
            console.error('Error getting hint:', error);
            this.showMessage('Error getting hint', 'error');
            return null;
        }
    }

    showLoading(show) {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.toggle('hidden', !show);
        }
    }

    showMessage(message, type = 'info') {
        const messageArea = document.getElementById('messageArea');
        if (messageArea) {
            messageArea.textContent = message;
            messageArea.className = `message-area ${type}`;
            messageArea.style.display = 'block';
            
            // Auto-hide success/info messages after 3 seconds
            if (type === 'success' || type === 'info') {
                setTimeout(() => {
                    messageArea.style.display = 'none';
                }, 3000);
            }
        }
        console.log(`[${type}] ${message}`);
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
    console.log("DOM loaded, starting Wikidata Wordle...");
    new WikidataWordle();
});

// Make it available globally for debugging
window.WikidataWordleApp = WikidataWordle;
