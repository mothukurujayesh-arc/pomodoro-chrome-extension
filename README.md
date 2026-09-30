# pomodoro-chrome-extension

# Pomodoro Focus Timer 🍅

A lightweight, customizable Pomodoro timer built as a Manifest V3 Chrome Extension. It helps you stay focused by breaking work into intervals, separated by short breaks, directly from your browser toolbar.

## ✨ Features

* **Customizable Intervals:** Set your own minutes for both "Work" and "Break" sessions.
* **Background Processing:** The timer continues to run seamlessly in the background even when the popup is closed, utilizing Chrome's Alarms API and Service Workers.
* **Audio Alerts:** Plays a distinct chime sound when a session finishes (built using the Manifest V3 Offscreen API).
* **Session Tracking:** Automatically counts how many "Work" sessions you complete each day and resets at midnight.
* **Persistent Storage:** Remembers your custom time settings and current mode (Work vs. Break) using Chrome Local Storage.

## 🚀 Tech Stack

* HTML5
* CSS3
* Vanilla JavaScript
* Chrome Extension APIs (Manifest V3, Storage, Alarms, Runtime, Offscreen)

## 🛠️ Installation (Developer Mode)

Since this extension is not currently published on the Chrome Web Store, you can easily install it locally:

1. Download or clone this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Turn on **Developer mode** using the toggle switch in the top right corner.
4. Click the **Load unpacked** button in the top left.
5. Select the folder containing this repository's files.
6. Click the puzzle piece icon in your Chrome toolbar and **pin** the Pomodoro timer for easy access.

## 🧠 What I Learned

Building this extension involved tackling several modern Chrome Extension architecture challenges:

* **Message Passing:** Sending data between the temporary UI (`popup.js`) and the persistent background script (`background.js`).
* **State Management:** Preventing memory leaks and visual desyncs when the user opens and closes the extension popup.
* **Manifest V3 Constraints:** Bypassing Service Worker limitations by using the Offscreen API to play audio files, and using the Alarms API to keep time accurately without `setInterval` dying in the background.

---
