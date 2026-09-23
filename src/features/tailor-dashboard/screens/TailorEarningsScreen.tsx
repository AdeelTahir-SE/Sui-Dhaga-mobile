import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { SectionTitle } from "../components/SectionTitle";
import { TailorDashboardHeader } from "../components/TailorDashboardHeader";
import { TailorDashboardShell } from "../components/TailorDashboardShell";
import { TailorDashboardTabs } from "../components/TailorDashboardTabs";
import { TailorDashPlaceholder } from "../components/TailorDashPlaceholder";
import { TailorEarningsChart } from "../components/TailorEarningsChart";
import { useOrders } from "../../booking-orders/hooks/useOrders";

const earningsImages = {
  money: require("@/assets/illustrations/tailor-dashboard/earnings/money-bag.png"),
  transaction: require("@/assets/illustrations/tailor-dashboard/earnings/transaction.png"),
};

function formatTransactionDate(dateStr?: string) {
  if (!dateStr) return "Recent";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function TransactionRow({
  id,
  date,
  amount,
  status,
  isPaid,
}: {
  id: string;
  date: string;
  amount: string;
  status: string;
  isPaid: boolean;
}) {
  return (
    <View className="flex-row items-center border-b border-brand-border py-3.5">
      <TailorDashPlaceholder
        image={earningsImages.transaction}
        variant="money"
        size="xs"
        tone="cream"
      />
      <View className="ml-3 flex-1">
        <Text className="text-[13px] font-bold text-brand-dark">#{id}</Text>
        <Text className="mt-0.5 text-[11px] font-medium text-brand-gray">{date}</Text>
      </View>
      <View className="items-end">
        <Text className="text-right text-[13px] font-black text-brand-dark">{amount}</Text>
        <Text
          className={`mt-0.5 text-right text-[10px] font-bold ${
            isPaid ? "text-[#2B9A52]" : "text-amber-600"
          }`}
        >
          {status}
        </Text>
      </View>
    </View>
  );
}

export default function TailorEarningsScreen() {
  const { orders, isLoading, isRefreshing, refresh } = useOrders();

  const { totalEarned, completedCount, pendingAmount, transactions } = useMemo(() => {
    let earned = 0;
    let completed = 0;
    let pending = 0;

    const validOrders = Array.isArray(orders) ? orders : [];

    const txs = validOrders.map((o, index) => {
      const priceVal = Number(o.price) || 0;
      const statusLower = (o.status || "").toLowerCase();
      const isCompleted = statusLower === "completed" || statusLower === "delivered";
      const isCancelled = statusLower === "cancelled" || statusLower === "canceled";

      if (isCompleted) {
        earned += priceVal;
        completed += 1;
      } else if (!isCancelled) {
        pending += priceVal;
      }

      return {
        id: o.orderNumber || o.id || String(index + 1),
        date: formatTransactionDate(o.createdAt || o.deliveryDate || o.dueDate),
        amount: `Rs. ${priceVal.toLocaleString()}`,
        status: isCompleted ? "Paid" : isCancelled ? "Cancelled" : "Pending",
        isPaid: isCompleted,
      };
    });

    return {
      totalEarned: earned,
      completedCount: completed,
      pendingAmount: pending,
      transactions: txs,
    };
  }, [orders]);

  return (
    <TailorDashboardShell
      bottomTabs={<TailorDashboardTabs active="Earnings" />}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={refresh}
          tintColor="#14919B"
          colors={["#14919B"]}
        />
      }
    >
      <TailorDashboardHeader title="Earnings" rightText="Overview" />
      <View className="flex-1 px-5 pb-8">
        <Text className="text-[12px] font-bold uppercase tracking-wider text-brand-gray">Total Earnings</Text>
        <View className="mt-2 flex-row items-center justify-between">
          <View>
            <Text className="text-[34px] font-black text-brand-dark tracking-tight">
              Rs. {totalEarned.toLocaleString()}
            </Text>
            <View className="mt-2 self-start rounded-md bg-[#EAF8EE] px-2.5 py-1">
              <Text className="text-[12px] font-bold text-[#2B9A52]">
                {completedCount > 0 ? `✓ ${completedCount} Completed Order${completedCount > 1 ? "s" : ""}` : "No completed orders yet"}
              </Text>
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
          <View className="flex-1 rounded-md border border-brand-border bg-white p-4 shadow-xs">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-brand-gray">Completed Orders</Text>
            <Text className="mt-2 text-[24px] font-black text-brand-dark">{completedCount}</Text>
          </View>
          <View className="flex-1 rounded-md border border-brand-border bg-white p-4 shadow-xs">
            <Text className="text-[11px] font-bold uppercase tracking-wider text-brand-gray">Pending Payments</Text>
            <Text className="mt-2 text-[24px] font-black text-brand-dark">Rs. {pendingAmount.toLocaleString()}</Text>
          </View>
        </View>

        <SectionTitle title="Earnings Overview" />
        <TailorEarningsChart orders={orders} totalEarned={totalEarned} />

        <SectionTitle title="Recent Transactions" />
        {isLoading && !isRefreshing ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color="#14919B" />
          </View>
        ) : transactions.length === 0 ? (
          <View className="items-center justify-center py-10 px-4 my-2 rounded-2xl border border-dashed border-brand-border bg-gray-50/50">
            <View className="w-16 h-16 rounded-full bg-primary/10 items-center justify-center mb-3">
              <Ionicons name="cash-outline" size={34} color="#14919B" />
            </View>
            <Text className="text-[17px] font-bold text-brand-dark text-center tracking-tight">
              No Transactions Yet
            </Text>
            <Text className="mt-1.5 text-[13px] font-medium text-brand-gray text-center leading-[19px] max-w-[280px]">
              When you accept and complete customer orders, your transactions and payouts will be recorded here.
            </Text>
          </View>
        ) : (
          <View className="rounded-md border border-brand-border bg-white px-3.5 shadow-xs">
            {transactions.slice(0, 10).map((tx, index) => (
              <TransactionRow
                key={tx.id || index}
                id={tx.id}
                date={tx.date}
                amount={tx.amount}
                status={tx.status}
                isPaid={tx.isPaid}
              />
            ))}
          </View>
        )}
      </View>
    </TailorDashboardShell>
  );
}
