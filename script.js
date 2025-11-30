// --- JAVASCRIPT LOGIC ---

// --- 1. CONFIGURATION ---
// This section holds configuration that can be easily modified
const CONFIG = {
    MAX_LIVES: 6,
    WORD_LENGTH: 5, // Adjusted for typical Wordle-like experience
    POINTS_PER_LETTER: 10,
    POINTS_PER_WORD: 100,
    POINTS_BONUS_PER_LIFE: 10,
    API_BASE_URL: 'https://query.wikidata.org/sparql',
    // SPARQL query template to fetch lexemes based on language code and word length
    // Note: LANG_PLACEHOLDER and WORD_LENGTH_PLACEHOLDER will be replaced dynamically
    SPARQL_QUERY_TEMPLATE: `
        SELECT ?lexeme ?lemma ?definition ?grammaticalFeature ?translation ?pronunciation ?image WHERE {
          ?lexeme dct:language ?language ;
                  wikibase:lemma ?lemma .
          OPTIONAL { ?lexeme wdt:P5137 ?definition. }
          OPTIONAL { ?lexeme wdt:P5185 ?grammaticalFeature. } # Grammatical features
          OPTIONAL { ?lexeme wdt:P5137 ?translation. FILTER(LANG(?translation) != LANG(?lemma)) } # Translations (different language)
          OPTIONAL { ?lexeme wdt:P443 ?pronunciation. } # Pronunciation (often a file link)
          OPTIONAL { ?lexeme wdt:P18 ?image. } # Image from Wikimedia Commons
          
          # Filter by language (using the ?language variable bound in the query)
          # Filter by word length
          FILTER(STRLEN(?lemma) = WORD_LENGTH_PLACEHOLDER)
          # Filter by language code (ensure lemma is in the requested language)
          FILTER(LANG(?lemma) = "LANG_CODE_PLACEHOLDER")
          # Additional filters can be added here (e.g., POS tags, commonness)
        }
        LIMIT 100 # Get a set of candidates
    `,
    // Map language codes to Wikidata Q-IDs for the dct:language property
    // You might need to expand this list. Example Q-IDs:
    // Dagbani: Q32238, German: Q188, English: Q1860
    LANGUAGE_CODE_TO_QID: {
        "dag": "Q32238",
        "de": "Q188",
        "en": "Q1860"
        // Add more mappings as needed
    }
};

// --- 2. GAME STATE ---
// This object holds the current state of the game
let gameState = {
    currentWord: "",
    currentLemma: "", // Store the original lemma from Wikidata
    currentDefinition: "",
    currentGrammaticalFeatures: "", // Store grammatical features
    currentTranslations: "", // Store translations
    currentPronunciation: "", // Store pronunciation info
    currentImage: "", // Store image URL
    currentLanguageCode: "en", // Default language
    currentLanguageName: "English", // Default language name
    guessedLetters: [],
    correctLetters: [],
    lives: CONFIG.MAX_LIVES,
    score: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    isGameActive: false, // Start as false until initialized
    isLoading: false // Track if data is being fetched
};

// --- 3. DOM ELEMENTS CACHE ---
// Cache DOM elements for easier access
const domElements = {
    wordDisplay: document.getElementById('wordDisplay'),
    hintElement: document.getElementById('hint'),
    definitionElement: document.getElementById('definition'),
    grammaticalFeaturesElement: document.getElementById('grammaticalFeatures'),
    translationsElement: document.getElementById('translations'),
    pronunciationElement: document.getElementById('pronunciation'),
    imagesElement: document.getElementById('images'),
    languageDisplay: document.getElementById('languageDisplay'),
    languageCodeDisplay: document.getElementById('languageCodeDisplay'),
    guessInput: document.getElementById('guessInput'),
    submitBtn: document.getElementById('submitBtn'),
    hintBtn: document.getElementById('hintBtn'),
    newGameBtn: document.getElementById('newGameBtn'),
    feedbackElement: document.getElementById('feedback'),
    livesElement: document.getElementById('lives'),
    scoreElement: document.getElementById('score'),
    gamesPlayedElement: document.getElementById('gamesPlayed'),
    gamesWonElement: document.getElementById('gamesWon'),
    winRateElement: document.getElementById('winRate'),
    languageSelect: document.getElementById('languageSelect')
};

