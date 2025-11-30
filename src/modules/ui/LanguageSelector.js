import { SUPPORTED_LANGUAGES, getAllLanguageCodes } from '../config/supportedLanguages.js';

export class LanguageSelector {
    constructor(onLanguageChange) {
        this.onLanguageChange = onLanguageChange;
        this.currentLanguage = 'we'; // Default to Welsh
        this.container = null;
    }

    render(container) {
        this.container = container;
        
        const languageSelectorHTML = `
            <div class="language-selector">
                <h3>Choose Language</h3>
                <div class="language-grid">
                    ${this.generateLanguageOptions()}
                </div>
                <div class="selected-language">
                    Selected: <strong id="selectedLangName">${SUPPORTED_LANGUAGES[this.currentLanguage].name}</strong>
                </div>
            </div>
        `;

        container.innerHTML = languageSelectorHTML;
        this.attachEventListeners();
    }

    generateLanguageOptions() {
        const languageCodes = getAllLanguageCodes();
        
        return languageCodes.map(code => {
            const lang = SUPPORTED_LANGUAGES[code];
            const isSelected = code === this.currentLanguage ? 'selected' : '';
            
            return `
                <div class="language-option ${isSelected}" data-lang="${code}">
                    <div class="language-flag">${this.getFlagEmoji(code)}</div>
                    <div class="language-info">
                        <div class="language-name">${lang.name}</div>
                        <div class="language-native">${lang.nativeName}</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getFlagEmoji(languageCode) {
        const flagEmojis = {
            'we': '🏴', // Welsh flag
            'eu': '🇪🇸', // Basque (Spain)
            'da': '🇩🇰', // Danish
            'la': '🏛️'  // Latin (Roman building)
        };
        return flagEmojis[languageCode] || '🌐';
    }

    attachEventListeners() {
        const options = this.container.querySelectorAll('.language-option');
        
        options.forEach(option => {
            option.addEventListener('click', () => {
                const langCode = option.dataset.lang;
                this.selectLanguage(langCode);
            });
        });
    }

    selectLanguage(languageCode) {
        if (!SUPPORTED_LANGUAGES[languageCode]) {
            console.error('Invalid language code:', languageCode);
            return;
        }

        // Update UI
        const options = this.container.querySelectorAll('.language-option');
        options.forEach(opt => opt.classList.remove('selected'));
        
        const selectedOption = this.container.querySelector(`[data-lang="${languageCode}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }

        // Update selected language display
        const selectedLangName = this.container.querySelector('#selectedLangName');
        if (selectedLangName) {
            selectedLangName.textContent = SUPPORTED_LANGUAGES[languageCode].name;
        }

        this.currentLanguage = languageCode;
        this.onLanguageChange(languageCode);
    }

    getCurrentLanguage() {
        return SUPPORTED_LANGUAGES[this.currentLanguage];
    }

    disable() {
        const options = this.container.querySelectorAll('.language-option');
        options.forEach(opt => opt.style.pointerEvents = 'none');
    }

    enable() {
        const options = this.container.querySelectorAll('.language-option');
        options.forEach(opt => opt.style.pointerEvents = 'auto');
    }
}
