export class Keyboard {
    constructor(onKeyPress) {
        this.onKeyPress = onKeyPress;
        this.container = null;
        this.keyStates = {}; // Track key states: 'correct', 'present', 'absent', 'unused'
    }

    render(container) {
        this.container = container;
        
        const keyboardHTML = `
            <div class="virtual-keyboard">
                <div class="keyboard-row" id="row1">
                    ${this.generateKeys('qwertyuiop')}
                </div>
                <div class="keyboard-row" id="row2">
                    ${this.generateKeys('asdfghjkl')}
                </div>
                <div class="keyboard-row" id="row3">
                    <button class="key key-special key-enter">ENTER</button>
                    ${this.generateKeys('zxcvbnm')}
                    <button class="key key-special key-backspace">⌫</button>
                </div>
            </div>
        `;

        container.innerHTML = keyboardHTML;
        this.attachEventListeners();
    }

    generateKeys(keys) {
        return keys.split('').map(key => 
            `<button class="key" data-key="${key}">${key.toUpperCase()}</button>`
        ).join('');
    }

    attachEventListeners() {
        const keys = this.container.querySelectorAll('.key');
        keys.forEach(key => {
            key.addEventListener('click', () => {
                const keyValue = key.dataset.key;
                this.onKeyPress(keyValue);
            });
        });

        const enterKey = this.container.querySelector('.key-enter');
        const backspaceKey = this.container.querySelector('.key-backspace');

        if (enterKey) {
            enterKey.addEventListener('click', () => {
                this.onKeyPress('Enter');
            });
        }

        if (backspaceKey) {
            backspaceKey.addEventListener('click', () => {
                this.onKeyPress('Backspace');
            });
        }

        // Physical keyboard support
        document.addEventListener('keydown', (event) => {
            this.handlePhysicalKeyPress(event);
        });
    }

    handlePhysicalKeyPress(event) {
        const key = event.key.toLowerCase();
        
        if (key === 'enter') {
            this.onKeyPress('Enter');
            event.preventDefault();
        } else if (key === 'backspace') {
            this.onKeyPress('Backspace');
            event.preventDefault();
        } else if (/^[a-z]$/.test(key)) {
            this.onKeyPress(key);
            event.preventDefault();
        }
    }

    updateKeyStates(guessEvaluation) {
        if (!guessEvaluation) return;

        // Update key states based on the latest guess
        guessEvaluation.forEach(({ letter, status }) => {
            const currentState = this.keyStates[letter];
            
            // Only upgrade key state (correct > present > absent)
            if (!currentState || this.getStatePriority(status) > this.getStatePriority(currentState)) {
                this.keyStates[letter] = status;
            }
        });

        this.updateKeyAppearance();
    }

    getStatePriority(status) {
        const priorities = {
            'correct': 3,
            'present': 2,
            'absent': 1,
            'unused': 0
        };
        return priorities[status] || 0;
    }

    updateKeyAppearance() {
        const keys = this.container.querySelectorAll('.key[data-key]');
        
        keys.forEach(key => {
            const keyChar = key.dataset.key;
            const state = this.keyStates[keyChar];
            
            // Reset classes
            key.className = 'key';
            
            // Add state class if exists
            if (state && state !== 'unused') {
                key.classList.add(state);
            }
        });
    }

    reset() {
        this.keyStates = {};
        this.updateKeyAppearance();
    }

    disable() {
        const keys = this.container.querySelectorAll('.key');
        keys.forEach(key => key.disabled = true);
    }

    enable() {
        const keys = this.container.querySelectorAll('.key');
        keys.forEach(key => key.disabled = false);
    }
}
