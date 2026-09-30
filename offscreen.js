// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "play_chime") {
        // Create an audio object and play the file
        const audio = new Audio('chime.mp3');
        audio.play();
    }
});