@echo off
setlocal enabledelayedexpansion

:: Default values
set "URL=about:blank"
set "TIMEOUT=300"
set "CONTINUOUS=true"
set "EXTENSION_PATH=%CD%"

:: Parse command line arguments
:parse_args
if "%~1"=="" goto :done_parsing
if "%~1"=="--url" (
    set "URL=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--timeout" (
    set "TIMEOUT=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--continuous" (
    set "CONTINUOUS=%~2"
    shift
    shift
    goto :parse_args
)
if "%~1"=="--extension-path" (
    set "EXTENSION_PATH=%~2"
    shift
    shift
    goto :parse_args
)
echo Unknown parameter: %1
exit /b 1

:done_parsing
:: Display settings
echo Launching Chrome in kiosk mode...
echo URL: %URL%
echo Timeout: %TIMEOUT% seconds
echo Continuous: %CONTINUOUS%

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

:: Launch Chrome in kiosk mode
start "" "!CHROME_PATH!" ^
    --kiosk ^
    --start-fullscreen ^
    --disable-restore-session-state ^
    --noerrdialogs ^
    --disable-infobars ^
    --disable-features=TranslateUI ^
    --load-extension="%EXTENSION_PATH%" ^
    "about:blank?url=%URL%&timeout=%TIMEOUT%&continuous=%CONTINUOUS%&autostart=true"

exit /b 0