// --- 4. CORE GAME LOGIC FUNCTIONS ---
// These functions handle the core game mechanics

/**
 * Initializes the game state and starts a new round.
 */
function initGame() {
    if (gameState.isLoading) return; // Prevent multiple fetches if one is ongoing

    resetGameState();
    gameState.isGameActive = true;
    gameState.isLoading = true; // Set loading flag
    updateDisplay(); // Show loading state

    // Fetch a new word based on the selected language
    fetchRandomWordFromWikidata(gameState.currentLanguageCode)
        .then(() => {
            gameState.isLoading = false;
            updateDisplay(); // Update display again after word is fetched
        })
        .catch(error => {
            console.error("Error fetching word from Wikidata:", error);
            gameState.isLoading = false;
            showFeedback("Failed to load a new word from Wikidata. Please try again.", false);
            gameState.isGameActive = false; // Stop game if fetch fails
            updateDisplay(); // Update display to show error
        });
}

/**
 * Resets the game state for the current round.
 */
function resetGameState() {
    gameState.guessedLetters = [];
    gameState.correctLetters = [];
    gameState.lives = CONFIG.MAX_LIVES;
    gameState.isGameActive = false; // Will be set to true in initGame
    domElements.guessInput.value = '';
    domElements.feedbackElement.innerHTML = '';
    domElements.guessInput.disabled = false;
    domElements.submitBtn.disabled = false;
    // Reset display fields
    domElements.wordDisplay.textContent = '_ '.repeat(CONFIG.WORD_LENGTH).trim();
    domElements.definitionElement.textContent = "Loading definition...";
    domElements.grammaticalFeaturesElement.textContent = "Grammatical Features: -";
    domElements.translationsElement.textContent = "Translations: -";
    domElements.pronunciationElement.textContent = "Pronunciation: -";
    domElements.imagesElement.textContent = "Images: -";
}

/**
 * Fetches a random lexeme data from Wikidata based on the selected language code.
 * Makes an actual SPARQL query to the Wikidata Query Service.
 * @param {string} languageCode - The language code (e.g., 'en', 'dag').
 */
async function fetchRandomWordFromWikidata(languageCode) {
    const qId = CONFIG.LANGUAGE_CODE_TO_QID[languageCode];
    if (!qId) {
        throw new Error(`Language code '${languageCode}' is not mapped to a Wikidata Q-ID in CONFIG.LANGUAGE_CODE_TO_QID.`);
    }

    // Replace placeholders in the query template
    let query = CONFIG.SPARQL_QUERY_TEMPLATE
        .replace('LANG_PLACEHOLDER', qId)
        .replace('LANG_CODE_PLACEHOLDER', languageCode)
        .replace('WORD_LENGTH_PLACEHOLDER', CONFIG.WORD_LENGTH.toString());

    const url = `${CONFIG.API_BASE_URL}?query=${encodeURIComponent(query)}`;
    console.log("Fetching from Wikidata:", url); // For debugging

    const response = await fetch(url, {
        headers: {
            'Accept': 'application/sparql-results+json'
        }
    });

    if (!response.ok) {
        throw new Error(`Wikidata API request failed with status ${response.status}`);
    }

    const data = await response.json();
    const results = data.results.bindings;

    if (results.length === 0) {
        throw new Error(`No lexemes found for language '${languageCode}' with length ${CONFIG.WORD_LENGTH}.`);
    }

    // Pick a random result from the fetched data
    const randomResult = results[Math.floor(Math.random() * results.length)];

    // Extract data from the result, handling potential missing values
    gameState.currentLemma = randomResult.lemma?.value?.toLowerCase() || "";
    gameState.currentWord = gameState.currentLemma; // Use lemma as the word to guess
    gameState.currentDefinition = randomResult.definition?.value || "Definition not available";
    gameState.currentGrammaticalFeatures = randomResult.grammaticalFeature?.value || "Not specified";
    // Translations might be multiple - join them if needed
    gameState.currentTranslations = randomResult.translation?.value || "Not available";
    gameState.currentPronunciation = randomResult.pronunciation?.value || "Not available";
    gameState.currentImage = randomResult.image?.value || ""; // URL might be available

    console.log("Fetched lexeme data:", gameState); // For debugging
}


