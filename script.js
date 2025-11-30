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
    // Example SPARQL query template. This would need to be adapted to filter by language code.
    SPARQL_QUERY_TEMPLATE: `
        SELECT ?lexeme ?lemma ?definition ?grammaticalFeature ?translation ?pronunciation ?image WHERE {
          ?lexeme dct:language wd:LANG_PLACEHOLDER ;
                  wikibase:lemma ?lemma .
          OPTIONAL { ?lexeme wdt:P5137 ?definition. }
          OPTIONAL { ?lexeme wdt:P5185 ?grammaticalFeature. } # Example property for grammatical features
          OPTIONAL { ?lexeme wdt:P5137 ?translation. FILTER(LANG(?translation) != LANG(?lemma)) } # Example for translations
          OPTIONAL { ?lexeme wdt:P443 ?pronunciation. } # Example for pronunciation (sound file)
          OPTIONAL { ?lexeme wdt:P18 ?image. } # Example for image
          FILTER(STRLEN(?lemma) = WORD_LENGTH_PLACEHOLDER) # Filter by word length
          FILTER(LANG(?lemma) = "LANG_CODE_PLACEHOLDER") # Ensure lemma is in the correct language
          # Add more filters as needed (e.g., for common words, specific POS tags)
        }
        LIMIT 100 # Get a set of candidates
    `
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
    imagesElement: document.getElementById('images'), // Added image element
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
    resetGameState();
    gameState.isGameActive = true;
    // Update display before fetching word to show loading state or previous word briefly
    updateDisplay();
    // Fetch a new word based on the selected language
    fetchRandomWord(gameState.currentLanguageCode).then(() => {
        updateDisplay(); // Update display again after word is fetched
    }).catch(error => {
        console.error("Error fetching word:", error);
        showFeedback("Failed to load a new word. Please try again.", false);
        gameState.isGameActive = false; // Stop game if fetch fails
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
    // Reset display to loading state or clear previous data
    domElements.wordDisplay.textContent = '_ '.repeat(CONFIG.WORD_LENGTH).trim();
    domElements.definitionElement.textContent = "Loading definition...";
    domElements.grammaticalFeaturesElement.textContent = "Grammatical Features: -";
    domElements.translationsElement.textContent = "Translations: -";
    domElements.pronunciationElement.textContent = "Pronunciation: -";
    domElements.imagesElement.textContent = "Images: -"; // Reset image info
}

/**
 * Fetches a random lexeme data from Wikidata based on the selected language code.
 * This is a placeholder implementation using a mock API call.
 * In a real implementation, this would make an actual SPARQL query to Wikidata.
 * @param {string} languageCode - The language code (e.g., 'en', 'dag').
 */
async function fetchRandomWord(languageCode) {
    // In a real implementation, this function would:
    // 1. Construct the SPARQL query using CONFIG.SPARQL_QUERY_TEMPLATE
    // 2. Replace LANG_PLACEHOLDER and WORD_LENGTH_PLACEHOLDER with actual values
    // 3. Call the Wikidata API using fetch()
    // 4. Parse the JSON response
    // 5. Select a random result from the parsed data
    // 6. Update gameState.currentWord, gameState.currentLemma, gameState.currentDefinition, etc.

    // Placeholder logic for demonstration
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Example placeholder data structure (this would come from API)
    const mockLexemes = {
        "en": [
            { lemma: "serendipity", definition: "The occurrence of events by chance in a happy or beneficial way", grammaticalFeatures: "noun", translations: "French: sérendipité", pronunciation: "suh-ren-DIP-ih-tee", image: "https://commons.wikimedia.org/wiki/File:Serendipity.jpg" },
            { lemma: "euphoria", definition: "A feeling of intense excitement and happiness", grammaticalFeatures: "noun", translations: "French: euphorie", pronunciation: "yoo-FOR-ee-uh", image: "https://commons.wikimedia.org/wiki/File:Euphoria.jpg" }
        ],
        "dag": [ // Example Dagbani words (these are examples, not verified)
            { lemma: "yɛlɛ", definition: "to go", grammaticalFeatures: "verb", translations: "English: go", pronunciation: "YEH-leh", image: "" },
            { lemma: "ni", definition: "water", grammaticalFeatures: "noun", translations: "English: water", pronunciation: "nee", image: "https://commons.wikimedia.org/wiki/File:Water_drop.jpg" }
        ],
        "fr": [
            { lemma: "bonjour", definition: "hello", grammaticalFeatures: "noun", translations: "English: hello", pronunciation: "bon-ZHOOR", image: "" }
        ]
    };

    const langLexemes = mockLexemes[languageCode] || mockLexemes["en"]; // Fallback to English
    if (langLexemes.length === 0) {
        throw new Error(`No words available for language code: ${languageCode}`);
    }

    const randomIndex = Math.floor(Math.random() * langLexemes.length);
    const selectedLexeme = langLexemes[randomIndex];

    gameState.currentLemma = selectedLexeme.lemma.toLowerCase();
    // For this Wordle-style game, we focus on the lemma itself
    gameState.currentWord = gameState.currentLemma;
    gameState.currentDefinition = selectedLexeme.definition || "Definition not available";
    gameState.currentGrammaticalFeatures = selectedLexeme.grammaticalFeatures || "Not specified";
    gameState.currentTranslations = selectedLexeme.translations || "Not available";
    gameState.currentPronunciation = selectedLexeme.pronunciation || "Not available";
    gameState.currentImage = selectedLexeme.image || "No image available";
}


/**
 * Updates the display based on the current game state.
 */
function updateDisplay() {
    if (!gameState.currentWord) {
         // If no word is loaded yet, just update stats and other elements
        domElements.wordDisplay.textContent = '_ '.repeat(CONFIG.WORD_LENGTH).trim();
        domElements.definitionElement.textContent = gameState.isLoading ? "Loading definition..." : "Click 'New Game' to start";
        domElements.hintElement.textContent = gameState.isLoading ? "Fetching word..." : "Guess the word using lexicographical data from Wikidata";
        domElements.grammaticalFeaturesElement.textContent = `Grammatical Features: ${gameState.currentGrammaticalFeatures}`;
        domElements.translationsElement.textContent = `Translations: ${gameState.currentTranslations}`;
        domElements.pronunciationElement.textContent = `Pronunciation: ${gameState.currentPronunciation}`;
        domElements.imagesElement.textContent = `Images: ${gameState.currentImage ? `<a href="${gameState.currentImage}" target="_blank">View Image</a>` : "No image available"}`;
    } else {
         // Update word display with guessed letters
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
        domElements.definitionElement.textContent = gameState.currentDefinition;
        domElements.grammaticalFeaturesElement.textContent = `Grammatical Features: ${gameState.currentGrammaticalFeatures}`;
        domElements.translationsElement.textContent = `Translations: ${gameState.currentTranslations}`;
        domElements.pronunciationElement.textContent = `Pronunciation: ${gameState.currentPronunciation}`;
        domElements.imagesElement.textContent = `Images: ${gameState.currentImage ? `<a href="${gameState.currentImage}" target="_blank">View Image</a>` : "No image available"}`;
    }

    // Update other elements
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
    initGame();
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
