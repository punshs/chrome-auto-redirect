let redirectTimer = null;
let targetUrl = '';
let timeoutDuration = 0;
let startTime = 0;
let isContinuous = false;

// Initialize extension with default settings on install
chrome.runtime.onInstalled.addListener(async (details) => {
  // Set default configuration
  const defaultSettings = {
    targetUrl: 'about:blank',
    timeout: 300,
    continuous: true,
    autostart: false
  };

  chrome.storage.local.get(['targetUrl', 'timeout', 'continuous', 'autostart'], (result) => {
    if (Object.keys(result).length === 0) {
      chrome.storage.local.set(defaultSettings);
    }
  });
});

// Handle startup and check for URL parameters
async function checkUrlParameters() {
  try {
    // Get the current tab to check for URL parameters
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0] && tabs[0].url) {
      const url = new URL(tabs[0].url);
      const params = new URLSearchParams(url.search);
      
      if (params.has('url')) {
        const settings = {
          targetUrl: params.get('url'),
          timeout: parseInt(params.get('timeout')) || 300,
          continuous: params.get('continuous') !== 'false',
          autostart: params.get('autostart') !== 'false'
        };
        
        await chrome.storage.local.set(settings);
        startTimer(settings.targetUrl, settings.timeout, settings.continuous);
      }
    }
  } catch (error) {
    console.error('Error processing URL parameters:', error);
  }
}

chrome.runtime.onStartup.addListener(() => {
  checkUrlParameters();
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startTimer':
      startTimer(message.targetUrl, message.timeout, message.continuous);
      chrome.storage.local.set({ targetUrl: message.targetUrl, timeout: message.timeout, continuous: message.continuous });
      sendResponse({ success: true });
      break;
    
    case 'stopTimer':
      stopTimer();
      sendResponse({ success: true });
      break;
    
    case 'getStatus':
      const remainingTime = redirectTimer ? 
        Math.ceil((startTime + timeoutDuration * 1000 - Date.now()) / 1000) : 0;
      sendResponse({ 
        isRunning: redirectTimer !== null,
        remainingTime: remainingTime > 0 ? remainingTime : 0
      });
      break;
  }
  return true;
});

// Start redirect timer
function startTimer(url, timeout, continuous) {
  if (redirectTimer) stopTimer(); // Clear any existing timer
  
  targetUrl = url;
  timeoutDuration = timeout;
  startTime = Date.now();
  isContinuous = continuous;
  
  async function redirectAndReset() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      chrome.tabs.update(tabs[0].id, { url: targetUrl });
      
      // If continuous mode is enabled, restart the timer
      if (isContinuous) {
        startTime = Date.now();
        redirectTimer = setTimeout(redirectAndReset, timeoutDuration * 1000);
      } else {
        redirectTimer = null;
      }
    }
  };

  // Start the initial timer
  redirectTimer = setTimeout(redirectAndReset, timeout * 1000);
}

// Stop redirect timer
function stopTimer() {
  console.log('Stopping timer');
  if (redirectTimer) {
    clearTimeout(redirectTimer);
    redirectTimer = null;
  }
  isContinuous = false;
}

// Check for URL parameters when extension loads
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') checkUrlParameters();
});

// Clean up when extension is unloaded
chrome.runtime.onSuspend.addListener(() => {
  stopTimer();
});