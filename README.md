# Chrome Auto-Redirect Extension

A Chrome extension for kiosk displays that automatically redirects back to the home page after navigation. Perfect for public displays, information kiosks, and digital signage.

## Features

- 🏠 Automatic home page detection
- ⚡ Instant redirect after timeout
- ⚙️ Configurable settings
- 🖥️ Kiosk mode support
- 🎯 No popup interface - works silently in the background

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
   - Select the extension folder

## Configuration

1. Right-click the extension icon and select "Options", or visit:
   `chrome://extensions/?options=<extension_id>`

2. Configure:
   - **Default URL** (optional): If set, always redirects to this URL. If not set, uses the first loaded page as home.
   - **Timeout** (seconds): How long to wait before redirecting back to home page after navigation.

## Usage

### Basic Usage

1. Open Chrome with your desired home page
2. The extension will automatically:
   - Set the current page as home (unless a default URL is configured)
   - Monitor for navigation to other pages
   - Redirect back to home after the set timeout

### Kiosk Mode

#### Windows
```batch
launch-kiosk.bat [initial-url]
```

#### Linux
```bash
./launch-kiosk.sh [initial-url]
```

The `initial-url` parameter is optional. If not provided, Chrome will open to `about:blank`.

### How it Works

1. When Chrome starts:
   - If a default URL is set in options, it becomes the home page
   - Otherwise, the first loaded page becomes the home page

2. During operation:
   - When user navigates to any other page, a timer starts
   - After the configured timeout, redirects back to home
   - Process repeats for any new navigation

## Exit Kiosk Mode

- Windows/Linux: Press `Alt+F4` or `Ctrl+Shift+W`

## Development

### Project Structure
```
chrome-auto-redirect/
├── manifest.json        # Extension configuration
├── background.js       # Core redirect logic
├── options.html        # Settings page
├── options.js         # Settings logic
├── launch-kiosk.bat   # Windows launcher
├── launch-kiosk.sh    # Linux launcher
└── README.md          # Documentation
```

### Building from Source

No build step required - this is a pure JavaScript extension.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see below for details:

```
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
