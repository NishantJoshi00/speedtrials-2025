#!/usr/bin/env node

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function parseCSV(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',');
  
  return {
    headers,
    data: lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, i) => {
        obj[header] = values[i] || '';
      });
      return obj;
    }),
    count: lines.length - 1
  };
}

async function auditData() {
  console.log('🔍 COMPREHENSIVE DATA AUDIT\n');
  console.log('='.repeat(60));
  
  // 1. EXAMINE RAW CSV DATA
  console.log('📁 EXAMINING RAW CSV FILES:');
  console.log('─'.repeat(40));
  
  try {
    const waterSystems = parseCSV('data/SDWA_PUB_WATER_SYSTEMS.csv');
    const violations = parseCSV('data/SDWA_VIOLATIONS_ENFORCEMENT.csv');
    
    console.log(`Water Systems CSV: ${waterSystems.count} records`);
    console.log(`Violations CSV: ${violations.count} records`);
    
    // Sample the first few records
    console.log('\n🔍 Sample Water System (first record):');
    const firstSystem = waterSystems.data[0];
    console.log('PWSID:', firstSystem.PWSID);
    console.log('Name:', firstSystem.PWS_NAME);
    console.log('Activity:', firstSystem.PWS_ACTIVITY_CODE);
    console.log('Type:', firstSystem.PWS_TYPE_CODE);
    console.log('Population:', firstSystem.POPULATION_SERVED_COUNT);
    
    console.log('\n🔍 Sample Violation (first record):');
    const firstViolation = violations.data[0];
    console.log('PWSID:', firstViolation.PWSID);
    console.log('Violation ID:', firstViolation.VIOLATION_ID);
    console.log('Status:', firstViolation.VIOLATION_STATUS);
    console.log('Health Based:', firstViolation.IS_HEALTH_BASED_IND);
    console.log('Begin Date:', firstViolation.NON_COMPL_PER_BEGIN_DATE);
    console.log('End Date:', firstViolation.NON_COMPL_PER_END_DATE);
    
    // Check activity codes
    const activityCodes = {};
    waterSystems.data.forEach(system => {
      const code = system.PWS_ACTIVITY_CODE;
      activityCodes[code] = (activityCodes[code] || 0) + 1;
    });
    
    console.log('\n📊 Water System Activity Codes:');
    Object.entries(activityCodes).forEach(([code, count]) => {
      console.log(`${code}: ${count} systems`);
    });
    
    // Check violation statuses
    const violationStatuses = {};
    violations.data.forEach(violation => {
      const status = violation.VIOLATION_STATUS;
      violationStatuses[status] = (violationStatuses[status] || 0) + 1;
    });
    
    console.log('\n📊 Violation Status Distribution:');
    Object.entries(violationStatuses).forEach(([status, count]) => {
      console.log(`${status}: ${count} violations`);
    });
    
  } catch (error) {
    console.error('❌ Error reading CSV files:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  
  // 2. EXAMINE DATABASE DATA
  console.log('🗄️  EXAMINING DATABASE DATA:');
  console.log('─'.repeat(40));
  
  try {
    // Check water systems table
    const { count: dbWaterSystems } = await supabase
      .from('water_systems')
      .select('*', { count: 'exact', head: true });
    
    const { count: activeDbSystems } = await supabase
      .from('water_systems')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    const { count: dbViolations } = await supabase
      .from('violations')
      .select('*', { count: 'exact', head: true });
    
    console.log(`Database Water Systems: ${dbWaterSystems}`);
    console.log(`Database Active Systems: ${activeDbSystems}`);
    console.log(`Database Violations: ${dbViolations}`);
    
    // Sample database records
    const { data: sampleSystems } = await supabase
      .from('water_systems')
      .select('*')
      .limit(3);
    
    console.log('\n🔍 Sample Database Water System:');
    if (sampleSystems && sampleSystems[0]) {
      const system = sampleSystems[0];
      console.log('PWSID:', system.pwsid);
      console.log('Name:', system.pws_name);
      console.log('Active:', system.is_active);
      console.log('Current Violations:', system.current_violations);
      console.log('Total Violations:', system.total_violations);
      console.log('Health Violations:', system.health_violations);
    }
    
    const { data: sampleViolations } = await supabase
      .from('violations')
      .select('*')
      .limit(3);
    
    console.log('\n🔍 Sample Database Violation:');
    if (sampleViolations && sampleViolations[0]) {
      const violation = sampleViolations[0];
      console.log('PWSID:', violation.pwsid);
      console.log('Violation ID:', violation.violation_id);
      console.log('Status:', violation.violation_status);
      console.log('Health Based:', violation.is_health_based_ind);
      console.log('Begin Date:', violation.non_compl_per_begin_date);
      console.log('End Date:', violation.non_compl_per_end_date);
    }
    
    // Check violation status distribution in database
    const { data: dbViolationStatuses } = await supabase
      .from('violations')
      .select('violation_status');
    
    const dbStatusCounts = {};
    dbViolationStatuses.forEach(v => {
      const status = v.violation_status;
      dbStatusCounts[status] = (dbStatusCounts[status] || 0) + 1;
    });
    
    console.log('\n📊 Database Violation Status Distribution:');
    Object.entries(dbStatusCounts).forEach(([status, count]) => {
      console.log(`${status}: ${count} violations`);
    });
    
    // Check current violations calculation
    const { data: systemsWithCurrentViols } = await supabase
      .from('water_systems')
      .select('pwsid, current_violations, total_violations')
      .gt('current_violations', 0)
      .limit(10);
    
    console.log('\n📊 Systems with Current Violations (sample):');
    if (systemsWithCurrentViols && systemsWithCurrentViols.length > 0) {
      systemsWithCurrentViols.forEach(system => {
        console.log(`${system.pwsid}: ${system.current_violations} current, ${system.total_violations} total`);
      });
    } else {
      console.log('❌ No systems found with current_violations > 0');
    }
    
    // Let's manually count violations by PWSID to see what should be current
    console.log('\n🔍 Manual violation count for sample systems:');
    const { data: manualCheck } = await supabase
      .from('violations')
      .select('pwsid, violation_status')
      .in('pwsid', ['GA0010000', 'GA0010001', 'GA0290101'])
      .limit(50);
    
    const manualCounts = {};
    manualCheck.forEach(v => {
      if (!manualCounts[v.pwsid]) {
        manualCounts[v.pwsid] = { total: 0, unaddressed: 0, resolved: 0, archived: 0 };
      }
      manualCounts[v.pwsid].total++;
      
      if (v.violation_status === 'Unaddressed') {
        manualCounts[v.pwsid].unaddressed++;
      } else if (v.violation_status === 'Resolved') {
        manualCounts[v.pwsid].resolved++;
      } else if (v.violation_status === 'Archived') {
        manualCounts[v.pwsid].archived++;
      }
    });
    
    Object.entries(manualCounts).forEach(([pwsid, counts]) => {
      console.log(`${pwsid}: ${counts.total} total (${counts.unaddressed} unaddressed, ${counts.resolved} resolved, ${counts.archived} archived)`);
    });
    
  } catch (error) {
    console.error('❌ Error querying database:', error.message);
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('🎯 ANALYSIS COMPLETE - Check the data above to identify issues!');
}

auditData();