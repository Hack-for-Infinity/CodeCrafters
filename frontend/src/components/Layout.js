import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Brain,
  Settings,
  BarChart3,
  Info,
  Home,
  Menu,
  X,
  Zap,
  Play
} from 'lucide-react';
import './Layout.css';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard', shortcut: 'D' },
    { path: '/demo', icon: Play, label: 'Live Demo', shortcut: 'L', badge: 'NEW' },
    { path: '/settings', icon: Settings, label: 'Settings', shortcut: 'S' },
    { path: '/statistics', icon: BarChart3, label: 'Statistics', shortcut: 'T' },
    { path: '/about', icon: Info, label: 'About', shortcut: 'A' },
  ];

  return (
    <div className="layout">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button
          className="menu-btn"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <div className="mobile-logo">
          <div className="mobile-logo-icon">
            <Brain size={20} />
          </div>
          <span>NeuroRead</span>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <Brain size={28} />
              <div className="logo-glow"></div>
            </div>
            <div className="logo-text">
              <h1>NeuroRead</h1>
              <span className="logo-badge">
                <Zap size={10} />
                Reading Assistant
              </span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Navigation</div>
          {navItems.map((item, index) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="nav-icon-wrapper">
                <item.icon size={18} />
              </div>
              <span className="nav-label">{item.label}</span>
              {item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
              <span className="nav-shortcut">{item.shortcut}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <div className="status-dot"></div>
            <span>Extension Active</span>
          </div>
          <div className="version-info">
            <span className="version">v1.0.0</span>
            <span className="tagline">Hack for Infinity 2K26</span>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
