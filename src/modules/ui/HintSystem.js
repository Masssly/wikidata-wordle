import { GAME_CONSTANTS } from '../config/constants.js';

export class HintSystem {
    constructor(onHintRequest) {
        this.onHintRequest = onHintRequest;
        this.container = null;
        this.availableHints = [];
        this.usedHints = new Set();
    }

    render(container) {
        this.container = container;
        
        const hintSystemHTML = `
            <div class="hint-system">
                <h4>Available Hints</h4>
                <div class="hint-buttons" id="hintButtons">
                    <!-- Hint buttons will be generated here -->
                </div>
                <div class="hint-display" id="hintDisplay"></div>
            </div>
        `;

        container.innerHTML = hintSystemHTML;
    }

    initializeHints(difficulty = 'medium') {
        this.usedHints.clear();
        this.availableHints = GAME_CONSTANTS.DIFFICULTY_LEVELS[difficulty] || 
                             GAME_CONSTANTS.DIFFICULTY_LEVELS.medium;
        
        this.renderHintButtons();
    }

    renderHintButtons() {
        const hintButtonsContainer = this.container.querySelector('#hintButtons');
        if (!hintButtonsContainer) return;

        hintButtonsContainer.innerHTML = this.availableHints.map(hintType => {
            const isUsed = this.usedHints.has(hintType);
            const buttonText = this.getHintButtonText(hintType);
            
            return `
                <button class="hint-btn ${isUsed ? 'used' : ''}" 
                        data-hint="${hintType}" 
                        ${isUsed ? 'disabled' : ''}>
                    ${buttonText}
                </button>
            `;
        }).join('');

        this.attachHintEventListeners();
    }

    getHintButtonText(hintType) {
        const hintTexts = {
            'grammatical_features': 'Grammar',
            'definition': 'Definition',
            'image': 'Image',
            'translations': 'Translation',
            'pronunciation': 'Audio'
        };
        return hintTexts[hintType] || hintType;
    }

    attachHintEventListeners() {
        const hintButtons = this.container.querySelectorAll('.hint-btn:not(.used)');
        
        hintButtons.forEach(button => {
            button.addEventListener('click', () => {
                const hintType = button.dataset.hint;
                this.requestHint(hintType);
            });
        });
    }

    async requestHint(hintType) {
        if (this.usedHints.has(hintType)) {
            return; // Hint already used
        }

        this.usedHints.add(hintType);
        const hintData = await this.onHintRequest(hintType);
        
        if (hintData) {
            this.displayHint(hintData);
            this.renderHintButtons(); // Update UI to show used hint
        }
    }

    displayHint(hintData) {
        const hintDisplay = this.container.querySelector('#hintDisplay');
        if (!hintDisplay) return;

        let hintHTML = '';

        switch (hintData.type) {
            case 'grammatical_features':
                const features = hintData.data;
                hintHTML = `
                    <div class="hint-content grammatical-hint">
                        <strong>Grammatical Features:</strong>
                        ${features.gender ? `<div>Gender: ${features.gender}</div>` : ''}
                        ${features.plurals && features.plurals.length > 0 ? 
                          `<div>Plural forms: ${features.plurals.join(', ')}</div>` : ''}
                    </div>
                `;
                break;

            case 'definition':
                hintHTML = `
                    <div class="hint-content definition-hint">
                        <strong>Definition:</strong>
                        <div>${hintData.data}</div>
                    </div>
                `;
                break;

            case 'image':
                hintHTML = `
                    <div class="hint-content image-hint">
                        <strong>Visual Reference:</strong>
                        <img src="${hintData.data}" alt="Word visual reference" style="max-width: 200px; max-height: 150px;">
                    </div>
                `;
                break;

            case 'pronunciation':
                hintHTML = `
                    <div class="hint-content audio-hint">
                        <strong>Pronunciation:</strong>
                        <audio controls src="${hintData.data}">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                `;
                break;

            default:
                hintHTML = `<div class="hint-content">Hint: ${JSON.stringify(hintData)}</div>`;
        }

        hintDisplay.innerHTML = hintHTML;
        hintDisplay.style.display = 'block';
    }

    clearHints() {
        const hintDisplay = this.container.querySelector('#hintDisplay');
        if (hintDisplay) {
            hintDisplay.innerHTML = '';
            hintDisplay.style.display = 'none';
        }
        
        this.usedHints.clear();
        this.renderHintButtons();
    }

    getUsedHints() {
        return Array.from(this.usedHints);
    }
}
