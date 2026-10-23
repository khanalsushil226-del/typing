
const testsCompleted = document.getElementById("testsCompleted");
const averageWpm = document.getElementById("averageWpm");
const bestWpm = document.getElementById("bestWpm");
const averageAccuracy = document.getElementById("averageAccuracy");
const bestAccuracy = document.getElementById("bestAccuracy");
const totalCharacters = document.getElementById("totalCharacters");
const historyList = document.getElementById("historyList");
const emptyState = document.getElementById("emptyState");
const clearStatsButton = document.getElementById("clearStatsButton");

function getHistory() {
    return JSON.parse(
        localStorage.getItem("typingHistory") || "[]"
    );
}

function formatDate(dateString) {
    const date = new Date(dateString);

    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function loadStats() {
    const history = getHistory();

    if (history.length === 0) {
        emptyState.classList.remove("hidden");
        historyList.innerHTML = "";

        testsCompleted.textContent = "0";
        averageWpm.textContent = "0";
        bestWpm.textContent = "0";
        averageAccuracy.textContent = "0%";
        bestAccuracy.textContent = "0%";
        totalCharacters.textContent = "0";

        return;
    }

    emptyState.classList.add("hidden");

    const totalWpm = history.reduce(
        (sum, test) => sum + Number(test.wpm || 0),
        0
    );

    const totalAccuracy = history.reduce(
        (sum, test) => sum + Number(test.accuracy || 0),
        0
    );

    const characters = history.reduce(
        (sum, test) => sum + Number(test.characters || 0),
        0
    );

    const highestWpm = Math.max(
        ...history.map(test => Number(test.wpm || 0))
    );

    const highestAccuracy = Math.max(
        ...history.map(test => Number(test.accuracy || 0))
    );

    testsCompleted.textContent = history.length;

    averageWpm.textContent = Math.round(
        totalWpm / history.length
    );

    bestWpm.textContent = highestWpm;

    averageAccuracy.textContent = `${Math.round(
        totalAccuracy / history.length
    )}%`;

    bestAccuracy.textContent = `${highestAccuracy}%`;

    totalCharacters.textContent = characters.toLocaleString();

    historyList.innerHTML = "";

    const recentTests = [...history]
        .reverse()
        .slice(0, 20);

    recentTests.forEach(test => {
        const row = document.createElement("div");

        row.className = "history-row";

        row.innerHTML = `
            <span class="history-wpm">${test.wpm}</span>
            <span class="history-accuracy">${test.accuracy}%</span>
            <span>${test.rawWpm}</span>
            <span>${formatTime(test.time)}</span>
            <span>${test.setting}</span>
            <span class="history-date">${formatDate(test.date)}</span>
        `;

        historyList.appendChild(row);
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

clearStatsButton.addEventListener("click", () => {
    const history = getHistory();

    if (history.length === 0) {
        return;
    }

    const confirmed = confirm(
        "Are you sure you want to clear all typing statistics?"
    );

    if (!confirmed) {
        return;
    }

    localStorage.removeItem("typingHistory");

    loadStats();
});

loadStats();
