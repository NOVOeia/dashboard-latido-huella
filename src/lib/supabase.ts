import { createClient } from '@supabase/supabase-js'
const SUPABASE_URL = 'https://adkqijensfxzzftylktm.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFka3FpamVuc2Z4enpmdHlsa3RtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNzQ1OTMsImV4cCI6MjA5Mzc1MDU5M30.Yk7hafWIWMsKQtcCZ4f03_hCVtAUgoTt4soxEgEuLrY'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
