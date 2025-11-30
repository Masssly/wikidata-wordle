export const SUPPORTED_LANGUAGES = {
    'we': {
        qid: 'Q9307',
        name: 'Welsh',
        nativeName: 'Cymraeg',
        code: 'we',
        wordTypes: ['nouns'],
        defaultWordType: 'nouns'
    },
    'eu': {
        qid: 'Q8752',
        name: 'Basque',
        nativeName: 'Euskara',
        code: 'eu',
        wordTypes: ['nouns'],
        defaultWordType: 'nouns'
    },
    'da': {
        qid: 'Q9035',
        name: 'Danish',
        nativeName: 'Dansk',
        code: 'da',
        wordTypes: ['nouns'],
        defaultWordType: 'nouns'
    },
    'la': {
        qid: 'Q397',
        name: 'Latin',
        nativeName: 'Latina',
        code: 'la',
        wordTypes: ['nouns'],
        defaultWordType: 'nouns'
    }
};

export const getLanguageByCode = (code) => {
    return SUPPORTED_LANGUAGES[code] || null;
};

export const getAllLanguageCodes = () => {
    return Object.keys(SUPPORTED_LANGUAGES);
};
