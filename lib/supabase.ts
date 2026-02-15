import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('Missing Supabase environment variables in production!');
    } else {
        console.warn('Using placeholder Supabase environment variables for build/development.');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
