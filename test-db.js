const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function testWaterSystems() {
  console.log('Testing water systems query...');
  
  try {
    // Test 1: Check if table exists and get schema
    console.log('\n=== TEST 1: Schema Check ===');
    const { data: schemaCheck, error: schemaError } = await supabase
      .from('water_systems')
      .select('*')
      .limit(1);
    
    if (schemaError) {
      console.error('Schema error:', schemaError);
      return;
    }
    
    if (schemaCheck && schemaCheck.length > 0) {
      console.log('Available columns:', Object.keys(schemaCheck[0]));
      console.log('Sample row:', schemaCheck[0]);
    } else {
      console.log('No data in water_systems table');
    }

    // Test 2: Count total rows
    console.log('\n=== TEST 2: Row Count ===');
    const { count, error: countError } = await supabase
      .from('water_systems')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Count error:', countError);
    } else {
      console.log('Total rows in water_systems:', count);
    }

    // Test 3: Get sample data without filters
    console.log('\n=== TEST 3: Sample Data (No Filters) ===');
    const { data: sampleData, error: sampleError } = await supabase
      .from('water_systems')
      .select('pwsid, pws_name, city_name, state_code, is_active')
      .limit(5);
    
    if (sampleError) {
      console.error('Sample error:', sampleError);
    } else {
      console.log('Sample data:', sampleData);
    }

    // Test 4: Check active systems
    console.log('\n=== TEST 4: Active Systems ===');
    const { data: activeData, error: activeError } = await supabase
      .from('water_systems')
      .select('pwsid, pws_name, city_name, state_code, is_active')
      .eq('is_active', true)
      .limit(5);
    
    if (activeError) {
      console.error('Active systems error:', activeError);
    } else {
      console.log('Active systems:', activeData);
    }

    // Test 5: Check water_systems_map_view which should have county data
    console.log('\n=== TEST 5: Check Water Systems Map View ===');
    const { data: mapViewData, error: mapViewError } = await supabase
      .from('water_systems_map_view')
      .select('*')
      .limit(3);
    
    if (mapViewError) {
      console.error('Map view error:', mapViewError);
    } else {
      console.log('Map view sample:', mapViewData);
      if (mapViewData && mapViewData.length > 0) {
        console.log('Map view columns:', Object.keys(mapViewData[0]));
      }
    }

    // Test 6: Test the updated map query with cities
    console.log('\n=== TEST 6: Test Updated Map Query ===');
    const { data: mapQueryData, error: mapQueryError } = await supabase
      .from('water_systems_map_view')
      .select(`
        pwsid,
        pws_name,
        primary_city,
        population_served_count,
        pws_type_code,
        risk_level,
        current_violations,
        total_violations,
        health_violations,
        is_active
      `)
      .eq('is_active', true)
      .not('primary_city', 'is', null)
      .limit(100);
    
    if (mapQueryError) {
      console.error('Map query error:', mapQueryError);
    } else {
      console.log('Map query results count:', mapQueryData?.length);
      console.log('Map query sample:', mapQueryData?.slice(0, 3));
      
      // Test city to county mapping
      const cityToCounty = {
        'ATLANTA': 'Fulton',
        'BAXLEY': 'Appling',
        'SURRENCY': 'Appling'
      };
      
      const mappedResults = mapQueryData?.map(system => ({
        ...system,
        mapped_county: cityToCounty[system.primary_city?.toUpperCase()] || 'Unknown'
      }));
      
      console.log('Sample with county mapping:', mappedResults?.slice(0, 3));
      
      // Count unique cities and how many we can map
      const uniqueCities = [...new Set(mapQueryData?.map(s => s.primary_city))];
      console.log('Unique cities found:', uniqueCities.length);
      console.log('Sample cities:', uniqueCities.slice(0, 20));
      
      const mappableCount = mappedResults?.filter(r => r.mapped_county !== 'Unknown').length;
      console.log(`Can map ${mappableCount} out of ${mapQueryData?.length} systems`);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testWaterSystems();