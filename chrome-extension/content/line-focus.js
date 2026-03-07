// Line Focus - Guide reading line by line across any page
// Follows mouse or auto-advances; minimizes DOM intrusion for compatibility

class LineFocus {
  constructor() {
    this.isEnabled = false;
    this.overlay = null;
    this.bar = null;
    this.controls = null;
    this.autoTimer = null;
    this.currentY = window.innerHeight * 0.3;
    this.stepPx = 30;
    this.autoIntervalMs = 4000;
    this.isAuto = false;

    this.mouseHandler = (e) => {
      if (!this.isEnabled || this.isAuto) return;
      this.currentY = e.clientY;
      this.updateBarPosition();
    };

    this.keyHandler = (e) => {
      if (!this.isEnabled) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.nudge(this.stepPx);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.nudge(-this.stepPx);
      }
      if (e.key === ' ') {
        // Only intercept space if not in an input
        if (document.activeElement === document.body || document.activeElement === null) {
          e.preventDefault();
          this.toggleAuto();
        }
      }
      if (e.key === 'Escape') {
        this.disable();
      }
    };
  }

  enable() {
    if (this.isEnabled) return;
    this.isEnabled = true;

    this.createOverlay();
    this.attachListeners();
    this.updateBarPosition();

    document.body.classList.add('neuroread-linefocus-active');
  }

  disable() {
    if (!this.isEnabled) return;
    this.isEnabled = false;

    this.stopAuto();
    this.detachListeners();
    this.destroyOverlay();

    document.body.classList.remove('neuroread-linefocus-active');
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'neuroread-line-focus';
    this.overlay.innerHTML = `
      <div class="line-focus-bar"></div>
      <div class="line-focus-controls" aria-label="Line focus controls">
        <button class="lf-btn lf-toggle" title="Play/Pause (Space)">▶</button>
        <button class="lf-btn lf-up" title="Up (Arrow Up)">▲</button>
        <button class="lf-btn lf-down" title="Down (Arrow Down)">▼</button>
        <button class="lf-btn lf-close" title="Close (Esc)">✕</button>
      </div>
    `;
    document.body.appendChild(this.overlay);

    this.bar = this.overlay.querySelector('.line-focus-bar');
    this.controls = this.overlay.querySelector('.line-focus-controls');

    // Controls
    this.controls.querySelector('.lf-toggle').addEventListener('click', () => this.toggleAuto());
    this.controls.querySelector('.lf-up').addEventListener('click', () => this.nudge(-this.stepPx));
    this.controls.querySelector('.lf-down').addEventListener('click', () => this.nudge(this.stepPx));
    this.controls.querySelector('.lf-close').addEventListener('click', () => this.disable());
  }

  destroyOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
      this.bar = null;
      this.controls = null;
    }
  }

  attachListeners() {
    document.addEventListener('mousemove', this.mouseHandler, { passive: true });
    document.addEventListener('keydown', this.keyHandler);
  }

  detachListeners() {
    document.removeEventListener('mousemove', this.mouseHandler);
    document.removeEventListener('keydown', this.keyHandler);
  }

  toggleAuto() {
    this.isAuto = !this.isAuto;
    if (this.controls) {
      const toggle = this.controls.querySelector('.lf-toggle');
      toggle.textContent = this.isAuto ? '⏸' : '▶';
    }
    if (this.isAuto) {
      this.startAuto();
    } else {
      this.stopAuto();
    }
  }

  startAuto() {
    this.stopAuto();
    this.autoTimer = setInterval(() => {
      this.nudge(this.stepPx);
    }, this.autoIntervalMs);
  }

  stopAuto() {
    if (this.autoTimer) {
      clearInterval(this.autoTimer);
      this.autoTimer = null;
    }
  }

  nudge(delta) {
    this.currentY = Math.max(20, Math.min(window.innerHeight - 20, this.currentY + delta));

    // Auto-scroll page when bar reaches near edges
    if (this.currentY > window.innerHeight - 100) {
      window.scrollBy({ top: 100, behavior: 'smooth' });
      this.currentY = window.innerHeight - 120;
    }
    if (this.currentY < 100 && window.scrollY > 0) {
      window.scrollBy({ top: -100, behavior: 'smooth' });
      this.currentY = 120;
    }

    this.updateBarPosition();
  }

  updateBarPosition() {
    if (!this.bar) return;

    // Detect line at current mouse Y using caret range
    const lineInfo = this.detectLineAtY(this.currentY);

    if (lineInfo) {
      // Bar is position: fixed, so we use viewport coordinates directly
      this.bar.style.top = `${lineInfo.top}px`;
      this.bar.style.left = `${lineInfo.left}px`;
      this.bar.style.width = `${lineInfo.width}px`;
      this.bar.style.height = `${lineInfo.height}px`;
    } else {
      // Fallback: full-width bar centered at currentY
      this.bar.style.top = `${this.currentY - 16}px`;
      this.bar.style.left = '8px';
      this.bar.style.width = `calc(100% - 16px)`;
      this.bar.style.height = '32px';
    }
  }

  detectLineAtY(y) {
    // Try to find the text line bounding rect at this Y position
    const range = this.getRangeFromPoint(window.innerWidth / 2, y);

    if (range) {
      const rect = range.getBoundingClientRect();

      if (rect && rect.height > 2) {
        // If range width is zero, use the parent element width
        if (!rect.width || rect.width < 4) {
          const container = range.startContainer?.parentElement;
          if (container) {
            const cRect = container.getBoundingClientRect();
            if (cRect.width > 10) {
              return {
                top: rect.top - 4,
                left: cRect.left,
                width: cRect.width,
                height: Math.max(rect.height + 8, 28)
              };
            }
          }
        }

        // Expand the bar to the full text container width
        const container = range.startContainer?.parentElement;
        const cRect = container?.getBoundingClientRect();
        const left = (cRect && cRect.width > 40) ? cRect.left : rect.left;
        const width = (cRect && cRect.width > 40) ? cRect.width : Math.max(rect.width, document.documentElement.clientWidth - 24);

        return {
          top: rect.top - 4,
          left: left,
          width: width,
          height: Math.max(rect.height + 8, 28)
        };
      }
    }

    // Second attempt: try to find a text element at this y
    const elements = document.elementsFromPoint(window.innerWidth / 2, y);
    for (const el of elements) {
      if (el.id && el.id.startsWith('neuroread')) continue;
      const tag = el.tagName?.toLowerCase();
      if (['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'a', 'td', 'div'].includes(tag)) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 40 && rect.height > 0) {
          const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 24;
          return {
            top: y - (lineHeight / 2) - 4,
            left: rect.left,
            width: rect.width,
            height: lineHeight + 8
          };
        }
      }
    }

    return null;
  }

  getRangeFromPoint(x, y) {
    if (document.caretRangeFromPoint) {
      try {
        return document.caretRangeFromPoint(x, y);
      } catch (e) {
        // ignore
      }
    }
    if (document.caretPositionFromPoint) {
      try {
        const pos = document.caretPositionFromPoint(x, y);
        if (pos) {
          const range = document.createRange();
          range.setStart(pos.offsetNode, pos.offset);
          range.collapse(true);
          return range;
        }
      } catch (e) {
        // ignore
      }
    }
    return null;
  }
}

// Make available globally
window.LineFocus = LineFocus;
