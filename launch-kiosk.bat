@echo off
setlocal enabledelayedexpansion

:: Get URL from first argument or use about:blank
set "URL=%~1"
if "%URL%"=="" set "URL=about:blank"
set "EXTENSION_PATH=%CD%"

:: Find Chrome path from Registry
for /f "tokens=2*" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve') do set "CHROME_PATH=%%b"
if not defined CHROME_PATH (
    for /f "tokens=2*" %%a in ('reg query "HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Windows\CurrentVersion\App Paths\chrome.exe" /ve') do set "CHROME_PATH=%%b"
)

if not defined CHROME_PATH (
    echo Chrome not found in registry. Trying default path...
    set "CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe"
    if not exist "!CHROME_PATH!" (
        set "CHROME_PATH=C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
    )
)

if not exist "!CHROME_PATH!" (
    echo Error: Could not find Chrome installation
    exit /b 1
)

:: Display settings
echo Launching Chrome in kiosk mode...
echo Initial URL: %URL%

:: Launch Chrome in kiosk mode
start "" "!CHROME_PATH!" ^
    --kiosk ^
    --start-fullscreen ^
    --disable-restore-session-state ^
    --noerrdialogs ^
    --disable-infobars ^
    --disable-features=TranslateUI ^
    --no-first-run ^
    --load-extension="%EXTENSION_PATH%" ^
    "%URL%"

exit /b 0