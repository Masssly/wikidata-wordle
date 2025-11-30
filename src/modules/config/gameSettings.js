import { GAME_CONSTANTS } from './constants.js';

export const DEFAULT_SETTINGS = {
    maxAttempts: GAME_CONSTANTS.MAX_ATTEMPTS,
    difficulty: 'medium',
    enableHints: true,
    enableAudio: true,
    wordLength: {
        min: GAME_CONSTANTS.WORD_LENGTH.MIN,
        max: GAME_CONSTANTS.WORD_LENGTH.MAX
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
