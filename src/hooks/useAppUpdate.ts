import { useEffect } from 'react';
import { useAppUpdateStore } from '../stores/app-update.store';

export function useAppUpdate() {
  const updateInfo = useAppUpdateStore((state) => state.updateInfo);
  const isVisible = useAppUpdateStore((state) => state.isVisible);
  const isChecking = useAppUpdateStore((state) => state.isChecking);
  const checkForUpdate = useAppUpdateStore((state) => state.checkForUpdate);
  const dismissModal = useAppUpdateStore((state) => state.dismissModal);
  const triggerUpdate = useAppUpdateStore((state) => state.triggerUpdate);

  // Automatically check on app launch
  useEffect(() => {
    const timer = setTimeout(() => {
      checkForUpdate(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [checkForUpdate]);

  return {
    updateInfo,
    isVisible,
    isChecking,
    checkForUpdate,
    dismissModal,
    triggerUpdate,
  };
}
