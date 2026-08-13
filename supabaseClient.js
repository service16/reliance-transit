// Supabase Configuration
const SUPABASE_URL = 'https://cefgmttlrudmfcpgrdsi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlZmdydHRscnVkbWZjcGdyZHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2NTEwNTgsImV4cCI6MjEwMjIyNzA1OH0.u7X_hNhXMTw1R3dJOhA6BckKrQrscsbPknpWVVtxLqc';

// Initialize client safely without duplicate declaration errors
if (!window._supabaseClient) {
    window._supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
const supabase = window._supabaseClient;
