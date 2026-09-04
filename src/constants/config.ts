export const CONFIG = {
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://sui-dhaga-backend.vercel.app',
  BACKEND_URL: process.env.EXPO_PUBLIC_BACKEND_URL || 'https://sui-dhaga-backend.vercel.app',
} as const;

export default CONFIG;
