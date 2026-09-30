# Dedicated OS-Level Kiosk & Lockdown Deployment Guide
### Insight Accessible Online Examination Platform for Visually Impaired Candidates

---

## 1. Technical Boundary: Browser Sandbox vs. OS-Level Enforcement

In a standard web browser (Chrome, Firefox, Edge, Safari), JavaScript runs strictly within a secure sandbox:
* **What a web browser CAN do:**
  * Request and monitor Fullscreen mode (`requestFullscreen()`, `fullscreenchange`).
  * Detect tab switching and backgrounding via Page Visibility API (`visibilitychange`, `document.visibilityState`).
  * Detect loss of window focus (`window.onblur`, `window.onfocus`).
  * Intercept unload and navigation attempts (`window.onbeforeunload`).
  * Spoken TTS security warnings and live ARIA region announcements (`role="alert"`).
  * Record all security audit events securely on the backend server.
* **What a web browser CANNOT do (Technical Limitation):**
  * A web application cannot forcibly close arbitrary third-party software (e.g., chat applications, screen recorders, external browsers) on the candidate's operating system.
  * A web application cannot block system-level OS shortcuts (e.g., `Win + Tab`, `Alt + Tab`, `Ctrl + Alt + Delete`) from pure browser JavaScript.

For high-stakes competitive examinations requiring absolute operating system containment, the platform must be deployed inside an **OS-level Kiosk / Managed Device environment**.

---

## 2. Option A: Chromium / Google Chrome Kiosk Mode

Google Chrome and Chromium-based browsers provide a built-in dedicated `--kiosk` execution mode that disables address bars, browser menus, tabs, and developer tools.

### Launch Command (Windows)
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --kiosk "https://your-exam-portal.org/login" ^
  --no-first-run ^
  --disable-pinch ^
  --disable-context-menu ^
  --disable-features=TranslateUI ^
  --incognito ^
  --disable-extensions ^
  --check-for-update-interval=31536000
```

### Launch Command (Linux / Ubuntu)
```bash
google-chrome \
  --kiosk "https://your-exam-portal.org/login" \
  --no-first-run \
  --disable-pinch \
  --disable-context-menu \
  --disable-features=TranslateUI \
  --incognito \
  --disable-extensions
```

### Key Protections Enforced:
1. Fullscreen canvas covers all OS window bars.
2. Address bar, back/forward buttons, and URL inspection are completely hidden.
3. Right-click context menus are disabled.
4. Incognito prevents persistent cookies or browsing history access.

---

## 3. Option B: Windows 10/11 Assigned Access (Single-App Kiosk)

Windows 11 and Windows 10 Enterprise/Pro include **Assigned Access**, a native operating system feature that locks a designated local user account to a single application.

### Setup Instructions:
1. Create a standard local Windows user account named `ExamCandidate`.
2. Open **Windows Settings** $\to$ **Accounts** $\to$ **Other users** $\to$ **Set up a kiosk (Assigned Access)**.
3. Select **Microsoft Edge** as the kiosk browser.
4. Configure Edge as a **Digital Signage or Interactive Display (InPrivate Full Screen)**.
5. Set the default URL to: `https://your-exam-portal.org/`.
6. Set session idle timeout or restart on launch.

### OS-Level Enforcement Provided:
* **Disables Start Menu and Windows Key**: Candidate cannot open other apps.
* **Disables Task Manager**: `Ctrl + Alt + Del` options are suppressed.
* **Disables Alt + Tab**: Cannot switch to background applications.
* **Disables File Explorer**: No access to local hard drive or unauthorized study files.
* **Speech Synthesis Remains Fully Functional**: The Windows Speech Engine continues to run without interruption for blind and low-vision candidates.

---

## 4. Option C: ChromeOS Managed Kiosk Deployment

For educational institutions using Chromebooks:
1. Log in to **Google Admin Console** (`admin.google.com`).
2. Navigate to **Devices** $\to$ **Chrome** $\to$ **Apps & Extensions** $\to$ **Kiosks**.
3. Add the Web App URL: `https://your-exam-portal.org/`.
4. Configure Kiosk Settings:
   * **Auto-Launch App**: Enable.
   * **Virtual Keyboard**: Enable for accessibility.
   * **ChromeVox Screen Reader**: Enable for visually impaired candidates.
   * **Screen Capture / External Storage**: Disabled.

---

## 5. Option D: Electron Desktop Lockdown Container

For institutions packaging Insight Exam Platform as an installable desktop binary:

```javascript
// main.js (Electron Main Process)
const { app, BrowserWindow, globalShortcut } = require('electron');

let mainWindow;

function createSecureWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        kiosk: true,              // Enforces true OS-level kiosk
        fullscreen: true,         // Covers taskbar and desktop
        alwaysOnTop: true,        // Remains on top of OS notifications
        frame: false,             // Removes OS window borders and close button
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    mainWindow.loadURL('https://your-exam-portal.org/login');

    // Prevent navigation outside examination origin
    mainWindow.webContents.on('will-navigate', (event, url) => {
        if (!url.startsWith('https://your-exam-portal.org')) {
            event.preventDefault();
        }
    });

    // Intercept hazardous key combinations
    globalShortcut.register('CommandOrControl+W', () => {});
    globalShortcut.register('Alt+F4', () => {});
    globalShortcut.register('CommandOrControl+R', () => {});
}

app.whenReady().then(createSecureWindow);
```

---

## 6. Security + Accessibility Coexistence Checklist

| Accessibility Requirement | Secure Kiosk Compatibility |
| :--- | :--- |
| **Web Speech API (TTS)** | Fully supported in Chrome kiosk, Edge Assigned Access, and Electron. |
| **Controlled Keyboard Navigation** | Numeric keys `1`, `2`, `3`, `4`, `R`, `T`, `I`, `D`, `S`, `Y`, `Escape` operate without OS interference. |
| **Screen Readers (NVDA / JAWS / ChromeVox)** | Native screen readers receive all ARIA live regions (`role="status"`, `role="alert"`). |
| **High Contrast Modes** | Clean Light, High Contrast Yellow, High Contrast Cyan render natively. |
| **Server Synchronization** | Continuous auto-saving guarantees zero lost responses during any event. |
