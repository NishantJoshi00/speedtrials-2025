#!/usr/bin/env node

/**
 * Data ingestion script to load CSV files into Supabase
 * Usage: npm run ingest
 */

const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration - you'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Data file mappings
const DATA_FILES = {
    'data/SDWA_REF_CODE_VALUES.csv': 'reference_codes',
    'data/SDWA_PUB_WATER_SYSTEMS.csv': 'water_systems', 
    'data/SDWA_GEOGRAPHIC_AREAS.csv': 'geographic_areas',
    'data/SDWA_VIOLATIONS_ENFORCEMENT.csv': 'violations'
};

// Field mappings to convert CSV columns to database columns
const FIELD_MAPPINGS = {
    reference_codes: {
        'VALUE_TYPE': 'value_type',
        'VALUE_CODE': 'value_code', 
        'VALUE_DESCRIPTION': 'value_description'
    },
    water_systems: {
        'SUBMISSIONYEARQUARTER': 'submission_year_quarter',
        'PWSID': 'pwsid',
        'PWS_NAME': 'pws_name',
        'PRIMACY_AGENCY_CODE': 'primacy_agency_code',
        'EPA_REGION': 'epa_region',
        'PWS_ACTIVITY_CODE': 'pws_activity_code',
        'PWS_TYPE_CODE': 'pws_type_code',
        'OWNER_TYPE_CODE': 'owner_type_code',
        'POPULATION_SERVED_COUNT': 'population_served_count',
        'PRIMARY_SOURCE_CODE': 'primary_source_code',
        'PHONE_NUMBER': 'phone_number',
        'EMAIL_ADDR': 'email_addr',
        'ADMIN_NAME': 'admin_name',
        'ADDRESS_LINE1': 'address_line1',
        'CITY_NAME': 'city_name',
        'STATE_CODE': 'state_code',
        'ZIP_CODE': 'zip_code'
    },
    geographic_areas: {
        'PWSID': 'pwsid',
        'AREA_TYPE_CODE': 'area_type_code',
        'STATE_SERVED': 'state_served',
        'CITY_SERVED': 'city_served',
        'COUNTY_SERVED': 'county_served',
        'ZIP_CODE_SERVED': 'zip_code_served',
        'ANSI_ENTITY_CODE': 'ansi_entity_code'
    },
    violations: {
        'PWSID': 'pwsid',
        'VIOLATION_ID': 'violation_id',
        'FACILITY_ID': 'facility_id',
        'NON_COMPL_PER_BEGIN_DATE': 'non_compl_per_begin_date',
        'NON_COMPL_PER_END_DATE': 'non_compl_per_end_date',
        'VIOLATION_CODE': 'violation_code',
        'VIOLATION_CATEGORY_CODE': 'violation_category_code',
        'IS_HEALTH_BASED_IND': 'is_health_based_ind',
        'CONTAMINANT_CODE': 'contaminant_code',
        'VIOL_MEASURE': 'viol_measure',
        'UNIT_OF_MEASURE': 'unit_of_measure',
        'FEDERAL_MCL': 'federal_mcl',
        'VIOLATION_STATUS': 'violation_status',
        'PUBLIC_NOTIFICATION_TIER': 'public_notification_tier',
        'RULE_CODE': 'rule_code',
        'RULE_FAMILY_CODE': 'rule_family_code',
        'ENFORCEMENT_DATE': 'enforcement_date',
        'ENFORCEMENT_ACTION_TYPE_CODE': 'enforcement_action_type_code'
    }
};

function parseDate(dateStr) {
    if (!dateStr || dateStr.trim() === '') return null;
    
    // Handle MM/DD/YYYY format
    const parts = dateStr.split('/');
    if (parts.length === 3) {
        const [month, day, year] = parts;
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    return null;
}

function transformRow(row, tableName) {
    const mapping = FIELD_MAPPINGS[tableName];
    const transformed = {};
    
    for (const [csvField, dbField] of Object.entries(mapping)) {
        let value = row[csvField];
        
        // Handle empty strings
        if (value === '' || value === undefined) {
            value = null;
        }
        
        // Handle specific data type conversions
        if (dbField.includes('date') && value) {
            value = parseDate(value);
        } else if (dbField.includes('count') && value) {
            value = parseInt(value) || null;
        } else if (dbField.includes('measure') && value) {
            value = parseFloat(value) || null;
        } else if (dbField === 'is_health_based_ind' && value) {
            value = value.toUpperCase() === 'Y';
        } else if (dbField === 'public_notification_tier' && value) {
            value = parseInt(value) || null;
        }
        
        transformed[dbField] = value;
    }
    
    return transformed;
}

function removeDuplicates(data, tableName) {
    const seen = new Set();
    
    return data.filter(row => {
        let key;
        
        // Define unique keys for each table
        if (tableName === 'water_systems') {
            key = row.pwsid;
        } else if (tableName === 'geographic_areas') {
            key = `${row.pwsid}_${row.area_type_code}_${row.city_served || ''}_${row.county_served || ''}`;
        } else if (tableName === 'violations') {
            key = `${row.violation_id}_${row.pwsid}`;
        } else if (tableName === 'reference_codes') {
            key = `${row.value_type}_${row.value_code}`;
        } else {
            return true; // No deduplication for unknown tables
        }
        
        if (seen.has(key)) {
            return false; // Duplicate, filter out
        }
        
        seen.add(key);
        return true;
    });
}

async function loadCSV(filePath) {
    return new Promise((resolve, reject) => {
        const results = [];
        const stream = fs.createReadStream(filePath);
        
        Papa.parse(stream, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
                resolve(result.data);
            },
            error: (error) => {
                reject(error);
            }
        });
    });
}

