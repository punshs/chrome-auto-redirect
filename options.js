// DOM elements
const defaultUrlInput = document.getElementById('defaultUrl');
const timeoutInput = document.getElementById('timeout');
const saveButton = document.getElementById('save');
const statusDiv = document.getElementById('status');

// Load saved settings
chrome.storage.local.get({
  defaultUrl: '', // default to empty string if not set
  timeout: 300    // default to 5 minutes if not set
}, (items) => {
  defaultUrlInput.value = items.defaultUrl;
  timeoutInput.value = items.timeout;
});

// Save settings
saveButton.addEventListener('click', () => {
  const timeout = parseInt(timeoutInput.value);
  
  // Validate timeout
  if (timeout < 1) {
    showStatus('Timeout must be at least 1 second', false);
    return;
  }

  // Validate URL if provided
  const defaultUrl = defaultUrlInput.value.trim();
  if (defaultUrl && !isValidUrl(defaultUrl)) {
    showStatus('Please enter a valid URL', false);
    return;
  }

  // Save settings
  chrome.storage.local.set({
    defaultUrl: defaultUrl,
    timeout: timeout
  }, () => {
    showStatus('Settings saved successfully!', true);
  });
});

// Helper function to show status message
function showStatus(message, success) {
  statusDiv.textContent = message;
  statusDiv.style.display = 'block';
  statusDiv.className = success ? 'success' : 'error';
  
  // Hide status after 3 seconds
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
}

// Helper function to validate URLs
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}