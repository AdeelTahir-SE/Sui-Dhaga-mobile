import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  Modal,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "../../../stores/auth.store";
import { useDesigns } from "../../design-studio/hooks/useDesigns";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { QuickAction } from "../components/QuickAction";
import { SectionTitle } from "../components/SectionTitle";
import { TabPlaceholder } from "../components/TabPlaceholder";

const homeHero = require("@/assets/illustrations/customer-tabs/home-hero.png");
const skinTexture = require("@/assets/texture/skin-texture.png");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  const user = useAuthStore((state) => state.user);
  const { designs, isLoading: designsLoading } = useDesigns();

  const [activeModal, setActiveModal] = useState<
    "designs" | "quickActions" | null
  >(null);

  const emailPrefix = user?.email ? user.email.split("@")[0] : "User";
  const userName = user?.fullName?.trim() || user?.name?.trim() || emailPrefix;

  const quickActionsList = [
    {
      id: "qa-1",
      title: "Appointments",
      description: "Manage upcoming fittings & tailor visits",
      icon: "calendar" as const,
      route: "/appointments",
      color: "#2563EB",
      bgColor: "#EFF6FF",
      borderColor: "#DBEAFE",
    },
    {
      id: "qa-2",
      title: "Book Tailor",
      description: "Find & schedule master stitching experts",
      icon: "cut-outline" as const,
      route: "/tailors",
      color: "#D97706",
      bgColor: "#FFFBEB",
      borderColor: "#FEF3C7",
    },
    {
      id: "qa-3",
      title: "AI Studio",
      description: "Create bespoke outfits with AI visualization",
      icon: "color-wand-outline" as const,
      route: "/design-studio",
      color: "#7C3AED",
      bgColor: "#F5F3FF",
      borderColor: "#EDE9FE",
    },
    {
      id: "qa-4",
      title: "My Orders",
      description: "Track live stitching and delivery status",
      icon: "bag-handle-outline" as const,
      route: "/orders",
      color: "#0D9488",
      bgColor: "#F0FDFA",
      borderColor: "#CCFBF1",
    },
    {
      id: "qa-5",
      title: "Measurements",
      description: "Save and update your custom body profiles",
      icon: "body-outline" as const,
      route: "/measurements",
      color: "#E11D48",
      bgColor: "#FFF1F2",
      borderColor: "#FFE4E6",
    },
    {
      id: "qa-6",
      title: "AI Assistant",
      description: "Chat with AI stylist for fabric & cut advice",
      icon: "sparkles-outline" as const,
      route: "/design-studio/chat",
      color: "#EA580C",
      bgColor: "#FFF7ED",
      borderColor: "#FFEDD5",
    },
    {
      id: "qa-7",
      title: "Tailor Map",
      description: "Locate nearby verified boutiques & studios",
      icon: "map-outline" as const,
      route: "/tailors/map",
      color: "#059669",
      bgColor: "#ECFDF5",
      borderColor: "#D1FAE5",
    },
    {
      id: "qa-8",
      title: "Community",
      description: "Connect & share designs with fashion enthusiasts",
      icon: "people-outline" as const,
      route: "/community",
      color: "#4F46E5",
      bgColor: "#EEF2FF",
      borderColor: "#E0E7FF",
    },
  ];

  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Home" />}>
      <View className="px-5 pt-3 pb-8">
        {/* Prominent Header / User Welcome Bar */}
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-[20px] font-black text-brand-dark tracking-tight">
              Hello, {userName} 👋
            </Text>
            <Text className="mt-0.5 text-[13px] font-medium text-brand-gray">
              Ready to look your best today?
            </Text>
          </View>

          {/* Action Icons */}
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => router.push("/messages" as never)}
              activeOpacity={0.7}
              className="relative h-11 w-11 items-center justify-center rounded-md border border-brand-border/80 bg-white shadow-xs"
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#1A1D1F"
              />
              <View className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Prominent Hero Banner */}
        <View className="relative overflow-hidden rounded-md bg-[#FFF7EA] border border-[#FFE8C7] p-5 shadow-sm min-h-[168px] justify-center">
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <RNImage
              source={skinTexture}
              resizeMode="repeat"
              style={[
                StyleSheet.absoluteFill,
                {
                  width: "100%",
                  height: "100%",
                },
              ]}
            />
          </View>
          <Text className="w-[56%] text-[23px] font-black leading-[29px] text-brand-dark">
            Your Style, Your Story, Our Craft.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/tailors" as never)}
            activeOpacity={0.8}
            className="mt-3.5 self-start rounded-md bg-primary px-5 py-3 shadow-sm active:bg-primary-dark flex-row items-center gap-1.5"
          >
            <Text className="text-[13px] font-bold text-white tracking-wide">
              Explore Tailors
            </Text>
            <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
          </TouchableOpacity>
          <Image
            source={homeHero}
            contentFit="cover"
            style={{
              position: "absolute",
              bottom: 0,
              right: -5,
              height: "105%",
              width: "56%",
            }}
          />
        </View>

        {/* Quick Actions (2 Rows of 4) */}
        <SectionTitle
          title="Quick Actions"
          action="View All"
          onPressAction={() => setActiveModal("quickActions")}
        />
        <View className="gap-2">
          <View className="flex-row gap-2">
            {quickActionsList.slice(0, 4).map((quickAction) => (
              <QuickAction
                key={quickAction.id}
                title={quickAction.title}
                icon={quickAction.icon}
                color={quickAction.color}
                bgColor={quickAction.bgColor}
                borderColor={quickAction.borderColor}
                onPress={() => router.push(quickAction.route as never)}
              />
            ))}
          </View>
          <View className="flex-row gap-2">
            {quickActionsList.slice(4, 8).map((quickAction) => (
              <QuickAction
                key={quickAction.id}
                title={quickAction.title}
                icon={quickAction.icon}
                color={quickAction.color}
                bgColor={quickAction.bgColor}
                borderColor={quickAction.borderColor}
                onPress={() => router.push(quickAction.route as never)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Modal: All Quick Actions */}
      <Modal
        visible={activeModal === "quickActions"}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setActiveModal(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          </TouchableWithoutFeedback>

          <View
            style={{
              height: Math.min(620, SCREEN_HEIGHT * 0.78),
              maxHeight: SCREEN_HEIGHT - insets.top - 50,
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 25,
            }}
          >
            <View style={{ alignItems: "center", paddingVertical: 6 }}>
              <View
                style={{
                  width: 44,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: "#E2E8F0",
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#F1F5F9",
                marginBottom: 10,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "900", color: "#1A1D1F" }}
                  numberOfLines={1}
                >
                  All Quick Actions
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: "#6F767E",
                    marginTop: 2,
                  }}
                >
                  Fast shortcuts to everything in Sui Dhaga
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveModal(null)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#F4F5F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={22} color="#1A1D1F" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <View className="gap-2.5">
                {quickActionsList.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      setActiveModal(null);
                      router.push(action.route as never);
                    }}
                    className="flex-row items-center rounded-xl border border-brand-border bg-white p-3.5 shadow-xs active:bg-gray-50"
                  >
                    <View
                      style={{
                        backgroundColor: action.bgColor,
                        borderColor: action.borderColor,
                        borderWidth: 1,
                      }}
                      className="h-11 w-11 items-center justify-center rounded-xl"
                    >
                      <Ionicons
                        name={action.icon}
                        size={22}
                        color={action.color}
                      />
                    </View>
                    <View className="ml-3.5 flex-1">
                      <Text className="text-[14px] font-bold text-brand-dark">
                        {action.title}
                      </Text>
                      <Text className="mt-0.5 text-[11px] font-medium text-brand-gray">
                        {action.description}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: All Designs */}
      <Modal
        visible={activeModal === "designs"}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setActiveModal(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
          </TouchableWithoutFeedback>

          <View
            style={{
              height: Math.min(620, SCREEN_HEIGHT * 0.78),
              maxHeight: SCREEN_HEIGHT - insets.top - 50,
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 25,
            }}
          >
            <View style={{ alignItems: "center", paddingVertical: 6 }}>
              <View
                style={{
                  width: 44,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: "#E2E8F0",
                }}
              />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#F1F5F9",
                marginBottom: 10,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "900", color: "#1A1D1F" }}
                  numberOfLines={1}
                >
                  Design Gallery
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: "#6F767E",
                    marginTop: 2,
                  }}
                >
                  Custom & AI created garment designs
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveModal(null)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#F4F5F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={22} color="#1A1D1F" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {designs.map((design, index) => (
                  <TouchableOpacity
                    key={design.id || index}
                    activeOpacity={0.8}
                    onPress={() => {
                      setActiveModal(null);
                      router.push("/design-studio" as never);
                    }}
                    className="w-[48%] rounded-md border border-brand-border bg-white p-3 shadow-xs active:bg-gray-50 items-center"
                  >
                    <TabPlaceholder
                      image={design.imageUrl || design.image}
                      variant="garment"
                      size="md"
                      tone="coral"
                    />
                    <Text
                      className="mt-2.5 text-center text-[13px] font-bold text-brand-dark leading-[16px]"
                      numberOfLines={1}
                    >
                      {design.name || "Custom Outfit"}
                    </Text>
                    <Text className="mt-0.5 text-center text-[11px] font-medium text-brand-gray">
                      {design.garmentType || design.category || "AI Generated"}
                    </Text>
                    <View className="mt-2.5 w-full rounded-md bg-primary/10 py-1.5 items-center">
                      <Text className="text-[11px] font-bold text-primary">
                        Customize in Studio
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </CustomerTabShell>
  );
}
