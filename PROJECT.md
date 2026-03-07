# 🧠 NeuroRead - Project Documentation

## Submission for Hack for Infinity – Infinity 2K26 Hackathon

---

## Project Title
**NeuroRead - ADHD & Dyslexia Reading Assistant**

## Team Members
*(Add your team member names here)*

---

## Problem Statement Addressed
**PS 01: NeuroInclusive Tech** — Making digital content readable for ADHD and Dyslexic minds

### The Problem
Most digital content is a wall of text. For people with ADHD or dyslexia, standard fonts and dense layouts are mentally exhausting — the brain skips lines, loses its place, and accumulates "reading fatigue" just trying to absorb basic information. Roughly **1 in 5 people** have a learning difference, and **70% of websites** have accessibility issues.

### Our Vision
Content that physically adapts to the reader's brain — bolding the first syllables of words to create visual "anchor" points, stripping away visual noise, and offering a distraction-free reading mode that works anywhere on the web.

---

## System Architecture

```
┌─────────────────────────────────────────────┐
│           CHROME EXTENSION (MV3)            │
│                                             │
│  ┌──────────┐ ┌─────────┐ ┌──────────────┐ │
│  │ Popup UI │ │ Content │ │  Background  │ │
│  │  (HTML)  │ │ Scripts │ │   Worker     │ │
│  └────┬─────┘ └────┬────┘ └──────┬───────┘ │
│       │            │             │          │
│       └────────────┴─────────────┘          │
│                    │                        │
│       ┌────────────┴────────────┐           │
│       │    7 Feature Modules    │           │
│       │ • Bionic Reading        │           │
│       │ • Focus Mode            │           │
│       │ • Eye Tracker (Webcam)  │           │
│       │ • Auto Scroll           │           │
│       │ • Text to Speech        │           │
│       │ • Word Highlight        │           │
│       │ • Dyslexia Theme        │           │
│       └─────────────────────────┘           │
└──────────────────┬──────────────────────────┘
                   │ API
                   ▼
┌─────────────────────────────────────────────┐
│            NODE.JS BACKEND                  │
│  • AI Summarization (OpenAI / Fallback)     │
│  • Reading Difficulty Analysis              │
│  • Key Points Extraction                    │
│  • Flesch Reading Score                     │
└─────────────────────────────────────────────┘
```

---

## Technologies Used

| Layer | Technology |
|-------|-----------|
| Extension Platform | Chrome Extension Manifest V3 |
| Core Logic | JavaScript (ES6+) |
| Extension UI | HTML5, CSS3 |
| Content Injection | Chrome Content Scripts API |
| State Management | Chrome Storage API (sync + local) |
| Backend | Node.js + Express.js |
| AI Summarization | OpenAI GPT-3.5 API (with local fallback) |
| Text-to-Speech | Web Speech API |
| Eye Tracking | Custom webcam-based face detection |
| Typography | OpenDyslexic Font (CDN) |
| Dashboard | React.js |

---

## Key Features and Functionality

### 1. 🔤 Bionic Reading
**What:** Automatically bolds the first half of every word on any webpage  
**Why:** Creates visual "anchor points" that guide the eye through text, reducing line-skipping and improving reading speed  
**How:** Uses DOM TreeWalker to find text nodes, applies regex-based word splitting, wraps initial characters in `<strong>` tags with MutationObserver for dynamic content

### 2. 🎯 Focus Mode  
**What:** Strips away all distractions (ads, sidebars, nav, comments) and presents content in a clean overlay  
**Why:** ADHD readers lose focus due to visual clutter — Focus Mode eliminates this entirely  
**How:** Uses content detection heuristics (article/main/role selectors + text density analysis) to find the main content, then renders it in a fullscreen overlay with font controls and progress tracking

### 3. 📹 Eye Tracking (Webcam-Based)
**What:** Uses your webcam to detect your face/gaze position and auto-scroll as you read  
**Why:** Manual scrolling interrupts concentration — eye-tracked scrolling is hands-free  
**How:** Accesses webcam via `getUserMedia`, uses pixel-level skin-color detection as face detection proxy, estimates gaze Y position, smooths with exponential filter, controls scroll based on reading zone thresholds  
**Extra Innovation:** Works with NO special hardware — just your existing webcam

### 4. 📜 Auto Scroll
**What:** Automatically scrolls the page at your preferred reading speed (50-800 WPM)  
**Why:** Maintains reading flow without interruption  
**How:** Uses `requestAnimationFrame` for smooth pixel-level scrolling, WPM-based speed calculation, pause/resume with Space key

