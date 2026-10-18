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
let timeLeft = selectedTime;
let started = false;
let finished = false;

let currentPosition = 0;
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
        const randomWord =
            wordBank[Math.floor(Math.random() * wordBank.length)];

        selectedWords.push(randomWord);
    }

    const text = selectedWords.join(" ");

    for (let i = 0; i < text.length; i++) {
        const character = document.createElement("span");

        character.className = "character";
        character.textContent = text[i];

        if (text[i] === " ") {
            character.classList.add("space");
        }

        typingText.appendChild(character);
    }

    updateCaret();
}

function updateCaret() {
    const characters = document.querySelectorAll(".character");

    characters.forEach(character => {
        character.classList.remove("current");
    });

    if (characters[currentPosition]) {
        characters[currentPosition].classList.add("current");

        characters[currentPosition].scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
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

function handleInput(event) {
    if (finished) return;

    if (!started) {
        started = true;
        startTimer();
    }

    const typedValue = typingInput.value;

    const newCharacterCount = typedValue.length - currentPosition;

    if (newCharacterCount <= 0) {
        currentPosition = typedValue.length;
        updateCaret();
        return;
    }

    const typedCharacter =
        typedValue[typedValue.length - 1];

    const characters =
        document.querySelectorAll(".character");

    const targetCharacter =
        characters[currentPosition];

    if (!targetCharacter) {
        finishTest();
        return;
    }

    totalTyped++;

    if (typedCharacter === targetCharacter.textContent) {
        targetCharacter.classList.remove("incorrect");
        targetCharacter.classList.add("correct");

        correctTyped++;
    } else {
        targetCharacter.classList.remove("correct");
        targetCharacter.classList.add("incorrect");

        errors++;
    }

    currentPosition++;

    updateCaret();
    updateStats();

    typingInput.value = "";
}

function handleBackspace(event) {
    if (event.key !== "Backspace") return;

    event.preventDefault();

    if (currentPosition <= 0) return;

    const characters =
        document.querySelectorAll(".character");

    currentPosition--;

    const character = characters[currentPosition];

    if (character.classList.contains("correct")) {
        correctTyped--;
    }

    if (
        character.classList.contains("correct") ||
        character.classList.contains("incorrect")
    ) {
        totalTyped--;
    }

    if (character.classList.contains("incorrect")) {
        errors--;
    }

    character.classList.remove("correct");
    character.classList.remove("incorrect");

    updateCaret();
    updateStats();
}

function updateStats() {
    const elapsedSeconds =
        Math.max(1, selectedTime - timeLeft);

    const minutes = elapsedSeconds / 60;

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
    if (finished) return;

    finished = true;

    clearInterval(timer);
    timer = null;

    typingInput.blur();

    const elapsedSeconds =
        Math.max(1, selectedTime - timeLeft);

    const minutes = elapsedSeconds / 60;

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

    result.classList.remove("hidden");
}

function resetTest() {
    clearInterval(timer);

    timer = null;
    timeLeft = selectedTime;

    started = false;
    finished = false;

    currentPosition = 0;
    totalTyped = 0;
    correctTyped = 0;
    errors = 0;

    typingInput.value = "";

    timerDisplay.textContent = selectedTime;
    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "100%";

    result.classList.add("hidden");

    generateText();

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

typingInput.addEventListener("input", handleInput);

typingInput.addEventListener("keydown", handleBackspace);

typingText.addEventListener("click", () => {
    typingInput.focus();
});

document.addEventListener("keydown", event => {
    if (
        event.key.length === 1 ||
        event.key === "Backspace"
    ) {
        typingInput.focus();
    }

    if (event.key === "Tab") {
        event.preventDefault();
    }
});

restartButton.addEventListener("click", resetTest);

tryAgainButton.addEventListener("click", resetTest);

generateText();
typingInput.focus();