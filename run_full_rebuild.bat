@echo off
title Rebuild Full Healthcare NLP Pipeline - Group 6
echo =================================================================
echo   Rebuilding Full Healthcare NLP System (Group 6)
echo =================================================================
echo.

python run_full_rebuild.py

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Rebuild failed with an error.
    pause
) else (
    echo.
    pause
)
