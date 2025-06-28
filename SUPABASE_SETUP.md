# Supabase Setup Guide

## 🚀 Quick Setup Steps

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" 
3. Sign in with GitHub/Google
4. Click "New Project"
5. Choose organization and fill in:
   - **Name**: `georgia-water-dashboard`
   - **Database Password**: (generate strong password)
   - **Region**: `East US (N. Virginia)` (closest to Georgia)
6. Click "Create new project" (takes ~2 minutes)

### 2. Get Your Credentials
Once your project is ready:

1. **Project URL**: Copy from Settings → API → Project URL
   ```
   https://your-project-ref.supabase.co
   ```

2. **Anon Key**: Copy from Settings → API → Project API keys → `anon public`
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. **Service Role Key**: Copy from Settings → API → Project API keys → `service_role`
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 3. Create Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire contents of `supabase-schema.sql`
3. Paste into SQL Editor
4. Click "Run" to execute the schema

### 4. Set Environment Variables
1. Open `.env.local` in this project
2. Replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
   ```

### 5. Test Connection
```bash
npm install
npm run ingest
```

## 🔒 Security Notes

- **Anon Key**: Safe for client-side use (public)
- **Service Role Key**: Keep secret! Only for server-side operations
- **Row Level Security**: Enabled on all tables for public read access

## 📊 Expected Tables After Schema Setup

- ✅ `water_systems` (main systems data)
- ✅ `geographic_areas` (location mapping)  
- ✅ `violations` (safety violations)
- ✅ `reference_codes` (code translations)
- ✅ `water_systems_map_view` (optimized view for map)

## 🧪 Testing Your Setup

```sql
-- Test query in Supabase SQL Editor
SELECT COUNT(*) FROM water_systems;
SELECT COUNT(*) FROM violations;
```

## 🆘 Troubleshooting

**Connection Issues:**
- Check URL format: `https://xyz.supabase.co` (no trailing slash)
- Verify anon key starts with `eyJ`

**Schema Issues:**
- Make sure you're in the correct project
- Check if extensions are enabled
- Look for error messages in SQL Editor

**Data Ingestion Issues:**
- Verify service role key permissions
- Check that CSV files exist in `/data` folder

## 📱 Ready for Next Step
Once you see "✅ Successfully loaded" messages, you're ready to build the mobile map interface!