/**
 * Updates the display based on the current game state.
 */
function updateDisplay() {
    // Update word display
    if (!gameState.currentWord) {
        domElements.wordDisplay.textContent = '_ '.repeat(CONFIG.WORD_LENGTH).trim();
    } else {
        let displayWord = '';
        for (let i = 0; i < gameState.currentWord.length; i++) {
            const char = gameState.currentWord[i];
            if (gameState.correctLetters.includes(char)) {
                displayWord += char + ' ';
            } else {
                displayWord += '_ ';
            }
        }
        domElements.wordDisplay.textContent = displayWord.trim();
    }

    // Update other display elements
    domElements.hintElement.textContent = gameState.isLoading ? "Fetching word from Wikidata..." : "Guess the word using lexicographical data from Wikidata";
    domElements.definitionElement.textContent = gameState.currentDefinition;
    domElements.grammaticalFeaturesElement.textContent = `Grammatical Features: ${gameState.currentGrammaticalFeatures}`;
    domElements.translationsElement.textContent = `Translations: ${gameState.currentTranslations}`;
    domElements.pronunciationElement.textContent = `Pronunciation: ${gameState.currentPronunciation}`;
    // Handle image display - show link or placeholder
    if (gameState.currentImage) {
        domElements.imagesElement.innerHTML = `Images: <a href="${gameState.currentImage}" target="_blank" rel="noopener">View Image on Commons</a>`;
    } else {
        domElements.imagesElement.textContent = "Images: No image available";
    }

    domElements.languageDisplay.textContent = getLanguageName(gameState.currentLanguageCode);
    domElements.languageCodeDisplay.textContent = gameState.currentLanguageCode;
    domElements.livesElement.textContent = gameState.lives;
    domElements.scoreElement.textContent = gameState.score;
    domElements.gamesPlayedElement.textContent = gameState.gamesPlayed;
    domElements.gamesWonElement.textContent = gameState.gamesWon;

    const winRate = gameState.gamesPlayed > 0 ?
        Math.round((gameState.gamesWon / gameState.gamesPlayed) * 100) : 0;
    domElements.winRateElement.textContent = winRate + '%';
}

/**
 * Processes the player's guess.
 */
function processGuess() {
    if (!gameState.isGameActive || gameState.isLoading) return; // Prevent actions during loading or inactive game

    const guess = domElements.guessInput.value.trim().toLowerCase();
    if (!guess) return;

    // Check if it's a full word guess (Wordle style)
    if (guess.length === gameState.currentWord.length) {
        if (guess === gameState.currentWord) {
            // Player guessed the whole word correctly
            gameState.correctLetters = [...new Set(gameState.currentWord.split(''))]; // Add all unique letters
            gameState.score += CONFIG.POINTS_PER_WORD;
            endGame(true);
        } else {
            // Wrong word guess
            gameState.lives--;
            showFeedback(`Incorrect word guess! The word was "${gameState.currentWord}".`, false);
            if (gameState.lives <= 0) {
                endGame(false);
            }
        }
    } else {
        // Single letter guess (Hangman style - kept for potential hybrid)
        const letter = guess[0];
        if (gameState.guessedLetters.includes(letter)) {
            showFeedback('You already guessed that letter!', false);
            return;
        }

        gameState.guessedLetters.push(letter);

        if (gameState.currentWord.includes(letter)) {
            // Correct letter
            if (!gameState.correctLetters.includes(letter)) {
                gameState.correctLetters.push(letter);
                gameState.score += CONFIG.POINTS_PER_LETTER;
            }
            showFeedback(`Good guess! '${letter}' is in the word.`, true);

            // Check if word is completely guessed
            const allCorrect = gameState.currentWord.split('').every(char =>
                gameState.correctLetters.includes(char));
            if (allCorrect) {
                // Word completed via letters
                gameState.score += CONFIG.POINTS_PER_WORD; // Bonus for completing via letters
                endGame(true);
            }
        } else {
            // Incorrect letter
            gameState.lives--;
            showFeedback(`Sorry, '${letter}' is not in the word.`, false);
            if (gameState.lives <= 0) {
                endGame(false);
            }
        }
    }

    domElements.guessInput.value = '';
    updateDisplay();
}

