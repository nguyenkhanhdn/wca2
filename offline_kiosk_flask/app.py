#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Trợ lý Dịch vụ công Một cửa & Bản đồ số Phường Sơn Trà
Phiên bản Offline Standalone cho Windows (Flask + SQLite + Tailwind)
Không phụ thuộc internet, hoạt động độc lập trên máy Kiosk.
"""

import os
import json
from flask import Flask, render_template, request, jsonify, redirect, url_for, send_file
import database
from ai_assistant import analyze_citizen_speech

app = Flask(__name__)
app.config['SECRET_KEY'] = 'sontra-kiosk-offline-secret-key-2026'

# Khởi tạo cơ sở dữ liệu SQLite khi khởi động
database.init_db()

@app.context_processor
def inject_global_data():
    """Cung cấp dữ liệu dùng chung (Phường Sơn Trà) cho mọi template"""
    ward = database.get_ward('ward-sontra') or {
        'id': 'ward-sontra',
        'name': 'Phường Sơn Trà',
        'district': 'Thành phố Đà Nẵng',
        'city': 'Thành phố Đà Nẵng',
        'address': 'Số 06 Nguyễn Phan Vinh, phường Sơn Trà, thành phố Đà Nẵng',
        'hotline': '0913 415 457',
        'working_hours': 'Sáng 07h30 - 11h30 | Chiều 13h30 - 17h00'
    }
    return dict(current_ward=ward)

# --- Trang giao diện Kiosk ---

@app.route('/')
def standby_screen():
    """Màn hình chờ Kiosk"""
    counters = database.get_counters('ward-sontra')
    services = database.get_services('ward-sontra')
    return render_template('standby.html', counters=counters, services=services)

@app.route('/citizen')
def citizen_home():
    """Trang tra cứu thủ tục cho người dân và người cao tuổi"""
    category = request.args.get('category', 'all')
    search = request.args.get('search', '').strip().lower()

    services = database.get_services('ward-sontra')
    counters = database.get_counters('ward-sontra')
    counter_map = {c['id']: c for c in counters}

    filtered_services = []
    for s in services:
        if category != 'all' and s.get('category') != category:
            continue
        if search:
            name = s.get('name', '').lower()
            code = s.get('code', '').lower()
            summary = s.get('summary', '').lower()
            keywords = ' '.join(s.get('searchKeywords', [])).lower()
            if search not in name and search not in code and search not in summary and search not in keywords:
                continue
        s['counter'] = counter_map.get(s.get('counterId'))
        filtered_services.append(s)

    return render_template(
        'citizen.html',
        services=filtered_services,
        selected_category=category,
        search_query=search,
        counters=counters
    )

@app.route('/service/<service_id>')
def service_detail(service_id):
    """Trang chi tiết quy trình, hồ sơ, lệ phí và hướng dẫn in phiếu"""
    service = database.get_service(service_id)
    if not service:
        return redirect(url_for('citizen_home'))

    counter = database.get_counter(service.get('counterId'))
    officer = None
    if counter and counter.get('officerId'):
        officer = database.get_officer(counter.get('officerId'))

    # Các thủ tục liên quan cùng ô
    all_services = database.get_services('ward-sontra')
    related_services = [s for s in all_services if s.get('counterId') == service.get('counterId') and s['id'] != service_id]

    return render_template(
        'service_detail.html',
        service=service,
        counter=counter,
        officer=officer,
        related_services=related_services
    )

@app.route('/mindmap')
def mindmap_view():
    """Sơ đồ tiếp nhận 8 ô và chuyên viên phụ trách"""
    counters = database.get_counters('ward-sontra')
    officers = database.get_officers('ward-sontra')
    services = database.get_services('ward-sontra')
    return render_template('mindmap.html', counters=counters, officers=officers, services=services)

@app.route('/admin')
def admin_panel():
    """Bảng quản trị cho cán bộ ủy ban phường"""
    counters = database.get_counters('ward-sontra')
    officers = database.get_officers('ward-sontra')
    services = database.get_services('ward-sontra')
    ward = database.get_ward('ward-sontra')
    return render_template('admin.html', counters=counters, officers=officers, services=services, ward=ward)

# --- API Endpoints ---

@app.route('/api/ai-assistant', methods=['POST'])
def api_ai_assistant():
    """API nhận diện giọng nói và câu hỏi của công dân"""
    data = request.get_json() or {}
    query = data.get('query', '').strip()

    services = database.get_services('ward-sontra')
    counters = database.get_counters('ward-sontra')
    officers = database.get_officers('ward-sontra')
    ward = database.get_ward('ward-sontra')

    result = analyze_citizen_speech(query, services, counters, officers, ward)
    return jsonify(result)

@app.route('/api/services', methods=['GET'])
def api_get_services():
    services = database.get_services('ward-sontra')
    return jsonify(services)

@app.route('/api/services/<service_id>', methods=['GET'])
def api_get_service(service_id):
    service = database.get_service(service_id)
    if not service:
        return jsonify({'error': 'Thủ tục không tồn tại'}), 404
    return jsonify(service)

@app.route('/api/services/<service_id>', methods=['PUT', 'POST'])
def api_update_service(service_id):
    data = request.get_json() or {}
    database.update_service(service_id, data)
    return jsonify({'success': True, 'message': 'Cập nhật thủ tục thành công!'})

@app.route('/api/reset', methods=['POST'])
def api_reset_db():
    database.init_db(force_reseed=True)
    return jsonify({'success': True, 'message': 'Đã khôi phục dữ liệu mặc định thành công!'})

@app.route('/api/backup', methods=['GET'])
def api_export_backup():
    data = {
        'wards': database.get_wards(),
        'counters': database.get_counters('ward-sontra'),
        'officers': database.get_officers('ward-sontra'),
        'services': database.get_services('ward-sontra')
    }
    return jsonify(data)

if __name__ == '__main__':
    # Chạy trên port 5000 để độc lập, hỗ trợ mọi thiết bị trong mạng LAN/Kiosk
    print("=" * 65)
    print("UBND PHƯỜNG SƠN TRÀ - TRỢ LÝ DỊCH VỤ CÔNG MỘT CỬA")
    print("Phiên bản Offline Standalone cho Windows")
    print("Đang chạy máy chủ tại: http://localhost:5000")
    print("=" * 65)
    app.run(host='0.0.0.0', port=5000, debug=False)