### 5. 🔊 Text to Speech with Word Highlighting
**What:** Reads content aloud while simultaneously highlighting each spoken word  
**Why:** Multi-modal processing (hearing + seeing) improves comprehension (Dual Coding Theory)  
**How:** Uses Web Speech API `SpeechSynthesisUtterance` with `onboundary` events to track word position, creates DOM highlights in sync with speech

### 6. ✨ Word Highlight (Reading Guide)
**What:** A visual reading ruler that follows your mouse cursor  
**Why:** Prevents line-skipping and keeps place during reading  
**How:** Uses `document.caretRangeFromPoint()` to identify the text line at the cursor position, overlays a semi-transparent highlight, supports line/word/paragraph modes

### 7. 🎨 Accessibility Themes
**What:** 5 color themes including Dyslexia-Friendly with OpenDyslexic font  
**Why:** Different visual needs require different color and typography settings  
**How:** Dynamically injects CSS styles that override page defaults, loads OpenDyslexic font from CDN, adjusts line-height, letter-spacing, and word-spacing

### 8. 🤖 AI Summarizer
**What:** Summarizes any article into key bullet points  
**Why:** Quickly extract essential information without reading entire articles  
**How:** Extracts page text via `chrome.scripting.executeScript`, sends to Node.js backend which uses OpenAI API (or local sentence-scoring fallback), returns HTML bullet points

---

## How the Solution Works

### User Flow:
1. User installs NeuroRead as a Chrome extension
2. Clicks the NeuroRead icon in the toolbar
3. Toggles desired features on/off via the popup UI
4. Content scripts immediately modify the current webpage
5. Settings persist across sessions via Chrome Storage API
6. Keyboard shortcuts provide instant access (Alt+B, Alt+F, etc.)

### Data Flow:
```
User Toggle → Popup.js → chrome.tabs.sendMessage() → Content Script (main.js)
                                                           ↓
                                                    Feature Module
                                                    (enable/disable)
                                                           ↓
                                                    DOM Manipulation
                                                    (page transforms)
```

### Privacy:
- All processing happens locally in the browser
- No user data is collected or stored remotely
- Eye tracking video never leaves the device
- AI features use backend only when explicitly triggered

---

## Explanation of Key Code

### Content Script Architecture
Each feature is implemented as an independent class with `enable()` and `disable()` methods. The `main.js` orchestrator coordinates all features, handles messaging from the popup, manages state persistence, and provides keyboard shortcuts.

### Eye Tracking Algorithm
```
1. Access webcam via getUserMedia (320x240 resolution)
2. Draw each frame to offscreen canvas
3. Scan pixels for skin-color detection (RGB thresholds)
4. Calculate bounding box of skin pixels → face position
5. Estimate eye Y position (top 35% of face region)
6. Apply exponential smoothing (factor: 0.1)
7. Map smoothed gaze Y to scroll direction
8. If gaze above "reading zone" (top 30%) → scroll up
9. If gaze below "reading zone" (bottom 70%) → scroll down
10. Apply smooth scroll with velocity dampening
```

### Bionic Reading Algorithm
```
1. Walk DOM tree to find all text nodes
2. Skip script/style/iframe/canvas elements
3. For each word: calculate bold length = ceil(word.length × intensity)
4. Replace word with: <strong>boldPart</strong>restPart
5. Observe DOM mutations for dynamically loaded content
6. On disable: restore original text from textContent
```

---

## Demo Instructions

1. Load extension: `chrome://extensions/` → Developer Mode → Load Unpacked → select `chrome-extension/` folder
2. Open `demo-page.html` in Chrome
3. Click the NeuroRead toolbar icon
4. Demo each feature in order:
   - **Bionic Reading** — watch text transform with bold anchors
   - **Focus Mode** — see the clean overlay with only article content
   - **Eye Tracking** — enable camera and show gaze-based scrolling
   - **Auto Scroll** — set WPM and watch hands-free reading
   - **Text to Speech** — hear content read with word highlighting
   - **Word Highlight** — move mouse to see reading guide
   - **Themes** — switch between Default, Sepia, Dark, High Contrast
   - **AI Summarize** — generate key points from the article

---

*Made with 💜 for the neurodivergent community*  
*Hack for Infinity – Infinity 2K26*
