import { QueryBuilder } from './QueryBuilder.js';

export class WikidataAPI {
    constructor() {
        this.endpoint = 'https://query.wikidata.org/sparql';
        this.headers = {
            'Accept': 'application/sparql-results+json',
            'User-Agent': 'WikidataWordle/1.0'
        };
    }

    async fetchLexemes(language, wordType = 'nouns', options = {}) {
        try {
            const query = QueryBuilder.buildQuery(language, wordType, options);
            const results = await this.executeQuery(query);
            
            return this.transformLexemeResults(results, language);
        } catch (error) {
            console.error('Error fetching lexemes:', error);
            throw new Error(`Failed to fetch lexemes: ${error.message}`);
        }
    }

    async fetchLexemeDetails(lexemeQid, languageCode) {
        try {
            const query = QueryBuilder.buildLexemeDetailsQuery(lexemeQid, languageCode);
            const results = await this.executeQuery(query);
            
            return results.length > 0 ? this.transformLexemeDetail(results[0]) : null;
        } catch (error) {
            console.error('Error fetching lexeme details:', error);
            return null;
        }
    }

    async executeQuery(query) {
        const url = `${this.endpoint}?format=json&query=${encodeURIComponent(query)}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.results.bindings;
    }

    transformLexemeResults(results, language) {
        return results.map(item => ({
            id: item.lexeme.value.split('/').pop(),
            lemma: item.lemma.value,
            language: language.code,
            grammaticalFeatures: {
                gender: item.gender?.value,
                plurals: item.plurals?.value?.split(', ') || []
            },
            description: item.description?.value,
            image: item.image?.value,
            audio: item.audio?.value
        }));
    }

    transformLexemeDetail(item) {
        return {
            id: item.lexeme.value.split('/').pop(),
            lemma: item.lemma.value,
            lexicalCategory: item.lexicalCategory.value.split('/').pop(),
            grammaticalFeatures: {
                gender: item.gender?.value,
                plural: item.plural?.value
            },
            description: item.description?.value,
            image: item.image?.value,
            audio: item.audio?.value,
            translation: item.translation?.value
        };
    }
}
