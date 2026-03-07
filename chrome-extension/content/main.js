// NeuroRead Main Content Script
// Orchestrates all reading assistance features

class NeuroRead {
  constructor() {
    this.features = {
      bionic: null,
      focus: null,
      eye: null,
      scroll: null,
      lineFocus: null,
      tts: null,
      highlight: null,
      dyslexia: null
    };
    this.state = {
      bionic: false,
      focus: false,
      eye: false,
      scroll: false,
      lineFocus: false,
      tts: false,
      highlight: false,
      dyslexia: false,
      theme: 'default'
    };
    this.summaryOverlay = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    if (this.isInitialized) return;

    console.log('🧠 NeuroRead initializing...');

    // Initialize feature modules
    this.features.bionic = new BionicReading();
    this.features.focus = new FocusMode();
    this.features.eye = new EyeTracker();
    this.features.scroll = new AutoScroll();
    this.features.lineFocus = new LineFocus();
    this.features.tts = new TextToSpeech();
    this.features.highlight = new WordHighlight();
    this.features.dyslexia = new DyslexiaTheme();

    // Load saved state
    await this.loadState();

    // Setup message listener
    this.setupMessageListener();

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Inject NeuroRead container
    this.injectContainer();

    this.isInitialized = true;
    console.log('✅ NeuroRead initialized successfully');
  }

