#!/bin/bash

# Default values
URL="about:blank"
TIMEOUT=300
CONTINUOUS="true"
AUTOSTART="true"
EXTENSION_PATH="$PWD"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --url)
      URL="$2"
      shift 2
      ;;
    --timeout)
      TIMEOUT="$2"
      shift 2
      ;;
    --continuous)
      CONTINUOUS="$2"
      shift 2
      ;;
    --extension-path)
      EXTENSION_PATH="$2"
      shift 2
      ;;
    *)
      echo "Unknown parameter: $1"
      exit 1
      ;;
  esac
done

# Create a temporary HTML file
TEMP_HTML=$(mktemp)
cat > "$TEMP_HTML" << EOL
<!DOCTYPE html>
<html>
<head>
<script>
const extensionId = 'mpkkhcmmngaghkpjhflcjgfgachfodmm';
const config = {
  targetUrl: '$URL',
  timeout: $TIMEOUT,
  continuous: $CONTINUOUS,
  autostart: true
};
chrome.runtime.sendMessage(extensionId, { type: 'setConfig', config },
  response => {
    if (response.success) {
      console.log('Extension configured successfully');
    }
  }
);
</script>
</head>
<body></body>
</html>
EOL

# Execute the command
CHROME_CMD="google-chrome --kiosk --start-fullscreen --disable-restore-session-state --noerrdialogs --disable-infobars --disable-features=TranslateUI --load-extension=\"$EXTENSION_PATH\" \"file://$TEMP_HTML\""
echo "Launching Chrome in kiosk mode..."
echo "URL: $URL"
echo "Timeout: $TIMEOUT seconds"
echo "Continuous: $CONTINUOUS"

eval $CHROME_CMD