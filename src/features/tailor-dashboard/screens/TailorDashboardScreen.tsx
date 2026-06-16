import { Text, View } from "react-native";

import { MetricCard } from "../components/MetricCard";
import { SectionTitle } from "../components/SectionTitle";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { TailorDashPlaceholder } from "../components/TailorDashPlaceholder";

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
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
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
  return (
    <TailorDashboardShell
      bottomTabs={<TailorDashboardTabs active="Dashboard" />}
    >
      <TailorDashboardHeader title="Dashboard" />
      <View className="px-5">
        <View className="overflow-hidden rounded-2xl bg-primary-50 p-4">
          <Text className="text-[12px] text-brand-gray">Good Morning,</Text>
          <Text className="mt-1 text-[20px] font-bold text-primary">
            Rekha Tailors
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

        <View className="mt-5 flex-row flex-wrap justify-between gap-y-3">
          <MetricCard title="New Orders" value="12" action="View all" icon="bag-add-outline" tone="coral" />
          <MetricCard title="Appointments" value="5" action="View all" icon="calendar-outline" tone="gold" />
          <MetricCard title="Messages" value="8" action="View all" icon="chatbubble-outline" tone="teal" />
          <MetricCard title="Earnings (This Month)" value="₹48,650" action="View details" icon="cash-outline" tone="teal" />
        </View>

        <SectionTitle title="Recent Activity" />
        <View className="rounded-xl border border-brand-border px-3">
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
