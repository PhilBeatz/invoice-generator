import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials
// Or use environment variables (recommended for production):
// const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
// const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const SUPABASE_URL = 'https://yeligmxxckhcfubrmuzx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InllbGlnbXh4Y2toY2Z1YnJtdXp4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNTU4NTMsImV4cCI6MjA4NTgzMTg1M30.5Id7UNBlYdnzvi-eZbLLU5OtRxCZoiBSXQqXeZDjYmA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
