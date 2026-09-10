import { router } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type RouteItem = {
  label: string;
  href: string;
};

type RouteGroup = {
  title: string;
  items: RouteItem[];
};

const routeGroups: RouteGroup[] = [
  {
    title: "Auth Flow",
    items: [
      { label: "Login", href: "/auth/login" },
      { label: "Register", href: "/auth/register" },
      { label: "Forgot Password", href: "/auth/forgot-password" },
      { label: "Reset Password", href: "/auth/reset-password" },
      { label: "Success", href: "/auth/success" },
    ],
  },
  {
    title: "Customer Tabs",
    items: [
      { label: "Home", href: "/home" },
      { label: "Tailors", href: "/tailors" },
      { label: "Design", href: "/design" },
      { label: "Orders", href: "/orders" },
      { label: "Messages", href: "/messages" },
      { label: "Profile", href: "/profile" },
    ],
  },
  {
    title: "Tailor Discovery",
    items: [
      { label: "Tailor Map", href: "/tailors/map" },
      { label: "Tailor Profile", href: "/tailors/rekha-tailors" },
    ],
  },
  {
    title: "Booking & Orders",
    items: [
      { label: "Book Appointment", href: "/booking/rekha-tailors" },
      { label: "Appointments", href: "/appointments" },
      { label: "Appointment Details", href: "/appointments/apt-123456" },
      { label: "Order Details", href: "/orders/ord-12345" },
    ],
  },
  {
    title: "AI Design Studio",
    items: [
      { label: "AI Studio", href: "/design-studio" },
      { label: "Text to Design", href: "/design-studio/text-to-design" },
      { label: "Image to Design", href: "/design-studio/image-to-design" },
      { label: "Sketch to Design", href: "/design-studio/sketch-to-design" },
      { label: "AI Chat", href: "/design-studio/chat" },
      { label: "Editor", href: "/design-studio/editor/sample-design" },
      { label: "Export", href: "/design-studio/export/sample-design" },
    ],
  },
  {
    title: "Measurements, Community, Checkout",
    items: [
      { label: "Measurements", href: "/measurements" },
      { label: "Add Measurement", href: "/measurements/new" },
      { label: "Measurement Details", href: "/measurements/bust" },
      { label: "Community", href: "/community" },
      { label: "Create Post", href: "/community/create" },
      { label: "Post Details", href: "/community/post-123" },
      { label: "Checkout", href: "/checkout" },
      { label: "Checkout Success", href: "/checkout/success" },
      { label: "Checkout Failed", href: "/checkout/failed" },
    ],
  },
  {
    title: "Tailor App",
    items: [
      { label: "Dashboard", href: "/tailor-dashboard" },
      { label: "Tailor Orders", href: "/tailor-dashboard/orders" },
      { label: "Tailor Appointments", href: "/tailor-dashboard/appointments" },
      { label: "Services", href: "/tailor-dashboard/services" },
      { label: "Availability", href: "/tailor-dashboard/availability" },
      { label: "Earnings", href: "/tailor-dashboard/earnings" },
    ],
  },
];

export default function DesignRouteLauncher() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-[28px] font-bold text-brand-dark">Sui Dhaga</Text>
        <Text className="mt-2 text-[14px] leading-5 text-brand-gray">
          Design route launcher. Open any implemented screen from here.
        </Text>

        {routeGroups.map((group) => (
          <View key={group.title} className="mt-6">
            <Text className="mb-3 text-[15px] font-bold text-brand-dark">
              {group.title}
            </Text>
            <View className="gap-2">
              {group.items.map((item) => (
                <TouchableOpacity
                  key={item.href}
                  accessibilityRole="button"
                  onPress={() => router.push(item.href as never)}
                  className="h-[48px] flex-row items-center justify-between rounded-xl border border-brand-border bg-white px-4"
                >
                  <Text className="text-[13px] font-medium text-brand-dark">
                    {item.label}
                  </Text>
                  <View className="flex-row items-center">
                    <Text className="mr-2 text-[11px] text-brand-gray">
                      {item.href}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
