@echo off
title Healthcare Text Intelligence System - Group 6
echo =================================================================
echo   Launching Healthcare Text Intelligence System (Group 6)
echo =================================================================
echo.

python run_app.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Server stopped with error or was closed.
    pause
)
