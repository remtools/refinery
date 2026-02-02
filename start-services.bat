@echo off
echo Starting Refinery Services...

:: Open Backend in a new window
echo Starting Backend...
start "Refinery Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: Open Frontend in a new window
echo Starting Frontend...
start "Refinery Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both services are starting in separate windows.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3001
pause
