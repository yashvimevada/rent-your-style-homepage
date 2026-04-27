import { createClient } from "@supabase/supabase-js";

// Supabase Project Credentials
// Found in Supabase Dashboard → Project Settings → API

const SUPABASE_URL = 'https://wxloskrvckipqhmukibg.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4bG9za3J2Y2tpcHFobXVraWJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMjQ1OTksImV4cCI6MjA4ODkwMDU5OX0.Vwen-l5zcpJ3H-xozPHNmIIFHu0Sn_J_NrLayFWwDxA';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);