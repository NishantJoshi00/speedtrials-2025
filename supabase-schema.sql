-- Georgia Water Quality Dashboard - Supabase Schema
-- Optimized for mobile map visualization and public access

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Reference codes table for translating system codes to human-readable text
CREATE TABLE reference_codes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    value_type TEXT NOT NULL,
    value_code TEXT NOT NULL,
    value_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(value_type, value_code)
);

-- Main water systems table
CREATE TABLE water_systems (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pwsid TEXT UNIQUE NOT NULL,
    pws_name TEXT NOT NULL,
    primacy_agency_code TEXT,
    epa_region TEXT,
    pws_activity_code TEXT DEFAULT 'A', -- A=Active, I=Inactive
    pws_type_code TEXT, -- CWS, NTNCWS, TNCWS
    owner_type_code TEXT, -- F=Federal, L=Local, P=Private, etc.
    population_served_count INTEGER,
    primary_source_code TEXT, -- GW, SW, GWP, SWP
    phone_number TEXT,
    email_addr TEXT,
    admin_name TEXT,
    address_line1 TEXT,
    city_name TEXT,
    state_code TEXT DEFAULT 'GA',
    zip_code TEXT,
    is_active BOOLEAN DEFAULT true,
    submission_year_quarter TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Geographic areas for mapping and search
CREATE TABLE geographic_areas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pwsid TEXT NOT NULL REFERENCES water_systems(pwsid) ON DELETE CASCADE,
    area_type_code TEXT, -- CN=County, CT=City
    state_served TEXT,
    city_served TEXT,
    county_served TEXT,
    zip_code_served TEXT,
    ansi_entity_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Violations and enforcement data
CREATE TABLE violations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    pwsid TEXT NOT NULL REFERENCES water_systems(pwsid) ON DELETE CASCADE,
    violation_id TEXT NOT NULL,
    facility_id TEXT,
    non_compl_per_begin_date DATE,
    non_compl_per_end_date DATE,
    violation_code TEXT,
    violation_category_code TEXT, -- MCL, TT, MR, etc.
    is_health_based_ind BOOLEAN,
    contaminant_code TEXT,
    viol_measure NUMERIC,
    unit_of_measure TEXT,
    federal_mcl TEXT,
    violation_status TEXT, -- Resolved, Archived, Addressed, Unaddressed
    public_notification_tier INTEGER,
    rule_code TEXT,
    rule_family_code TEXT,
    enforcement_date DATE,
    enforcement_action_type_code TEXT,
    is_current_violation BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(violation_id, pwsid)
);

-- Computed view for map visualization
CREATE VIEW water_systems_map_view AS
SELECT 
    ws.pwsid,
    ws.pws_name,
    ws.population_served_count,
    ws.pws_type_code,
    ws.primary_source_code,
    ws.phone_number,
    
    -- Geographic info for mapping
    ga_city.city_served as primary_city,
    ga_county.county_served as primary_county,
    
    -- Violation summary for color coding
    COALESCE(v_summary.total_violations, 0) as total_violations,
    COALESCE(v_summary.current_violations, 0) as current_violations,
    COALESCE(v_summary.health_violations, 0) as health_violations,
    
    -- Status for map color coding
    CASE 
        WHEN v_summary.health_violations > 0 THEN 'high_risk'
        WHEN v_summary.current_violations > 0 THEN 'medium_risk'
        WHEN v_summary.total_violations > 0 THEN 'low_risk'
        ELSE 'no_violations'
    END as risk_level,
    
    ws.is_active

FROM water_systems ws

-- Get primary city
LEFT JOIN LATERAL (
    SELECT city_served 
    FROM geographic_areas 
    WHERE pwsid = ws.pwsid AND area_type_code = 'CT' 
    LIMIT 1
) ga_city ON true

-- Get primary county  
LEFT JOIN LATERAL (
    SELECT county_served 
    FROM geographic_areas 
    WHERE pwsid = ws.pwsid AND area_type_code = 'CN' 
    LIMIT 1
) ga_county ON true

-- Violation summary
LEFT JOIN LATERAL (
    SELECT 
        COUNT(*) as total_violations,
        COUNT(*) FILTER (WHERE violation_status IN ('Unaddressed', 'Addressed')) as current_violations,
        COUNT(*) FILTER (WHERE is_health_based_ind = true) as health_violations
    FROM violations 
    WHERE pwsid = ws.pwsid
) v_summary ON true

