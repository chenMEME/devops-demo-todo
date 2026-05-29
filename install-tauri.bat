@echo off
set "PATH=C:\Users\94839\.rustup\toolchains\stable-x86_64-pc-windows-gnu\lib\rustlib\x86_64-pc-windows-gnu\bin\self-contained;%PATH%"
C:\Users\94839\.cargo\bin\cargo.exe install tauri-cli --version "^2"
echo exit code: %ERRORLEVEL%
