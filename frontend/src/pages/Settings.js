/* global chrome */
import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Check, Eye } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const [settings, setSettings] = useState({
    bionic: {
      intensity: 0.5,
      enabled: true
    },
    focus: {
      hideAds: true,
      hideSidebars: true,
      hideComments: true
    },
    scroll: {
      speed: 100,
      adaptive: true
    },
    tts: {
      rate: 1.0,
      voice: 'default',
      highlightWords: true
    },
    theme: {
      defaultTheme: 'default',
      fontSize: 16,
      lineHeight: 1.6,
      letterSpacing: 0.5,
      wordSpacing: 0.1
    }
  });

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const result = await chrome.storage.sync.get(['settings']);
        if (result.settings) {
          setSettings(result.settings);
        }
      } catch (error) {
        console.log('Storage not available');
      }
    };
    loadSettings();
  }, []);

  const handleChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setSaved(false);
  };

  const saveSettings = async () => {
    try {
      await chrome.storage.sync.set({ settings });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.log('Could not save settings');
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const resetSettings = () => {
    const defaultSettings = {
      bionic: { intensity: 0.5, enabled: true },
      focus: { hideAds: true, hideSidebars: true, hideComments: true },
      scroll: { speed: 100, adaptive: true },
      tts: { rate: 1.0, voice: 'default', highlightWords: true },
      theme: { defaultTheme: 'default', fontSize: 16, lineHeight: 1.6, letterSpacing: 0.5, wordSpacing: 0.1 }
    };
    setSettings(defaultSettings);
    setSaved(false);
  };

  const applyBionic = (text) => {
    return text.split(' ').map((word, i) => {
      const boldLen = Math.ceil(word.length * settings.bionic.intensity);
      return (
        <span key={i}>
          <strong>{word.slice(0, boldLen)}</strong>{word.slice(boldLen)}{' '}
        </span>
      );
    });
  };

  const previewText = "NeuroRead transforms how people with ADHD and Dyslexia experience digital content. With Bionic Reading, your brain processes text faster by creating visual anchor points.";

  return (
    <div className="settings">
      <header className="settings-header">
        <div>
          <h1>Settings</h1>
          <p>Customize your reading experience</p>
        </div>
      </header>

      {/* Live Preview */}
      <section className="preview-section">
        <div className="preview-card">
          <div className="preview-header">
            <Eye size={16} />
            <span>Live Preview</span>
          </div>
          <div className="preview-text" style={{
            fontSize: `${settings.theme.fontSize}px`,
            lineHeight: settings.theme.lineHeight,
            letterSpacing: `${settings.theme.letterSpacing}px`,
            wordSpacing: `${settings.theme.wordSpacing}em`
          }}>
            {settings.bionic.enabled ? applyBionic(previewText) : previewText}
          </div>
        </div>
      </section>

      {/* Bionic Reading Settings */}
      <section className="settings-section">
        <h2>🔤 Bionic Reading</h2>
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <label>Bold Intensity</label>
              <p>How much of each word to bold</p>
            </div>
            <div className="setting-control">
              <input
                type="range"
                min="0.3"
                max="0.7"
                step="0.1"
                value={settings.bionic.intensity}
                onChange={(e) => handleChange('bionic', 'intensity', parseFloat(e.target.value))}
              />
              <span>{Math.round(settings.bionic.intensity * 100)}%</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Enable by Default</label>
              <p>Automatically apply on page load</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.bionic.enabled}
                  onChange={(e) => handleChange('bionic', 'enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Mode Settings */}
      <section className="settings-section">
        <h2>🎯 Focus Mode</h2>
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <label>Hide Advertisements</label>
              <p>Remove ads and promotional content</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.focus.hideAds}
                  onChange={(e) => handleChange('focus', 'hideAds', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Hide Sidebars</label>
              <p>Remove navigation and widget sidebars</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.focus.hideSidebars}
                  onChange={(e) => handleChange('focus', 'hideSidebars', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Hide Comments</label>
              <p>Remove comment sections</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.focus.hideComments}
                  onChange={(e) => handleChange('focus', 'hideComments', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Auto Scroll Settings */}
      <section className="settings-section">
        <h2>📜 Auto Scroll</h2>
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <label>Scroll Speed</label>
              <p>Words per minute</p>
            </div>
            <div className="setting-control">
              <input
                type="range"
                min="50"
                max="800"
                step="10"
                value={settings.scroll.speed}
                onChange={(e) => handleChange('scroll', 'speed', parseInt(e.target.value))}
              />
              <span>{settings.scroll.speed} WPM</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Adaptive Speed</label>
              <p>Automatically adjust based on content</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.scroll.adaptive}
                  onChange={(e) => handleChange('scroll', 'adaptive', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Text to Speech Settings */}
      <section className="settings-section">
        <h2>🔊 Text to Speech</h2>
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <label>Speech Rate</label>
              <p>How fast the text is read</p>
            </div>
            <div className="setting-control">
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={settings.tts.rate}
                onChange={(e) => handleChange('tts', 'rate', parseFloat(e.target.value))}
              />
              <span>{settings.tts.rate}x</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Highlight Words</label>
              <p>Show current word being read</p>
            </div>
            <div className="setting-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.tts.highlightWords}
                  onChange={(e) => handleChange('tts', 'highlightWords', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Theme Settings */}
      <section className="settings-section">
        <h2>🎨 Appearance</h2>
        <div className="settings-card">
          <div className="setting-item">
            <div className="setting-info">
              <label>Default Theme</label>
              <p>Color scheme for reading</p>
            </div>
            <div className="setting-control">
              <div className="theme-selector">
                {[
                  { value: 'default', label: 'Default', colors: ['#ffffff', '#1e293b'] },
                  { value: 'sepia', label: 'Sepia', colors: ['#f5e6d3', '#5c4b37'] },
                  { value: 'dark', label: 'Dark', colors: ['#1a1a2e', '#e2e8f0'] },
                  { value: 'high-contrast', label: 'Contrast', colors: ['#000000', '#ffffff'] },
                  { value: 'dyslexia', label: 'Dyslexia', colors: ['#fef3c7', '#92400e'] },
                ].map(theme => (
                  <button
                    key={theme.value}
                    className={`theme-option ${settings.theme.defaultTheme === theme.value ? 'selected' : ''}`}
                    onClick={() => handleChange('theme', 'defaultTheme', theme.value)}
                    title={theme.label}
                  >
                    <div className="theme-preview">
                      <div style={{ background: theme.colors[0] }} className="theme-bg"></div>
                      <div style={{ background: theme.colors[1] }} className="theme-text-preview"></div>
                    </div>
                    <span className="theme-label">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Font Size</label>
              <p>Base text size in pixels</p>
            </div>
            <div className="setting-control">
              <input
                type="range"
                min="12"
                max="24"
                step="1"
                value={settings.theme.fontSize}
                onChange={(e) => handleChange('theme', 'fontSize', parseInt(e.target.value))}
              />
              <span>{settings.theme.fontSize}px</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Line Height</label>
              <p>Space between lines</p>
            </div>
            <div className="setting-control">
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={settings.theme.lineHeight}
                onChange={(e) => handleChange('theme', 'lineHeight', parseFloat(e.target.value))}
              />
              <span>{settings.theme.lineHeight}</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Letter Spacing</label>
              <p>Space between letters</p>
            </div>
            <div className="setting-control">
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.theme.letterSpacing}
                onChange={(e) => handleChange('theme', 'letterSpacing', parseFloat(e.target.value))}
              />
              <span>{settings.theme.letterSpacing}px</span>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-info">
              <label>Word Spacing</label>
              <p>Space between words</p>
            </div>
            <div className="setting-control">
              <input
                type="range"
                min="0"
                max="0.5"
                step="0.05"
                value={settings.theme.wordSpacing}
                onChange={(e) => handleChange('theme', 'wordSpacing', parseFloat(e.target.value))}
              />
              <span>{settings.theme.wordSpacing}em</span>
            </div>
          </div>
        </div>
      </section>

      {/* Action Buttons */}
      <div className="settings-actions">
        <button className="btn btn-secondary" onClick={resetSettings}>
          <RotateCcw size={16} />
          Reset Defaults
        </button>
        <button className={`btn btn-primary ${saved ? 'saved' : ''}`} onClick={saveSettings}>
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default Settings;
