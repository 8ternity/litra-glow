@echo off
echo %date% %time% - Plugin batch starting > "%~dp0plugin-batch.log"
echo Arguments: %* >> "%~dp0plugin-batch.log"
echo Current directory: %cd% >> "%~dp0plugin-batch.log"
echo Node version: >> "%~dp0plugin-batch.log"
node --version >> "%~dp0plugin-batch.log" 2>&1
echo Starting plugin... >> "%~dp0plugin-batch.log"
node "%~dp0plugin.js" %* >> "%~dp0plugin-batch.log" 2>&1
echo Plugin ended with code: %ERRORLEVEL% >> "%~dp0plugin-batch.log" 