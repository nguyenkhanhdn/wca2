@echo off
chcp 65001 >nul
title CÀI ĐẶT HỆ THỐNG KIOSK DỊCH VỤ CÔNG PHƯỜNG SƠN TRÀ (OFFLINE)
color 1F

echo ======================================================================
echo    ỦY BAN NHÂN DÂN PHƯỜNG SƠN TRÀ - THÀNH PHỐ ĐÀ NẴNG
echo    BỘ CÀI ĐẶT HỆ THỐNG KIOSK MỘT CỬA OFFLINE STANDALONE
echo ======================================================================
echo.

:: 1. Kiểm tra Python
echo [1/3] Đang kiểm tra môi trường Python trên máy tính...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo [LỖI] Máy tính chưa cài đặt Python!
    echo Vui lòng tải và cài đặt Python 3.9 - 3.12 từ trang python.org
    echo Lưu ý: Hãy tích chọn ô "Add Python to PATH" khi cài đặt.
    echo.
    pause
    exit /b 1
)

python --version
echo - Đã tìm thấy Python sẵn sàng.
echo.

:: 2. Tạo môi trường ảo venv độc lập (Không ảnh hưởng phần mềm khác)
echo [2/3] Đang khởi tạo môi trường chạy độc lập (Virtual Environment)...
if not exist "venv" (
    python -m venv venv
    echo - Đã tạo thư mục môi trường ảo venv thành công.
) else (
    echo - Môi trường ảo venv đã tồn tại sẵn.
)
echo.

:: 3. Cài đặt các thư viện cần thiết (Flask, Jinja2, Werkzeug)
echo [3/3] Đang cài đặt các gói phụ thuộc từ requirements.txt...
call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo ======================================================================
echo    CÀI ĐẶT HOÀN TẤT THÀNH CÔNG!
echo    Bác có thể khởi chạy Kiosk bằng cách nhấp đúp vào:
echo    ==> "CHAY_KIOSK_OFFLINE.bat"
echo ======================================================================
echo.
pause
