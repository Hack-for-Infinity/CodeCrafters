import React from 'react';
import { Heart, Github, Mail, ExternalLink, Globe, Code, Cpu, Mic } from 'lucide-react';
import './About.css';

const About = () => {
  const techStack = [
    { name: 'Chrome Extension API', desc: 'Manifest V3', icon: Globe },
    { name: 'React 19', desc: 'Dashboard interface', icon: Code },
    { name: 'Node.js / Express', desc: 'AI summarization backend', icon: Cpu },
    { name: 'Web Speech API', desc: 'Text-to-speech synthesis', icon: Mic },
  ];

  return (
    <div className="about">
      <header className="about-header">
        <div className="about-logo">
          <div className="logo-icon-large">
            <span className="logo-emoji">🧠</span>
            <div className="logo-ring"></div>
          </div>
          <h1 className="gradient-text">NeuroRead</h1>
        </div>
        <p className="about-tagline">
          Making the web accessible for ADHD and Dyslexic minds
        </p>
      </header>

      {/* Mission Section */}
      <section className="mission-section">
        <h2>Our Mission</h2>
        <div className="mission-card">
          <p>
            Roughly <strong>1 in 5 people</strong> have a learning difference like ADHD or Dyslexia.
            Yet most digital content is designed as a wall of text that creates reading fatigue
            and mental exhaustion.
          </p>
          <p>
            NeuroRead was built to change that. We believe information shouldn't be a chore.
            Our tools adapt web content to work <em>with</em> your brain, not against it.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-about-section">
        <h2>What We Offer</h2>
        <div className="features-about-grid">
          {[
            { emoji: '🔤', title: 'Bionic Reading', desc: 'Bold the first half of words to create visual anchor points.' },
            { emoji: '🎯', title: 'Focus Mode', desc: 'Strip away distractions like ads, sidebars, and clutter.' },
            { emoji: '📹', title: 'Eye Tracking', desc: 'Webcam-based gaze detection for hands-free scrolling.' },
            { emoji: '📜', title: 'Auto Scroll', desc: 'Hands-free reading with adaptive speed.' },
            { emoji: '🔊', title: 'Text to Speech', desc: 'Listen and follow along with word highlighting.' },
            { emoji: '✨', title: 'Word Highlight', desc: 'Keep your place with a moving highlight guide.' },
            { emoji: '🤖', title: 'AI Summarizer', desc: 'Get key points from any article in seconds.' },
            { emoji: '🎨', title: 'Themes', desc: 'Dyslexia-friendly fonts, contrast & dark modes.' },
          ].map((f, i) => (
            <div key={f.title} className="feature-about-item" style={{ animationDelay: `${i * 0.06}s` }}>
              <span className="feature-about-emoji">{f.emoji}</span>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Impact Section */}
      <section className="impact-section">
        <h2>Why It Matters</h2>
        <div className="impact-stats">
          {[
            { number: '20%', label: 'of people have a learning difference' },
            { number: '70%', label: 'of websites have accessibility issues' },
            { number: '∞', label: 'potential for inclusive design' },
          ].map((s, i) => (
            <div key={s.label} className="impact-stat" style={{ animationDelay: `${i * 0.1}s` }}>
              <span className="impact-number">{s.number}</span>
              <span className="impact-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section className="tech-section">
        <h2>Technology</h2>
        <div className="tech-card">
          {techStack.map((t, i) => (
            <div key={t.name} className="tech-item" style={{ animationDelay: `${i * 0.08}s` }}>
              <div className="tech-icon-wrap">
                <t.icon size={18} />
              </div>
              <div className="tech-info">
                <span className="tech-name">{t.name}</span>
                <span className="tech-desc">{t.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Built With Love */}
      <section className="team-section">
        <div className="team-card">
          <p>
            NeuroRead was created during <strong>Hack for Infinity — Infinity 2K26</strong> with a simple goal:
            make the web more accessible for everyone.
          </p>
          <div className="built-with">
            <span>Built with</span>
            <Heart size={14} className="heart-icon" />
            <span>for the neurodivergent community</span>
          </div>
        </div>
      </section>

      {/* Links */}
      <section className="links-section">
        <div className="links-grid">
          <a href="https://github.com" className="link-card" target="_blank" rel="noopener noreferrer">
            <Github size={20} />
            <span>GitHub</span>
            <ExternalLink size={14} />
          </a>
          <a href="mailto:contact@neuroread.app" className="link-card">
            <Mail size={20} />
            <span>Contact</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <p>© 2026 NeuroRead. Made for Hack for Infinity.</p>
        <p className="footer-tagline">Reading that adapts to YOUR brain.</p>
      </footer>
    </div>
  );
};

export default About;
