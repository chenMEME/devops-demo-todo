@echo off
set "VS_INSTALL=D:\vs-buildtools\install"
set "MSVC_VER=14.44.35207"
set "SDK_ROOT=C:\Program Files (x86)\Windows Kits\10"
set "SDK_VER=10.0.26100.0"

:: MSVC 工具链
set "PATH=%VS_INSTALL%\VC\Tools\MSVC\%MSVC_VER%\bin\Hostx64\x64;%PATH%"
set "INCLUDE=%VS_INSTALL%\VC\Tools\MSVC\%MSVC_VER%\include;%VS_INSTALL%\VC\Tools\MSVC\%MSVC_VER%\atlmfc\include"
set "LIB=%VS_INSTALL%\VC\Tools\MSVC\%MSVC_VER%\lib\x64;%VS_INSTALL%\VC\Tools\MSVC\%MSVC_VER%\atlmfc\lib\x64"

:: Windows SDK
set "PATH=%SDK_ROOT%\bin\%SDK_VER%\x64;%PATH%"
set "INCLUDE=%INCLUDE%;%SDK_ROOT%\Include\%SDK_VER%\ucrt;%SDK_ROOT%\Include\%SDK_VER%\um;%SDK_ROOT%\Include\%SDK_VER%\shared;%SDK_ROOT%\Include\%SDK_VER%\winrt"
set "LIB=%LIB%;%SDK_ROOT%\Lib\%SDK_VER%\um\x64;%SDK_ROOT%\Lib\%SDK_VER%\ucrt\x64"

:: Cargo
set "PATH=C:\Users\94839\.cargo\bin;%PATH%"

cd /d D:\Reasonix\tauri-todo
tauri build --bundles wix
echo.
echo Build complete with exit code: %ERRORLEVEL%
