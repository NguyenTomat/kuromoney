@echo off
chcp 65001 >nul
cls
echo ========================================================
echo   DAY CODE KUROMONEY LEN GITHUB: NguyenTomat/kuromoney
echo ========================================================
echo.
echo 1. Dang them file vao Git...
git add .
echo.
echo 2. Dang commit code moi nhat...
git commit -m "Sua loi vo anh toast va cap nhat OneSignal"
echo.
echo 3. Dang day code len GitHub...
git push origin main
echo.
echo ========================================================
echo THANH CONG! Web se tu dong cap nhat tai:
echo https://nguyentomat.github.io/kuromoney/
echo ========================================================
pause
