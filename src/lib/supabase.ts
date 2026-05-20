import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://adkqijensfxzzftylktm.supabase.co'
const SUPABASE_KEY = 'sb_publishable_kbnrfUYF6dUYl428Zu4PTg_basloyh0'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)