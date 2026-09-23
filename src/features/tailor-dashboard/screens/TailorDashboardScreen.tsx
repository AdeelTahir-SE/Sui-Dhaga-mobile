import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "../../../stores/auth.store";
import { useAppointments } from "../../booking-orders/hooks/useAppointments";
import { useOrders } from "../../booking-orders/hooks/useOrders";
import { QuickAction } from "../../customer-tabs/components/QuickAction";
import { MetricCard } from "../components/MetricCard";
import { SectionTitle } from "../components/SectionTitle";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { useTailorProfile } from "../hooks/useTailorProfile";

const dashboardHeroImage = require("@/assets/illustrations/tailor-dashboard/dashboard-hero.png");
const buttonGreenishTexture = require("@/assets/texture/button-greenish-texture.original.png");
const ordersMetricIcon = require("@/assets/illustrations/tailor-dashboard/dashboard/orders.png");
const appointmentsMetricIcon = require("@/assets/illustrations/tailor-dashboard/dashboard/appointments.png");
const messagesMetricIcon = require("@/assets/illustrations/tailor-dashboard/dashboard/messages.png");
const earningsMetricIcon = require("@/assets/illustrations/tailor-dashboard/dashboard/earnings.png");

const appointmentsIcon = require("@/assets/illustrations/customer-tabs/home/appointments-icon.png");
const AvailabilityIcon = require("@/assets/illustrations/tailor-dashboard/availability.png");
const ProfileIcon = require("@/assets/illustrations/tailor-dashboard/profile.png");
const ordersIcon = require("@/assets/illustrations/customer-tabs/home/orders-icon.png");
const messagesIcon = require("@/assets/illustrations/customer-tabs/home/messages-icon.png");
const communityIcon = require("@/assets/illustrations/customer-tabs/home/community-icon.png");
const aiStudioIcon = require("@/assets/illustrations/customer-tabs/home/ai-studio-icon.png");

