import { apiClient } from './client';
import { CONFIG } from '../constants/config';
import type { AppVersionInfo } from '../types/app-version.types';

export const appVersionApi = {
  /**
   * Fetches latest version config from the backend /api/v1/app-version/latest endpoint.
   * If backend is unreachable, falls back to direct Supabase REST query.
   */
  async getLatestVersion(platform = 'android', currentVersion = '1.0.2'): Promise<AppVersionInfo | null> {
    try {
      const res = await apiClient<AppVersionInfo>(
        `/app-version/latest?platform=${encodeURIComponent(platform)}&clientVersion=${encodeURIComponent(currentVersion)}`,
        {
          method: 'GET',
          skipAuth: true,
        }
      );

      if (res?.data) {
        return res.data;
      }
    } catch (backendError) {
      console.warn('[appVersionApi] Primary backend check failed, trying Supabase fallback:', backendError);
    }

    // Resilient fallback: Try Supabase REST directly
    if (CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
      try {
        const cleanUrl = CONFIG.SUPABASE_URL.replace(/\/+$/, '');
        const url = `${cleanUrl}/rest/v1/app_versions?is_active=eq.true&or=(platform.eq.${platform},platform.eq.all)&order=created_at.desc&limit=1`;
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            apikey: CONFIG.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
            Accept: 'application/json',
          },
        });

        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) {
            const row = rows[0];
            return {
              platform: row.platform,
              latestVersion: row.latest_version,
              minVersion: row.min_version,
              downloadUrl: row.download_url,
              releaseNotes: row.release_notes,
              forceUpdate: Boolean(row.force_update),
              isUpdateAvailable: false, // Calculated by service
              isMandatory: false,       // Calculated by service
            };
          }
        }
      } catch (supabaseError) {
        console.warn('[appVersionApi] Supabase fallback also failed:', supabaseError);
      }
    }

    return null;
  },
};
