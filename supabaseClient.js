// Supabase Configuration
const SUPABASE_URL = 'https://cefgmttlrudmfcpgrdsi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GgKaaMJOUZjr8ELi2g7G2A_RyCKOL6f';

// Safe global initialization to prevent duplicate declaration errors
if (typeof window.supabaseClient === 'undefined') {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
