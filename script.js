const typingInput = document.getElementById("typingInput");
const typingText = document.getElementById("typingText");
const timerDisplay = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const restartButton = document.getElementById("restartButton");
const tryAgainButton = document.getElementById("tryAgainButton");
const result = document.getElementById("result");
const resultWpm = document.getElementById("resultWpm");
const resultAccuracy = document.getElementById("resultAccuracy");
const resultCharacters = document.getElementById("resultCharacters");
const resultErrors = document.getElementById("resultErrors");

const timeOptions = document.querySelector(".time-options");
const wordOptions = document.querySelector(".word-options");
const modeButtons = document.querySelectorAll('[data-mode]');
const timeButtons = document.querySelectorAll('[data-time]');
const wordButtons = document.querySelectorAll('[data-words]');

const words = [
    "the", "quick", "brown", "fox", "jumps", "over", "the", "lazy",
    "dog", "while", "the", "world", "moves", "around", "you", "every",
    "day", "people", "learn", "new", "things", "when", "they", "practice",
    "small", "steps", "can", "create", "great", "results", "typing",
    "takes", "time", "but", "consistent", "practice", "makes", "you",
    "faster", "and", "more", "accurate", "focus", "on", "each", "word",
    "and", "keep", "your", "hands", "relaxed", "while", "you", "type"
];

let selectedTime = 15;
let selectedWordCount = 25;
let currentMode = "time";

let timeLeft = selectedTime;
let timer = null;
let started = false;
let finished = false;
let totalTyped = 0;
let correctTyped = 0;
let errors = 0;

function generateWords(count = selectedWordCount) {
    typingText.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const word = words[Math.floor(Math.random() * words.length)];

        const wordElement = document.createElement("span");
        wordElement.className = "word";

        for (const character of word) {
            const characterElement = document.createElement("span");
            characterElement.textContent = character;
            wordElement.appendChild(characterElement);
        }

        typingText.appendChild(wordElement);
    }

    highlightCurrentCharacter();
}

function highlightCurrentCharacter() {
    document.querySelectorAll(".typing-text span span").forEach(character => {
        character.style.color = "";
        character.style.background = "";
    });

    const currentIndex = typingInput.value.length;
    const characters = document.querySelectorAll(".typing-text span span");

    if (characters[currentIndex]) {
        characters[currentIndex].style.color = "#e2b714";
        characters[currentIndex].style.background = "rgba(226, 183, 20, 0.12)";
    }
}

function startTimer() {
    if (timer) return;

    timer = setInterval(() => {
        timeLeft--;

        timerDisplay.textContent = timeLeft;

        updateStats();

        if (timeLeft <= 0) {
            finishTest();
        }
    }, 1000);
}

function updateStats() {
    const elapsedTime = Math.max(1, selectedTime - timeLeft);
    const minutes = elapsedTime / 60;

    const wpm = minutes > 0
        ? Math.round((correctTyped / 5) / minutes)
        : 0;

    const accuracy = totalTyped > 0
        ? Math.round((correctTyped / totalTyped) * 100)
        : 100;

    wpmDisplay.textContent = wpm;
    accuracyDisplay.textContent = `${accuracy}%`;
}

function handleTyping() {
    if (finished) return;

    if (!started) {
        started = true;

        if (currentMode === "time") {
            startTimer();
        }
    }

    const input = typingInput.value;
    const characters = document.querySelectorAll(".typing-text span span");

    totalTyped = input.length;
    correctTyped = 0;
    errors = 0;

    characters.forEach((character, index) => {
        character.style.background = "";
        character.style.color = "";

        if (index < input.length) {
            if (input[index] === character.textContent) {
                character.style.color = "#e6e6e6";
                correctTyped++;
            } else {
                character.style.color = "#e05252";
                character.style.background = "rgba(224, 82, 82, 0.12)";
                errors++;
            }
        }
    });

    if (currentMode === "words") {
        const targetText = Array.from(characters)
            .map(character => character.textContent)
            .join("");

        if (input.length >= targetText.length) {
            finishTest();
            return;
        }
    }

    highlightCurrentCharacter();
    updateStats();
}

function finishTest() {
    if (finished) return;

    finished = true;

    clearInterval(timer);
    timer = null;

    typingInput.blur();

    const elapsedTime = Math.max(
        1,
        selectedTime - timeLeft
    );

    const minutes = elapsedTime / 60;

    const finalWpm = Math.round(
        (correctTyped / 5) / minutes
    );

    const finalAccuracy = totalTyped > 0
        ? Math.round((correctTyped / totalTyped) * 100)
        : 100;

    resultWpm.textContent = finalWpm;
    resultAccuracy.textContent = `${finalAccuracy}%`;
    resultCharacters.textContent = totalTyped;
    resultErrors.textContent = errors;

    result.classList.remove("hidden");
}

function resetTest() {
    clearInterval(timer);

    timer = null;
    started = false;
    finished = false;

    totalTyped = 0;
    correctTyped = 0;
    errors = 0;

    timeLeft = selectedTime;

    timerDisplay.textContent = selectedTime;
    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "100%";

    typingInput.value = "";

    result.classList.add("hidden");

    generateWords();

    typingInput.focus();
}

function setActiveButton(buttons, selectedButton) {
    buttons.forEach(button => {
        button.classList.remove("active");
    });

    selectedButton.classList.add("active");
}

modeButtons.forEach(button => {
    button.addEventListener("click", () => {
        currentMode = button.dataset.mode;

        setActiveButton(modeButtons, button);

        if (currentMode === "time") {
            timeOptions.classList.remove("hidden");
            wordOptions.classList.add("hidden");
        } else {
            timeOptions.classList.add("hidden");
            wordOptions.classList.remove("hidden");
        }

        resetTest();
    });
});

timeButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedTime = Number(button.dataset.time);

        setActiveButton(timeButtons, button);

        resetTest();
    });
});

wordButtons.forEach(button => {
    button.addEventListener("click", () => {
        selectedWordCount = Number(button.dataset.words);

        setActiveButton(wordButtons, button);

        resetTest();
    });
});

typingInput.addEventListener("input", handleTyping);

typingText.addEventListener("click", () => {
    typingInput.focus();
});

document.addEventListener("keydown", event => {
    if (event.key === "Tab") {
        event.preventDefault();
    }
});

restartButton.addEventListener("click", resetTest);
tryAgainButton.addEventListener("click", resetTest);

generateWords();
typingInput.focus();