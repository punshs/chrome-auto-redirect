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

// Handle launch parameters
chrome.runtime.onMessageExternal.addListener(
  async (request, sender, sendResponse) => {
    if (request.type === 'setConfig') {
      await chrome.storage.local.set(request.config);
      if (request.config.autostart && request.config.targetUrl !== 'about:blank') {
        startTimer(
          request.config.targetUrl,
          request.config.timeout,
          request.config.continuous
        );
      }
      sendResponse({ success: true });
    }
  }
);

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.action) {
    case 'startTimer':
      startTimer(message.targetUrl, message.timeout, message.continuous);
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
    }
    
    // If continuous mode is enabled, restart the timer
    if (isContinuous) {
      startTime = Date.now();
      redirectTimer = setTimeout(redirectAndReset, timeoutDuration * 1000);
    } else {
      redirectTimer = null;
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