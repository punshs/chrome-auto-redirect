let homeUrl = null;
let redirectTimer = null;
let lastNavigationTime = 0;
const MIN_NAVIGATION_INTERVAL = 1000; // Minimum time between navigations

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get({
    defaultUrl: '',
    timeout: 300
  }, (items) => {
    chrome.storage.local.set(items);
  });
});

// Monitor tab updates to detect the initial page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active && tab.url) {
    // Ignore chrome:// and chrome-extension:// URLs
    if (!tab.url.startsWith('chrome://') && !tab.url.startsWith('chrome-extension://')) {
      chrome.storage.local.get(['defaultUrl'], (items) => {
        // If default URL is set, use it as home
        if (items.defaultUrl) {
          homeUrl = items.defaultUrl;
        }
        // Otherwise, if we don't have a home URL yet, use this page
        else if (!homeUrl) {
          console.log('Setting home URL to:', tab.url);
          homeUrl = tab.url;
        }
      });
    }
  }
});

// Monitor web navigation events
chrome.webNavigation.onCompleted.addListener((details) => {
  // Only handle main frame navigations
  if (details.frameId === 0) {
    handleNavigation(details);
  }
});

// Handle navigation events
async function handleNavigation(details) {
  // Ignore chrome:// and chrome-extension:// URLs
  if (details.url.startsWith('chrome://') || details.url.startsWith('chrome-extension://')) {
    return;
  }

  const now = Date.now();
  // Prevent rapid-fire navigations
  if (now - lastNavigationTime < MIN_NAVIGATION_INTERVAL) {
    return;
  }
  lastNavigationTime = now;

  // Get current settings
  const settings = await chrome.storage.local.get(['defaultUrl', 'timeout']);
  const currentHomeUrl = settings.defaultUrl || homeUrl;

  // If we have a home URL and this navigation is to a different page
  if (currentHomeUrl && details.url !== currentHomeUrl) {
    console.log('Navigation to non-home URL detected:', details.url);
    
    // Clear any existing timer
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }

    // Start new redirect timer
    redirectTimer = setTimeout(async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0] && tabs[0].url !== currentHomeUrl) {
        console.log('Redirecting back to home:', currentHomeUrl);
        chrome.tabs.update(tabs[0].id, { url: currentHomeUrl });
      }
    }, settings.timeout * 1000);
  }
}

// Clear timer when tab is closed
chrome.tabs.onRemoved.addListener(() => {
  if (redirectTimer) {
    clearTimeout(redirectTimer);
    redirectTimer = null;
  }
});

// Update home URL when settings change
chrome.storage.onChanged.addListener((changes) => {
  if (changes.defaultUrl) {
    homeUrl = changes.defaultUrl.newValue || homeUrl;
  }
});