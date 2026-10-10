@echo off
chcp 65001 > nul
title Day KuroMoney Len GitHub
echo ========================================================
echo   💜 ĐẨY CODE KUROMONEY LÊN GITHUB CỦA BẠN 💜
echo ========================================================
echo.
echo Tai khoan Git: tunbebong-creator
echo.
set /p REPO_NAME="Nhap ten Repository ban vua tao tren GitHub (Vi du: kuromoney): "
if "%REPO_NAME%"=="" (
    echo Ban chua nhap ten repository!
    pause
    exit /b
)

git remote remove origin 2>nul
git remote add origin https://github.com/tunbebong-creator/%REPO_NAME%.git
echo.
echo Dang day code len branch main...
git push -u origin main

echo.
echo ========================================================
echo Neu day thanh cong, hay vao Settings -> Pages tren GitHub:
echo Chon Branch: main -> Save
echo Link Web cua ban se la:
echo 👉 https://tunbebong-creator.github.io/%REPO_NAME%/
echo ========================================================
pause
