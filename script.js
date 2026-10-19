const resultRawWpm = document.getElementById("resultRawWpm");
const resultCorrect = document.getElementById("resultCorrect");
const resultTime = document.getElementById("resultTime");
const resultMode = document.getElementById("resultMode");
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
const modeButtons = document.querySelectorAll("[data-mode]");
const timeButtons = document.querySelectorAll("[data-time]");
const wordButtons = document.querySelectorAll("[data-words]");

const wordBank = [
    "about", "after", "again", "against", "almost", "always",
    "around", "because", "before", "between", "better", "bring",
    "change", "children", "different", "during", "every", "example",
    "family", "first", "follow", "found", "great", "group", "important",
    "inside", "keep", "large", "learn", "little", "making", "might",
    "never", "number", "often", "place", "point", "problem", "program",
    "question", "really", "right", "school", "second", "small", "something",
    "still", "system", "their", "these", "think", "through", "together",
    "under", "until", "using", "usually", "water", "where", "without",
    "world", "would", "write", "young", "your", "quick", "brown", "fox",
    "jumps", "over", "lazy", "dog", "typing", "practice", "focus",
    "keyboard", "speed", "accuracy", "computer", "technology", "future"
];

let selectedTime = 15;
let selectedWordCount = 25;
let currentMode = "time";

let timer = null;
let startTime = null;
let elapsedSeconds = 0;

let started = false;
let finished = false;

let targetText = "";
let typedText = "";

let totalTyped = 0;
let correctTyped = 0;
let errors = 0;

function generateText() {
    typingText.innerHTML = "";

    const count = currentMode === "words"
        ? selectedWordCount
        : 120;

    const selectedWords = [];

    for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * wordBank.length);
        selectedWords.push(wordBank[randomIndex]);
    }

    targetText = selectedWords.join(" ");
    typedText = "";

    for (let i = 0; i < targetText.length; i++) {
        const character = document.createElement("span");

        character.className = "character";
        character.textContent = targetText[i];

        if (targetText[i] === " ") {
            character.classList.add("space");
        }

        typingText.appendChild(character);
    }

    updateDisplay();
}

function updateDisplay() {
    const characters = typingText.querySelectorAll(".character");

    characters.forEach((character, index) => {
        character.classList.remove(
            "correct",
            "incorrect",
            "current"
        );

        if (index < typedText.length) {
            if (typedText[index] === targetText[index]) {
                character.classList.add("correct");
            } else {
                character.classList.add("incorrect");
            }
        }
    });

    if (
        typedText.length < characters.length &&
        characters[typedText.length]
    ) {
        characters[typedText.length].classList.add("current");

        characters[typedText.length].scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }
}

function startTest() {
    if (started || finished) {
        return;
    }

    started = true;
    startTime = Date.now();

    startTimer();
}

function startTimer() {
    if (timer) {
        return;
    }

    timer = setInterval(() => {
        if (!started || finished) {
            return;
        }

        elapsedSeconds = Math.floor(
            (Date.now() - startTime) / 1000
        );

        if (currentMode === "time") {
            const remaining = Math.max(
                0,
                selectedTime - elapsedSeconds
            );

            timerDisplay.textContent = remaining;

            if (remaining <= 0) {
                finishTest();
                return;
            }
        } else {
            timerDisplay.textContent = formatTime(elapsedSeconds);
        }

        updateStats();
    }, 100);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
}

function handleInput() {
    if (finished) {
        return;
    }

    const newValue = typingInput.value;

    if (!started && newValue.length > 0) {
        startTest();
    }

    if (newValue.length > targetText.length) {
        typingInput.value = typedText;
        return;
    }

    typedText = newValue;

    calculateStats();
    updateDisplay();

    if (
        currentMode === "words" &&
        typedText.length >= targetText.length
    ) {
        finishTest();
    }
}

function calculateStats() {
    totalTyped = typedText.length;
    correctTyped = 0;
    errors = 0;

    for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] === targetText[i]) {
            correctTyped++;
        } else {
            errors++;
        }
    }
}

function updateStats() {
    calculateStats();

    if (!started || !startTime) {
        return;
    }

    const currentElapsed = Math.max(
        1,
        Math.floor((Date.now() - startTime) / 1000)
    );

    const minutes = currentElapsed / 60;

    const wpm = Math.round(
        (correctTyped / 5) / minutes
    );

    const accuracy = totalTyped > 0
        ? Math.round((correctTyped / totalTyped) * 100)
        : 100;

    wpmDisplay.textContent = Math.max(0, wpm);
    accuracyDisplay.textContent = `${accuracy}%`;
}

function finishTest() {
    if (finished) {
        return;
    }

    finished = true;
    started = false;

    clearInterval(timer);
    timer = null;

    calculateStats();

    const finalElapsed = Math.max(
        1,
        currentMode === "time"
            ? Math.min(elapsedSeconds, selectedTime)
            : Math.floor((Date.now() - startTime) / 1000)
    );

    const minutes = finalElapsed / 60;

    const finalWpm = Math.round(
        (correctTyped / 5) / minutes
    );

    const finalAccuracy = totalTyped > 0
        ? Math.round((correctTyped / totalTyped) * 100)
        : 100;

    resultWpm.textContent = Math.max(0, finalWpm);
    resultAccuracy.textContent = `${finalAccuracy}%`;
    resultCharacters.textContent = totalTyped;
    resultErrors.textContent = errors;

    wpmDisplay.textContent = Math.max(0, finalWpm);
    accuracyDisplay.textContent = `${finalAccuracy}%`;

    result.classList.remove("hidden");

    typingInput.blur();
}

function resetTest() {
    clearInterval(timer);

    timer = null;
    startTime = null;

    started = false;
    finished = false;

    elapsedSeconds = 0;

    typedText = "";

    totalTyped = 0;
    correctTyped = 0;
    errors = 0;

    typingInput.value = "";

    if (currentMode === "time") {
        timerDisplay.textContent = selectedTime;
    } else {
        timerDisplay.textContent = "0:00";
    }

    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "100%";

    result.classList.add("hidden");

    generateText();

    requestAnimationFrame(() => {
        typingInput.focus();
    });
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

typingInput.addEventListener("input", handleInput);

typingText.addEventListener("click", () => {
    if (!finished) {
        typingInput.focus();
    }
});

typingText.addEventListener("mousedown", event => {
    event.preventDefault();
});

document.addEventListener("keydown", event => {
    if (event.key === "Tab") {
        event.preventDefault();
        resetTest();
        return;
    }

    if (event.key === "Escape") {
        event.preventDefault();
        resetTest();
        return;
    }

    if (
        event.key === "Enter" &&
        finished
    ) {
        event.preventDefault();
        resetTest();
        return;
    }

    if (
        event.key.length === 1 ||
        event.key === "Backspace"
    ) {
        if (!finished) {
            typingInput.focus();
        }
    }
});

restartButton.addEventListener("click", () => {
    resetTest();
});

tryAgainButton.addEventListener("click", () => {
    resetTest();
});

generateText();
typingInput.focus();