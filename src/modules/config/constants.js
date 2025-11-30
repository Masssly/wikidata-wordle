export const GAME_CONSTANTS = {
    MAX_ATTEMPTS: 6,
    WORD_LENGTH: {
        MIN: 3,
        MAX: 12
    },
    HINTS: {
        GRAMMATICAL_FEATURES: 'grammatical_features',
        DEFINITION: 'definition',
        IMAGE: 'image',
        TRANSLATIONS: 'translations',
        PRONUNCIATION: 'pronunciation'
    },
    DIFFICULTY_LEVELS: {
        EASY: [GAME_CONSTANTS.HINTS.GRAMMATICAL_FEATURES, GAME_CONSTANTS.HINTS.DEFINITION],
        MEDIUM: [GAME_CONSTANTS.HINTS.IMAGE, GAME_CONSTANTS.HINTS.TRANSLATIONS],
        HARD: [GAME_CONSTANTS.HINTS.PRONUNCIATION]
    }
};
