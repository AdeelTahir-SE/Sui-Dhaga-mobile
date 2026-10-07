export interface AppVersionInfo {
  platform: string;
  latestVersion: string;
  minVersion: string;
  downloadUrl: string;
  releaseNotes?: string;
  forceUpdate: boolean;
  isUpdateAvailable: boolean;
  isMandatory: boolean;
}
