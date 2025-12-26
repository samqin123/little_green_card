
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hxequmcqsixjarjqazer.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable__7i_gBdPInDhfDzjGvKcKw_bJgaw7sT';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
