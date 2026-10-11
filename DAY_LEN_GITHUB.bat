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
git commit -m "Cap nhat dang ky luu tai khoan, lich dong thoi gian thuc va bo data gia"
echo.
echo 3. Dang day code len GitHub...
git push -u origin main --force
echo.
echo ========================================================
echo THANH CONG! Web se tu dong cap nhat tai:
echo https://nguyentomat.github.io/kuromoney/
echo ========================================================
pause
