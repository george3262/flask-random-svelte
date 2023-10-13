
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ttlayfpgmhymotuswyme.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0bGF5ZnBnbWh5bW90dXN3eW1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ1NjA2MDMsImV4cCI6MjAxMDEzNjYwM30.D303AaLHjJG_bRz3SoRzx0JDDT0ld8UtaW2WBMOEHMc"
export const supabasecopy = createClient(supabaseUrl, supabaseKey)