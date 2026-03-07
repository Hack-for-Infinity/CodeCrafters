/* global chrome */
import React, { useState, useEffect } from 'react';
import {
  Eye,
  BookOpen,
  Type,
  Volume2,
  Sparkles,
  Activity,
  Clock,
  TrendingUp,
  Zap,
  Shield,
  Palette
} from 'lucide-react';
import './Dashboard.css';

/* Animated Counter Component */
const AnimatedCounter = ({ end, duration = 1500, suffix = '' }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};

const Dashboard = () => {
  const [features, setFeatures] = useState([
    { id: 'bionic', name: 'Bionic Reading', icon: Type, active: false, description: 'Bold first half of words', color: '#7c3aed' },
    { id: 'focus', name: 'Focus Mode', icon: Eye, active: false, description: 'Remove distractions', color: '#22d3ee' },
    { id: 'eye', name: 'Eye Tracking', icon: Activity, active: false, description: 'Hands-free scrolling', color: '#ec4899' },
    { id: 'scroll', name: 'Auto Scroll', icon: TrendingUp, active: false, description: 'Adaptive speed', color: '#34d399' },
    { id: 'tts', name: 'Text to Speech', icon: Volume2, active: false, description: 'Read aloud', color: '#f97316' },
    { id: 'highlight', name: 'Word Highlight', icon: Sparkles, active: false, description: 'Guide reading', color: '#fbbf24' },
  ]);

  const toggleFeature = (featureId) => {
    setFeatures(features.map(f =>
      f.id === featureId ? { ...f, active: !f.active } : f
    ));

    try {
      chrome.runtime.sendMessage({
        action: 'toggleMode',
        mode: featureId,
        enabled: !features.find(f => f.id === featureId).active
      });
    } catch (error) {
      console.log('Extension not available');
    }
  };

  const stats = [
    { icon: Activity, value: 200, suffix: '', label: 'Avg WPM', gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
    { icon: Clock, value: 47, suffix: 'm', label: 'Reading Time', gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)' },
    { icon: BookOpen, value: 12540, suffix: '', label: 'Words Read', gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
    { icon: TrendingUp, value: 18, suffix: '', label: 'Sessions', gradient: 'linear-gradient(135deg, #34d399, #059669)' },
  ];

  return (
    <div className="dashboard">
      {/* Hero Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-badge">
            <Zap size={12} />
            <span>Reading Assistant Active</span>
          </div>
          <h1>Welcome to <span className="gradient-text">NeuroRead</span></h1>
          <p>Your personal reading assistant that adapts content to your brain</p>
        </div>
        <div className="header-glow"></div>
      </header>

      {/* Stats Cards */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="stat-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="stat-icon" style={{ background: stat.gradient }}>
                <stat.icon size={20} />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </span>
                <span className="stat-label">{stat.label}</span>
              </div>
              <div className="stat-shine"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Features */}
      <section className="features-section">
        <div className="section-header">
          <h2>Quick Features</h2>
          <span className="section-subtitle">Toggle features on/off instantly</span>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <button
              key={feature.id}
              className={`feature-card ${feature.active ? 'active' : ''}`}
              onClick={() => toggleFeature(feature.id)}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="feature-header">
                <div className="feature-icon-wrap" style={{
                  background: feature.active
                    ? `${feature.color}20`
                    : 'rgba(255,255,255,0.04)'
                }}>
                  <feature.icon size={20} style={{ color: feature.active ? feature.color : '#94a3b8' }} />
                </div>
                <div className={`feature-toggle ${feature.active ? 'active' : ''}`}>
                  <div className="toggle-dot"></div>
                </div>
              </div>
              <div className="feature-info">
                <h3>{feature.name}</h3>
                <p>{feature.description}</p>
              </div>
              {feature.active && (
                <div className="feature-glow" style={{ background: feature.color }}></div>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Highlights Section */}
      <section className="highlights-section">
        <div className="section-header">
          <h2>Why NeuroRead?</h2>
          <span className="section-subtitle">Built for neurodivergent minds</span>
        </div>
        <div className="highlights-grid">
          <div className="highlight-card">
            <div className="highlight-icon-bg" style={{ background: 'linear-gradient(135deg, #7c3aed20, #a855f720)' }}>
              <Shield size={24} style={{ color: '#a855f7' }} />
            </div>
            <h3>Privacy First</h3>
            <p>All processing happens locally in your browser. No data ever leaves your device.</p>
          </div>
          <div className="highlight-card">
            <div className="highlight-icon-bg" style={{ background: 'linear-gradient(135deg, #22d3ee20, #06b6d420)' }}>
              <Zap size={24} style={{ color: '#22d3ee' }} />
            </div>
            <h3>Instant Activation</h3>
            <p>Toggle any feature with a single click or keyboard shortcut. Zero setup required.</p>
          </div>
          <div className="highlight-card">
            <div className="highlight-icon-bg" style={{ background: 'linear-gradient(135deg, #ec489920, #f43f5e20)' }}>
              <Palette size={24} style={{ color: '#ec4899' }} />
            </div>
            <h3>Fully Customizable</h3>
            <p>Adjust fonts, spacing, colors, and reading speed to match your unique needs.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-card">
          <div className="cta-content">
            <h2>Ready to transform your reading?</h2>
            <p>Navigate to any website, click the NeuroRead icon, and experience the difference.</p>
            <div className="cta-stats">
              <div className="cta-stat">
                <span className="cta-stat-value">6</span>
                <span className="cta-stat-label">Reading Modes</span>
              </div>
              <div className="cta-stat">
                <span className="cta-stat-value">5</span>
                <span className="cta-stat-label">Themes</span>
              </div>
              <div className="cta-stat">
                <span className="cta-stat-value">∞</span>
                <span className="cta-stat-label">Websites</span>
              </div>
            </div>
          </div>
          <div className="cta-glow"></div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
