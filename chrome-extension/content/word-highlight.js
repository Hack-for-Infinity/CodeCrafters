// Word Highlight - Guide reading with a moving highlight
// Helps ADHD readers maintain focus on current word/line

class WordHighlight {
  constructor() {
    this.isEnabled = false;
    this.highlightElement = null;
    this.isAutoAdvance = false;
    this.words = [];
    this.currentWordIndex = 0;
    this.maxWords = 4000;
    this.autoTimer = null;
    this.wpm = 200;
    this.lastSpan = null;
    this.lastMouseY = window.innerHeight * 0.4;

    // Settings
    this.highlightMode = 'line'; // 'line', 'word', 'paragraph'
    this.bar = null;
  }

  enable() {
    if (this.isEnabled) return;
    this.isEnabled = true;

    console.log('✨ Word Highlight enabled');

    this.buildWordIndex();
    this.createHighlight();
    this.setupEventListeners();
    this.updateHighlightPosition(this.lastMouseY);
    this.updateRateDisplay();

    document.body.classList.add('neuroread-highlight-active');
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;

    console.log('✨ Word Highlight disabled');

    this.stopAutoAdvance();
    this.clearWordHighlight();
    this.removeEventListeners();
    this.removeHighlight();

    document.body.classList.remove('neuroread-highlight-active');
    document.body.classList.remove('neuroread-highlight-mode-line', 'neuroread-highlight-mode-word', 'neuroread-highlight-mode-paragraph');
  }

  createHighlight() {
    this.highlightElement = document.createElement('div');
    this.highlightElement.id = 'neuroread-word-highlight';
    this.highlightElement.innerHTML = `
      <div class="highlight-line"></div>
      <div class="highlight-controls">
        <button class="highlight-btn" data-mode="line" title="Line Mode">≡</button>
        <button class="highlight-btn" data-mode="word" title="Word Mode">▪</button>
        <button class="highlight-btn" data-mode="paragraph" title="Paragraph Mode">¶</button>
        <div class="highlight-divider"></div>
        <button class="highlight-btn" data-action="play" title="Start / Pause">▶</button>
        <button class="highlight-btn" data-action="slower" title="Slower">−</button>
        <span class="highlight-rate">200 WPM</span>
        <button class="highlight-btn" data-action="faster" title="Faster">+</button>
        <button class="highlight-btn" data-action="reset" title="Restart">⟳</button>
      </div>
    `;

    document.body.appendChild(this.highlightElement);
    this.bar = this.highlightElement.querySelector('.highlight-line');

    // Setup mode buttons
    this.highlightElement.querySelectorAll('.highlight-btn').forEach(btn => {
      if (btn.dataset.mode) {
        btn.addEventListener('click', () => this.setMode(btn.dataset.mode));
      }
      if (btn.dataset.action) {
        btn.addEventListener('click', () => this.handleAction(btn.dataset.action));
      }
    });

    this.setMode(this.highlightMode);
  }

  removeHighlight() {
    if (this.highlightElement) {
      this.highlightElement.remove();
      this.highlightElement = null;
      this.bar = null;
    }
  }

