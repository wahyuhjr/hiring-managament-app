
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://pjufmuhiarceoynrkiwj.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

if (!supabaseKey) {
  throw new Error('Missing Supabase key')
}

export const supabase = createClient(supabaseUrl, supabaseKey)