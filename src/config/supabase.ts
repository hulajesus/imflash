import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://woxbgotwkbbtiaerzrqu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndveGJnb3R3a2JidGlhZXJ6cnF1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNTU3MzMsImV4cCI6MjA3NDkzMTczM30.oS0b-N1l7midTEZ1qlD8qovPB_IkeJM5cYele7AZ10M';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
