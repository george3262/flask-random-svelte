
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nddzcrwdycczcdonkbhy.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kZHpjcndkeWNjemNkb25rYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ4MDQ1MjMsImV4cCI6MjAxMDM4MDUyM30.HCNXybb1szJwSFiAMiAUD07psBk475Hz8eD1Qb_LCqk"
export const supabase = createClient(supabaseUrl, supabaseKey)