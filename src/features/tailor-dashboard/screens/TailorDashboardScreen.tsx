import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { MetricCard } from "../components/MetricCard";
import { SectionTitle } from "../components/SectionTitle";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { useAuthStore } from "../../../stores/auth.store";
import { useTailorProfile } from "../hooks/useTailorProfile";
import { useOrders } from "../../booking-orders/hooks/useOrders";
import { useAppointments } from "../../booking-orders/hooks/useAppointments";

const dashboardHeroImage = require("@/assets/illustrations/tailor-dashboard/dashboard-hero.png");

function ActivityRow({
  title,
  subtitle,
  time,
}: {
  title: string;
  subtitle: string;
  time: string;
}) {
  return (
    <View className="flex-row items-center border-b border-brand-border py-3.5">
      <View className="h-9 w-9 items-center justify-center rounded-md bg-primary-50">
        <Text className="text-primary font-bold">•</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[13px] font-bold text-brand-dark">{title}</Text>
        <Text className="mt-0.5 text-[11px] font-medium text-brand-gray">{subtitle}</Text>
      </View>
      <Text className="text-[11px] font-semibold text-brand-gray">{time}</Text>
    </View>
  );
}

export default function TailorDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const { profile } = useTailorProfile();
  const { orders } = useOrders();
  const { appointments } = useAppointments();

  const emailPrefix = user?.email ? user.email.split("@")[0] : "Tailor";
  const displayBusinessName =
    profile?.businessName?.trim() ||
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    emailPrefix;

  const { newOrdersCount, pendingAppointmentsCount, totalEarnings } = useMemo(() => {
    const validOrders = Array.isArray(orders) ? orders : [];
    const validAppts = Array.isArray(appointments) ? appointments : [];

    const newOrders = validOrders.filter(
      (o) => (o.status || "").toLowerCase() === "pending"
    ).length;

    const pendingAppts = validAppts.filter(
      (a) => (a.status || "").toLowerCase() !== "completed"
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
        {/* Hero Banner with increased height & no border */}
        <View className="relative overflow-hidden rounded-md bg-primary-50 min-h-[175px] justify-center p-6 shadow-sm">
          <Text className="text-[13px] font-bold text-brand-gray tracking-wide">Good Morning,</Text>
          <Text className="mt-1 text-[23px] font-black text-primary tracking-tight">
            {displayBusinessName}
          </Text>
          <Text className="mt-2 w-[55%] text-[13px] font-semibold text-brand-dark leading-[19px]">
            Here's what's happening with your boutique today.
          </Text>
          <Image
            source={dashboardHeroImage}
            contentFit="contain"
            style={{
              position: "absolute",
              bottom: 6,
              right: 12,
              height: 140,
              width: 140,
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
            onPress={() => router.push("/tailor-dashboard/appointments" as never)}
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

        {/* Recent Activity */}
        <SectionTitle title="Recent Activity" />
        <View className="rounded-md border border-brand-border bg-white px-3.5 shadow-xs">
          {orders?.length > 0 ? (
            orders.slice(0, 3).map((o, idx) => (
              <ActivityRow
                key={o.id || idx}
                title={`Order #${o.orderNumber || o.id}`}
                subtitle={`${o.itemName || "Custom Garment"} • ${o.customerName || "Customer"}`}
                time={o.status || "Active"}
              />
            ))
          ) : (
            <View className="py-6 items-center justify-center">
              <Text className="text-[13px] font-medium text-brand-gray">
                No recent activity to show
              </Text>
            </View>
          )}
        </View>
      </View>
    </TailorDashboardShell>
  );
}
