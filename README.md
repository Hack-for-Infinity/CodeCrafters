# 🧠 NeuroRead - ADHD & Dyslexia Reading Assistant

> **Making the web accessible for everyone**

NeuroRead is a Chrome Extension that transforms how people with ADHD and Dyslexia experience digital content. With features like Bionic Reading, Eye Tracking, AI Summarization, and Focus Mode, we make reading effortless and enjoyable.

![NeuroRead Banner](demo-assets/banner.png)

## ✨ Features

### 🔤 Bionic Reading
Bold the first half of words to create visual anchor points that guide your eye through text. Scientifically proven to improve reading speed and comprehension for neurodivergent readers.

### 🎯 Focus Mode
Strip away distractions like ads, sidebars, and clutter. Just the content you want to read in a clean, beautiful interface.

### 📹 Eye Tracking
Use your webcam to track your gaze and automatically scroll as you read. Hands-free reading at its finest.

### 📜 Auto Scroll
Set your reading speed and let the page scroll automatically. Perfect for hands-free reading sessions.

### 🔊 Text to Speech
Listen to content while following along with word highlighting. Supports multiple voices and speeds.

### ✨ Word Highlight
Keep your place with a moving highlight that follows your reading. Never lose your spot again.

### 🤖 AI Summarizer
Get key points from any article in seconds with our AI-powered summarization backend.

### 🎨 Accessibility Themes
- **Default**: Clean and modern
- **Sepia**: Easy on the eyes
- **Dark**: Perfect for night reading
- **High Contrast**: Maximum visibility
- **Dyslexia-Friendly**: OpenDyslexic font with optimized spacing

## 🚀 Quick Start

### Chrome Extension

1. **Load the Extension**
   ```bash
   cd chrome-extension
   # Open Chrome and go to chrome://extensions/
   # Enable "Developer mode"
   # Click "Load unpacked" and select the chrome-extension folder
   ```

2. **Start Using**
   - Click the NeuroRead icon in your browser toolbar
   - Toggle features on/off as needed
   - Use keyboard shortcuts for quick access:
     - `Alt + B`: Toggle Bionic Reading
     - `Alt + F`: Toggle Focus Mode
     - `Alt + S`: Toggle Auto Scroll
     - `Alt + T`: Toggle Text to Speech

### Backend API (Optional)

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Add your OpenAI API key to .env
   ```

3. **Start Server**
   ```bash
   npm start
   # Server runs on http://localhost:3000
   ```

### Dashboard (Optional)

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   # Dashboard opens at http://localhost:3001
   ```

## 📁 Project Structure

```
neuroread-extension/
├── chrome-extension/          # Chrome Extension (Main)
│   ├── manifest.json          # Extension manifest
│   ├── popup.html             # Popup UI
│   ├── popup.js               # Popup logic
│   ├── background.js          # Service worker
│   ├── content/               # Content scripts
│   │   ├── main.js            # Main controller
│   │   ├── bionic-reading.js  # Bionic reading feature
│   │   ├── focus-mode.js      # Focus mode feature
│   │   ├── eye-tracker.js     # Eye tracking feature
│   │   ├── auto-scroll.js     # Auto scroll feature
│   │   ├── text-to-speech.js  # TTS feature
│   │   ├── word-highlight.js  # Word highlight feature
│   │   └── dyslexia-theme.js  # Theme feature
│   └── styles/                # CSS styles
├── backend/                   # Node.js API
│   ├── server.js              # Express server
│   └── package.json
├── frontend/                  # React Dashboard
│   ├── src/
│   └── package.json
└── README.md
```

## 🛠️ Tech Stack

- **Chrome Extension API**: Manifest V3
- **JavaScript (ES6+)**: Core functionality
- **CSS3**: Styling and animations
- **Node.js + Express**: Backend API
- **React**: Dashboard interface
- **OpenAI API**: AI summarization
- **Web Speech API**: Text-to-speech
- **WebGazer.js**: Eye tracking (optional)

## 🎯 Use Cases

### For ADHD Readers
- **Focus Mode** removes distractions that break concentration
- **Word Highlight** keeps your place when your mind wanders
- **Auto Scroll** maintains reading flow without manual scrolling

### For Dyslexic Readers
- **Bionic Reading** creates visual anchors that prevent skipping lines
- **Dyslexia Theme** uses OpenDyslexic font with optimized spacing
- **Text to Speech** provides audio support for difficult words

### For Everyone
- **AI Summarizer** quickly extracts key information
- **Focus Mode** creates a clean reading environment
- **Multiple Themes** reduce eye strain

## 🏆 Hackathon Submission

This project was built for **Hack for Infinity - Infinity 2K26** hackathon.

### Problem Statement
**PS 01: NeuroInclusive Tech** - Making digital content readable for ADHD and Dyslexic minds

### Solution Highlights
- ✅ Works on ANY website
- ✅ No account required
- ✅ Privacy-focused (local processing)
- ✅ Fully accessible UI
- ✅ Keyboard navigable
- ✅ Screen reader compatible

### Innovation
- **Eye Tracking**: Webcam-based gaze detection for hands-free reading
- **Adaptive Scroll**: Speed adjusts based on reading patterns
- **AI Summarization**: Intelligent content condensation
- **Bionic Reading**: Automatic text transformation

## 📊 Impact

- **20%** of the population has a learning difference
- **70%** of websites have accessibility issues
- **∞** potential for inclusive design

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [OpenDyslexic Font](https://opendyslexic.org/) for dyslexia-friendly typography
- [Bionic Reading](https://bionic-reading.com/) for the reading technique
- [WebGazer](https://webgazer.cs.brown.edu/) for eye tracking inspiration

---

<p align="center">
  <strong>Made with 💜 for the neurodivergent community</strong>
</p>

<p align="center">
  <a href="#">Website</a> •
  <a href="#">Documentation</a> •
  <a href="#">Support</a>
</p>
