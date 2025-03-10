let redirectTimer = null;
let targetUrl = '';
let timeoutDuration = 0;
let startTime = 0;
let isContinuous = false;

// Initialize extension on install or update
chrome.runtime.onInstalled.addListener(async (details) => {
  const manifest = chrome.runtime.getManifest();
  const defaultConfig = manifest.default_config;
  
  // Get URL parameters if any
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  
  // Set initial configuration
  await chrome.storage.local.set({
    targetUrl: params.get('url') || defaultConfig.targetUrl,
    timeout: parseInt(params.get('timeout')) || defaultConfig.timeout,
    continuous: params.has('continuous') ? 
      params.get('continuous') === 'true' : 
      defaultConfig.continuous,
    autostart: params.has('autostart') ? 
      params.get('autostart') === 'true' : 
      defaultConfig.autostart
  });

  // Auto-start if configured
  const config = await chrome.storage.local.get(['autostart', 'targetUrl', 'timeout', 'continuous']);
  if (config.autostart && config.targetUrl !== 'about:blank') {
    startTimer(
      config.targetUrl,
      config.timeout,
      config.continuous
    );
  }
});

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