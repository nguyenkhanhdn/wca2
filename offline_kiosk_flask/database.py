import sqlite3
import json
import os
from typing import Dict, List, Any, Optional

DB_FILE = os.path.join(os.path.dirname(__file__), 'dvc_sontra.db')
INITIAL_DATA_FILE = os.path.join(os.path.dirname(__file__), 'data', 'initial_data.json')

def get_db_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db(force_reseed: bool = False):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS wards (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        district TEXT,
        city TEXT,
        address TEXT,
        hotline TEXT,
        working_hours TEXT,
        support_officer TEXT,
        description TEXT
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS counters (
        id TEXT PRIMARY KEY,
        ward_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        officer_id TEXT,
        officer_name TEXT,
        primary_field TEXT,
        description TEXT,
        position_number INTEGER DEFAULT 1,
        color_theme TEXT DEFAULT 'blue',
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS officers (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT,
        counter_id TEXT,
        ward_id TEXT NOT NULL,
        phone TEXT,
        avatar_url TEXT,
        fields_json TEXT,
        primary_duties_json TEXT,
        concurrent_roles_json TEXT,
        badge_color TEXT DEFAULT 'blue',
        FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS services (
        id TEXT PRIMARY KEY,
        ward_id TEXT NOT NULL,
        code TEXT NOT NULL,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        level TEXT DEFAULT 'Toàn trình',
        counter_id TEXT,
        summary TEXT,
        processing_duration TEXT,
        fee TEXT,
        required_documents_json TEXT,
        steps_json TEXT,
        audio_script TEXT,
        legal_basis_json TEXT,
        faq_json TEXT,
        search_keywords_json TEXT,
        national_portal_url TEXT,
        is_popular INTEGER DEFAULT 0,
        FOREIGN KEY (ward_id) REFERENCES wards(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS app_settings (
        key TEXT PRIMARY KEY,
        value TEXT
    );
    """)

    conn.commit()

    # Check if empty or forced reseed
    cursor.execute("SELECT COUNT(*) FROM services")
    count = cursor.fetchone()[0]

    if count == 0 or force_reseed:
        seed_data(conn)

    conn.close()

def seed_data(conn: sqlite3.Connection):
    cursor = conn.cursor()
    if not os.path.exists(INITIAL_DATA_FILE):
        return

    with open(INITIAL_DATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Clean existing data if reseeding
    cursor.execute("DELETE FROM services")
    cursor.execute("DELETE FROM officers")
    cursor.execute("DELETE FROM counters")
    cursor.execute("DELETE FROM wards")

    # 1. Insert Wards
    for w in data.get('wards', []):
        cursor.execute("""
        INSERT OR REPLACE INTO wards (id, name, district, city, address, hotline, working_hours, support_officer, description)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            w['id'], w['name'], w.get('district', ''), w.get('city', ''),
            w.get('address', ''), w.get('hotline', ''), w.get('workingHours', ''),
            w.get('supportOfficer', ''), w.get('description', '')
        ))

    # 2. Insert Counters
    for c in data.get('counters', []):
        cursor.execute("""
        INSERT OR REPLACE INTO counters (id, ward_id, code, name, officer_id, officer_name, primary_field, description, position_number, color_theme, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            c['id'], c['wardId'], c['code'], c['name'], c.get('officerId', ''),
            c.get('officerName', ''), c.get('primaryField', ''), c.get('description', ''),
            c.get('positionNumber', 1), c.get('colorTheme', 'blue'), 1 if c.get('isActive', True) else 0
        ))

    # 3. Insert Officers
    for o in data.get('officers', []):
        cursor.execute("""
        INSERT OR REPLACE INTO officers (id, name, title, counter_id, ward_id, phone, avatar_url, fields_json, primary_duties_json, concurrent_roles_json, badge_color)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            o['id'], o['name'], o.get('title', ''), o.get('counterId', ''), o['wardId'],
            o.get('phone', ''), o.get('avatarUrl', ''),
            json.dumps(o.get('fields', []), ensure_ascii=False),
            json.dumps(o.get('primaryDuties', []), ensure_ascii=False),
            json.dumps(o.get('concurrentRoles', []), ensure_ascii=False),
            o.get('badgeColor', 'blue')
        ))

    # 4. Insert Services
    for s in data.get('services', []):
        cursor.execute("""
        INSERT OR REPLACE INTO services (
            id, ward_id, code, name, category, level, counter_id, summary, 
            processing_duration, fee, required_documents_json, steps_json, 
            audio_script, legal_basis_json, faq_json, search_keywords_json, 
            national_portal_url, is_popular
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            s['id'], s['wardId'], s['code'], s['name'], s['category'], s.get('level', 'Toàn trình'),
            s.get('counterId', ''), s.get('summary', ''), s.get('processingDuration', ''), s.get('fee', ''),
            json.dumps(s.get('requiredDocuments', []), ensure_ascii=False),
            json.dumps(s.get('steps', []), ensure_ascii=False),
            s.get('audioScript', ''),
            json.dumps(s.get('legalBasis', []), ensure_ascii=False),
            json.dumps(s.get('faq', []), ensure_ascii=False),
            json.dumps(s.get('searchKeywords', []), ensure_ascii=False),
            s.get('nationalPortalUrl', ''),
            1 if s.get('isPopular', False) else 0
        ))

    conn.commit()

# --- Helper Query Functions ---

def _normalize_counter(d: Dict[str, Any]) -> Dict[str, Any]:
    d['positionNumber'] = d.get('position_number')
    d['officerName'] = d.get('officer_name')
    d['officerId'] = d.get('officer_id')
    d['wardId'] = d.get('ward_id')
    d['primaryField'] = d.get('primary_field')
    d['colorTheme'] = d.get('color_theme')
    d['isActive'] = bool(d.get('is_active', 1))
    return d

def _normalize_ward(d: Dict[str, Any]) -> Dict[str, Any]:
    d['workingHours'] = d.get('working_hours')
    d['supportOfficer'] = d.get('support_officer')
    return d

def _normalize_officer(d: Dict[str, Any]) -> Dict[str, Any]:
    d['counterId'] = d.get('counter_id')
    d['phoneNumber'] = d.get('phone_number')
    d['avatarUrl'] = d.get('avatar_url')
    d['fields'] = json.loads(d.get('fields_json') or '[]')
    d['primaryDuties'] = json.loads(d.get('primary_duties_json') or '[]')
    d['concurrentRoles'] = json.loads(d.get('concurrent_roles_json') or '[]')
    return d

def _normalize_service(d: Dict[str, Any]) -> Dict[str, Any]:
    d['counterId'] = d.get('counter_id')
    d['wardId'] = d.get('ward_id')
    d['processingDuration'] = d.get('processing_duration')
    d['audioScript'] = d.get('audio_script')
    d['isPopular'] = bool(d.get('is_popular', 0))
    d['requiredDocuments'] = json.loads(d.get('required_documents_json') or '[]')
    d['steps'] = json.loads(d.get('steps_json') or '[]')
    d['legalBasis'] = json.loads(d.get('legal_basis_json') or '[]')
    d['faq'] = json.loads(d.get('faq_json') or '[]')
    d['searchKeywords'] = json.loads(d.get('search_keywords_json') or '[]')
    return d

def get_wards() -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM wards").fetchall()
    conn.close()
    return [_normalize_ward(dict(r)) for r in rows]

def get_ward(ward_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM wards WHERE id = ?", (ward_id,)).fetchone()
    conn.close()
    return _normalize_ward(dict(row)) if row else None

def get_counters(ward_id: str = 'ward-sontra') -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM counters WHERE ward_id = ? ORDER BY position_number ASC", (ward_id,)).fetchall()
    conn.close()
    return [_normalize_counter(dict(r)) for r in rows]

def get_counter(counter_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM counters WHERE id = ?", (counter_id,)).fetchone()
    conn.close()
    return _normalize_counter(dict(row)) if row else None

def get_officers(ward_id: str = 'ward-sontra') -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM officers WHERE ward_id = ?", (ward_id,)).fetchall()
    conn.close()
    return [_normalize_officer(dict(r)) for r in rows]

def get_officer(officer_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM officers WHERE id = ?", (officer_id,)).fetchone()
    conn.close()
    return _normalize_officer(dict(row)) if row else None

def get_services(ward_id: str = 'ward-sontra') -> List[Dict[str, Any]]:
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM services WHERE ward_id = ?", (ward_id,)).fetchall()
    conn.close()
    return [_normalize_service(dict(r)) for r in rows]

def get_service(service_id: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    row = conn.execute("SELECT * FROM services WHERE id = ?", (service_id,)).fetchone()
    conn.close()
    return _normalize_service(dict(row)) if row else None

def update_service(service_id: str, data: Dict[str, Any]) -> bool:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE services SET
        name = ?,
        code = ?,
        category = ?,
        level = ?,
        counter_id = ?,
        summary = ?,
        processing_duration = ?,
        fee = ?,
        audio_script = ?,
        national_portal_url = ?,
        is_popular = ?
    WHERE id = ?
    """, (
        data.get('name'), data.get('code'), data.get('category'), data.get('level', 'Toàn trình'),
        data.get('counter_id'), data.get('summary'), data.get('processing_duration'),
        data.get('fee'), data.get('audio_script'), data.get('national_portal_url'),
        1 if data.get('is_popular') else 0,
        service_id
    ))
    conn.commit()
    conn.close()
    return True
