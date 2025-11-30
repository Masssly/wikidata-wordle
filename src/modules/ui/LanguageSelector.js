// src/modules/ui/LanguageSelector.js
export class LanguageSelector {
    constructor(onLanguageChange) {
        this.onLanguageChange = onLanguageChange;
        this.currentLanguage = null;
    }
    
    render() {
        // Creates language dropdown
    }
    
    handleSelection(languageCode) {
        this.currentLanguage = languageCode;
        this.onLanguageChange(languageCode);
    }
}
