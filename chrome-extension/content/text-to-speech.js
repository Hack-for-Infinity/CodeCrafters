// Text to Speech - Read content aloud with word highlighting
// Uses Web Speech API for natural voice synthesis

class TextToSpeech {
  constructor() {
    this.isEnabled = false;
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.isPaused = false;

    // Settings
    this.rate = 1.0;
    this.pitch = 1.0;
    this.volume = 1.0;
    this.selectedVoice = null;

    // Word highlighting
    this.currentWordIndex = 0;
    this.words = [];
    this.highlightElements = [];

    // Controls
    this.ttsOverlay = null;

    this.init();
  }

  init() {
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = () => this.loadVoices();
    }
    this.loadVoices();
  }

  loadVoices() {
    this.voices = this.synth.getVoices();

    const preferredVoices = [
      'Google US English',
      'Microsoft David',
      'Microsoft Zira',
      'Samantha',
      'Alex'
    ];

    for (const voiceName of preferredVoices) {
      const voice = this.voices.find(v => v.name.includes(voiceName));
      if (voice) {
        this.selectedVoice = voice;
        break;
      }
    }

    if (!this.selectedVoice) {
      this.selectedVoice = this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
    }
  }

  enable() {
    this.isEnabled = true;
    console.log('🔊 Text to Speech enabled');
    this.createControls();

    // Auto-start reading the article content
    setTimeout(() => {
      this.speakArticle();
    }, 300); // Small delay to let controls render
  }

  disable() {
    this.isEnabled = false;
    this.stop();
    this.removeControls();
    console.log('🔊 Text to Speech disabled');
  }

  createControls() {
    this.ttsOverlay = document.createElement('div');
    this.ttsOverlay.id = 'neuroread-tts-controls';
    this.ttsOverlay.innerHTML = `
      <div class="tts-panel">
        <span class="tts-label">🔊 Reading...</span>
        <button class="tts-btn tts-play" title="Play">▶</button>
        <button class="tts-btn tts-pause" title="Pause" style="display: none;">⏸</button>
        <button class="tts-btn tts-stop" title="Stop">⏹</button>
        <div class="tts-speed">
          <button class="tts-btn tts-speed-down" title="Slower">−</button>
          <span class="tts-rate">1.0×</span>
          <button class="tts-btn tts-speed-up" title="Faster">+</button>
        </div>
        <button class="tts-btn tts-close" title="Close">✕</button>
      </div>
      <div class="tts-progress">
        <div class="tts-progress-bar"></div>
      </div>
    `;

    document.body.appendChild(this.ttsOverlay);
    this.setupControls();
  }

  setupControls() {
    this.ttsOverlay.querySelector('.tts-play').addEventListener('click', () => this.resume());
    this.ttsOverlay.querySelector('.tts-pause').addEventListener('click', () => this.pause());
    this.ttsOverlay.querySelector('.tts-stop').addEventListener('click', () => this.stop());
    this.ttsOverlay.querySelector('.tts-speed-down').addEventListener('click', () => this.setRate(this.rate - 0.1));
    this.ttsOverlay.querySelector('.tts-speed-up').addEventListener('click', () => this.setRate(this.rate + 0.1));
    this.ttsOverlay.querySelector('.tts-close').addEventListener('click', () => this.disable());
  }

  removeControls() {
    if (this.ttsOverlay) {
      this.ttsOverlay.remove();
      this.ttsOverlay = null;
    }
  }

  updateControls() {
    if (!this.ttsOverlay) return;

    const playBtn = this.ttsOverlay.querySelector('.tts-play');
    const pauseBtn = this.ttsOverlay.querySelector('.tts-pause');
    const rateDisplay = this.ttsOverlay.querySelector('.tts-rate');
    const label = this.ttsOverlay.querySelector('.tts-label');

    if (this.isSpeaking && !this.isPaused) {
      playBtn.style.display = 'none';
      pauseBtn.style.display = 'flex';
      if (label) label.textContent = '🔊 Reading...';
    } else if (this.isPaused) {
      playBtn.style.display = 'flex';
      pauseBtn.style.display = 'none';
      if (label) label.textContent = '⏸ Paused';
    } else {
      playBtn.style.display = 'flex';
      pauseBtn.style.display = 'none';
      if (label) label.textContent = '🔊 Ready';
    }

    rateDisplay.textContent = `${this.rate.toFixed(1)}×`;
  }

  speak(text) {
    if (!text) return;

    this.stop();

    this.words = text.split(/\s+/);
    this.currentWordIndex = 0;

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.voice = this.selectedVoice;
    this.currentUtterance.rate = this.rate;
    this.currentUtterance.pitch = this.pitch;
    this.currentUtterance.volume = this.volume;

    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.updateControls();
      document.body.classList.add('neuroread-tts-speaking');
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.updateControls();
      this.clearHighlight();
      document.body.classList.remove('neuroread-tts-speaking');
    };

    this.currentUtterance.onpause = () => {
      this.isPaused = true;
      this.updateControls();
    };

    this.currentUtterance.onresume = () => {
      this.isPaused = false;
      this.updateControls();
    };

    this.currentUtterance.onboundary = (event) => {
      if (event.name === 'word') {
        this.highlightWordAtPosition(event.charIndex);
        this.updateProgress(event.charIndex / text.length);
      }
    };

    this.synth.speak(this.currentUtterance);
  }

  pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.synth.paused) {
      this.synth.resume();
    } else if (!this.synth.speaking) {
      this.speakArticle();
    }
  }

  stop() {
    this.synth.cancel();
    this.isSpeaking = false;
    this.isPaused = false;
    this.clearHighlight();
    this.updateControls();
    document.body.classList.remove('neuroread-tts-speaking');
  }

  setRate(rate) {
    this.rate = Math.max(0.5, Math.min(3, rate));

    if (this.currentUtterance && this.isSpeaking) {
      const wasPaused = this.isPaused;
      const remainingText = this.words.slice(this.currentWordIndex).join(' ');
      this.stop();
      setTimeout(() => {
        this.speak(remainingText);
        if (wasPaused) setTimeout(() => this.pause(), 200);
      }, 100);
    }

    this.updateControls();
  }

  highlightWordAtPosition(charIndex) {
    this.clearHighlight();

    let currentIndex = 0;
    let wordIndex = 0;

    for (let i = 0; i < this.words.length; i++) {
      if (currentIndex >= charIndex) {
        wordIndex = i;
        break;
      }
      currentIndex += this.words[i].length + 1;
    }

    this.currentWordIndex = wordIndex;
    this.highlightWordInDOM(this.words[wordIndex]);
  }

  highlightWordInDOM(word) {
    if (!word || word.length < 2) return;

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
    if (cleanWord.length < 2) return;

    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent;
      const regex = new RegExp(`\\b${cleanWord}\\b`, 'i');

      if (regex.test(text)) {
        const parent = node.parentElement;
        if (parent && !this.isNeuroReadElement(parent)) {
          const span = document.createElement('span');
          span.className = 'neuroread-tts-highlight';

          const parts = text.split(regex);
          const match = text.match(regex);

          if (parts.length > 1 && match) {
            span.textContent = match[0];

            const before = document.createTextNode(parts[0]);
            const after = document.createTextNode(parts.slice(1).join(match[0]));

            const wrapper = document.createElement('span');
            wrapper.appendChild(before);
            wrapper.appendChild(span);
            wrapper.appendChild(after);

            node.parentNode.replaceChild(wrapper, node);

            span.scrollIntoView({ behavior: 'smooth', block: 'center' });

            this.highlightElements.push(span);
            break;
          }
        }
      }
    }
  }

  clearHighlight() {
    this.highlightElements.forEach(el => {
      const wrapper = el.parentElement;
      if (wrapper && wrapper.parentNode) {
        const text = wrapper.textContent;
        const textNode = document.createTextNode(text);
        wrapper.parentNode.replaceChild(textNode, wrapper);
      }
    });
    this.highlightElements = [];
  }

  updateProgress(percent) {
    if (!this.ttsOverlay) return;

    const progressBar = this.ttsOverlay.querySelector('.tts-progress-bar');
    if (progressBar) {
      progressBar.style.width = `${Math.min(100, percent * 100)}%`;
    }
  }

  speakSelection() {
    const selection = window.getSelection().toString();
    if (selection) {
      this.speak(selection);
    }
  }

  speakArticle() {
    const article = document.querySelector('article, main, .article, .post-content, .entry-content, [role="main"]');
    if (article) {
      this.speak(article.textContent.trim().substring(0, 8000));
    } else {
      // Gather visible text paragraphs as fallback
      const paragraphs = Array.from(document.querySelectorAll('p')).filter(p => p.textContent.trim().length > 20);
      if (paragraphs.length > 0) {
        const text = paragraphs.map(p => p.textContent.trim()).join(' ').substring(0, 8000);
        this.speak(text);
      } else {
        this.speak(document.body.innerText.substring(0, 5000));
      }
    }
  }

  isNeuroReadElement(element) {
    if (!element) return false;
    if (element.id && element.id.startsWith('neuroread-')) return true;
    if (element.classList) {
      return Array.from(element.classList).some(cls => cls.startsWith('neuroread-'));
    }
    return false;
  }
}

// Make available globally
window.TextToSpeech = TextToSpeech;
