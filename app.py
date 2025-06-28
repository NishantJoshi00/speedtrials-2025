#!/usr/bin/env python3
"""
Georgia Water Quality Dashboard
A public-facing web application to make water quality data accessible
"""

import pandas as pd
import sqlite3
from flask import Flask, render_template, request, jsonify
import os
from datetime import datetime
import json

app = Flask(__name__)

# Database setup
DB_PATH = 'water_data.db'

def init_database():
    """Initialize SQLite database and load CSV data"""
    conn = sqlite3.connect(DB_PATH)
    
    # Load water systems data
    systems_df = pd.read_csv('data/SDWA_PUB_WATER_SYSTEMS.csv')
    systems_df.to_sql('water_systems', conn, if_exists='replace', index=False)
    
    # Load violations data
    violations_df = pd.read_csv('data/SDWA_VIOLATIONS_ENFORCEMENT.csv')
    violations_df.to_sql('violations', conn, if_exists='replace', index=False)
    
    # Load geographic areas
    geo_df = pd.read_csv('data/SDWA_GEOGRAPHIC_AREAS.csv')
    geo_df.to_sql('geographic_areas', conn, if_exists='replace', index=False)
    
    # Load reference codes
    ref_df = pd.read_csv('data/SDWA_REF_CODE_VALUES.csv')
    ref_df.to_sql('reference_codes', conn, if_exists='replace', index=False)
    
    conn.close()
    print("Database initialized successfully!")

def get_readable_violation_code(violation_code):
    """Convert violation codes to human-readable descriptions"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT VALUE_DESCRIPTION 
        FROM reference_codes 
        WHERE VALUE_TYPE = 'VIOLATION_CODE' AND VALUE_CODE = ?
    """, (violation_code,))
    
    result = cursor.fetchone()
    conn.close()
    
    return result[0] if result else f"Violation Code {violation_code}"

@app.route('/')
def index():
    """Home page with search functionality"""
    return render_template('index.html')

@app.route('/api/search')
def search_water_systems():
    """API endpoint to search water systems by location"""
    query = request.args.get('q', '').strip()
    
    if not query:
        return jsonify([])
    
    conn = sqlite3.connect(DB_PATH)
    
    # Search by city or water system name
    sql = """
        SELECT DISTINCT 
            ws.PWSID,
            ws.PWS_NAME,
            ws.POPULATION_SERVED_COUNT,
            ws.PWS_TYPE_CODE,
            ws.PRIMARY_SOURCE_CODE,
            ga.CITY_SERVED,
            ga.COUNTY_SERVED,
            ws.PHONE_NUMBER
        FROM water_systems ws
        LEFT JOIN geographic_areas ga ON ws.PWSID = ga.PWSID
        WHERE (
            UPPER(ws.PWS_NAME) LIKE UPPER(?) OR
            UPPER(ga.CITY_SERVED) LIKE UPPER(?) OR
            UPPER(ga.COUNTY_SERVED) LIKE UPPER(?)
        )
        AND ws.PWS_ACTIVITY_CODE = 'A'
        ORDER BY ws.POPULATION_SERVED_COUNT DESC
        LIMIT 20
    """
    
    search_term = f"%{query}%"
    results = pd.read_sql_query(sql, conn, params=[search_term, search_term, search_term])
    conn.close()
    
    return jsonify(results.to_dict('records'))

@app.route('/api/system/<pwsid>')
def get_system_details(pwsid):
    """Get detailed information about a specific water system"""
    conn = sqlite3.connect(DB_PATH)
    
    # Get system basic info
    system_sql = """
        SELECT 
            ws.*,
            ga.CITY_SERVED,
            ga.COUNTY_SERVED
        FROM water_systems ws
        LEFT JOIN geographic_areas ga ON ws.PWSID = ga.PWSID
        WHERE ws.PWSID = ?
        LIMIT 1
    """
    
    system_info = pd.read_sql_query(system_sql, conn, params=[pwsid])
    
    if system_info.empty:
        conn.close()
        return jsonify({'error': 'System not found'}), 404
    
    # Get violations
    violations_sql = """
        SELECT 
            VIOLATION_CODE,
            VIOLATION_CATEGORY_CODE,
            IS_HEALTH_BASED_IND,
            CONTAMINANT_CODE,
            NON_COMPL_PER_BEGIN_DATE,
            NON_COMPL_PER_END_DATE,
            VIOLATION_STATUS,
            PUBLIC_NOTIFICATION_TIER
        FROM violations
        WHERE PWSID = ?
        ORDER BY NON_COMPL_PER_BEGIN_DATE DESC
        LIMIT 10
    """
    
    violations = pd.read_sql_query(violations_sql, conn, params=[pwsid])
    conn.close()
    
    # Format the response
    system = system_info.iloc[0].to_dict()
    
    # Clean up null values
    for key, value in system.items():
        if pd.isna(value):
            system[key] = None
    
    response = {
        'system': system,
        'violations': violations.to_dict('records'),
        'violation_count': len(violations),
        'recent_violations': len(violations[violations['VIOLATION_STATUS'] != 'Resolved'])
    }
    
    return jsonify(response)

@app.route('/system/<pwsid>')
def system_detail_page(pwsid):
    """Detailed page for a specific water system"""
    return render_template('system_detail.html', pwsid=pwsid)

if __name__ == '__main__':
    # Initialize database if it doesn't exist
    if not os.path.exists(DB_PATH):
        print("Initializing database...")
        init_database()
    
    app.run(debug=True, host='0.0.0.0', port=5000)