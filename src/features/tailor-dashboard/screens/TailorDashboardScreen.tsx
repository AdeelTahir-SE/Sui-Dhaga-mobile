import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useAuthStore } from "../../../stores/auth.store";
import { useAppointments } from "../../booking-orders/hooks/useAppointments";
import { useOrders } from "../../booking-orders/hooks/useOrders";
import { MetricCard } from "../components/MetricCard";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { useTailorProfile } from "../hooks/useTailorProfile";

const dashboardHeroImage = require("@/assets/illustrations/tailor-dashboard/dashboard-hero.png");
const buttonGreenishTexture = require("@/assets/texture/button-greenish-texture.original.png");

export default function TailorDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const { profile } = useTailorProfile();
  const { orders } = useOrders();
  const { appointments } = useAppointments();

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
              className="mt-1 text-[22px] font-black tracking-tight"
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
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              className="mt-1.5 text-[12.5px] font-semibold leading-[18px]"
              style={{
                color: "#F0FDFA",
                textShadowColor: "rgba(0, 0, 0, 0.25)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              Here's what's happening with your boutique today.
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
              width: "48%",
            }}
          />
        </View>

        {/* Metrics Grid */}
        <View className="mt-5 flex-row flex-wrap justify-between gap-y-3">
          <MetricCard
            title="New Orders"
            value={String(newOrdersCount)}
            action="View all"
            icon="bag-add-outline"
            tone="coral"
            onPress={() => router.push("/tailor-dashboard/orders" as never)}
          />
          <MetricCard
            title="Appointments"
            value={String(pendingAppointmentsCount)}
            action="View all"
            icon="calendar-outline"
            tone="gold"
            onPress={() =>
              router.push("/tailor-dashboard/appointments" as never)
            }
          />
          <MetricCard
            title="Messages"
            value="0"
            action="View all"
            icon="chatbubble-outline"
            tone="teal"
            onPress={() => router.push("/messages" as never)}
          />
          <MetricCard
            title="Earnings"
            value={`Rs. ${totalEarnings.toLocaleString()}`}
            action="View details"
            icon="cash-outline"
            tone="teal"
            onPress={() => router.push("/tailor-dashboard/earnings" as never)}
          />
        </View>
      </View>
    </TailorDashboardShell>
  );
}
