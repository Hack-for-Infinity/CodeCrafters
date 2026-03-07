/* global chrome */
import React, { useState, useEffect } from 'react';
import { BookOpen, Clock, TrendingUp, Calendar } from 'lucide-react';
import './Statistics.css';

/* Animated Counter */
const AnimatedCounter = ({ end, duration = 1500, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    let frame;
    const animate = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      setCount(Math.floor((1 - Math.pow(1 - p, 3)) * end));
      if (p < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const Statistics = () => {
  const [stats, setStats] = useState({
    totalSessions: 12,
    totalWords: 15420,
    totalTime: 77,
    avgWPM: 200,
    dailyData: [
      { day: 'Mon', words: 1200, time: 6 },
      { day: 'Tue', words: 2100, time: 10 },
      { day: 'Wed', words: 800, time: 4 },
      { day: 'Thu', words: 2500, time: 12 },
      { day: 'Fri', words: 1800, time: 9 },
      { day: 'Sat', words: 3200, time: 16 },
      { day: 'Sun', words: 2820, time: 14 }
    ]
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await chrome.storage.local.get(['readingStats']);
        if (result.readingStats) {
          setStats(prev => ({
            ...prev,
            totalSessions: result.readingStats.sessions || prev.totalSessions,
            totalWords: result.readingStats.words || prev.totalWords,
            totalTime: result.readingStats.time || prev.totalTime,
            avgWPM: result.readingStats.wpm || prev.avgWPM
          }));
        }
      } catch (error) {
        console.log('Storage not available, using demo data');
      }
    };
    loadStats();
  }, []);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const maxWords = Math.max(...stats.dailyData.map(d => d.words));

  const milestones = [
    { icon: '🎯', title: 'First 1K', desc: 'Read 1,000 words', achieved: stats.totalWords >= 1000 },
    { icon: '📚', title: 'Book Worm', desc: 'Read 10,000 words', achieved: stats.totalWords >= 10000 },
    { icon: '⏰', title: 'Hour Power', desc: '1 hour reading', achieved: stats.totalTime >= 60 },
    { icon: '🔥', title: 'Consistent', desc: '10 sessions', achieved: stats.totalSessions >= 10 },
    { icon: '⚡', title: 'Speed Demon', desc: '250+ WPM', achieved: stats.avgWPM >= 250 },
    { icon: '🌟', title: 'Dedicated', desc: '50,000 words', achieved: stats.totalWords >= 50000 },
  ];

  return (
    <div className="statistics">
      <header className="statistics-header">
        <h1>Statistics</h1>
        <p>Track your reading progress and achievements</p>
      </header>

      {/* Overview Cards */}
      <section className="overview-section">
        <div className="overview-grid">
          {[
            { icon: BookOpen, label: 'Words Read', value: stats.totalWords, gradient: 'linear-gradient(135deg, #7c3aed, #a855f7)' },
            { icon: Clock, label: 'Reading Time', value: stats.totalTime, suffix: 'm', gradient: 'linear-gradient(135deg, #22d3ee, #06b6d4)' },
            { icon: TrendingUp, label: 'Avg WPM', value: stats.avgWPM, gradient: 'linear-gradient(135deg, #ec4899, #f43f5e)' },
            { icon: Calendar, label: 'Sessions', value: stats.totalSessions, gradient: 'linear-gradient(135deg, #34d399, #059669)' },
          ].map((item, i) => (
            <div key={item.label} className="overview-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="overview-icon" style={{ background: item.gradient }}>
                <item.icon size={20} />
              </div>
              <div className="overview-info">
                <span className="overview-value">
                  <AnimatedCounter end={item.value} suffix={item.suffix || ''} />
                </span>
                <span className="overview-label">{item.label}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Weekly Activity */}
      <section className="activity-section">
        <h2>Weekly Activity</h2>
        <div className="activity-card">
          <div className="activity-chart">
            {stats.dailyData.map((day, index) => (
              <div key={index} className="activity-bar-container" style={{ animationDelay: `${index * 0.08}s` }}>
                <div className="activity-bar-wrapper">
                  <div
                    className="activity-bar"
                    style={{
                      height: `${Math.max(8, (day.words / maxWords) * 100)}%`,
                    }}
                  >
                    <span className="activity-tooltip">
                      <strong>{day.words.toLocaleString()}</strong> words
                      <br />
                      {day.time} min
                    </span>
                  </div>
                </div>
                <span className="activity-label">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reading Insights */}
      <section className="insights-section">
        <h2>Reading Insights</h2>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-icon">📈</div>
            <h3>Reading Speed</h3>
            <p>Your average speed is <strong>{stats.avgWPM} WPM</strong></p>
            <p className="insight-detail">
              {stats.avgWPM > 250
                ? 'Above average! Excellent reading pace.'
                : stats.avgWPM > 200
                  ? 'Right on target for comfortable reading.'
                  : 'Take your time — comprehension matters most.'}
            </p>
          </div>

          <div className="insight-card">
            <div className="insight-icon">📚</div>
            <h3>Consistency</h3>
            <p><strong>{stats.totalSessions}</strong> reading sessions completed</p>
            <p className="insight-detail">
              {stats.totalSessions > 10
                ? 'Great reading habit forming!'
                : 'Keep going — consistency is key!'}
            </p>
          </div>

          <div className="insight-card">
            <div className="insight-icon">🎯</div>
            <h3>Focus Time</h3>
            <p>Total: <strong>{formatTime(stats.totalTime)}</strong></p>
            <p className="insight-detail">
              That's {Math.round(stats.totalTime / 60 * 10) / 10} hours of focused reading!
            </p>
          </div>

          <div className="insight-card">
            <div className="insight-icon">💡</div>
            <h3>Pro Tips</h3>
            <ul>
              <li>Use Focus Mode for long articles</li>
              <li>Try Bionic Reading for faster comprehension</li>
              <li>Take breaks every 20–30 minutes</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Milestones */}
      <section className="milestones-section">
        <h2>Achievements</h2>
        <div className="milestones-grid">
          {milestones.map((m, i) => (
            <div
              key={m.title}
              className={`milestone-card ${m.achieved ? 'achieved' : ''}`}
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <span className="milestone-icon">{m.icon}</span>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
              {m.achieved && <div className="milestone-check">✓</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Statistics;
