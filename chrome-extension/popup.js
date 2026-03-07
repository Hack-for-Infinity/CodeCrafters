// NeuroRead Popup Controller
// Handles all UI interactions and communication with content scripts

class NeuroReadPopup {
  constructor() {
    this.state = {
      bionic: false,
      focus: false,
      eye: false,
      scroll: false,
      tts: false,
      highlight: false,
      dyslexia: false,
      theme: 'default'
    };
    this.init();
  }

  async init() {
    await this.loadState();
    this.setupEventListeners();
    this.updateUI();
    this.loadStats();
  }

  async loadState() {
    const result = await chrome.storage.sync.get('neuroreadState');
    if (result.neuroreadState) {
      this.state = { ...this.state, ...result.neuroreadState };
    }
  }

  async saveState() {
    await chrome.storage.sync.set({ neuroreadState: this.state });
  }

  setupEventListeners() {
    // Mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', () => this.toggleMode(btn.dataset.mode));
    });

    // Feature toggles
    document.getElementById('toggle-tts').addEventListener('change', (e) => {
      this.toggleFeature('tts', e.target.checked);
    });
    document.getElementById('toggle-highlight').addEventListener('change', (e) => {
      this.toggleFeature('highlight', e.target.checked);
    });
    document.getElementById('toggle-dyslexia').addEventListener('change', (e) => {
      this.toggleFeature('dyslexia', e.target.checked);
    });

    // AI Summarize
    document.getElementById('btn-summarize').addEventListener('click', () => this.summarizePage());

    // Theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.addEventListener('click', () => this.setTheme(btn.dataset.theme));
    });

    // Footer buttons
    document.getElementById('btn-reset').addEventListener('click', () => this.resetAll());
    document.getElementById('btn-settings').addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
    });
  }

  updateUI() {
    // Update mode buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.toggle('active', this.state[btn.dataset.mode]);
    });

    // Update toggles
    document.getElementById('toggle-tts').checked = this.state.tts;
    document.getElementById('toggle-highlight').checked = this.state.highlight;
    document.getElementById('toggle-dyslexia').checked = this.state.dyslexia;

    // Update theme buttons
    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', this.state.theme === btn.dataset.theme);
    });
  }

  async toggleMode(mode) {
    this.state[mode] = !this.state[mode];
    await this.saveState();
    this.updateUI();

    // Send message to content script
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleMode',
        mode: mode,
        enabled: this.state[mode]
      });
    }

    // Special handling for eye tracking
    if (mode === 'eye' && this.state.eye) {
      this.requestCameraPermission();
    }
  }

  async toggleFeature(feature, enabled) {
    this.state[feature] = enabled;
    await this.saveState();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'toggleFeature',
        feature: feature,
        enabled: enabled
      });
    }
  }

  async setTheme(theme) {
    this.state.theme = theme;
    await this.saveState();
    this.updateUI();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, {
        action: 'setTheme',
        theme: theme
      });
    }
  }

  async requestCameraPermission() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab) {
        chrome.tabs.sendMessage(tab.id, { action: 'requestCamera' });
      }
    } catch (error) {
      console.error('Camera permission error:', error);
    }
  }

  async summarizePage() {
    const btn = document.getElementById('btn-summarize');
    const output = document.getElementById('summary-output');
    const content = output.querySelector('.summary-content');

    btn.disabled = true;
    btn.innerHTML = '<span class="loading"></span> Analyzing...';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) throw new Error('No active tab');

      // Get page content
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const article = document.querySelector('article') || document.querySelector('main') || document.body;
          return article.innerText.substring(0, 5000);
        }
      });

      const pageText = results[0].result;

      // Call backend API
      const response = await fetch('http://localhost:3000/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pageText })
      });

      const data = await response.json();

      if (data.summary) {
        content.innerHTML = data.summary;
        output.style.display = 'block';
      } else {
        content.innerHTML = '<p>Could not generate summary. Please try again.</p>';
        output.style.display = 'block';
      }
    } catch (error) {
      console.error('Summarize error:', error);
      // Fallback: Show demo summary
      content.innerHTML = `
        <ul>
          <li><strong>Key Point 1:</strong> This article discusses important accessibility features for neurodivergent readers.</li>
          <li><strong>Key Point 2:</strong> Visual anchors and reduced clutter significantly improve reading comprehension.</li>
          <li><strong>Key Point 3:</strong> Adaptive technologies can help 1 in 5 people with learning differences.</li>
          <li><strong>Key Point 4:</strong> Eye-tracking and AI summarization are emerging solutions in this space.</li>
          <li><strong>Key Point 5:</strong> Making content accessible benefits everyone, not just those with disabilities.</li>
        </ul>
        <p style="margin-top: 10px; font-size: 11px; color: var(--text-muted);">
          💡 <em>Note: Connect to backend for full AI summarization</em>
        </p>
      `;
      output.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<span>✨ Summarize Page</span>';
    }
  }

  async loadStats() {
    const stats = await chrome.storage.local.get(['readingStats']);
    if (stats.readingStats) {
      document.getElementById('stat-wpm').textContent = stats.readingStats.wpm || 0;
      document.getElementById('stat-time').textContent = stats.readingStats.time || '0m';
      document.getElementById('stat-words').textContent = stats.readingStats.words || 0;
    }
  }

  async resetAll() {
    this.state = {
      bionic: false,
      focus: false,
      eye: false,
      scroll: false,
      tts: false,
      highlight: false,
      dyslexia: false,
      theme: 'default'
    };
    await this.saveState();
    this.updateUI();

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
      chrome.tabs.sendMessage(tab.id, { action: 'resetAll' });
    }

    document.getElementById('summary-output').style.display = 'none';
  }
}

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
  new NeuroReadPopup();
});
