:begin

cd /d %~dp0

del gen\Mezonet.js
call r_js -o build_senv.js

pause
goto begin
