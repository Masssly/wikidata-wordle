// Import individual constants instead of the whole object
import { MAX_ATTEMPTS, WORD_LENGTH } from './constants.js';

export const DEFAULT_SETTINGS = {
    maxAttempts: MAX_ATTEMPTS,
    difficulty: 'medium',
    enableHints: true,
    enableAudio: true,
    wordLength: {
        min: WORD_LENGTH.MIN,
        max: WORD_LENGTH.MAX
    }
};

export class GameSettings {
    constructor() {
        this.settings = this.loadSettings();
    }

    loadSettings() {
        const saved = localStorage.getItem('wikidata-wordle-settings');
        return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : { ...DEFAULT_SETTINGS };
    }

    saveSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        localStorage.setItem('wikidata-wordle-settings', JSON.stringify(this.settings));
        return this.settings;
    }

    getSettings() {
        return this.settings;
    }

    updateSetting(key, value) {
        return this.saveSettings({ [key]: value });
    }
}
