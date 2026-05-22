import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fpjbaufhwstvntatslar.supabase.co';
const supabaseKey = import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_Aty9V2PtcFHlEJrTsofUAQ_Bwbpyc7Z';
export const supabase = createClient(supabaseUrl, supabaseKey);