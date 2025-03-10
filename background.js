let redirectTimer = null;
let targetUrl = '';
let timeoutDuration = 0;
let startTime = 0;
let isContinuous = false;

// Initialize extension with default settings on install
chrome.runtime.onInstalled.addListener(async (details) => {
  const defaultSettings = {
    targetUrl: 'about:blank',
    timeout: 300,
    continuous: true
  };
  chrome.storage.local.set(defaultSettings);
});

// Listen for tab updates to check for auto-redirect parameters
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    if (url.hash.startsWith('#auto-redirect')) {
      // Extract parameters from the URL fragment
      const params = new URLSearchParams(url.hash.substring('#auto-redirect'.length));
      
      // Configure redirect settings
      const settings = {
        targetUrl: url.toString().split('#')[0], // Use the base URL without fragment
        timeout: parseInt(params.get('timeout')) || 300,
        continuous: params.get('continuous') === 'true'
      };

      // Start timer if autostart is true
      if (params.get('autostart') === 'true') {
        chrome.storage.local.set(settings, () => {
          startTimer(settings.targetUrl, settings.timeout, settings.continuous);
        });
      }
    }
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startTimer':
      startTimer(message.targetUrl, message.timeout, message.continuous);
      chrome.storage.local.set({
        targetUrl: message.targetUrl,
        timeout: message.timeout,
        continuous: message.continuous
      });
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
  stopTimer(); // Clear any existing timer
  
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
  }

  // Start the initial timer
  redirectTimer = setTimeout(redirectAndReset, timeout * 1000);
}

// Stop redirect timer
function stopTimer() {
  if (redirectTimer) {
    clearTimeout(redirectTimer);
    redirectTimer = null;
  }
  isContinuous = false;
}

// Clean up when extension is unloaded
chrome.runtime.onSuspend.addListener(() => {
  stopTimer();
});