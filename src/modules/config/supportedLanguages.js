// src/modules/config/supportedLanguages.js
export const SUPPORTED_LANGUAGES = {
    'we': { 
        qid: 'Q9307', 
        name: 'Welsh', 
        nativeName: 'Cymraeg',
        wordTypes: ['nouns', 'verbs']
    },
    'eu': { 
        qid: 'Q8752', 
        name: 'Basque', 
        nativeName: 'Euskara',
        wordTypes: ['nouns', 'verbs'] 
    },
    // ... other languages
};

// src/modules/config/gameSettings.js
export const GAME_SETTINGS = {
    MAX_ATTEMPTS: 6,
    WORD_LENGTH_LIMITS: { min: 3, max: 12 },
    HINT_LEVELS: {
        EASY: ['grammatical_features', 'definition'],
        MEDIUM: ['image', 'translations'],
        HARD: ['pronunciation']
    }
};
