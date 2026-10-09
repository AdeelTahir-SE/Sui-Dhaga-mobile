import { Linking, Platform } from 'react-native';
import Constants from 'expo-constants';
import { appVersionApi } from '../api/app-version.api';
import type { AppVersionInfo } from '../types/app-version.types';

/**
 * Compare two semver strings: returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parse = (v: string) =>
    (v || '0')
      .replace(/^v/i, '')
      .trim()
      .split('.')
      .map((part) => parseInt(part, 10) || 0);

  const parts1 = parse(v1);
  const parts2 = parse(v2);
  const maxLength = Math.max(parts1.length, parts2.length);

  for (let i = 0; i < maxLength; i++) {
    const num1 = parts1[i] ?? 0;
    const num2 = parts2[i] ?? 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

export interface UpdateCheckResult {
  currentVersion: string;
  latestVersion: string;
  minVersion: string;
  downloadUrl: string;
  releaseNotes: string;
  isUpdateAvailable: boolean;
  isMandatory: boolean;
}

export const appUpdateService = {
  /**
   * Returns current installed app version from expoConfig or fallback '1.0.4'
   */
  getCurrentVersion(): string {
    return Constants.expoConfig?.version || '1.0.4';
  },

  /**
   * Checks whether a new version is available on the server.
   */
  async checkForUpdate(): Promise<UpdateCheckResult | null> {
    try {
      const currentVersion = this.getCurrentVersion();
      const platform = Platform.OS === 'ios' ? 'ios' : 'android';

      const versionInfo = await appVersionApi.getLatestVersion(platform, currentVersion);
      if (!versionInfo) return null;

      const latestVersion = versionInfo.latestVersion || currentVersion;
      const minVersion = versionInfo.minVersion || currentVersion;

      // Check if current version is strictly less than latest available version
      const hasNewerVersion = compareVersions(currentVersion, latestVersion) < 0;

      // Mandatory if current version is below min_version OR forceUpdate is true
      const isMandatory = Boolean(
        versionInfo.forceUpdate || (hasNewerVersion && compareVersions(currentVersion, minVersion) < 0)
      );

      return {
        currentVersion,
        latestVersion,
        minVersion,
        downloadUrl: versionInfo.downloadUrl,
        releaseNotes: versionInfo.releaseNotes || 'Bug fixes and performance improvements.',
        isUpdateAvailable: hasNewerVersion,
        isMandatory,
      };
    } catch (error) {
      console.warn('[appUpdateService] Error checking for app update:', error);
      return null;
    }
  },

  /**
   * Opens the download or store link in the external browser / store app
   */
  async openUpdateUrl(url: string): Promise<boolean> {
    if (!url) return false;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return true;
      } else {
        await Linking.openURL(url);
        return true;
      }
    } catch (err) {
      console.error('[appUpdateService] Failed to open update URL:', err);
      return false;
    }
  },
};
