import { create } from "zustand";

interface ToastState {
  message: string | null;
  type: "info" | "success" | "warning" | "error";
  isVisible: boolean;
  showToast: (message: string, type?: "info" | "success" | "warning" | "error", duration?: number) => void;
  hideToast: () => void;
}

let toastTimer: any = null;

export const useToastStore = create<ToastState>((set) => ({
  message: null,
  type: "info",
  isVisible: false,

  showToast: (message, type = "info", duration = 3500) => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ message, type, isVisible: true });
    toastTimer = setTimeout(() => {
      set({ isVisible: false, message: null });
    }, duration);
  },

  hideToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ isVisible: false, message: null });
  },
}));

export const toast = {
  show: (message: string, type: "info" | "success" | "warning" | "error" = "info", duration = 3500) => {
    useToastStore.getState().showToast(message, type, duration);
  },
  info: (message: string, duration = 3500) => {
    useToastStore.getState().showToast(message, "info", duration);
  },
  success: (message: string, duration = 3500) => {
    useToastStore.getState().showToast(message, "success", duration);
  },
  warning: (message: string, duration = 3500) => {
    useToastStore.getState().showToast(message, "warning", duration);
  },
  error: (message: string, duration = 3500) => {
    useToastStore.getState().showToast(message, "error", duration);
  },
};
