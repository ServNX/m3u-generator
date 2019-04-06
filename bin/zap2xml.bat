@echo off
set user=%1
set pass=%2
IF NOT EXIST %~dp0\zap2xml.exe (
    START /WAIT %~dp0\zapinstall.exe
)
%~dp0\zap2xml.exe -I -O -u %user% -p %pass% -U UTF-8