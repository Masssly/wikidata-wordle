// src/index.js
import { GameEngine } from './modules/core/GameEngine.js';
import { LanguageSelector } from './modules/ui/LanguageSelector.js';
import { GameBoard } from './modules/ui/GameBoard.js';
import { SUPPORTED_LANGUAGES } from './modules/config/supportedLanguages.js';

class WikidataWordle {
    constructor() {
        this.gameEngine = new GameEngine();
        this.initializeApp();
    }
    
    async initializeApp() {
        this.languageSelector = new LanguageSelector(
            (lang) => this.onLanguageChange(lang)
        );
        this.gameBoard = new GameBoard(
            (guess) => this.onGuessSubmit(guess)
        );
        
        this.renderInitialUI();
    }
    
    async onLanguageChange(languageCode) {
        const languageConfig = SUPPORTED_LANGUAGES[languageCode];
        await this.gameEngine.initializeGame(languageConfig, 'nouns');
        this.gameBoard.reset();
    }
    
    onGuessSubmit(guess) {
        const result = this.gameEngine.submitGuess(guess);
        this.gameBoard.update(result);
    }
}

// Initialize the application
new WikidataWordle();
