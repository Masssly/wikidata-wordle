export const BASE_QUERY_TEMPLATES = {
    NOUNS: `
SELECT ?lexeme ?lemma ?gender (GROUP_CONCAT(?plural; separator=", ") as ?plurals) ?description ?image ?audio
WHERE {
    ?lexeme dct:language wd:{{LANGUAGE_QID}};
            wikibase:lexicalCategory wd:Q1084;
            wikibase:lemma ?lemma.
    
    OPTIONAL { ?lexeme wdt:P5185 ?gender. }
    OPTIONAL { ?lexeme wdt:P7296 ?plural. }
    OPTIONAL { ?lexeme schema:description ?description. FILTER(LANG(?description) = "{{LANGUAGE_CODE}}") }
    OPTIONAL { ?lexeme wdt:P18 ?image. }
    OPTIONAL { ?lexeme wdt:P443 ?audio. }
    
    FILTER(LANG(?lemma) = "{{LANGUAGE_CODE}}")
    FILTER(STRLEN(?lemma) >= {{MIN_LENGTH}} && STRLEN(?lemma) <= {{MAX_LENGTH}})
}
GROUP BY ?lexeme ?lemma ?gender ?description ?image ?audio
LIMIT {{LIMIT}}
    `,

    LEXEME_DETAILS: `
SELECT ?lexeme ?lemma ?lexicalCategory ?gender ?plural ?description ?image ?audio ?translation
WHERE {
    BIND(wd:{{LEXEME_QID}} AS ?lexeme)
    ?lexeme wikibase:lemma ?lemma;
            wikibase:lexicalCategory ?lexicalCategory.
    
    OPTIONAL { ?lexeme wdt:P5185 ?gender. }
    OPTIONAL { ?lexeme wdt:P7296 ?plural. }
    OPTIONAL { ?lexeme schema:description ?description. FILTER(LANG(?description) = "{{LANGUAGE_CODE}}") }
    OPTIONAL { ?lexeme wdt:P18 ?image. }
    OPTIONAL { ?lexeme wdt:P443 ?audio. }
    OPTIONAL { 
        ?lexeme ^wdt:P5972 ?sense.
        ?sense skos:altLabel ?translation.
        FILTER(LANG(?translation) = "en")
    }
}
    `
};
