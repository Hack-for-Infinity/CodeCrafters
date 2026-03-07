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
    this.stepPx = 32;
    this.autoIntervalMs = 4500;
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
        e.preventDefault();
        this.toggleAuto();
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
    this.currentY = Math.max(10, Math.min(window.innerHeight - 10, this.currentY + delta));
    if (this.currentY > window.innerHeight - 120) {
      window.scrollBy({ top: 120, behavior: 'smooth' });
    }
    if (this.currentY < 120 && window.scrollY > 0) {
      window.scrollBy({ top: -120, behavior: 'smooth' });
    }
    this.updateBarPosition();
  }

  updateBarPosition() {
    if (!this.bar) return;

    const rect = this.getLineRect(this.currentY);

    if (rect) {
      const width = rect.width && rect.width > 20 ? rect.width : document.documentElement.clientWidth - 24;
      const left = rect.width && rect.width > 20 ? rect.left : 12;
      const height = Math.max(rect.height || 0, 28);

      this.bar.style.top = `${rect.top + window.scrollY}px`;
      this.bar.style.left = `${left}px`;
      this.bar.style.width = `${width}px`;
      this.bar.style.height = `${height}px`;
    } else {
      // Fallback full-width bar at currentY
      this.bar.style.top = `${window.scrollY + this.currentY - 14}px`;
      this.bar.style.left = '8px';
      this.bar.style.width = `calc(100% - 16px)`;
      this.bar.style.height = '32px';
    }
  }

  getLineRect(y) {
    const range = this.getRangeFromPoint(window.innerWidth / 2, y);
    if (range) {
      const rect = range.getBoundingClientRect();
      if (rect && rect.height > 0) {
        // If width is 0, try to derive from parent element
        if (!rect.width || rect.width < 1) {
          const container = range.startContainer?.parentElement;
          if (container) {
            const cRect = container.getBoundingClientRect();
            return {
              top: rect.top,
              left: cRect.left + 4,
              width: cRect.width - 8,
              height: rect.height
            };
          }
        }
        return rect;
      }
    }
    return null;
  }

  getRangeFromPoint(x, y) {
    if (document.caretRangeFromPoint) {
      try {
        return document.caretRangeFromPoint(x, y);
      } catch (error) {
        // ignore and fall through
      }
    }
    if (document.caretPositionFromPoint) {
      const pos = document.caretPositionFromPoint(x, y);
      if (pos) {
        const range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
        return range;
      }
    }
    return null;
  }
}

// Make available globally
window.LineFocus = LineFocus;