  async loadState() {
    try {
      const result = await chrome.storage.sync.get('neuroreadState');
      if (result.neuroreadState) {
        this.state = { ...this.state, ...result.neuroreadState };

        // Apply saved states
        Object.keys(this.state).forEach(key => {
          if (this.state[key] && this.features[key]) {
            this.features[key].enable();
          }
        });
      }
    } catch (error) {
      console.log('Storage not available, using defaults');
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('Message received:', request.action);

      switch (request.action) {
        case 'toggleMode':
          this.toggleMode(request.mode, request.enabled);
          sendResponse({ success: true });
          break;

        case 'toggleFeature':
          this.toggleFeature(request.feature, request.enabled);
          sendResponse({ success: true });
          break;

        case 'setTheme':
          this.setTheme(request.theme);
          sendResponse({ success: true });
          break;

        case 'speakText':
          this.features.tts.speak(request.text);
          sendResponse({ success: true });
          break;

        case 'summarizePage':
          this.summarizePage();
          sendResponse({ success: true });
          break;

        case 'requestCamera':
          this.features.eye.requestCameraPermission();
          sendResponse({ success: true });
          break;

        case 'resetAll':
          this.resetAll();
          sendResponse({ success: true });
          break;

        case 'getState':
          sendResponse({ state: this.state });
          break;

        case 'setScrollSpeed':
          if (this.features.scroll && this.features.scroll.targetWPM !== undefined) {
            this.features.scroll.targetWPM = request.speed;
            if (this.features.scroll.controlsOverlay) {
              const speedVal = this.features.scroll.controlsOverlay.querySelector('.speed-value');
              if (speedVal) speedVal.textContent = request.speed;
            }
          }
          sendResponse({ success: true });
          break;
      }

      return true;
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Alt + B: Toggle Bionic Reading
      if (e.altKey && e.key === 'b') {
        e.preventDefault();
        this.toggleMode('bionic');
      }
      // Alt + F: Toggle Focus Mode
      if (e.altKey && e.key === 'f') {
        e.preventDefault();
        this.toggleMode('focus');
      }
      // Alt + S: Toggle Auto Scroll
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        this.toggleMode('scroll');
      }
      // Alt + L: Toggle Line Focus
      if (e.altKey && e.key === 'l') {
        e.preventDefault();
        this.toggleMode('lineFocus');
      }
      // Alt + T: Toggle Text to Speech
      if (e.altKey && e.key === 't') {
        e.preventDefault();
        this.toggleFeature('tts');
      }
      // Alt + E: Toggle Eye Tracking
      if (e.altKey && e.key === 'e') {
        e.preventDefault();
        this.toggleMode('eye');
      }
      // Escape: Reset all
      if (e.key === 'Escape' && e.shiftKey) {
        e.preventDefault();
        this.resetAll();
      }
    });
  }

  injectContainer() {
    // Create floating indicator
    const indicator = document.createElement('div');
    indicator.id = 'neuroread-indicator';
    indicator.innerHTML = `
      <div class="neuroread-indicator-content">
        <span class="neuroread-logo">🧠</span>
        <span class="neuroread-status">NeuroRead Active</span>
      </div>
    `;
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      padding: 10px 16px;
      border-radius: 50px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      font-weight: 600;
      z-index: 999999;
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.4);
      cursor: pointer;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      pointer-events: none;
    `;

    document.body.appendChild(indicator);

    // Show indicator when features are active
    this.updateIndicator();
  }

  updateIndicator() {
    const indicator = document.getElementById('neuroread-indicator');
    if (!indicator) return;

    const activeFeatures = Object.keys(this.state).filter(key => this.state[key]);

    if (activeFeatures.length > 0) {
      indicator.style.opacity = '1';
      indicator.style.transform = 'translateY(0)';
      indicator.querySelector('.neuroread-status').textContent =
        `${activeFeatures.length} mode${activeFeatures.length > 1 ? 's' : ''} active`;
    } else {
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateY(20px)';
    }
  }

  toggleMode(mode, enabled = null) {
    if (!this.features[mode]) return;

    const newState = enabled !== null ? enabled : !this.state[mode];
    this.state[mode] = newState;

    if (newState) {
      this.features[mode].enable();
    } else {
      this.features[mode].disable();
    }

    this.saveState();
    this.updateIndicator();

    // Show toast notification
    this.showToast(`${mode.charAt(0).toUpperCase() + mode.slice(1)} ${newState ? 'enabled' : 'disabled'}`);
  }

  toggleFeature(feature, enabled = null) {
    if (!this.features[feature]) return;

    const newState = enabled !== null ? enabled : !this.state[feature];
    this.state[feature] = newState;

    if (newState) {
      this.features[feature].enable();
    } else {
      this.features[feature].disable();
    }

    this.saveState();
    this.updateIndicator();
  }

  setTheme(theme) {
    this.state.theme = theme;
    this.features.dyslexia.setTheme(theme);
    this.saveState();
  }

  async saveState() {
    try {
      await chrome.storage.sync.set({ neuroreadState: this.state });
    } catch (error) {
      console.log('Could not save state');
    }
  }

  resetAll() {
    Object.keys(this.features).forEach(key => {
      if (this.state[key] && this.features[key]) {
        this.features[key].disable();
      }
    });

    this.state = {
      bionic: false,
      focus: false,
      eye: false,
      scroll: false,
      lineFocus: false,
      tts: false,
      highlight: false,
      dyslexia: false,
      theme: 'default'
    };

    this.saveState();
    this.updateIndicator();
    this.showToast('All modes reset');
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'neuroread-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #1e293b;
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 14px;
      font-weight: 500;
      z-index: 9999999;
      animation: neuroread-toast-in 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'neuroread-toast-out 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  async summarizePage() {
    const overlay = this.getSummaryOverlay();
    const content = overlay.querySelector('.neuroread-summary-body');
    const status = overlay.querySelector('.neuroread-summary-status');

    overlay.style.display = 'block';
    content.innerHTML = '';
    status.textContent = 'Analyzing page...';

    try {
      const pageText = this.extractReadableText();
      if (!pageText) throw new Error('No readable text detected');

      const response = await fetch('http://localhost:3000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pageText, maxPoints: 6 })
      });

      const data = await response.json();
      const summary = data?.summary;

      if (summary) {
        content.innerHTML = summary;
        status.textContent = 'AI summary ready';
      } else {
        throw new Error('No summary returned');
      }
    } catch (error) {
      console.error('Summarize error:', error);
      status.textContent = 'Using quick fallback summary';
      content.innerHTML = `
        <ul>
          <li><strong>Key Point 1:</strong> Highlights the main accessibility improvements on this page.</li>
          <li><strong>Key Point 2:</strong> Focus mode and bionic reading can be toggled for distraction-free reading.</li>
          <li><strong>Key Point 3:</strong> Eye tracking, auto-scroll, and TTS support hands-free reading.</li>
          <li><strong>Key Point 4:</strong> Connect the backend (localhost:3000) for full AI summaries.</li>
        </ul>
      `;
    }
  }

  getSummaryOverlay() {
    if (this.summaryOverlay) return this.summaryOverlay;

    const overlay = document.createElement('div');
    overlay.id = 'neuroread-summary-overlay';
    overlay.innerHTML = `
      <div class="neuroread-summary-card">
        <div class="neuroread-summary-header">
          <span>🤖 AI Summary</span>
          <button class="neuroread-summary-close" aria-label="Close summary">✕</button>
        </div>
        <div class="neuroread-summary-status">Preparing...</div>
        <div class="neuroread-summary-body"></div>
      </div>
    `;
    overlay.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      max-width: 360px;
      width: 92vw;
      background: #0f172a;
      color: #e2e8f0;
      border: 1px solid rgba(148, 163, 184, 0.35);
      border-radius: 12px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.35);
      z-index: 999999;
      padding: 14px;
      font-family: system-ui, -apple-system, sans-serif;
      display: none;
    `;

    const card = overlay.querySelector('.neuroread-summary-card');
    card.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';

    const header = overlay.querySelector('.neuroread-summary-header');
    header.style.cssText = 'display: flex; justify-content: space-between; align-items: center; font-weight: 700; font-size: 14px;';

    const body = overlay.querySelector('.neuroread-summary-body');
    body.style.cssText = 'font-size: 13px; line-height: 1.6; max-height: 260px; overflow-y: auto;';

    const status = overlay.querySelector('.neuroread-summary-status');
    status.style.cssText = 'font-size: 12px; color: #94a3b8;';

    const closeBtn = overlay.querySelector('.neuroread-summary-close');
    closeBtn.style.cssText = 'background: none; border: none; color: inherit; cursor: pointer; font-size: 14px;';
    closeBtn.addEventListener('click', () => {
      overlay.style.display = 'none';
    });

    document.body.appendChild(overlay);
    this.summaryOverlay = overlay;
    return overlay;
  }

  extractReadableText() {
    const root = document.querySelector('article') || document.querySelector('main') || document.body;
    const text = root?.innerText || '';
    return text.trim().substring(0, 5000);
  }
}

// Add toast animations
const style = document.createElement('style');
style.textContent = `
  @keyframes neuroread-toast-in {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  @keyframes neuroread-toast-out {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(20px); }
  }
`;
document.head.appendChild(style);

// Initialize NeuroRead when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.neuroread = new NeuroRead();
  });
} else {
  window.neuroread = new NeuroRead();
}
