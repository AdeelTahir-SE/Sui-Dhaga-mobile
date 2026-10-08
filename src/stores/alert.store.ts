import { create } from "zustand";

export type AlertType = "success" | "error" | "warning" | "info" | "block";

export interface ThemedAlertButton {
  text?: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export interface ThemedAlertOptions {
  cancelable?: boolean;
  onDismiss?: () => void;
  type?: AlertType;
  badge?: string;
  icon?: string;
}

export interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons: ThemedAlertButton[];
  options?: ThemedAlertOptions;
  type: AlertType;
  showAlert: (
    title: string,
    message?: string,
    buttons?: ThemedAlertButton[],
    options?: ThemedAlertOptions
  ) => void;
  dismissAlert: () => void;
}

/**
 * Heuristically infers the visual alert type from title, message, and buttons
 */
export function inferAlertType(
  title: string,
  message?: string,
  buttons?: ThemedAlertButton[],
  explicitType?: AlertType
): AlertType {
  if (explicitType) return explicitType;

  const content = `${title} ${message || ""}`.toLowerCase();

  // Check for destructive buttons first
  const hasDestructive = buttons?.some((b) => b.style === "destructive");
  if (hasDestructive) {
    if (content.includes("block")) return "block";
    return "warning";
  }

  // Blocking specific detection
  if (content.includes("block")) {
    return "block";
  }

  // Success detection
  if (
    content.includes("success") ||
    content.includes("updated") ||
    content.includes("saved") ||
    content.includes("confirmed") ||
    content.includes("completed") ||
    content.includes("created") ||
    content.includes("placed successfully")
  ) {
    return "success";
  }

  // Error detection
  if (
    content.includes("error") ||
    content.includes("fail") ||
    content.includes("unable") ||
    content.includes("could not") ||
    content.includes("invalid") ||
    content.includes("required") ||
    content.includes("missing") ||
    content.includes("denied")
  ) {
    return "error";
  }

  // Warning / Confirmation detection
  if (
    content.includes("are you sure") ||
    content.includes("sign out") ||
    content.includes("log out") ||
    content.includes("delete") ||
    content.includes("remove") ||
    content.includes("cancel") ||
    content.includes("warning") ||
    content.includes("decline")
  ) {
    return "warning";
  }

  return "info";
}

export const useAlertStore = create<AlertState>((set) => ({
  visible: false,
  title: "",
  message: undefined,
  buttons: [],
  options: undefined,
  type: "info",

  showAlert: (title, message, buttons, options) => {
    const defaultButtons: ThemedAlertButton[] =
      buttons && buttons.length > 0 ? buttons : [{ text: "OK", style: "default" }];
    const resolvedType = inferAlertType(title, message, defaultButtons, options?.type);

    set({
      visible: true,
      title,
      message,
      buttons: defaultButtons,
      options,
      type: resolvedType,
    });
  },

  dismissAlert: () => {
    set({ visible: false });
  },
}));
