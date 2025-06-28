#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStats() {
  console.log('🔍 Checking database statistics...\n');
  
  try {
    // Check water systems
    const { count: totalSystems } = await supabase
      .from('water_systems')
      .select('*', { count: 'exact', head: true });
    
    const { count: activeSystems } = await supabase
      .from('water_systems')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    // Check violations
    const { count: totalViolations } = await supabase
      .from('violations')
      .select('*', { count: 'exact', head: true });
    
    // Check systems with current violations
    const { count: systemsWithViolations } = await supabase
      .from('water_systems')
      .select('*', { count: 'exact', head: true })
      .gt('current_violations', 0);
    
    // Check systems with violations using different method
    const { data: systemsWithViols } = await supabase
      .from('water_systems')
      .select('pwsid, current_violations')
      .gt('current_violations', 0);
    
    console.log('📊 DATABASE STATISTICS:');
    console.log('─'.repeat(40));
    console.log(`Total water systems:     ${totalSystems || 0}`);
    console.log(`Active water systems:    ${activeSystems || 0}`);
    console.log(`Total violations:        ${totalViolations || 0}`);
    console.log(`Systems with violations: ${systemsWithViolations || 0}`);
    console.log(`Clean systems:           ${(activeSystems || 0) - (systemsWithViolations || 0)}`);
    
    console.log('\n📋 SOURCE DATA (CSV files):');
    console.log('─'.repeat(40));
    console.log('Water systems CSV:       5,647 systems');
    console.log('Violations CSV:          151,084 violations');
    
    console.log('\n🔍 SAMPLE SYSTEMS WITH VIOLATIONS:');
    console.log('─'.repeat(40));
    if (systemsWithViols && systemsWithViols.length > 0) {
      systemsWithViols.slice(0, 5).forEach(system => {
        console.log(`${system.pwsid}: ${system.current_violations} violations`);
      });
      if (systemsWithViols.length > 5) {
        console.log(`... and ${systemsWithViols.length - 5} more`);
      }
    } else {
      console.log('No systems with violations found');
    }
    
    // Check if numbers look suspicious
    console.log('\n⚠️  DATA VALIDATION:');
    console.log('─'.repeat(40));
    
    if (totalSystems < 5000) {
      console.log('❌ Total systems seems low (expected ~5,600)');
    } else {
      console.log('✅ Total systems count looks reasonable');
    }
    
    if (systemsWithViolations === 0) {
      console.log('❌ Zero violations seems unrealistic');
    } else if (systemsWithViolations < 50) {
      console.log('⚠️  Very few violations (might be data issue)');
    } else {
      console.log('✅ Violations count seems realistic');
    }
    
  } catch (error) {
    console.error('❌ Error checking stats:', error.message);
    process.exit(1);
  }
}

checkStats();