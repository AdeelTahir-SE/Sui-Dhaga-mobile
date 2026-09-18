export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://sui-dhaga-backend.vercel.app',
  BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL || 'https://sui-dhaga-backend.vercel.app',
  SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '',
} as const;

export default CONFIG;