async function insertBatch(tableName, data, batchSize = 1000) {
    console.log(`Inserting ${data.length} records into ${tableName}...`);
    
    // Clear existing data
    const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
    
    if (deleteError) {
        console.warn(`Warning clearing ${tableName}:`, deleteError.message);
    }
    
    // Insert in batches with upsert to handle duplicates
    for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);
        
        let result;
        
        // Use upsert for tables with unique constraints
        if (tableName === 'violations') {
            result = await supabase
                .from(tableName)
                .upsert(batch, { 
                    onConflict: 'violation_id,pwsid',
                    ignoreDuplicates: false 
                });
        } else if (tableName === 'water_systems') {
            result = await supabase
                .from(tableName)
                .upsert(batch, { 
                    onConflict: 'pwsid',
                    ignoreDuplicates: false 
                });
        } else if (tableName === 'reference_codes') {
            result = await supabase
                .from(tableName)
                .upsert(batch, { 
                    onConflict: 'value_type,value_code',
                    ignoreDuplicates: false 
                });
        } else {
            // Regular insert for tables without unique constraints
            result = await supabase
                .from(tableName)
                .insert(batch);
        }
        
        if (result.error) {
            console.error(`Error inserting batch ${i}-${i + batch.length} into ${tableName}:`, result.error);
            throw result.error;
        }
        
        console.log(`✓ Inserted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.length/batchSize)}`);
    }
}

async function ingestData() {
    console.log('🚰 Starting Georgia Water Quality data ingestion...\n');
    
    let validPWSIDs = new Set();
    
    try {
        // Test Supabase connection
        const { data, error } = await supabase.from('water_systems').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Failed to connect to Supabase:', error);
            return;
        }
        console.log('✓ Connected to Supabase\n');
        
        // Process each data file
        for (const [filePath, tableName] of Object.entries(DATA_FILES)) {
            console.log(`📊 Processing ${filePath} -> ${tableName}`);
            
            if (!fs.existsSync(filePath)) {
                console.warn(`⚠️  File not found: ${filePath}`);
                continue;
            }
            
            // Load and transform data
            const rawData = await loadCSV(filePath);
            console.log(`📖 Loaded ${rawData.length} rows from CSV`);
            
            let transformedData = rawData
                .map(row => transformRow(row, tableName))
                .filter(row => {
                    // Filter out invalid rows
                    if (tableName === 'water_systems') {
                        const isValid = row.pwsid && row.pws_name;
                        if (isValid) {
                            validPWSIDs.add(row.pwsid); // Track valid PWS IDs
                        }
                        return isValid;
                    } else if (tableName === 'geographic_areas') {
                        return row.pwsid && validPWSIDs.has(row.pwsid) && (row.city_served || row.county_served);
                    } else if (tableName === 'violations') {
                        return row.pwsid && validPWSIDs.has(row.pwsid) && row.violation_id;
                    } else if (tableName === 'reference_codes') {
                        return row.value_type && row.value_code;
                    }
                    return true;
                });
            
            // Remove duplicates
            transformedData = removeDuplicates(transformedData, tableName);
            
            console.log(`🔄 Transformed to ${transformedData.length} valid rows`);
            
            if (transformedData.length > 0) {
                await insertBatch(tableName, transformedData);
                console.log(`✅ Successfully loaded ${tableName}\n`);
            } else {
                console.log(`⚠️  No valid data to load for ${tableName}\n`);
            }
        }
        
        // Update computed fields
        console.log('🔄 Updating computed fields...');
        const { error: computeError } = await supabase.rpc('update_computed_fields');
        if (computeError) {
            console.warn('Warning updating computed fields:', computeError.message);
        } else {
            console.log('✓ Computed fields updated');
        }
        
        console.log('🎉 Data ingestion completed successfully!');
        
        // Print summary stats
        const { data: systemCount } = await supabase.from('water_systems').select('count', { count: 'exact', head: true });
        const { data: violationCount } = await supabase.from('violations').select('count', { count: 'exact', head: true });
        
        console.log('\n📈 Summary:');
        console.log(`   Water Systems: ${systemCount?.count || 0}`);
        console.log(`   Violations: ${violationCount?.count || 0}`);
        
    } catch (error) {
        console.error('❌ Data ingestion failed:', error);
        process.exit(1);
    }
}

// Run the ingestion
if (require.main === module) {
    ingestData();
}

module.exports = { ingestData };