export default function TailorDashboardScreen() {
  const insets = useSafeAreaInsets();
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");
  const [isQuickActionsModalVisible, setIsQuickActionsModalVisible] =
    useState(false);

  const user = useAuthStore((state) => state.user);
  const { profile } = useTailorProfile();
  const { orders } = useOrders();
  const { appointments } = useAppointments();

  const tailorQuickActions = [
    {
      id: "tqa-community",
      title: "Community",
      description: "Connect & share designs with fashion enthusiasts",
      icon: "people-outline" as const,
      image: communityIcon,
      route: "/community",
      color: "#4F46E5",
      bgColor: "#EEF2FF",
      borderColor: "#E0E7FF",
    },
    {
      id: "tqa-availability",
      title: "Availability",
      description: "Update working hours, days & fitting slots",
      icon: "time-outline" as const,
      image: AvailabilityIcon,
      route: "/tailor-dashboard/availability",
      color: "#2563EB",
      bgColor: "#EFF6FF",
      borderColor: "#DBEAFE",
    },
    {
      id: "tqa-profile",
      title: "Profile",
      description: "Edit shop address, bio, experience & photos",
      icon: "storefront-outline" as const,
      image: ProfileIcon,
      route: "/tailor-dashboard/profile",
      color: "#7C3AED",
      bgColor: "#F5F3FF",
      borderColor: "#EDE9FE",
    },
    {
      id: "tqa-messages",
      title: "Messages",
      description: "Client inquiries & direct consultations with customers",
      icon: "chatbubbles-outline" as const,
      image: messagesIcon,
      route: "/tailor-dashboard/messages",
      color: "#0284C7",
      bgColor: "#F0F9FF",
      borderColor: "#BAE6FD",
    },
    {
      id: "tqa-orders",
      title: "Orders",
      description: "Review active, pending & delivered garment orders",
      icon: "bag-handle-outline" as const,
      image: ordersIcon,
      route: "/tailor-dashboard/orders",
      color: "#0D9488",
      bgColor: "#F0FDFA",
      borderColor: "#CCFBF1",
    },
    {
      id: "tqa-appointments",
      title: "Appointments",
      description: "View upcoming fittings, measurements & trial sessions",
      icon: "calendar-outline" as const,
      image: appointmentsIcon,
      route: "/tailor-dashboard/appointments",
      color: "#2563EB",
      bgColor: "#EFF6FF",
      borderColor: "#DBEAFE",
    },
    {
      id: "tqa-earnings",
      title: "Earnings",
      description: "Track revenues, completed order payouts & statements",
      icon: "cash-outline" as const,
      image: earningsMetricIcon,
      route: "/tailor-dashboard/earnings",
      color: "#059669",
      bgColor: "#ECFDF5",
      borderColor: "#A7F3D0",
    },
    {
      id: "tqa-studio",
      title: "Design Studio",
      description: "Explore bespoke templates & AI garment inspirations",
      icon: "color-wand-outline" as const,
      image: aiStudioIcon,
      route: "/design?from=tailor",
      color: "#7C3AED",
      bgColor: "#F5F3FF",
      borderColor: "#EDE9FE",
    },
  ];

  const emailPrefix = user?.email ? user.email.split("@")[0] : "Tailor";
  const displayBusinessName =
    profile?.shopName?.trim() ||
    profile?.businessName?.trim() ||
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    emailPrefix;

  const { newOrdersCount, pendingAppointmentsCount, totalEarnings } =
    useMemo(() => {
      const validOrders = Array.isArray(orders) ? orders : [];
      const validAppts = Array.isArray(appointments) ? appointments : [];

      const newOrders = validOrders.filter(
        (o) => (o.status || "").toLowerCase() === "pending",
      ).length;

      const pendingAppts = validAppts.filter(
        (a) => (a.status || "").toLowerCase() !== "completed",
      ).length;

      const earned = validOrders.reduce((sum, o) => {
        const s = (o.status || "").toLowerCase();
        if (s === "completed" || s === "delivered") {
          return sum + (Number(o.price) || 0);
        }
        return sum;
      }, 0);

      return {
        newOrdersCount: newOrders,
        pendingAppointmentsCount: pendingAppts,
        totalEarnings: earned,
      };
    }, [orders, appointments]);

  return (
    <TailorDashboardShell
      bottomTabs={<TailorDashboardTabs active="Dashboard" />}
    >
      <TailorDashboardHeader title="Dashboard" />
      <View className="px-5 pb-8">
        {/* Hero Banner with greenish texture background */}
        <View className="relative overflow-hidden rounded-md bg-[#00949D] min-h-[175px] justify-center p-6 shadow-sm">
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <Image
              source={buttonGreenishTexture}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
            />
          </View>
          <View className="z-10 max-w-[58%] pr-2">
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              className="text-[12.5px] font-bold tracking-wide"
              style={{
                color: "#DDF7F6",
                textShadowColor: "rgba(0, 0, 0, 0.3)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              Good Morning,
            </Text>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              className="mt-1 text-[22px] font-black tracking-tight text-wrap break-words "
              style={{
                color: "#FFFFFF",
                lineHeight: 27,
                textShadowColor: "rgba(0, 0, 0, 0.4)",
                textShadowOffset: { width: 0, height: 1.5 },
                textShadowRadius: 3,
              }}
            >
              {displayBusinessName}
            </Text>
          </View>
          <Image
            source={dashboardHeroImage}
            contentFit="cover"
            contentPosition="bottom right"
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              height: "100%",
              width: "64%",
            }}
          />
        </View>

        {/* Metrics Grid */}
        <View className="mt-5 flex-row flex-wrap justify-between gap-y-3">
          <MetricCard
            title="New Orders"
            value={String(newOrdersCount)}
            image={ordersMetricIcon}
            tone="teal"
            onPress={() => router.push("/tailor-dashboard/orders" as never)}
          />
          <MetricCard
            title="Appointments"
            value={String(pendingAppointmentsCount)}
            image={appointmentsMetricIcon}
            tone="coral"
            onPress={() =>
              router.push("/tailor-dashboard/appointments" as never)
            }
          />
          <MetricCard
            title="Messages"
            value="0"
            image={messagesMetricIcon}
            tone="coral"
            onPress={() => router.push("/tailor-dashboard/messages" as never)}
          />
          <MetricCard
            title="Earnings"
            value={`Rs. ${totalEarnings.toLocaleString()}`}
            image={earningsMetricIcon}
            tone="green"
            onPress={() => router.push("/tailor-dashboard/earnings" as never)}
          />
        </View>

        {/* Quick Actions (2 Rows of 4) */}
        <SectionTitle
          title="Quick Actions"
          action="View All"
          onPressAction={() => setIsQuickActionsModalVisible(true)}
        />
        <View className="gap-2">
          <View className="flex-row gap-2">
            {tailorQuickActions.slice(0, 4).map((action) => (
              <QuickAction
                key={action.id}
                title={action.title}
                icon={action.icon}
                image={action.image}
                color={action.color}
                bgColor={action.bgColor}
                borderColor={action.borderColor}
                onPress={() => router.push(action.route as never)}
              />
            ))}
          </View>
          <View className="flex-row gap-2">
            {tailorQuickActions.slice(4, 8).map((action) => (
              <QuickAction
                key={action.id}
                title={action.title}
                icon={action.icon}
                image={action.image}
                color={action.color}
                bgColor={action.bgColor}
                borderColor={action.borderColor}
                onPress={() => router.push(action.route as never)}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Modal: All Quick Actions */}
      <Modal
        visible={isQuickActionsModalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setIsQuickActionsModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableWithoutFeedback
            onPress={() => setIsQuickActionsModalVisible(false)}
          >
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
                  Boutique Quick Actions
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: "#6F767E",
                    marginTop: 2,
                  }}
                >
                  Fast shortcuts to manage your tailoring boutique
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsQuickActionsModalVisible(false)}
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
                {tailorQuickActions.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      setIsQuickActionsModalVisible(false);
                      router.push(action.route as never);
                    }}
                    className="flex-row items-center rounded-xl border border-brand-border bg-white p-3.5 shadow-xs active:bg-gray-50"
                  >
                    {action.image ? (
                      <Image
                        source={action.image}
                        contentFit="contain"
                        style={{ width: 44, height: 44 }}
                      />
                    ) : (
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
                    )}
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
    </TailorDashboardShell>
  );
}
