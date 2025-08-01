import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gwshtmfpdndlljifbloa.supabase.co'; // Ganti dengan Project URL Anda
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3c2h0bWZwZG5kbGxqaWZibG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MjkyMzQsImV4cCI6MjA2NzEwNTIzNH0.6f32ea-ePZh_byij9d11WWj6PcERg4RgjWUULKleix0'; // Ganti dengan anon public key Anda

export const supabase = createClient(supabaseUrl, supabaseAnonKey);