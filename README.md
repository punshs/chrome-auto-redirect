# Chrome Auto-Redirect Extension

A Chrome extension that automatically redirects to a specified URL after a set time interval. Perfect for kiosk displays, digital signage, and automated browsing scenarios.

## Features

- 🕒 Configurable redirect timer (30 seconds to 1 hour)
- 🔄 Supports one-time or continuous redirection
- 🖥️ Kiosk mode support for both Windows and Linux
- ⚙️ Command-line configuration
- 💾 Persistent settings storage
- 🚀 Lightweight and efficient

## Installation

1. Clone this repository:
```bash
git clone https://github.com/punshs/chrome-auto-redirect.git
cd chrome-auto-redirect
```

2. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked"
   - Select the `auto-redirect-extension` folder

## Usage

### GUI Mode

1. Click the extension icon in Chrome
2. Enter the target URL
3. Select the redirect timeout
4. Choose between one-time or continuous redirection
5. Click "Start Timer"

### Kiosk Mode

#### Windows
```batch
launch-kiosk.bat --url "https://your-website.com" --timeout 300 --continuous true
```

#### Linux
```bash
./launch-kiosk.sh --url "https://your-website.com" --timeout 300 --continuous true
```

### Command Line Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| --url | Target URL to redirect to | about:blank |
| --timeout | Time in seconds before redirect | 300 |
| --continuous | Enable continuous redirection | true |
| --extension-path | Custom path to extension directory | Current directory |

## Configuration

The extension uses Chrome's Storage API to manage settings with the following defaults:

```text
Target URL: about:blank
Timeout: 300 seconds (5 minutes)
Continuous Mode: enabled
```

Settings can be modified in two ways:
1. Through the extension's popup interface
2. Via the launch scripts in kiosk mode

All settings persist between browser sessions unless explicitly changed. The extension uses a fixed ID (`mpkkhcmmngaghkpjhflcjgfgachfodmm`) for stable communication between the launch scripts and the extension itself.
## Creating a Kiosk Display

### Windows

1. Create a desktop shortcut:
   - Right-click desktop → New → Shortcut
   - Enter the command:
     ```batch
     C:\Windows\System32\cmd.exe /c "C:\Path\To\launch-kiosk.bat" --url "https://your-website.com" --timeout 300
     ```
   - Name the shortcut and click Finish

2. Optional: Configure auto-start
   - Press Win + R
   - Type `shell:startup`
   - Move your shortcut to this folder

### Linux

1. Create an autostart entry:
   ```bash
   mkdir -p ~/.config/autostart
   ```

2. Create `chrome-kiosk.desktop`:
   ```ini
   [Desktop Entry]
   Type=Application
   Name=Chrome Kiosk
   Exec=/path/to/launch-kiosk.sh --url "https://your-website.com" --timeout 300
   Hidden=false
   X-GNOME-Autostart-enabled=true
   ```

## Exit Kiosk Mode

- Windows/Linux: Press `Alt+F4` or `Ctrl+Shift+W`

## Development

### Project Structure
```
auto-redirect-extension/
├── manifest.json        # Extension configuration
├── popup.html          # Extension popup UI
├── popup.js            # Popup logic
├── background.js       # Background service worker
├── launch-kiosk.bat    # Windows launcher
├── launch-kiosk.sh     # Linux launcher
└── README.md           # Documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE section in this file.

## License Text

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
