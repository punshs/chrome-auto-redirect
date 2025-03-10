let port = chrome.runtime.connect({ name: "popup" });

// DOM elements
const targetUrlInput = document.getElementById('targetUrl');
const timeoutSelect = document.getElementById('timeout');
const startButton = document.getElementById('startTimer');
const stopButton = document.getElementById('stopTimer');
const continuousCheckbox = document.getElementById('continuous');
const statusDiv = document.getElementById('status');

// Load saved settings
chrome.storage.local.get(['targetUrl', 'timeout', 'continuous'], (result) => {
  if (result.targetUrl) targetUrlInput.value = result.targetUrl;
  if (result.timeout) timeoutSelect.value = result.timeout;
  if (result.continuous) continuousCheckbox.checked = result.continuous;
});

// Check if timer is running
chrome.runtime.sendMessage({ action: "getStatus" }, (response) => {
  updateUIState(response.isRunning);
  if (response.isRunning && response.remainingTime) {
    updateCountdown(response.remainingTime);
  }
});

// Start timer button click handler
startButton.addEventListener('click', () => {
  const targetUrl = targetUrlInput.value;
  const timeout = parseInt(timeoutSelect.value);
  const continuous = continuousCheckbox.checked;

  if (!targetUrl) {
    statusDiv.textContent = 'Please enter a valid URL';
    return;
  }

  // Save settings
  chrome.storage.local.set({
    targetUrl: targetUrl,
    timeout: timeout,
    continuous: continuous
  });

  // Start the timer
  chrome.runtime.sendMessage({
    action: "startTimer",
    continuous: continuous,
    targetUrl: targetUrl,
    timeout: timeout
  }, (response) => {
    if (response.success) {
      updateUIState(true);
      updateCountdown(timeout);
    }
  });
});

// Stop timer button click handler
stopButton.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "stopTimer" }, (response) => {
    if (response.success) {
      updateUIState(false);
      statusDiv.textContent = 'Timer stopped';
    }
  });
});

// Update UI based on timer state
function updateUIState(isRunning) {
  startButton.style.display = isRunning ? 'none' : 'block';
  stopButton.style.display = isRunning ? 'block' : 'none';
}

// Update countdown display
function updateCountdown(seconds) {
  function formatTime(secs) {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  let timeLeft = seconds;
  statusDiv.textContent = `Redirecting in: ${formatTime(timeLeft)}`;

  const countdownInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      statusDiv.textContent = 'Redirecting...';
    } else {
      statusDiv.textContent = `Redirecting in: ${formatTime(timeLeft)}`;
    }
  }, 1000);
}