  setMode(mode) {
    this.highlightMode = mode;

    // Update button states
    this.highlightElement.querySelectorAll('.highlight-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    document.body.classList.remove('neuroread-highlight-mode-line', 'neuroread-highlight-mode-word', 'neuroread-highlight-mode-paragraph');
    document.body.classList.add(`neuroread-highlight-mode-${mode}`);

    // Update highlight height based on mode
    if (this.bar) {
      switch (mode) {
        case 'line':
          this.bar.style.height = '1.7em';
          this.bar.style.borderRadius = '6px';
          break;
        case 'word':
          this.bar.style.height = '1.4em';
          this.bar.style.borderRadius = '3px';
          break;
        case 'paragraph':
          this.bar.style.minHeight = '3em';
          this.bar.style.borderRadius = '10px';
          break;
      }
    }
  }

  setupEventListeners() {
    this.mouseHandler = (e) => {
      if (this.isAutoAdvance) return;
      this.lastMouseY = e.clientY;
      this.updateHighlightPosition(e.clientY);
    };

    this.scrollHandler = () => {
      if (!this.isAutoAdvance && this.lastMouseY > 0) {
        this.updateHighlightPosition(this.lastMouseY);
      }
    };

    this.keyHandler = (e) => {
      if (!this.isEnabled) return;
      if (e.key === 'ArrowDown') {
        this.lastMouseY = Math.min(window.innerHeight - 20, this.lastMouseY + 30);
        this.updateHighlightPosition(this.lastMouseY);
      } else if (e.key === 'ArrowUp') {
        this.lastMouseY = Math.max(20, this.lastMouseY - 30);
        this.updateHighlightPosition(this.lastMouseY);
      } else if (e.key === 'ArrowRight') {
        this.advanceWord();
      } else if (e.key === 'ArrowLeft') {
        this.rewindWord();
      }
    };

    document.addEventListener('mousemove', this.mouseHandler, { passive: true });
    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    document.addEventListener('keydown', this.keyHandler);
  }

  removeEventListeners() {
    document.removeEventListener('mousemove', this.mouseHandler);
    window.removeEventListener('scroll', this.scrollHandler);
    document.removeEventListener('keydown', this.keyHandler);
  }

  updateHighlightPosition(y) {
    if (!this.bar) return;

    // Use caret range to find actual text line at this Y
    const range = this.getRangeFromPoint(window.innerWidth / 2, y);

    if (range) {
      const rect = range.getBoundingClientRect();

      if (rect && rect.height > 2) {
        // Get parent element for full-width coverage
        const container = range.startContainer?.parentElement;
        const cRect = container?.getBoundingClientRect();

        const left = (cRect && cRect.width > 40) ? cRect.left : rect.left;
        const width = (cRect && cRect.width > 40) ? cRect.width : Math.max(rect.width, 200);
        const lineHeight = parseFloat(getComputedStyle(container || document.body).lineHeight) || 24;

        // position: fixed — viewport coordinates, NO scrollY offset
        this.bar.style.top = `${rect.top - 4}px`;
        this.bar.style.left = `${left}px`;
        this.bar.style.width = `${width}px`;
        this.bar.style.height = `${Math.max(rect.height + 8, lineHeight + 4)}px`;
        return;
      }
    }

    // Fallback: find a text element at this y
    const elements = document.elementsFromPoint(window.innerWidth / 2, y);
    for (const el of elements) {
      if (el.id && el.id.startsWith('neuroread')) continue;
      const tag = el.tagName?.toLowerCase();
      if (['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'td', 'div'].includes(tag)) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 40) {
          const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 24;
          this.bar.style.top = `${y - lineHeight / 2 - 4}px`;
          this.bar.style.left = `${rect.left}px`;
          this.bar.style.width = `${rect.width}px`;
          this.bar.style.height = `${lineHeight + 8}px`;
          return;
        }
      }
    }

    // Last resort: bar at mouse position
    this.bar.style.top = `${y - 16}px`;
    this.bar.style.left = '8px';
    this.bar.style.width = `calc(100% - 16px)`;
    this.bar.style.height = '32px';
  }

  buildWordIndex() {
    this.words = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!parent) return NodeFilter.FILTER_REJECT;
          const tag = parent.tagName?.toLowerCase();
          if (['script', 'style', 'noscript', 'iframe', 'canvas', 'svg'].includes(tag)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (this.isNeuroReadElement(parent)) return NodeFilter.FILTER_REJECT;
          if (!node.textContent || !node.textContent.trim()) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while ((node = walker.nextNode())) {
      const text = node.textContent;
      const regex = /[A-Za-z0-9']+/g;
      let match;
      while ((match = regex.exec(text)) !== null) {
        this.words.push({ node, start: match.index, end: match.index + match[0].length });
        if (this.words.length >= this.maxWords) return;
      }
    }
  }

  highlightCurrentWord() {
    this.clearWordHighlight();
    if (!this.words.length) return;

    if (this.currentWordIndex < 0) this.currentWordIndex = 0;
    if (this.currentWordIndex >= this.words.length) this.currentWordIndex = this.words.length - 1;

    const { node, start, end } = this.words[this.currentWordIndex];
    if (!node.parentNode) return;

    const range = document.createRange();
    try {
      range.setStart(node, start);
      range.setEnd(node, end);
    } catch (error) {
      return;
    }

    const span = document.createElement('span');
    span.className = 'neuroread-word-highlight-active';
    try {
      range.surroundContents(span);
    } catch (e) {
      return;
    }
    this.lastSpan = span;

    span.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  clearWordHighlight() {
    if (this.lastSpan && this.lastSpan.parentNode) {
      const textNode = document.createTextNode(this.lastSpan.textContent);
      this.lastSpan.parentNode.replaceChild(textNode, this.lastSpan);
    }
    this.lastSpan = null;
  }

  advanceWord() {
    if (!this.words.length) return;
    this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
    this.highlightCurrentWord();
  }

  rewindWord() {
    if (!this.words.length) return;
    this.currentWordIndex = (this.currentWordIndex - 1 + this.words.length) % this.words.length;
    this.highlightCurrentWord();
  }

  // Auto-advance mode
  startAutoAdvance(wpm = 200) {
    this.stopAutoAdvance();
    this.isAutoAdvance = true;
    this.wpm = wpm;
    this.updateRateDisplay();
    const msPerWord = 60000 / Math.max(80, this.wpm);
    this.highlightCurrentWord();
    this.autoTimer = setInterval(() => {
      this.advanceWord();
    }, msPerWord);
  }

  stopAutoAdvance() {
    this.isAutoAdvance = false;
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
    this.updatePlayButton(false);
  }

  toggleAutoAdvance() {
    if (this.isAutoAdvance) {
      this.stopAutoAdvance();
    } else {
      this.startAutoAdvance(this.wpm);
      this.updatePlayButton(true);
    }
  }

  handleAction(action) {
    switch (action) {
      case 'play':
        this.toggleAutoAdvance();
        break;
      case 'slower':
        this.wpm = Math.max(80, this.wpm - 20);
        if (this.isAutoAdvance) this.startAutoAdvance(this.wpm);
        this.updateRateDisplay();
        break;
      case 'faster':
        this.wpm = Math.min(500, this.wpm + 20);
        if (this.isAutoAdvance) this.startAutoAdvance(this.wpm);
        this.updateRateDisplay();
        break;
      case 'reset':
        this.currentWordIndex = 0;
        this.highlightCurrentWord();
        break;
    }
  }

  updateRateDisplay() {
    if (!this.highlightElement) return;
    const rateEl = this.highlightElement.querySelector('.highlight-rate');
    if (rateEl) rateEl.textContent = `${this.wpm} WPM`;
    this.updatePlayButton(this.isAutoAdvance);
  }

  updatePlayButton(isPlaying) {
    if (!this.highlightElement) return;
    const btn = this.highlightElement.querySelector('[data-action="play"]');
    if (btn) btn.textContent = isPlaying ? '⏸' : '▶';
  }

  isNeuroReadElement(element) {
    if (!element) return false;
    if (element.id && element.id.startsWith('neuroread-')) return true;
    if (element.classList) {
      return Array.from(element.classList).some(cls => cls.startsWith('neuroread-'));
    }
    return false;
  }

  getRangeFromPoint(x, y) {
    if (document.caretRangeFromPoint) {
      try {
        return document.caretRangeFromPoint(x, y);
      } catch (e) { /* ignore */ }
    }
    if (document.caretPositionFromPoint) {
      try {
        const position = document.caretPositionFromPoint(x, y);
        if (position) {
          const range = document.createRange();
          range.setStart(position.offsetNode, position.offset);
          range.collapse(true);
          return range;
        }
      } catch (e) { /* ignore */ }
    }
    return null;
  }
}

// Make available globally
window.WordHighlight = WordHighlight;
