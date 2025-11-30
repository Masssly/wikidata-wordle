// src/modules/config/constants.js
// Using simple exports to avoid circular dependencies

export const MAX_ATTEMPTS = 6;

export const WORD_LENGTH = {
    MIN: 3,
    MAX: 12
};

export const HINTS = {
    GRAMMATICAL_FEATURES: 'grammatical_features',
    DEFINITION: 'definition',
    IMAGE: 'image',
    TRANSLATIONS: 'translations',
    PRONUNCIATION: 'pronunciation'
};

export const DIFFICULTY_LEVELS = {
    EASY: ['grammatical_features', 'definition'],
    MEDIUM: ['image', 'translations'],
    HARD: ['pronunciation']
};

// If you need a combined object, create it after all individual exports
export const GAME_CONSTANTS = {
    MAX_ATTEMPTS,
    WORD_LENGTH,
    HINTS,
    DIFFICULTY_LEVELS
};
