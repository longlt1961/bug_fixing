@echo off
REM Script để khởi động sonar-scanner container

echo Starting sonar-scanner container...
docker-compose --profile tools up -d sonar-scanner

if %ERRORLEVEL% EQU 0 (
    echo Sonar-scanner container started successfully!
    echo You can now run scans faster using the existing container.
) else (
    echo Failed to start sonar-scanner container
    exit /b 1
)

echo.
echo Container status:
docker ps --filter "name=sonar_scanner"