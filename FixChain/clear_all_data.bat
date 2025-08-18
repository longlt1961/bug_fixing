@echo off
REM Batch script để clear tất cả dữ liệu RAG và SonarQube
REM Author: Assistant
REM Usage: Chạy file này để clear tất cả dữ liệu

echo ========================================
echo    FixChain Data Cleaner
echo ========================================
echo.

REM Change to FixChain directory
cd /d "%~dp0"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found! Please install Python first.
    pause
    exit /b 1
)

REM Show current data status
echo 📊 Checking current data status...
echo.
python clear_data.py --status
echo.

REM Ask for confirmation
set /p confirm="🗑️  Do you want to clear ALL data? (y/N): "
if /i not "%confirm%"=="y" (
    echo ❌ Operation cancelled.
    pause
    exit /b 0
)

echo.
echo 🧹 Clearing all data...
echo ========================================

REM Clear all data
python clear_data.py --all --no-confirm

if errorlevel 1 (
    echo.
    echo ❌ Some errors occurred during cleanup.
    echo Please check the output above for details.
) else (
    echo.
    echo ✅ All data cleared successfully!
)

echo.
echo 📊 Final status check...
echo.
python clear_data.py --status

echo.
echo ========================================
echo    Cleanup completed!
echo ========================================
pause