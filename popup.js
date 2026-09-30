const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');
const saveBtn = document.getElementById('save-btn');
const workTimeInput = document.getElementById('work-time');
const breakTimeInput = document.getElementById('break-time');
const timerDisplay = document.getElementById('timer-display');
const statusDisplay = document.getElementById('status');
const sessionCountDisplay = document.getElementById('session-count');

let visualInterval;
let isWorkMode = true; // We will now sync this with storage

// Make the status text look clickable
statusDisplay.style.cursor = "pointer";
statusDisplay.title = "Click to switch between Work and Break";

function updateDisplay(seconds) {
    if (seconds < 0) seconds = 0;
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = Math.floor(seconds % 60);
    timerDisplay.textContent = `${minutes}:${remainderSeconds.toString().padStart(2, '0')}`;
}

function startVisualTimer(endTime) {
    clearInterval(visualInterval);
    visualInterval = setInterval(() => {
        const now = Date.now();
        const timeLeft = (endTime - now) / 1000;

        if (timeLeft <= 0) {
            clearInterval(visualInterval);
            updateDisplay(0);
        } else {
            updateDisplay(timeLeft);
        }
    }, 100);
}

// 1. Initial Load: Get times, mode, AND session stats
chrome.storage.local.get(['workTime', 'breakTime', 'isRunning', 'endTime', 'isWorkMode', 'sessionCount', 'lastDate'], (result) => {
    const workTime = result.workTime || 25;
    const breakTime = result.breakTime || 5;
    isWorkMode = result.isWorkMode !== undefined ? result.isWorkMode : true;

    workTimeInput.value = workTime;
    breakTimeInput.value = breakTime;
    statusDisplay.textContent = isWorkMode ? "Work Time" : "Break Time";

    // --- NEW: Handle the daily session count display ---
    const today = new Date().toDateString();
    let count = result.sessionCount || 0;

    // If you opened the popup on a new day, visually reset it and save
    if (result.lastDate !== today) {
        count = 0;
        chrome.storage.local.set({ sessionCount: 0, lastDate: today });
    }
    sessionCountDisplay.textContent = count;
    // ---------------------------------------------------

    if (result.isRunning && result.endTime) {
        startVisualTimer(result.endTime);
    } else {
        const startingTime = isWorkMode ? workTime : breakTime;
        updateDisplay(startingTime * 60);
    }
});

// 2. Click the Status Text to Switch Modes
statusDisplay.addEventListener('click', () => {
    chrome.storage.local.get(['isRunning'], (result) => {
        if (result.isRunning) return; // Don't switch modes if a timer is actively running!

        isWorkMode = !isWorkMode; // Flip the mode
        statusDisplay.textContent = isWorkMode ? "Work Time" : "Break Time";

        // Save the new mode to storage so it remembers when you close the popup
        chrome.storage.local.set({ isWorkMode: isWorkMode });

        const activeTime = isWorkMode ? parseInt(workTimeInput.value) : parseInt(breakTimeInput.value);
        updateDisplay(activeTime * 60);
    });
});

// 3. Start Button Logic
startBtn.addEventListener('click', () => {
    chrome.storage.local.get(['isRunning'], (result) => {
        if (result.isRunning) return;

        // Check which time we should use based on the current mode!
        const activeTime = isWorkMode ? parseInt(workTimeInput.value) : parseInt(breakTimeInput.value);
        const totalSeconds = activeTime * 60;

        chrome.runtime.sendMessage({ command: "start", timeLeft: totalSeconds }, () => {
            const endTime = Date.now() + (totalSeconds * 1000);
            startVisualTimer(endTime);
        });
    });
});

// 4. Reset Button Logic
resetBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ command: "stop" }, () => {
        clearInterval(visualInterval);
        const activeTime = isWorkMode ? parseInt(workTimeInput.value) : parseInt(breakTimeInput.value);
        updateDisplay(activeTime * 60);
    });
});

// 5. Save Settings Logic
saveBtn.addEventListener('click', () => {
    const workTime = parseInt(workTimeInput.value);
    const breakTime = parseInt(breakTimeInput.value);

    chrome.storage.local.set({ workTime: workTime, breakTime: breakTime }, () => {
        saveBtn.textContent = 'Saved!';
        setTimeout(() => saveBtn.textContent = 'Save Settings', 1500);

        chrome.storage.local.get(['isRunning'], (result) => {
            if (!result.isRunning) {
                const activeTime = isWorkMode ? workTime : breakTime;
                updateDisplay(activeTime * 60);
            }
        });
    });
});