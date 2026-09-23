import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import MessagesScreen from "@/features/customer-tabs/screens/MessagesScreen";

export default function MessagesRoute() {
  const user = useAuthStore((state) => state.user);

  if (user?.role === "tailor") {
    return <Redirect href="/tailor-dashboard/messages" />;
  }

  return <MessagesScreen />;
}
