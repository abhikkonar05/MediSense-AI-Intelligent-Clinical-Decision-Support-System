@echo off
title MediSense AI Unified Launcher
echo ===================================================
echo     Welcome to MediSense AI Control Center 
echo ===================================================
echo.

:: Step 1: Install Python dependencies
echo [1/4] Checking and installing Python backend requirements...
python -m pip install -r backend/requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Python dependencies installation failed. Please check your Python installation.
    pause
    exit /b %errorlevel%
)
echo.

:: Step 2: Clean datasets and train models
echo [2/4] Executing clinical ML training and data cleansing pipelines...
python backend/app/ml_pipeline/train.py
if %errorlevel% neq 0 (
    echo [ERROR] ML training pipeline failed.
    pause
    exit /b %errorlevel%
)
echo.

:: Step 3: Launch FastAPI Backend Service
echo [3/4] Starting FastAPI Clinical API backend on http://127.0.0.1:8000...
start "MediSense Backend" /b uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000
echo [INFO] Backend active in background thread.
echo.

:: Step 4: Launch Vite React Frontend
echo [4/4] Starting Vite React + TypeScript Frontend on http://localhost:5173...
cd frontend
npm run dev

pause
