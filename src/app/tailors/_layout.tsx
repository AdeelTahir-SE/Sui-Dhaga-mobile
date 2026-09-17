import { Stack } from "expo-router";

export default function TailorsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FFFFFF" },
      }}
    />
  );
}
