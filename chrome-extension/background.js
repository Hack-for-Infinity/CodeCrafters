// NeuroRead Background Service Worker
// Handles extension lifecycle, context menu, and cross-tab communication

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('NeuroRead installed - Welcome!');
    
    // Initialize default settings
    chrome.storage.sync.set({
      neuroreadState: {
        bionic: false,
        focus: false,
        eye: false,
        scroll: false,
        tts: false,
        highlight: false,
        dyslexia: false,
        theme: 'default'
      },
      settings: {
        bionicIntensity: 0.5,
        scrollSpeed: 100,
        fontSize: 16,
        lineHeight: 1.6,
        letterSpacing: 0.5,
        highlightColor: '#6366f1',
        ttsRate: 1.0,
        ttsVoice: 'default'
      }
    });

    // Show welcome notification
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'Welcome to NeuroRead!',
      message: 'Your reading assistant is ready. Click the extension icon to get started.'
    });
  }
});

// Context menu for quick actions
chrome.runtime.onStartup.addListener(() => {
  createContextMenu();
});

chrome.runtime.onInstalled.addListener(() => {
  createContextMenu();
});

function createContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'neuroread-parent',
      title: 'NeuroRead',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'toggle-bionic',
      parentId: 'neuroread-parent',
      title: 'Toggle Bionic Reading',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'toggle-focus',
      parentId: 'neuroread-parent',
      title: 'Toggle Focus Mode',
      contexts: ['all']
    });

    chrome.contextMenus.create({
      id: 'toggle-tts',
      parentId: 'neuroread-parent',
      title: 'Read Selected Text',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'summarize-page',
      parentId: 'neuroread-parent',
      title: 'Summarize This Page',
      contexts: ['all']
    });
  });
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'toggle-bionic':
      chrome.tabs.sendMessage(tab.id, { action: 'toggleMode', mode: 'bionic' });
      break;
    case 'toggle-focus':
      chrome.tabs.sendMessage(tab.id, { action: 'toggleMode', mode: 'focus' });
      break;
    case 'toggle-tts':
      chrome.tabs.sendMessage(tab.id, { 
        action: 'speakText', 
        text: info.selectionText 
      });
      break;
    case 'summarize-page':
      chrome.tabs.sendMessage(tab.id, { action: 'summarizePage' });
      break;
  }
});

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getState':
      chrome.storage.sync.get('neuroreadState').then(result => {
        sendResponse(result.neuroreadState);
      });
      return true;

    case 'updateStats':
      updateReadingStats(request.stats);
      break;

    case 'captureTab':
      chrome.tabs.captureVisibleTab(sender.tab.windowId, { format: 'png' })
        .then(dataUrl => sendResponse({ success: true, dataUrl }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;

    case 'openSettings':
      chrome.tabs.create({ url: chrome.runtime.getURL('settings.html') });
      break;

    case 'createOffscreen':
      createOffscreenDocument();
      break;
  }
});

// Update reading statistics
async function updateReadingStats(newStats) {
  const result = await chrome.storage.local.get(['readingStats']);
  const currentStats = result.readingStats || {
    wpm: 0,
    time: 0,
    words: 0,
    sessions: 0
  };

  const updatedStats = {
    wpm: Math.round((currentStats.wpm * currentStats.sessions + newStats.wpm) / (currentStats.sessions + 1)),
    time: currentStats.time + newStats.time,
    words: currentStats.words + newStats.words,
    sessions: currentStats.sessions + 1,
    lastSession: new Date().toISOString()
  };

  await chrome.storage.local.set({ readingStats: updatedStats });
}

// Create offscreen document for DOM parsing (Manifest V3 requirement)
async function createOffscreenDocument() {
  if (await hasOffscreenDocument()) return;
  
  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['DOM_PARSER'],
    justification: 'Parse DOM for accessibility analysis'
  });
}

async function hasOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [chrome.runtime.getURL('offscreen.html')]
  });
  return existingContexts.length > 0;
}

// Track active reading sessions
const readingSessions = new Map();

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  if (tab.url && !tab.url.startsWith('chrome://')) {
    readingSessions.set(tabId, {
      startTime: Date.now(),
      url: tab.url
    });
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (readingSessions.has(tabId)) {
    const session = readingSessions.get(tabId);
    const duration = Math.round((Date.now() - session.startTime) / 60000);
    
    updateReadingStats({
      wpm: 200,
      time: duration,
      words: duration * 200
    });
    
    readingSessions.delete(tabId);
  }
});

// Keyboard shortcuts
chrome.commands.onCommand.addListener((command, tab) => {
  switch (command) {
    case 'toggle-bionic':
      chrome.tabs.sendMessage(tab.id, { action: 'toggleMode', mode: 'bionic' });
      break;
    case 'toggle-focus':
      chrome.tabs.sendMessage(tab.id, { action: 'toggleMode', mode: 'focus' });
      break;
    case 'toggle-tts':
      chrome.tabs.sendMessage(tab.id, { action: 'toggleFeature', feature: 'tts' });
      break;
  }
});

console.log('NeuroRead background service worker initialized');
