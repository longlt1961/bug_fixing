@echo off
REM RAG Evaluation Runner Script
REM Script để chạy toàn bộ quy trình đánh giá RAG

echo ========================================
echo RAG Evaluation Test Suite
echo ========================================
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ and try again
    pause
    exit /b 1
)

REM Change to test_scripts directory
cd /d "%~dp0"

REM Check if required files exist
if not exist "comprehensive_rag_evaluation.py" (
    echo ERROR: comprehensive_rag_evaluation.py not found
    echo Please ensure you're in the correct directory
    pause
    exit /b 1
)

echo Current directory: %CD%
echo.

REM Menu for user selection
:menu
echo Select evaluation mode:
echo 1. Quick Demo (test basic functionality)
echo 2. Comprehensive Evaluation (full test suite)
echo 3. Bug Detection Only
echo 4. Fix Suggestions Only
echo 5. Code Quality Analysis Only
echo 6. Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto quick_demo
if "%choice%"=="2" goto comprehensive
if "%choice%"=="3" goto bug_detection
if "%choice%"=="4" goto fix_suggestions
if "%choice%"=="5" goto code_quality
if "%choice%"=="6" goto exit

echo Invalid choice. Please try again.
echo.
goto menu

:quick_demo
echo.
echo ========================================
echo Running Quick Demo
echo ========================================
echo.
echo This will test basic RAG functionality with sample data...
echo.
python quick_demo.py
if errorlevel 1 (
    echo.
    echo Demo failed! Please check the error messages above.
    echo Make sure MongoDB and FixChain API are running.
) else (
    echo.
    echo Demo completed successfully!
)
echo.
pause
goto menu

:comprehensive
echo.
echo ========================================
echo Running Comprehensive Evaluation
echo ========================================
echo.
echo This will run the full evaluation suite...
echo Please ensure the following services are running:
echo - MongoDB (port 27017)
echo - FixChain API (port 8002)
echo - SonarQube (port 9000)
echo.
set /p source_dir="Enter source directory to analyze (or press Enter for current): "
if "%source_dir%"=="" set source_dir=%CD%

set /p max_bugs="Enter max bugs to test (default 10): "
if "%max_bugs%"=="" set max_bugs=10

set /p sonar_token="Enter SonarQube token (optional): "

echo.
echo Starting comprehensive evaluation...
echo Source directory: %source_dir%
echo Max bugs: %max_bugs%
echo.

if "%sonar_token%"=="" (
    python comprehensive_rag_evaluation.py --source-dir "%source_dir%" --max-bugs %max_bugs%
) else (
    python comprehensive_rag_evaluation.py --source-dir "%source_dir%" --max-bugs %max_bugs% --sonar-token "%sonar_token%"
)

if errorlevel 1 (
    echo.
    echo Evaluation failed! Please check the error messages above.
) else (
    echo.
    echo Evaluation completed successfully!
    echo Check the generated report files for detailed results.
)
echo.
pause
goto menu

:bug_detection
echo.
echo ========================================
echo Running Bug Detection Evaluation
echo ========================================
echo.
echo This will evaluate RAG effectiveness in bug detection...
echo.
python automated_rag_evaluation.py
if errorlevel 1 (
    echo.
    echo Bug detection evaluation failed!
) else (
    echo.
    echo Bug detection evaluation completed!
)
echo.
pause
goto menu

:fix_suggestions
echo.
echo ========================================
echo Running Fix Suggestions Evaluation
echo ========================================
echo.
echo This will evaluate fix suggestion quality...
echo.
python fix_suggestion_evaluator.py
if errorlevel 1 (
    echo.
    echo Fix suggestions evaluation failed!
) else (
    echo.
    echo Fix suggestions evaluation completed!
)
echo.
pause
goto menu

:code_quality
echo.
echo ========================================
echo Running Code Quality Analysis
echo ========================================
echo.
echo This will analyze code quality improvements...
echo.
python code_quality_analyzer.py
if errorlevel 1 (
    echo.
    echo Code quality analysis failed!
) else (
    echo.
    echo Code quality analysis completed!
)
echo.
pause
goto menu

:exit
echo.
echo Thank you for using RAG Evaluation Test Suite!
echo.
pause
exit /b 0