import { BASE_QUERY_TEMPLATES } from './queries/baseQueries.js';
// Import individual constants
import { WORD_LENGTH } from '../config/constants.js';

export class QueryBuilder {
    static buildQuery(language, wordType = 'nouns', options = {}) {
        const template = BASE_QUERY_TEMPLATES[wordType.toUpperCase()];
        
        if (!template) {
            throw new Error(`No query template found for word type: ${wordType}`);
        }

        const defaults = {
            LIMIT: options.limit || 50,
            MIN_LENGTH: options.minLength || WORD_LENGTH.MIN,
            MAX_LENGTH: options.maxLength || WORD_LENGTH.MAX
        };

        return template
            .replace('{{LANGUAGE_QID}}', language.qid)
            .replace('{{LANGUAGE_CODE}}', language.code)
            .replace('{{LIMIT}}', defaults.LIMIT)
            .replace('{{MIN_LENGTH}}', defaults.MIN_LENGTH)
            .replace('{{MAX_LENGTH}}', defaults.MAX_LENGTH);
    }

    static buildLexemeDetailsQuery(lexemeQid, languageCode) {
        return BASE_QUERY_TEMPLATES.LEXEME_DETAILS
            .replace('{{LEXEME_QID}}', lexemeQid)
            .replace('{{LANGUAGE_CODE}}', languageCode);
    }
}
