import { GAME_CONSTANTS } from '../config/constants.js';

export class GameBoard {
    constructor(onGuessSubmit, onNewGame) {
        this.onGuessSubmit = onGuessSubmit;
        this.onNewGame = onNewGame;
        this.container = null;
        this.currentRow = 0;
        this.boardState = [];
    }

    render(container) {
        this.container = container;
        
        const gameBoardHTML = `
            <div class="game-board">
                <div class="game-header">
                    <h2>Wikidata Wordle</h2>
                    <div class="game-info">
                        <span id="wordLength">Word Length: ?</span>
                        <span id="attemptsRemaining">Attempts: ${GAME_CONSTANTS.MAX_ATTEMPTS}</span>
                    </div>
                </div>
                
                <div class="board-grid" id="boardGrid">
                    <!-- Game board will be generated here -->
                </div>
                
                <div class="game-controls">
                    <button id="newGameBtn" class="btn-primary">New Game</button>
                    <button id="hintBtn" class="btn-secondary">Get Hint</button>
                </div>
                
                <div class="message-area" id="messageArea"></div>
            </div>
        `;

        container.innerHTML = gameBoardHTML;
        this.attachEventListeners();
    }

    initializeBoard(wordLength) {
        this.currentRow = 0;
        this.boardState = [];
        this.wordLength = wordLength;
        
        const boardGrid = this.container.querySelector('#boardGrid');
        boardGrid.innerHTML = '';
        
        // Create empty board
        for (let row = 0; row < GAME_CONSTANTS.MAX_ATTEMPTS; row++) {
            const rowElement = document.createElement('div');
            rowElement.className = 'board-row';
            rowElement.id = `row-${row}`;
            
            for (let col = 0; col < wordLength; col++) {
                const cell = document.createElement('div');
                cell.className = 'board-cell';
                cell.id = `cell-${row}-${col}`;
                cell.textContent = '';
                rowElement.appendChild(cell);
            }
            
            boardGrid.appendChild(rowElement);
            this.boardState[row] = Array(wordLength).fill({ letter: '', status: 'empty' });
        }

        // Update word length display
        const wordLengthElement = this.container.querySelector('#wordLength');
        if (wordLengthElement) {
            wordLengthElement.textContent = `Word Length: ${wordLength}`;
        }

        this.updateAttemptsDisplay();
        this.clearMessage();
    }

    updateBoard(guessResult) {
        if (!guessResult || !guessResult.evaluation) return;

        const { guess, evaluation, gameOver, guessesRemaining } = guessResult;
        
        // Update the current row with the guess evaluation
        for (let i = 0; i < evaluation.length; i++) {
            const cell = this.container.querySelector(`#cell-${this.currentRow}-${i}`);
            if (cell) {
                cell.textContent = evaluation[i].letter.toUpperCase();
                cell.className = `board-cell ${evaluation[i].status}`;
                
                // Update board state
                this.boardState[this.currentRow][i] = {
                    letter: evaluation[i].letter,
                    status: evaluation[i].status
                };
            }
        }

        this.currentRow++;
        this.updateAttemptsDisplay();

        // Handle game over states
        if (gameOver) {
            if (gameOver.won) {
                this.showMessage(gameOver.message, 'success');
            } else {
                this.showMessage(gameOver.message, 'error');
            }
            this.disableInput();
        }
    }

    updateAttemptsDisplay() {
        const attemptsElement = this.container.querySelector('#attemptsRemaining');
        if (attemptsElement) {
            const remaining = GAME_CONSTANTS.MAX_ATTEMPTS - this.currentRow;
            attemptsElement.textContent = `Attempts: ${remaining}`;
        }
    }

    showMessage(message, type = 'info') {
        const messageArea = this.container.querySelector('#messageArea');
        if (messageArea) {
            messageArea.textContent = message;
            messageArea.className = `message-area ${type}`;
            messageArea.style.display = 'block';
        }
    }

    clearMessage() {
        const messageArea = this.container.querySelector('#messageArea');
        if (messageArea) {
            messageArea.textContent = '';
            messageArea.style.display = 'none';
        }
    }

    showHint(hintData) {
        if (!hintData) return;

        let hintMessage = '';
        
        switch (hintData.type) {
            case 'grammatical_features':
                const features = hintData.data;
                hintMessage = 'Grammatical features: ';
                if (features.gender) hintMessage += `Gender: ${features.gender} `;
                if (features.plurals && features.plurals.length > 0) {
                    hintMessage += `Plurals: ${features.plurals.join(', ')}`;
                }
                break;
                
            case 'definition':
                hintMessage = `Definition: ${hintData.data}`;
                break;
                
            case 'image':
                hintMessage = 'There is an image available for this word';
                // You could also display the image here
                break;
                
            case 'pronunciation':
                hintMessage = 'Audio pronunciation is available';
                break;
                
            default:
                hintMessage = 'Hint: ' + JSON.stringify(hintData);
        }

        this.showMessage(hintMessage, 'hint');
    }

    disableInput() {
        const buttons = this.container.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = true);
    }

    enableInput() {
        const buttons = this.container.querySelectorAll('button');
        buttons.forEach(btn => btn.disabled = false);
    }

    attachEventListeners() {
        const newGameBtn = this.container.querySelector('#newGameBtn');
        const hintBtn = this.container.querySelector('#hintBtn');

        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.onNewGame();
            });
        }

        if (hintBtn) {
            hintBtn.addEventListener('click', () => {
                // This will be connected to the hint system
                this.showMessage('Hint feature coming soon!', 'info');
            });
        }
    }

    getBoardState() {
        return {
            currentRow: this.currentRow,
            boardState: this.boardState,
            wordLength: this.wordLength
        };
    }
}
