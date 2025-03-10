let homeUrl = null;
let redirectTimer = null;
let lastNavigationTime = 0;
const MIN_NAVIGATION_INTERVAL = 1000; // Minimum time between navigations

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  // Set default settings if not already set
  chrome.storage.local.get({
    defaultUrl: '',
    timeout: 300
  }, (items) => {
    chrome.storage.local.set(items);
  });
});

// Monitor tab updates to detect the initial page load
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.active) {
    chrome.storage.local.get(['defaultUrl'], (items) => {
      // If this is the first page load and no default URL is set, use this page as home
      if (!homeUrl && !items.defaultUrl) {
        homeUrl = tab.url;
      }
      // If default URL is set, always use it as home
      if (items.defaultUrl) {
        homeUrl = items.defaultUrl;
      }
    });
  }
});

// Monitor all navigation events
chrome.webNavigation.onCommitted.addListener((details) => {
  // Only handle main frame navigations
  if (details.frameId === 0) {
    handleNavigation(details);
  }
});

// Handle navigation events
async function handleNavigation(details) {
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
    // Clear any existing timer
    if (redirectTimer) {
      clearTimeout(redirectTimer);
    }

    // Start new redirect timer
    redirectTimer = setTimeout(async () => {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0] && tabs[0].url !== currentHomeUrl) {
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

// Reset timer when user interacts with the page
chrome.tabs.onActivated.addListener(() => {
  if (redirectTimer) {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs[0]) {
        const settings = await chrome.storage.local.get(['defaultUrl']);
        const currentHomeUrl = settings.defaultUrl || homeUrl;
        if (tabs[0].url !== currentHomeUrl) {
          handleNavigation({ url: tabs[0].url });
        }
      }
    });
  }
});