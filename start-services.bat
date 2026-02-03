@echo off
echo Starting Refinery Services...

:: Read configuration from config.json
for /f "tokens=2 delims=:, " %%a in ('findstr "port" "%~dp0config.json" ^| findstr "server" -A 1') do set PORT=%%a

:: Open Backend in a new window
echo Starting Backend...
start "Refinery Backend" cmd /k "cd /d %~dp0backend && npm run dev"

:: Open Frontend in a new window
echo Starting Frontend...
start "Refinery Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Both services are starting in separate windows.
echo Check config.json for the actual ports being used.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3000
pause
