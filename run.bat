@echo off
title CloudShield - AI Insider Threat Platform
echo ======================================================================
echo          CloudShield - AI Insider Threat Detection Platform           
echo ======================================================================
echo.

:: Ensure Python and Node are on PATH
set PATH=C:\Users\Asus\AppData\Local\Programs\Python\Python311;C:\Users\Asus\AppData\Local\Programs\Python\Python311\Scripts;C:\Users\Asus\AppData\Local\Microsoft\WinGet\Packages\OpenJS.NodeJS.LTS_Microsoft.Winget.Source_8wekyb3d8bbwe\node-v24.20.0-win-x64;%PATH%

echo [1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "CloudShield Backend" cmd /k "cd /d %~dp0 && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting React Vite Frontend on http://localhost:5173 ...
start "CloudShield Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ======================================================================
echo  CloudShield is now starting!
echo  - Frontend: http://localhost:5173
echo  - Backend API: http://127.0.0.1:8000
echo  - API Docs (Swagger): http://127.0.0.1:8000/docs
echo  - Demo Credentials: admin / cloudshield2026
echo ======================================================================
echo.
