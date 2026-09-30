// 1. Listen for start/stop messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.command === "start") {
        const endTime = Date.now() + (request.timeLeft * 1000);
        chrome.storage.local.set({ endTime: endTime, isRunning: true });
        chrome.alarms.create("pomodoroAlarm", { when: endTime });
        sendResponse({ status: "Timer started" });
    }
    else if (request.command === "stop") {
        chrome.alarms.clear("pomodoroAlarm");
        chrome.storage.local.set({ isRunning: false });
        sendResponse({ status: "Timer stopped" });
    }
    return true;
});

// 2. Listen for when the alarm actually rings
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "pomodoroAlarm") {

        chrome.storage.local.get(['isWorkMode', 'sessionCount', 'lastDate'], (result) => {
            const today = new Date().toDateString();
            let count = result.sessionCount || 0;

            if (result.lastDate !== today) {
                count = 0;
            }

            if (result.isWorkMode) {
                count += 1;
            }

            chrome.storage.local.set({
                isRunning: false,
                sessionCount: count,
                lastDate: today
            });

            playAlarmSound();
        });
    }
});

// 3. Audio Helper Function
async function playAlarmSound() {
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length === 0) {
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['AUDIO_PLAYBACK'],
            justification: 'To play the pomodoro alarm chime'
        });
    }

    chrome.runtime.sendMessage({ action: "play_chime" });
}