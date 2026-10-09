export const CONFIG = {
  API_URL: (process.env.EXPO_PUBLIC_API_URL || 'https://sui-dhaga-backend.vercel.app').trim().replace(/^["']|["']$/g, ''),
  BACKEND_URL: (process.env.EXPO_PUBLIC_BACKEND_URL || 'https://sui-dhaga-backend.vercel.app').trim().replace(/^["']|["']$/g, ''),
  SUPABASE_URL: (process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://nnuxpvskiypxsjsotvnz.supabase.co').trim().replace(/^["']|["']$/g, ''),
  SUPABASE_ANON_KEY: (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_k5aPuMNR-VUcCgA4SfZ16A_KFOTkpt6').trim().replace(/^["']|["']$/g, ''),
} as const;

export default CONFIG;
