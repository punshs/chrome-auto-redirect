#!/bin/bash

# Default values
URL="${1:-about:blank}"  # Use first argument as URL or about:blank if not provided
EXTENSION_PATH="$PWD"

# Kill any existing Chrome instances
echo "Closing existing Chrome instances..."
pkill chrome || true

echo "Launching Chrome in kiosk mode..."
echo "Initial URL: $URL"

# Launch Chrome in kiosk mode
google-chrome \
  --kiosk \
  --start-fullscreen \
  --disable-restore-session-state \
  --noerrdialogs \
  --disable-infobars \
  --disable-features=TranslateUI \
  --no-first-run \
  --load-extension="$EXTENSION_PATH" \
  "$URL"