WHERE ws.is_active = true;

-- Indexes for performance
CREATE INDEX idx_water_systems_active ON water_systems(is_active) WHERE is_active = true;
CREATE INDEX idx_water_systems_pwsid ON water_systems(pwsid);
CREATE INDEX idx_geographic_areas_pwsid ON geographic_areas(pwsid);
CREATE INDEX idx_geographic_areas_area_type ON geographic_areas(area_type_code);
CREATE INDEX idx_geographic_areas_city ON geographic_areas(city_served);
CREATE INDEX idx_geographic_areas_county ON geographic_areas(county_served);
CREATE INDEX idx_geographic_areas_zip ON geographic_areas(zip_code_served);
CREATE INDEX idx_violations_pwsid ON violations(pwsid);
CREATE INDEX idx_violations_status ON violations(violation_status);
CREATE INDEX idx_violations_health ON violations(is_health_based_ind);
CREATE INDEX idx_violations_current ON violations(is_current_violation) WHERE is_current_violation = true;

-- RLS (Row Level Security) policies for public access
ALTER TABLE water_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE geographic_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE reference_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all data (this is public government data)
CREATE POLICY "Public read access" ON water_systems FOR SELECT USING (true);
CREATE POLICY "Public read access" ON geographic_areas FOR SELECT USING (true);
CREATE POLICY "Public read access" ON violations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON reference_codes FOR SELECT USING (true);

-- Function to search water systems by location
CREATE OR REPLACE FUNCTION search_water_systems(search_term TEXT)
RETURNS TABLE (
    pwsid TEXT,
    pws_name TEXT,
    primary_city TEXT,
    primary_county TEXT,
    population_served_count INTEGER,
    risk_level TEXT,
    current_violations INTEGER
) 
LANGUAGE SQL
STABLE
AS $$
    SELECT 
        wmv.pwsid,
        wmv.pws_name,
        wmv.primary_city,
        wmv.primary_county,
        wmv.population_served_count,
        wmv.risk_level,
        wmv.current_violations
    FROM water_systems_map_view wmv
    WHERE 
        wmv.is_active = true
        AND (
            wmv.pws_name ILIKE '%' || search_term || '%'
            OR wmv.primary_city ILIKE '%' || search_term || '%'
            OR wmv.primary_county ILIKE '%' || search_term || '%'
        )
    ORDER BY 
        wmv.population_served_count DESC,
        wmv.current_violations DESC
    LIMIT 50;
$$;

-- Function to update computed fields
CREATE OR REPLACE FUNCTION update_computed_fields()
RETURNS VOID
LANGUAGE SQL
AS $$
    -- Update is_active field
    UPDATE water_systems 
    SET is_active = (pws_activity_code = 'A');
    
    -- Update is_current_violation field
    UPDATE violations 
    SET is_current_violation = (
        violation_status IN ('Addressed', 'Unaddressed') 
        AND (non_compl_per_end_date IS NULL OR non_compl_per_end_date > CURRENT_DATE - INTERVAL '1 year')
    );
$$;

-- Function to get system details
CREATE OR REPLACE FUNCTION get_system_details(system_pwsid TEXT)
RETURNS JSON
LANGUAGE SQL
STABLE
AS $$
    SELECT json_build_object(
        'system', row_to_json(wmv),
        'violations', COALESCE(violations_array.violations, '[]'::json),
        'geographic_areas', COALESCE(geo_array.areas, '[]'::json)
    )
    FROM water_systems_map_view wmv
    LEFT JOIN LATERAL (
        SELECT json_agg(row_to_json(v)) as violations
        FROM (
            SELECT 
                violation_code,
                violation_category_code,
                is_health_based_ind,
                contaminant_code,
                non_compl_per_begin_date,
                non_compl_per_end_date,
                violation_status,
                public_notification_tier
            FROM violations 
            WHERE pwsid = system_pwsid 
            ORDER BY non_compl_per_begin_date DESC
            LIMIT 20
        ) v
    ) violations_array ON true
    LEFT JOIN LATERAL (
        SELECT json_agg(row_to_json(ga)) as areas
        FROM (
            SELECT area_type_code, city_served, county_served, zip_code_served
            FROM geographic_areas 
            WHERE pwsid = system_pwsid
        ) ga
    ) geo_array ON true
    WHERE wmv.pwsid = system_pwsid;
$$;