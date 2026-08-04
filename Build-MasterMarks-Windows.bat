@echo off
setlocal
:: Navigate to the project root directory
cd /d "%~dp0"

echo.
echo ======================================================
echo   Building Master-Marks (Score Book) - Windows
echo ======================================================
echo.

:: Prompt for version
set /p APP_VERSION="Enter the App Version (e.g., 1.1 or 1.11): "

if "%APP_VERSION%"=="" (
    echo [ERROR] Version cannot be empty!
    pause
    exit /b 1
)

echo.
echo Updating Application Version to %APP_VERSION%...
node update-version.js

:: 1. Obfuscate source code for protection
echo.
echo [INFO] Obfuscating source code for protection...
call npm run obfuscate

if %errorlevel% neq 0 (
    echo [ERROR] Obfuscation failed!
    pause
    exit /b %errorlevel%
)

echo.
echo Project Directory: %cd%
echo.
echo Running electron-builder...
echo.

:: 2. Execute the build script from package.json
call npm run build:scorebook

:: Capture build error level
set BUILD_STATUS=%errorlevel%

:: 3. ALWAYS Restore original source code immediately after build
echo.
echo [INFO] Restoring original source code...
call node restore-src.js

if %BUILD_STATUS% neq 0 (
    echo.
    echo [ERROR] Build failed with error code %BUILD_STATUS%
    echo Please check the log above for details.
    echo.
    pause
    exit /b %BUILD_STATUS%
)

:: Organize Build Artifacts
echo.
echo Organizing Build Artifacts into x32 and x64 folders...
echo.

:: Ensure destination directories exist
if not exist "%~dp0Scorebook-win\x32" mkdir "%~dp0Scorebook-win\x32"
if not exist "%~dp0Scorebook-win\x64" mkdir "%~dp0Scorebook-win\x64"
if not exist "%~dp0Scorebook-win\Store" mkdir "%~dp0Scorebook-win\Store"

:: Move MSIX files to Store folder (both architectures)
echo Moving MSIX Store files...
move /Y "%~dp0Scorebook-win\*.msix" "%~dp0Scorebook-win\Store\" 2>nul

:: Move 32-bit build artifacts (ia32)
echo Organizing 32-bit files...
if exist "%~dp0Scorebook-win\win-ia32-unpacked" move /Y "%~dp0Scorebook-win\win-ia32-unpacked" "%~dp0Scorebook-win\x32\"
move /Y "%~dp0Scorebook-win\*_ia32.exe" "%~dp0Scorebook-win\x32\" 2>nul
move /Y "%~dp0Scorebook-win\*_ia32.msi" "%~dp0Scorebook-win\x32\" 2>nul
move /Y "%~dp0Scorebook-win\*_ia32.blockmap" "%~dp0Scorebook-win\x32\" 2>nul

:: Move 64-bit build artifacts (x64)
echo Organizing 64-bit files...
if exist "%~dp0Scorebook-win\win-unpacked" move /Y "%~dp0Scorebook-win\win-unpacked" "%~dp0Scorebook-win\x64\"
move /Y "%~dp0Scorebook-win\*_x64.exe" "%~dp0Scorebook-win\x64\" 2>nul
move /Y "%~dp0Scorebook-win\*_x64.msi" "%~dp0Scorebook-win\x64\" 2>nul
move /Y "%~dp0Scorebook-win\*_x64.blockmap" "%~dp0Scorebook-win\x64\" 2>nul

echo ======================================================
echo   Build Successful! 
echo   Files generated in: %~dp0Scorebook-win\
echo ======================================================
echo.
pause
