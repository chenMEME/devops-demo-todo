@echo off
title 📋 待办事项 — 卸载

set "APP_DIR=%LOCALAPPDATA%\待办事项"
set "DESKTOP_LNK=%USERPROFILE%\Desktop\📋 待办事项.lnk"

echo ============================================
echo   📋 待办事项 — 卸载程序
echo ============================================
echo.

if not exist "%APP_DIR%" (
    echo 未找到安装目录: %APP_DIR%
    echo 程序可能已经卸载或未安装。
    pause
    exit /b
)

echo 将删除:
echo   %APP_DIR%
echo   %DESKTOP_LNK%
echo.
choice /c YN /m "确认卸载?"
if errorlevel 2 goto :EOF

del "%DESKTOP_LNK%" 2>nul
rmdir /s /q "%APP_DIR%" 2>nul

echo.
echo ✅ 卸载完成。
echo 如果通过 MSI 安装，建议也在控制面板中卸载。
pause
