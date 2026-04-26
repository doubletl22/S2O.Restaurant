@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0run-scenario.ps1" %*
exit /b %errorlevel%
