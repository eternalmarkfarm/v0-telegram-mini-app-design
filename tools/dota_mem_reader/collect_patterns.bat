@echo off
setlocal

set "OUT_DIR=collector_output"

if not exist "%OUT_DIR%" mkdir "%OUT_DIR%"

powershell -NoProfile -Command "& .\build\Release\dota_mem_reader.exe --collect --out %OUT_DIR%"

echo.
echo Collector finished. Output: %OUT_DIR%
echo - client.dll
if exist "%OUT_DIR%\info.txt" type "%OUT_DIR%\info.txt"

echo.
echo Send the collector_output folder for pattern generation.
echo Press any key to close.
pause >nul
endlocal
