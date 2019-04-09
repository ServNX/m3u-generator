@echo off
set user=%1
set pass=%2
%~dp0\zap2xml.exe -I -O -u %user% -p %pass% -U UTF-8
exit 0