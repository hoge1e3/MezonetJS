cd /d %~dp0
del gen\MezonetWorker.js
call r_js -o build_senvw.js

del gen\Mezonet.js
call r_js -o build_senvc.js

pause
