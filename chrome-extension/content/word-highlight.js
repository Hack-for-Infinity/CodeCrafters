// Word Highlight - Guide reading with a moving highlight
// Helps ADHD readers maintain focus on current word/line

class WordHighlight {
  constructor() {
    this.isEnabled = false;
    this.highlightElement = null;
    this.currentLine = null;
    this.isFollowingMouse = false;
    this.isAutoAdvance = false;
    this.words = [];
    this.currentWordIndex = 0;
    this.maxWords = 4000;
    this.autoTimer = null;
    this.wpm = 200;
    this.lastSpan = null;
    
    // Settings
    this.highlightMode = 'line'; // 'line', 'word', 'paragraph'
    this.highlightColor = 'rgba(99, 102, 241, 0.2)';
    this.highlightHeight = 1.5; // em
    
    // Animation
    this.animationId = null;
    this.lastMouseY = 0;
  }

  enable() {
    if (this.isEnabled) return;
    this.isEnabled = true;
    
    console.log('✨ Word Highlight enabled');
    
    this.buildWordIndex();
    this.createHighlight();
    this.setupEventListeners();
    this.startFollowing();
    this.highlightCurrentWord();
    this.updateRateDisplay();
    
    document.body.classList.add('neuroread-highlight-active');
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;
    
    console.log('✨ Word Highlight disabled');
    
    this.stopAutoAdvance();
    this.clearWordHighlight();
    this.stopFollowing();
    this.removeEventListeners();
    this.removeHighlight();
    
    document.body.classList.remove('neuroread-highlight-active');
    document.body.classList.remove('neuroread-highlight-mode-line', 'neuroread-highlight-mode-word', 'neuroread-highlight-mode-paragraph');
  }

  createHighlight() {
    // Create the highlight element
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
    
    // Setup mode buttons
    this.highlightElement.querySelectorAll('.highlight-btn').forEach(btn => {
      if (btn.dataset.mode) {
        btn.addEventListener('click', () => this.setMode(btn.dataset.mode));
      }
      if (btn.dataset.action) {
        btn.addEventListener('click', () => this.handleAction(btn.dataset.action));
      }
    });
    
    // Set initial mode
    this.setMode(this.highlightMode);
  }

  removeHighlight() {
    if (this.highlightElement) {
      this.highlightElement.remove();
      this.highlightElement = null;
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
    
    // Update highlight style
    const line = this.highlightElement.querySelector('.highlight-line');
    
    switch (mode) {
      case 'line':
        line.style.height = '1.6em';
        line.style.borderRadius = '4px';
        break;
      case 'word':
        line.style.height = '1.4em';
        line.style.borderRadius = '2px';
        break;
      case 'paragraph':
        line.style.height = 'auto';
        line.style.minHeight = '3em';
        line.style.borderRadius = '8px';
        break;
    }
  }

  setupEventListeners() {
    // Mouse tracking
    this.mouseHandler = (e) => {
      if (this.isAutoAdvance) return;
      this.lastMouseY = e.clientY;
      this.updateHighlightPosition(e.clientY);
    };
    
    // Scroll tracking
    this.scrollHandler = () => {
      // Keep highlight in view during scroll
      if (this.lastMouseY > 0) {
        this.updateHighlightPosition(this.lastMouseY);
      }
    };
    
    // Keyboard navigation
    this.keyHandler = (e) => {
      if (e.key === 'ArrowDown') {
        this.moveHighlight(30);
      } else if (e.key === 'ArrowUp') {
        this.moveHighlight(-30);
      } else if (e.code === 'Space') {
        e.preventDefault();
        this.toggleAutoAdvance();
      } else if (e.key === 'ArrowRight') {
        this.advanceWord();
      } else if (e.key === 'ArrowLeft') {
        this.rewindWord();
      }
    };
    
    document.addEventListener('mousemove', this.mouseHandler);
    window.addEventListener('scroll', this.scrollHandler);
    document.addEventListener('keydown', this.keyHandler);
  }

  removeEventListeners() {
    document.removeEventListener('mousemove', this.mouseHandler);
    window.removeEventListener('scroll', this.scrollHandler);
    document.removeEventListener('keydown', this.keyHandler);
  }

  startFollowing() {
    this.isFollowingMouse = true;
  }

  stopFollowing() {
    this.isFollowingMouse = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  updateHighlightPosition(y) {
    if (!this.highlightElement) return;
    
    const line = this.highlightElement.querySelector('.highlight-line');
    
    // Get the element at this Y position
    const element = document.elementFromPoint(window.innerWidth / 2, y);
    
    if (element) {
      // Find the text line at this position
      const rect = this.getLineRect(element, y);
      
      if (rect) {
        line.style.top = `${rect.top + window.scrollY}px`;
        line.style.left = `${rect.left}px`;
        line.style.width = `${rect.width}px`;
        line.style.height = `${rect.height}px`;
      }
    }
  }

  getLineRect(element, y) {
    // Get the bounding rectangle of the text line
    const range = this.getRangeFromPoint(window.innerWidth / 2, y);
    
    if (range) {
      const rect = range.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      };
    }
    
    // Fallback to element rect
    const elemRect = element.getBoundingClientRect();
    return {
      top: elemRect.top,
      left: elemRect.left,
      width: elemRect.width,
      height: parseFloat(getComputedStyle(element).lineHeight) || 24
    };
  }

  moveHighlight(deltaY) {
    this.lastMouseY += deltaY;
    this.lastMouseY = Math.max(0, Math.min(window.innerHeight, this.lastMouseY));
    this.updateHighlightPosition(this.lastMouseY);
  }

  // Auto-advance mode for hands-free reading
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

  // Highlight specific word
  highlightWord(word) {
    // Find and highlight a specific word in the document
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );
    
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent;
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      
      if (regex.test(text)) {
        // Create highlight
        const span = document.createElement('span');
        span.className = 'neuroread-word-highlight-static';
        
        const parts = text.split(regex);
        const match = text.match(regex);
        
        if (parts.length > 1 && match) {
          const before = document.createTextNode(parts[0]);
          span.textContent = match[0];
          const after = document.createTextNode(parts.slice(1).join(match[0]));
          
          const wrapper = document.createElement('span');
          wrapper.appendChild(before);
          wrapper.appendChild(span);
          wrapper.appendChild(after);
          
          node.parentNode.replaceChild(wrapper, node);
          
          // Scroll to word
          span.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Remove highlight after delay
          setTimeout(() => {
            if (wrapper.parentNode) {
              const textNode = document.createTextNode(wrapper.textContent);
              wrapper.parentNode.replaceChild(textNode, wrapper);
            }
          }, 2000);
          
          return true;
        }
      }
    }
    
    return false;
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
    range.surroundContents(span);
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
      } catch (error) {
        console.warn('caretRangeFromPoint failed, falling back', error);
      }
    }

    if (document.caretPositionFromPoint) {
      const position = document.caretPositionFromPoint(x, y);
      if (position) {
        const range = document.createRange();
        range.setStart(position.offsetNode, position.offset);
        range.collapse(true);
        return range;
      }
    }

    return null;
  }
}

// Make available globally
window.WordHighlight = WordHighlight;
