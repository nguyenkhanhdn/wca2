@echo off
chcp 65001 >nul
title DỪNG HỆ THỐNG KIOSK PHƯỜNG SƠN TRÀ
echo ======================================================================
echo    ĐANG DỪNG MÁY CHỦ KIOSK OFFLINE...
echo ======================================================================

:: Dừng tiến trình Python đang chạy cổng 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000" ^| findstr "LISTENING"') do (
    echo - Tìm thấy tiến trình Kiosk PID: %%a, đang dừng...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo - Đã dừng toàn bộ dịch vụ Kiosk thành công.
echo ======================================================================
pause