/**
 * Shows feedback message to the player.
 * @param {string} message - The message to display.
 * @param {boolean} isCorrect - Whether the message indicates a correct action.
 */
function showFeedback(message, isCorrect) {
    domElements.feedbackElement.textContent = message;
    domElements.feedbackElement.className = isCorrect ? 'feedback correct' : 'feedback incorrect';
}

/**
 * Ends the current game round.
 * @param {boolean} isWin - Whether the player won the round.
 */
function endGame(isWin) {
    gameState.isGameActive = false;
    domElements.guessInput.disabled = true;
    domElements.submitBtn.disabled = true;

    if (isWin) {
        showFeedback(`Congratulations! You guessed the word "${gameState.currentWord}"!`, true);
        gameState.gamesWon++;
        gameState.score += gameState.lives * CONFIG.POINTS_BONUS_PER_LIFE; // Bonus for remaining lives
    } else {
        showFeedback(`Game over! The word was "${gameState.currentWord}".`, false);
    }

    gameState.gamesPlayed++;
    updateDisplay();
}

/**
 * Provides a hint to the player (reveals a random unguessed letter).
 */
function getHint() {
    if (!gameState.isGameActive || gameState.isLoading) return;

    // Find a letter that hasn't been guessed yet and is in the word
    const unguessedCorrectLetters = gameState.currentWord
        .split('')
        .filter(char => !gameState.correctLetters.includes(char) && !gameState.guessedLetters.includes(char));

    if (unguessedCorrectLetters.length > 0) {
        const randomLetter = unguessedCorrectLetters[Math.floor(Math.random() * unguessedCorrectLetters.length)];
        gameState.correctLetters.push(randomLetter);
        // Also add to guessed letters to prevent duplicate hints
        if (!gameState.guessedLetters.includes(randomLetter)) {
            gameState.guessedLetters.push(randomLetter);
        }

        showFeedback(`Hint: Letter '${randomLetter}' is in the word.`, true);
        updateDisplay();
    } else {
        showFeedback("No more hints available!", false);
    }
}

/**
 * Gets the display name for a language code.
 * @param {string} code - The language code.
 * @returns {string} The language name.
 */
function getLanguageName(code) {
    const languageNames = {
        "en": "English",
        "es": "Spanish",
        "fr": "French",
        "de": "German",
        "dag": "Dagbani"
        // Add more mappings as needed
    };
    return languageNames[code] || code.toUpperCase();
}

// --- 5. EVENT LISTENERS ---
// Attach event listeners to buttons and input
domElements.submitBtn.addEventListener('click', processGuess);
domElements.hintBtn.addEventListener('click', getHint);
domElements.newGameBtn.addEventListener('click', () => {
     // Update language code based on selection before starting new game
    gameState.currentLanguageCode = domElements.languageSelect.value;
    gameState.currentLanguageName = getLanguageName(gameState.currentLanguageCode);
    initGame(); // Call initGame to fetch new word
});

domElements.guessInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        processGuess();
    }
});

// --- 6. INITIALIZATION ---
// Initialize the game when the page loads
window.onload = () => {
    // Set initial language from the selector
    gameState.currentLanguageCode = domElements.languageSelect.value;
    gameState.currentLanguageName = getLanguageName(gameState.currentLanguageCode);
    // Update display to show initial language and setup
    updateDisplay();
};
