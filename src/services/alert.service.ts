import { Alert as RNAlert } from "react-native";
import { useAlertStore, ThemedAlertButton, ThemedAlertOptions, AlertType } from "../stores/alert.store";

// Store reference to native Alert.alert in case native popup is explicitly needed
const originalRNAlert = RNAlert.alert;

/**
 * Patch React Native's Alert.alert to render our custom Sui Dhaga themed modal.
 */
function patchReactNativeAlert() {
  RNAlert.alert = (
    title: string,
    message?: string,
    buttons?: ThemedAlertButton[],
    options?: ThemedAlertOptions
  ) => {
    useAlertStore.getState().showAlert(title, message, buttons, options);
  };
}

// Automatically patch upon module import
patchReactNativeAlert();

export const ThemedAlert = {
  /**
   * General alert matching React Native's Alert.alert signature
   */
  alert: (
    title: string,
    message?: string,
    buttons?: ThemedAlertButton[],
    options?: ThemedAlertOptions
  ) => {
    useAlertStore.getState().showAlert(title, message, buttons, options);
  },

  /**
   * Convenient helper for success alerts (e.g., "Profile updated successfully")
   */
  success: (title: string, message?: string, onOk?: () => void) => {
    useAlertStore.getState().showAlert(
      title,
      message,
      [{ text: "OK", onPress: onOk, style: "default" }],
      { type: "success" }
    );
  },

  /**
   * Convenient helper for error alerts
   */
  error: (title: string, message?: string, onOk?: () => void) => {
    useAlertStore.getState().showAlert(
      title,
      message,
      [{ text: "OK", onPress: onOk, style: "default" }],
      { type: "error" }
    );
  },

  /**
   * Convenient helper for warning alerts
   */
  warning: (title: string, message?: string, onOk?: () => void) => {
    useAlertStore.getState().showAlert(
      title,
      message,
      [{ text: "OK", onPress: onOk, style: "default" }],
      { type: "warning" }
    );
  },

  /**
   * Convenient helper for confirmations (e.g., "Are you sure you want to block?")
   */
  confirm: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDestructive = false
  ) => {
    useAlertStore.getState().showAlert(
      title,
      message,
      [
        { text: cancelText, onPress: onCancel, style: "cancel" },
        {
          text: confirmText,
          onPress: onConfirm,
          style: isDestructive ? "destructive" : "default",
        },
      ],
      {
        type: isDestructive ? "warning" : "info",
        cancelable: true,
      }
    );
  },

  /**
   * Dismiss the currently open themed alert
   */
  dismiss: () => {
    useAlertStore.getState().dismissAlert();
  },

  /**
   * Escape hatch to display native system alert if needed
   */
  nativeAlert: originalRNAlert,
};
