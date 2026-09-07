import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { MetricCard } from "../components/MetricCard";
import { SectionTitle } from "../components/SectionTitle";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { TailorDashPlaceholder } from "../components/TailorDashPlaceholder";
import { useAuthStore } from "../../../stores/auth.store";
import { useTailorProfile } from "../hooks/useTailorProfile";

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
    <View className="flex-row items-center border-b border-brand-border py-3">
      <View className="h-9 w-9 items-center justify-center rounded-md bg-primary-50">
        <Text className="text-primary">•</Text>
      </View>
      <View className="ml-3 flex-1">
        <Text className="text-[12px] font-semibold text-brand-dark">{title}</Text>
        <Text className="mt-1 text-[10px] text-brand-gray">{subtitle}</Text>
      </View>
      <Text className="text-[10px] text-brand-gray">{time}</Text>
    </View>
  );
}

export default function TailorDashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const { profile, isComplete } = useTailorProfile();

  const emailPrefix = user?.email ? user.email.split("@")[0] : "Tailor";
  const displayBusinessName =
    profile?.businessName?.trim() ||
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    emailPrefix;

  return (
    <TailorDashboardShell
      bottomTabs={<TailorDashboardTabs active="Dashboard" />}
    >
      <TailorDashboardHeader title="Dashboard" />
      <View className="px-5 pb-8">
        {/* Incomplete Profile Banner */}
        {!isComplete && (
          <View className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3.5">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-2">
                <View className="flex-row items-center">
                  <Ionicons name="sparkles" size={16} color="#D97706" />
                  <Text className="ml-1.5 text-[13px] font-bold text-amber-900">
                    Complete Tailor Profile
                  </Text>
                </View>
                <Text className="mt-1 text-[11px] leading-4 text-amber-800">
                  Set up your business name, specialties, city, and starting
                  prices to receive customer requests.
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push("/tailor-dashboard/complete-profile" as any)}
                className="items-center justify-center rounded-md bg-amber-600 px-3 py-1.5 shadow-sm"
              >
                <Text className="text-[11px] font-bold text-white">Setup</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Hero Card */}
        <View className="overflow-hidden rounded-md bg-primary-50 p-4">
          <Text className="text-[12px] text-brand-gray">Good Morning,</Text>
          <Text className="mt-1 text-[20px] font-bold text-primary">
            {displayBusinessName}
          </Text>
          <Text className="mt-2 w-[58%] text-[11px] leading-4 text-brand-dark">
            Here's what's happening today.
          </Text>
          <View className="absolute bottom-3 right-4">
            <TailorDashPlaceholder
              image={dashboardHeroImage}
              variant="machine"
              size="hero"
              tone="cream"
            />
          </View>
        </View>

        {/* Metrics Grid */}
        <View className="mt-5 flex-row flex-wrap justify-between gap-y-3">
          <MetricCard title="New Orders" value="12" action="View all" icon="bag-add-outline" tone="coral" />
          <MetricCard title="Appointments" value="5" action="View all" icon="calendar-outline" tone="gold" />
          <MetricCard title="Messages" value="8" action="View all" icon="chatbubble-outline" tone="teal" />
          <MetricCard title="Earnings (This Month)" value="₹48,650" action="View details" icon="cash-outline" tone="teal" />
        </View>

        {/* Recent Activity */}
        <SectionTitle title="Recent Activity" />
        <View className="rounded-md border border-brand-border px-3">
          <ActivityRow title="New order request" subtitle="#ORD1234" time="2m ago" />
          <ActivityRow title="Appointment request" subtitle="Riya Sharma" time="10m ago" />
          <ActivityRow title="New message" subtitle="From Neha Verma" time="20m ago" />
        </View>
        <Text className="mt-4 text-center text-[12px] font-semibold text-primary">
          View all activity
        </Text>
      </View>
    </TailorDashboardShell>
  );
}
