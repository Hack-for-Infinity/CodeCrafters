import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Type, Sparkles, ScanLine, Palette, Play, Pause,
    RotateCcw, Zap, Monitor, Volume2, Eye, Square
} from 'lucide-react';
import './LiveDemo.css';

const sampleText = `Reading is a fundamental skill that opens doors to knowledge and opportunity. For millions of people with ADHD or Dyslexia, standard web content creates unnecessary barriers. Dense paragraphs, small fonts, and cluttered layouts cause reading fatigue and make it difficult to focus on what matters.

NeuroRead changes this by adapting content to work with your brain. Bionic Reading creates visual anchor points by bolding the first half of words, helping your eyes flow naturally through text. Focus Mode strips away distractions, leaving only clean, readable content. Eye tracking follows your gaze to automatically scroll at your pace.

These aren't just features — they're tools for inclusion. When we make the web more readable, we lower barriers to education, employment, and everyday life. Information should never be a chore, and with NeuroRead, it doesn't have to be.`;

const LiveDemo = () => {
    const [activeMode, setActiveMode] = useState(null);
    const [bionicIntensity, setBionicIntensity] = useState(0.5);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const [focusLine, setFocusLine] = useState(-1);
    const [scrollSpeed, setScrollSpeed] = useState(0.5);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [selectedTheme, setSelectedTheme] = useState('default');
    const [dyslexiaSpacing, setDyslexiaSpacing] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [ttsWordIndex, setTtsWordIndex] = useState(-1);
    const [focusModeOn, setFocusModeOn] = useState(false);
    const scrollRef = useRef(null);
    const highlightTimer = useRef(null);
    const scrollTimer = useRef(null);
    const utteranceRef = useRef(null);

    const words = sampleText.split(/\s+/);
    const sentences = sampleText.split(/(?<=[.!?])\s+/);

    // Bionic Reading
    const renderBionic = useCallback(() => {
        return words.map((word, i) => {
            const boldLen = Math.ceil(word.length * bionicIntensity);
            return (
                <span key={i} className="bionic-word">
                    <strong>{word.slice(0, boldLen)}</strong>{word.slice(boldLen)}{' '}
                </span>
            );
        });
    }, [words, bionicIntensity]);

    // Word Highlight
    useEffect(() => {
        if (activeMode === 'highlight') {
            setHighlightIndex(0);
            highlightTimer.current = setInterval(() => {
                setHighlightIndex(prev => {
                    if (prev >= words.length - 1) return 0;
                    return prev + 1;
                });
            }, 400);
        } else {
            setHighlightIndex(-1);
            if (highlightTimer.current) clearInterval(highlightTimer.current);
        }
        return () => { if (highlightTimer.current) clearInterval(highlightTimer.current); };
    }, [activeMode, words.length]);

    // Line Focus
    useEffect(() => {
        if (activeMode === 'focus-line') {
            setFocusLine(0);
            const timer = setInterval(() => {
                setFocusLine(prev => {
                    if (prev >= sentences.length - 1) return 0;
                    return prev + 1;
                });
            }, 5000);
            return () => clearInterval(timer);
        } else {
            setFocusLine(-1);
        }
    }, [activeMode, sentences.length]);

    // Auto Scroll
    useEffect(() => {
        if (isAutoScrolling && scrollRef.current) {
            scrollTimer.current = setInterval(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop += scrollSpeed;
                    if (scrollRef.current.scrollTop >= scrollRef.current.scrollHeight - scrollRef.current.clientHeight) {
                        scrollRef.current.scrollTop = 0;
                    }
                }
            }, 50);
        }
        return () => { if (scrollTimer.current) clearInterval(scrollTimer.current); };
    }, [isAutoScrolling, scrollSpeed]);

    // TTS - Text to Speech
    const startTTS = useCallback(() => {
        if (!('speechSynthesis' in window)) return;
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(sampleText);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utteranceRef.current = utterance;

        // Track word boundaries
        let wordCounter = 0;
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                setTtsWordIndex(wordCounter);
                wordCounter++;
            }
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            setTtsWordIndex(-1);
            setActiveMode(null);
        };

        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    }, []);

    const stopTTS = useCallback(() => {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setTtsWordIndex(-1);
    }, []);

    // Clean up TTS on unmount or mode change
    useEffect(() => {
        if (activeMode !== 'tts' && isSpeaking) {
            stopTTS();
        }
    }, [activeMode, isSpeaking, stopTTS]);

    useEffect(() => {
        return () => { window.speechSynthesis.cancel(); };
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (e.altKey) {
                switch (e.key.toLowerCase()) {
                    case 'b':
                        e.preventDefault();
                        setActiveMode(prev => prev === 'bionic' ? null : 'bionic');
                        break;
                    case 'h':
                        e.preventDefault();
                        setActiveMode(prev => prev === 'highlight' ? null : 'highlight');
                        break;
                    case 'l':
                        e.preventDefault();
                        setActiveMode(prev => prev === 'focus-line' ? null : 'focus-line');
                        break;
                    case 't':
                        e.preventDefault();
                        setActiveMode(prev => {
                            if (prev === 'tts') {
                                stopTTS();
                                return null;
                            }
                            return 'tts';
                        });
                        break;
                    case 's':
                        e.preventDefault();
                        setIsAutoScrolling(prev => !prev);
                        break;
                    default:
                        break;
                }
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [stopTTS]);

    // Start TTS when mode activates
    useEffect(() => {
        if (activeMode === 'tts' && !isSpeaking) {
            startTTS();
        }
    }, [activeMode, isSpeaking, startTTS]);

    const resetAll = () => {
        stopTTS();
        setActiveMode(null);
        setIsAutoScrolling(false);
        setSelectedTheme('default');
        setDyslexiaSpacing(false);
        setFocusModeOn(false);
        setHighlightIndex(-1);
        setFocusLine(-1);
        setTtsWordIndex(-1);
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    };

    const themes = {
        default: { bg: '#0f0f23', text: '#e2e8f0', name: 'Default' },
        sepia: { bg: '#2a2218', text: '#d4c5a9', name: 'Sepia' },
        dark: { bg: '#0a0a0a', text: '#c8c8c8', name: 'Pure Dark' },
        'high-contrast': { bg: '#000000', text: '#ffffff', name: 'High Contrast' },
        dyslexia: { bg: '#1a1a0e', text: '#fde68a', name: 'Dyslexia' },
    };

    const modes = [
        { id: 'bionic', icon: Type, label: 'Bionic Reading', desc: 'Bold anchors', color: '#7c3aed' },
        { id: 'highlight', icon: Sparkles, label: 'Word Highlight', desc: 'Follow words', color: '#22d3ee' },
        { id: 'focus-line', icon: ScanLine, label: 'Line Focus', desc: 'Sentence focus', color: '#ec4899' },
        { id: 'tts', icon: Volume2, label: 'Text to Speech', desc: 'Read aloud', color: '#f97316' },
    ];

    const getThemeStyle = () => ({
        background: themes[selectedTheme].bg,
        color: themes[selectedTheme].text,
    });

    const renderText = () => {
        if (activeMode === 'bionic') {
            return <p className="demo-paragraph">{renderBionic()}</p>;
        }

        if (activeMode === 'highlight' || activeMode === 'tts') {
            const currentIndex = activeMode === 'tts' ? ttsWordIndex : highlightIndex;
            const activeClass = activeMode === 'tts' ? 'tts-active' : 'active';
            return (
                <p className="demo-paragraph">
                    {words.map((word, i) => (
                        <span
                            key={i}
                            className={`highlight-word ${i === currentIndex ? activeClass : ''} ${i < currentIndex ? 'read' : ''}`}
                        >
                            {word}{' '}
                        </span>
                    ))}
                </p>
            );
        }

        if (activeMode === 'focus-line') {
            return sentences.map((sentence, i) => (
                <p
                    key={i}
                    className={`focus-sentence ${i === focusLine ? 'focused' : ''} ${i < focusLine ? 'read' : ''}`}
                >
                    {sentence}
                </p>
            ));
        }

        return (
            <>
                <p className="demo-paragraph">{sampleText}</p>
                {focusModeOn && (
                    <>
                        <div className="demo-ad focus-hidden">
                            <span>📢 ADVERTISEMENT</span>
                            <p>Buy stuff you don't need!</p>
                        </div>
                        <div className="demo-sidebar-widget focus-hidden">
                            <span>📰 Trending</span>
                            <p>10 things you won't believe...</p>
                        </div>
                    </>
                )}
                {!focusModeOn && (
                    <>
                        <div className="demo-ad">
                            <span>📢 ADVERTISEMENT</span>
                            <p>Buy stuff you don't need!</p>
                        </div>
                        <div className="demo-sidebar-widget">
                            <span>📰 Trending</span>
                            <p>10 things you won't believe...</p>
                        </div>
                    </>
                )}
            </>
        );
    };

    return (
        <div className="live-demo">
            <header className="demo-header">
                <div className="demo-badge">
                    <Monitor size={14} />
                    <span>Interactive Demo</span>
                </div>
                <h1>Try NeuroRead <span className="gradient-text">Live</span></h1>
                <p>Experience every reading mode in action — right here, right now</p>
            </header>

            <div className="demo-layout">
                {/* Control Panel */}
                <div className="control-panel">
                    <div className="panel-section">
                        <h3>Reading Modes</h3>
                        <div className="mode-buttons">
                            {modes.map(mode => (
                                <button
                                    key={mode.id}
                                    className={`mode-btn ${activeMode === mode.id ? 'active' : ''}`}
                                    onClick={() => {
                                        if (activeMode === mode.id) {
                                            if (mode.id === 'tts') stopTTS();
                                            setActiveMode(null);
                                        } else {
                                            if (isSpeaking) stopTTS();
                                            setActiveMode(mode.id);
                                        }
                                    }}
                                    style={{ '--mode-color': mode.color }}
                                >
                                    {activeMode === mode.id && mode.id === 'tts' ? <Square size={18} /> : <mode.icon size={18} />}
                                    <div className="mode-btn-text">
                                        <span className="mode-btn-label">{mode.label}</span>
                                        <span className="mode-btn-desc">
                                            {activeMode === mode.id && mode.id === 'tts' ? 'Stop speaking' : mode.desc}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeMode === 'bionic' && (
                        <div className="panel-section control-slider">
                            <h3>Bold Intensity</h3>
                            <div className="slider-row">
                                <input
                                    type="range"
                                    min="0.3"
                                    max="0.7"
                                    step="0.1"
                                    value={bionicIntensity}
                                    onChange={e => setBionicIntensity(parseFloat(e.target.value))}
                                />
                                <span className="slider-value">{Math.round(bionicIntensity * 100)}%</span>
                            </div>
                        </div>
                    )}

                    <div className="panel-section">
                        <h3>Focus Mode</h3>
                        <button
                            className={`focus-mode-btn ${focusModeOn ? 'active' : ''}`}
                            onClick={() => {
                                setFocusModeOn(!focusModeOn);
                                if (activeMode) { setActiveMode(null); if (isSpeaking) stopTTS(); }
                            }}
                        >
                            <Eye size={16} />
                            <span>{focusModeOn ? 'Distractions Hidden' : 'Hide Distractions'}</span>
                            <div className={`mini-toggle ${focusModeOn ? 'on' : ''}`}>
                                <div className="mini-toggle-dot"></div>
                            </div>
                        </button>
                    </div>

                    <div className="panel-section">
                        <h3>Auto Scroll</h3>
                        <div className="scroll-controls">
                            <button
                                className={`scroll-btn ${isAutoScrolling ? 'active' : ''}`}
                                onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                            >
                                {isAutoScrolling ? <Pause size={16} /> : <Play size={16} />}
                                {isAutoScrolling ? 'Pause' : 'Start'}
                            </button>
                            <div className="speed-control">
                                <span className="speed-label">Speed</span>
                                <input
                                    type="range"
                                    min="0.2"
                                    max="2"
                                    step="0.1"
                                    value={scrollSpeed}
                                    onChange={e => setScrollSpeed(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="panel-section">
                        <h3>Themes</h3>
                        <div className="theme-buttons">
                            {Object.entries(themes).map(([key, theme]) => (
                                <button
                                    key={key}
                                    className={`theme-btn ${selectedTheme === key ? 'active' : ''}`}
                                    onClick={() => setSelectedTheme(key)}
                                    title={theme.name}
                                >
                                    <div className="theme-dot" style={{ background: theme.bg, border: `2px solid ${theme.text}` }}></div>
                                    <span>{theme.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="panel-section">
                        <h3>Accessibility</h3>
                        <button
                            className={`dyslexia-btn ${dyslexiaSpacing ? 'active' : ''}`}
                            onClick={() => setDyslexiaSpacing(!dyslexiaSpacing)}
                        >
                            <Palette size={16} />
                            <span>Dyslexia Spacing</span>
                            <div className={`mini-toggle ${dyslexiaSpacing ? 'on' : ''}`}>
                                <div className="mini-toggle-dot"></div>
                            </div>
                        </button>
                    </div>

                    <button className="reset-btn" onClick={resetAll}>
                        <RotateCcw size={14} />
                        Reset All
                    </button>
                </div>

                {/* Preview Area */}
                <div
                    ref={scrollRef}
                    className={`preview-area ${focusModeOn ? 'focus-mode-active' : ''}`}
                    style={{
                        ...getThemeStyle(),
                        ...(dyslexiaSpacing ? {
                            letterSpacing: '1.5px',
                            wordSpacing: '4px',
                            lineHeight: '2.2',
                        } : {}),
                    }}
                >
                    <div className="preview-toolbar">
                        <div className="toolbar-dots">
                            <span></span><span></span><span></span>
                        </div>
                        <span className="toolbar-url">neuroread.app/demo</span>
                    </div>
                    <div className="preview-content">
                        {renderText()}
                    </div>
                    {activeMode && (
                        <div className="active-mode-badge" style={{ background: modes.find(m => m.id === activeMode)?.color || '#7c3aed' }}>
                            <Zap size={12} />
                            {modes.find(m => m.id === activeMode)?.label} Active
                        </div>
                    )}
                </div>
            </div>

            {/* Keyboard Shortcuts */}
            <div className="shortcuts-bar">
                <span className="shortcut-title">Keyboard Shortcuts:</span>
                <div className="shortcut-item"><kbd>Alt</kbd>+<kbd>B</kbd> Bionic</div>
                <div className="shortcut-item"><kbd>Alt</kbd>+<kbd>H</kbd> Highlight</div>
                <div className="shortcut-item"><kbd>Alt</kbd>+<kbd>L</kbd> Line Focus</div>
                <div className="shortcut-item"><kbd>Alt</kbd>+<kbd>T</kbd> TTS</div>
                <div className="shortcut-item"><kbd>Alt</kbd>+<kbd>S</kbd> Scroll</div>
            </div>
        </div>
    );
};

export default LiveDemo;
