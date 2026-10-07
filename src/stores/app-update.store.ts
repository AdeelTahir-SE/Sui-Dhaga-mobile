import { create } from 'zustand';
import { Alert } from 'react-native';
import { appUpdateService, UpdateCheckResult } from '../services/app-update.service';

interface AppUpdateState {
  updateInfo: UpdateCheckResult | null;
  isVisible: boolean;
  isChecking: boolean;
  checkForUpdate: (isManual?: boolean) => Promise<void>;
  dismissModal: () => void;
  triggerUpdate: () => Promise<void>;
}

export const useAppUpdateStore = create<AppUpdateState>((set, get) => ({
  updateInfo: null,
  isVisible: false,
  isChecking: false,

  checkForUpdate: async (isManual = false) => {
    set({ isChecking: true });
    try {
      const result = await appUpdateService.checkForUpdate();
      if (result && result.isUpdateAvailable) {
        set({ updateInfo: result, isVisible: true });
      } else {
        set({ updateInfo: null, isVisible: false });
        if (isManual) {
          Alert.alert(
            'Up to Date',
            `You are using the latest version of Sui Dhaga (v${appUpdateService.getCurrentVersion()}).`
          );
        }
      }
    } catch {
      if (isManual) {
        Alert.alert('Check Failed', 'Could not verify the latest version. Please check your internet connection.');
      }
    } finally {
      set({ isChecking: false });
    }
  },

  dismissModal: () => {
    const { updateInfo } = get();
    // Cannot dismiss if update is mandatory
    if (updateInfo?.isMandatory) {
      return;
    }
    set({ isVisible: false });
  },

  triggerUpdate: async () => {
    const { updateInfo } = get();
    if (updateInfo?.downloadUrl) {
      await appUpdateService.openUpdateUrl(updateInfo.downloadUrl);
    }
  },
}));
