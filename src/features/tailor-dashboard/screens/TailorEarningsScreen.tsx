import { Text, View } from "react-native";

import { SectionTitle } from "../components/SectionTitle";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { TailorDashPlaceholder } from "../components/TailorDashPlaceholder";

const earningsImages = {
  money: require("@/assets/illustrations/tailor-dashboard/earnings/money-bag.png"),
  chart: require("@/assets/illustrations/tailor-dashboard/earnings/monthly-chart.png"),
  transaction: require("@/assets/illustrations/tailor-dashboard/earnings/transaction.png"),
};

function TransactionRow({
  id,
  date,
  amount,
  status,
}: {
  id: string;
  date: string;
  amount: string;
  status: string;
}) {
  return (
    <View className="flex-row items-center border-b border-brand-border py-3">
      <TailorDashPlaceholder
        image={earningsImages.transaction}
        variant="money"
        size="xs"
        tone="cream"
      />
      <View className="ml-3 flex-1">
        <Text className="text-[12px] font-bold text-brand-dark">#{id}</Text>
        <Text className="mt-1 text-[10px] text-brand-gray">{date}</Text>
      </View>
      <View>
        <Text className="text-right text-[12px] font-bold text-brand-dark">{amount}</Text>
        <Text className="mt-1 text-right text-[10px] text-brand-gray">{status}</Text>
      </View>
    </View>
  );
}

export default function TailorEarningsScreen() {
  return (
    <TailorDashboardShell
      bottomTabs={<TailorDashboardTabs active="Earnings" />}
    >
      <TailorDashboardHeader title="Earnings" showBack rightText="This Month" />
      <View className="px-5">
        <Text className="text-[12px] text-brand-gray">Total Earnings</Text>
        <View className="mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-[32px] font-bold text-brand-dark">₹48,650</Text>
            <View className="mt-2 self-start rounded-md bg-[#EAF8EE] px-2 py-1">
              <Text className="text-[11px] font-semibold text-[#2B9A52]">↑ 16.5% vs last month</Text>
            </View>
          </View>
          <TailorDashPlaceholder
            image={earningsImages.money}
            variant="money"
            size="md"
            tone="gold"
          />
        </View>

        <View className="mt-5 flex-row gap-3">
          <View className="flex-1 rounded-xl border border-brand-border p-4">
            <Text className="text-[11px] text-brand-gray">Completed Orders</Text>
            <Text className="mt-2 text-[22px] font-bold text-brand-dark">32</Text>
          </View>
          <View className="flex-1 rounded-xl border border-brand-border p-4">
            <Text className="text-[11px] text-brand-gray">Pending Payments</Text>
            <Text className="mt-2 text-[22px] font-bold text-brand-dark">₹12,350</Text>
          </View>
        </View>

        <SectionTitle title="Earnings Overview" />
        <TailorDashPlaceholder
          image={earningsImages.chart}
          variant="chart"
          size="chart"
          tone="mint"
        />

        <SectionTitle title="Recent Transactions" action="View all" />
        <View className="rounded-xl border border-brand-border px-3">
          <TransactionRow id="ORD12345" date="20 May 2024" amount="₹12,500" status="Paid" />
          <TransactionRow id="ORD12344" date="18 May 2024" amount="₹18,000" status="Paid" />
          <TransactionRow id="ORD12343" date="15 May 2024" amount="₹8,500" status="Pending" />
        </View>
      </View>
    </TailorDashboardShell>
  );
}
