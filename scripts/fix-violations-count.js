#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixViolationsCount() {
  console.log('🔧 Fixing violations count for water systems...\n');
  
  try {
    // Check what violation statuses exist
    const { data: violationStatuses } = await supabase
      .from('violations')
      .select('violation_status')
      .limit(1000);
    
    const uniqueStatuses = [...new Set(violationStatuses.map(v => v.violation_status))];
    console.log('📋 Found violation statuses:', uniqueStatuses);
    
    // Check a few sample violations to understand the data
    const { data: sampleViolations } = await supabase
      .from('violations')
      .select('pwsid, violation_status, non_compl_per_begin_date, non_compl_per_end_date')
      .limit(10);
    
    console.log('\n🔍 Sample violations:');
    sampleViolations.slice(0, 5).forEach(v => {
      console.log(`${v.pwsid}: ${v.violation_status} (${v.non_compl_per_begin_date} to ${v.non_compl_per_end_date})`);
    });
    
    // Update water systems with current violations count
    // Consider "Unaddressed" violations as current
    console.log('\n🔄 Updating current violations count...');
    
    const { error: updateError } = await supabase.rpc('update_current_violations');
    
    if (updateError) {
      console.log('📝 Creating update function...');
      
      // Create the function if it doesn't exist
      const updateFunction = `
        CREATE OR REPLACE FUNCTION update_current_violations()
        RETURNS void AS $$
        BEGIN
          UPDATE water_systems 
          SET current_violations = (
            SELECT COUNT(*)
            FROM violations v
            WHERE v.pwsid = water_systems.pwsid
            AND v.violation_status = 'Unaddressed'
          ),
          total_violations = (
            SELECT COUNT(*)
            FROM violations v
            WHERE v.pwsid = water_systems.pwsid
          ),
          health_violations = (
            SELECT COUNT(*)
            FROM violations v
            WHERE v.pwsid = water_systems.pwsid
            AND v.is_health_based_ind = true
            AND v.violation_status = 'Unaddressed'
          );
        END;
        $$ LANGUAGE plpgsql;
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', { sql: updateFunction });
      
      if (createError) {
        console.log('⚠️ Using direct UPDATE instead...');
        
        // Direct approach - update current violations for systems with unaddressed violations
        const { data: unaddressedCounts } = await supabase
          .from('violations')
          .select('pwsid')
          .eq('violation_status', 'Unaddressed');
        
        const violationCounts = {};
        unaddressedCounts.forEach(v => {
          violationCounts[v.pwsid] = (violationCounts[v.pwsid] || 0) + 1;
        });
        
        console.log(`📊 Found ${Object.keys(violationCounts).length} systems with unaddressed violations`);
        
        // Update in batches
        const updates = Object.entries(violationCounts).map(([pwsid, count]) => ({
          pwsid,
          current_violations: count
        }));
        
        console.log(`🔄 Updating ${updates.length} systems...`);
        
        for (let i = 0; i < updates.length; i += 100) {
          const batch = updates.slice(i, i + 100);
          
          for (const update of batch) {
            await supabase
              .from('water_systems')
              .update({ current_violations: update.current_violations })
              .eq('pwsid', update.pwsid);
          }
          
          console.log(`✅ Updated batch ${Math.floor(i/100) + 1}/${Math.ceil(updates.length/100)}`);
        }
      } else {
        // Run the function
        await supabase.rpc('update_current_violations');
        console.log('✅ Function executed successfully');
      }
    }
    
    // Check results
    console.log('\n📊 UPDATED STATISTICS:');
    console.log('─'.repeat(40));
    
    const { count: systemsWithViolations } = await supabase
      .from('water_systems')
      .select('*', { count: 'exact', head: true })
      .gt('current_violations', 0);
    
    const { count: totalSystems } = await supabase
      .from('water_systems')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log(`Systems with violations: ${systemsWithViolations}`);
    console.log(`Clean systems: ${totalSystems - systemsWithViolations}`);
    console.log(`Total systems: ${totalSystems}`);
    
    // Show some examples
    const { data: examples } = await supabase
      .from('water_systems')
      .select('pwsid, pws_name, current_violations')
      .gt('current_violations', 0)
      .limit(5);
    
    console.log('\n🔍 SAMPLE SYSTEMS WITH VIOLATIONS:');
    console.log('─'.repeat(40));
    examples.forEach(system => {
      console.log(`${system.pwsid}: ${system.pws_name} (${system.current_violations} violations)`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixViolationsCount();