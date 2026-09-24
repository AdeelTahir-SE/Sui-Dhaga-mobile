import { Text, TouchableOpacity, View } from "react-native";
import type { ImageSource } from "expo-image";

import { DashActionButton } from "./DashActionButton";
import { StatusPill } from "./StatusPill";
import { TailorDashPlaceholder } from "./TailorDashPlaceholder";

type OrderRequestCardProps = {
  image?: ImageSource;
  id: string;
  item: string;
  price: string;
  customer: string;
  status?: string;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  onPress?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  isProcessing?: boolean;
  actionLoading?: "accept" | "reject" | null;
};

export function OrderRequestCard({
  image,
  id,
  item,
  price,
  customer,
  status,
  tone = "coral",
  onPress,
  onAccept,
  onReject,
  isProcessing,
  actionLoading,
}: OrderRequestCardProps) {
  const normStatus = (status || "new").toLowerCase();
  const isPending = normStatus === "pending" || normStatus === "new";
  const isCompleted = normStatus === "completed" || normStatus === "delivered";
  const isCancelled = normStatus === "cancelled" || normStatus === "canceled" || normStatus === "rejected";
  const isInProgress = !isPending && !isCompleted && !isCancelled;

  const statusLabel = isCompleted
    ? "Completed"
    : isCancelled
    ? "Cancelled"
    : isInProgress
    ? "In Progress"
    : "New Request";

  const statusTone: "gold" | "teal" | "blue" | "green" | "red" | "gray" = isCompleted
    ? "green"
    : isCancelled
    ? "red"
    : isInProgress
    ? "blue"
    : "gold";

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.85 : 1}
      onPress={onPress}
      className="mb-3.5 rounded-md border border-brand-border bg-white p-3.5 shadow-xs"
    >
      <View className="flex-row">
        <TailorDashPlaceholder image={image} variant="garment" size="md" tone={tone} />
        <View className="ml-3.5 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="text-[14px] font-black text-brand-dark">#{id}</Text>
            <StatusPill label={statusLabel} tone={statusTone} />
          </View>
          <Text className="mt-1 text-[13px] font-bold text-brand-dark">
            {item}
          </Text>
          <Text className="mt-1 text-[14px] font-black text-brand-dark">
            {price}
          </Text>
          <Text className="mt-1 text-[12px] font-medium text-brand-gray">
            Customer: {customer}
          </Text>
        </View>
      </View>
      {isPending ? (
        <View className="mt-3 flex-row gap-3">
          <DashActionButton
            title="Reject"
            variant="black"
            onPress={onReject}
            disabled={isProcessing}
            loading={actionLoading === "reject"}
          />
          <DashActionButton
            title="Accept"
            variant="primary"
            onPress={onAccept}
            disabled={isProcessing}
            loading={actionLoading === "accept"}
          />
        </View>
      ) : isInProgress ? (
        <View className="mt-3 flex-row gap-3">
          <DashActionButton title="View Details" variant="outline" onPress={onPress} />
          <DashActionButton
            title="Mark Done"
            variant="primary"
            onPress={onAccept}
            disabled={isProcessing}
            loading={actionLoading === "accept"}
          />
        </View>
      ) : (
        <View className="mt-3 flex-row gap-3">
          <DashActionButton title="View Details" variant="outline" onPress={onPress} />
        </View>
      )}
    </TouchableOpacity>
  );
}
