// src/modules/data/WikidataAPI.js
export class WikidataAPI {
    constructor() {
        this.endpoint = 'https://query.wikidata.org/sparql';
    }
    
    async fetchLexemes(language, wordType, limit = 50) {
        const query = QueryBuilder.buildQuery(language, wordType, limit);
        return await this.executeQuery(query);
    }
    
    async executeQuery(query) {
        // HTTP request to Wikidata
    }
}

// src/modules/data/queries/nounQueries.js
export const NOUN_QUERY_TEMPLATE = `
SELECT ?lexeme ?lemma ?gender ?plural WHERE {
    ?lexeme dct:language wd:{{LANGUAGE_QID}};
            wikibase:lexicalCategory wd:Q1084;
            wikibase:lemma ?lemma.
    OPTIONAL { ?lexeme wdt:P5185 ?gender. }
    OPTIONAL { ?lexeme wdt:P7296 ?plural. }
    FILTER(LANG(?lemma) = "{{LANGUAGE_CODE}}")
}
LIMIT {{LIMIT}}
`;
