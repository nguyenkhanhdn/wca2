@echo off
chcp 65001 >nul
title KHỞI CHẠY KIOSK DỊCH VỤ CÔNG PHƯỜNG SƠN TRÀ (OFFLINE)
color 0A

echo ======================================================================
echo    ỦY BAN NHÂN DÂN PHƯỜNG SƠN TRÀ - THÀNH PHỐ ĐÀ NẴNG
echo    ĐANG KHỞI CHẠY HỆ THỐNG KIOSK TRA CỨU & TRỢ LÝ AI OFFLINE
echo ======================================================================
echo.

:: Chuyển đến thư mục chứa file .bat
cd /d "%~dp0"

:: Kích hoạt môi trường venv nếu có, hoặc dùng python toàn cục
if exist "venv\Scripts\activate.bat" (
    echo [1/3] Kích hoạt môi trường ảo venv...
    call venv\Scripts\activate.bat
)

:: Khởi chạy máy chủ Flask SQLite ngầm
echo [2/3] Đang khởi động máy chủ ứng dụng Kiosk Một cửa...
start /B python app.py

:: Chờ 2 giây để máy chủ nạp cơ sở dữ liệu SQLite
timeout /t 2 /nobreak >nul

:: Mở trình duyệt ở chế độ Toàn màn hình Kiosk (Microsoft Edge hoặc Google Chrome)
echo [3/3] Đang mở giao diện Kiosk toàn màn hình cảm ứng...

set BROWSER_FOUND=0

:: Thử Microsoft Edge trước (có sẵn trên mọi máy tính Windows 10/11)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --kiosk http://localhost:5000 --edge-kiosk-type=fullscreen --no-first-run --disable-translate
    set BROWSER_FOUND=1
) else if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --kiosk http://localhost:5000 --edge-kiosk-type=fullscreen --no-first-run --disable-translate
    set BROWSER_FOUND=1
)

:: Nếu không tìm thấy Edge, thử Google Chrome
if %BROWSER_FOUND% equ 0 (
    if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
        start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --kiosk http://localhost:5000 --no-first-run
        set BROWSER_FOUND=1
    ) else if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
        start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --kiosk http://localhost:5000 --no-first-run
        set BROWSER_FOUND=1
    )
)

:: Nếu không có sẵn đường dẫn mặc định, mở trình duyệt mặc định
if %BROWSER_FOUND% equ 0 (
    start http://localhost:5000
)

echo.
echo ======================================================================
echo    HỆ THỐNG KIOSK ĐANG HOẠT ĐỘNG TẠI: http://localhost:5000
echo.
echo    - Để tắt ứng dụng: Nhấn phím Alt + F4 hoặc nhấp đúp file DUNG_KIOSK.bat
echo    - Cửa sổ này có thể thu nhỏ xuống thanh taskbar.
echo ======================================================================
echo.
pause
