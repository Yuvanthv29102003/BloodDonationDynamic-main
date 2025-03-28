// import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://izbnrzvijjakebavdqvc.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6Ym5yenZpampha2ViYXZkcXZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MTg2NTUsImV4cCI6MjA1NTI5NDY1NX0.sAHOaZVJhWwmHzh7rgC2XVcDx_yLB0q8hCfYqBjy64c'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})