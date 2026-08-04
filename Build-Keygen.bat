@echo off
setlocal
:: Navigate to the project root directory
cd /d "%~dp0"

echo.
echo ======================================================
echo   Building Control Panel (Keygen) - Windows
echo ======================================================
echo.

:: Prompt for version
set /p APP_VERSION="Enter the Keygen Version (e.g., 1.1 or 1.11): "

if "%APP_VERSION%"=="" (
    echo [ERROR] Version cannot be empty!
    pause
    exit /b 1
)

echo.
echo Parsing Semantic Version for internal logic...
node -e "const fs=require('fs'); let b=JSON.parse(fs.readFileSync('package.json')); let v=process.env.APP_VERSION.split('.'); while(v.length<3)v.push('0'); b.version=v.slice(0,3).join('.'); fs.writeFileSync('package.json', JSON.stringify(b, null, 4));"

echo.
echo Project Directory: %cd%
echo.
echo Running electron-builder for Keygen...
echo.

:: Execute the build script from package.json for Keygen
call npm run build:keygen

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Build failed with error code %errorlevel%
    echo Please check the log above for details.
    echo.
    pause
    exit /b %errorlevel%
)

:: Organize Build Artifacts
echo.
echo Organizing Build Artifacts into x32 and x64 folders...
echo.

:: Ensure destination directories exist
if not exist "%~dp0Keygen-win\x32" mkdir "%~dp0Keygen-win\x32"
if not exist "%~dp0Keygen-win\x64" mkdir "%~dp0Keygen-win\x64"

:: Move 32-bit build artifacts
if exist "%~dp0Keygen-win\win-ia32-unpacked" (
    echo Moving 32-bit unpacked folder...
    move /Y "%~dp0Keygen-win\win-ia32-unpacked" "%~dp0Keygen-win\x32\"
)
if exist "%~dp0Keygen-win\Control Panel - Key Generator_v%APP_VERSION%_ia32.msi" (
    echo Moving 32-bit MSI installer...
    move /Y "%~dp0Keygen-win\Control Panel - Key Generator_v%APP_VERSION%_ia32.msi" "%~dp0Keygen-win\x32\"
)
if exist "%~dp0Keygen-win\Control Panel - Key Generator_v%APP_VERSION%_ia32.exe" (
    echo Moving 32-bit Portable executable...
    move /Y "%~dp0Keygen-win\Control Panel - Key Generator_v%APP_VERSION%_ia32.exe" "%~dp0Keygen-win\x32\"
)
if exist "%~dp0Keygen-win\Control Panel - Key Generator Setup_v%APP_VERSION%_ia32.exe" (
    echo Moving 32-bit Setup executable...
    move /Y "%~dp0Keygen-win\Control Panel - Key Generator Setup_v%APP_VERSION%_ia32.exe" "%~dp0Keygen-win\x32\"
)

:: Move 64-bit build artifacts
if exist "%~dp0Keygen-win\win-unpacked" (
    echo Moving 64-bit unpacked folder...
    move /Y "%~dp0Keygen-win\win-unpacked" "%~dp0Keygen-win\x64\"
)
if exist "%~dp0Keygen-win\Control Panel - Key Generator_v%APP_VERSION%_x64.msi" (
    echo Moving 64-bit MSI installer...
    move /Y "%~dp0Keygen-win\Control Panel - Key Generator_v%APP_VERSION%_x64.msi" "%~dp0Keygen-win\x64\"
)
if exist "%~dp0Keygen-win\Control Panel - Key Generator_v%APP_VERSION%_x64.exe" (
    echo Moving 64-bit Portable executable...
    move /Y "%~dp0Keygen-win\Control Panel - Key Generator_v%APP_VERSION%_x64.exe" "%~dp0Keygen-win\x64\"
)
if exist "%~dp0Keygen-win\Control Panel - Key Generator Setup %APP_VERSION%.exe" (
    echo Moving 64-bit Setup executable...
    move /Y "%~dp0Keygen-win\Control Panel - Key Generator Setup %APP_VERSION%.exe" "%~dp0Keygen-win\x64\"
)
if exist "%~dp0Keygen-win\Control Panel - Key Generator %APP_VERSION%.exe" (
    echo Moving 64-bit Portable executable...
    move /Y "%~dp0Keygen-win\Control Panel - Key Generator %APP_VERSION%.exe" "%~dp0Keygen-win\x64\"
)

echo ======================================================
echo   Build Successful! 
echo   Files generated in: %~dp0Keygen-win\
echo ======================================================
echo.
pause
