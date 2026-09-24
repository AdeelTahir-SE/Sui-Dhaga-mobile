import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

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
  tone = "teal",
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
      activeOpacity={0.88}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.contentRow}>
        <TailorDashPlaceholder image={image} variant="garment" size="md" tone={tone} />
        <View style={styles.infoCol}>
          <View style={styles.headerRow}>
            <View style={styles.idBadge}>
              <Text style={styles.idText}>#{id}</Text>
            </View>
            <StatusPill label={statusLabel} tone={statusTone} />
          </View>

          <Text style={styles.itemTitle} numberOfLines={1}>
            {item}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.priceText}>{price}</Text>
            <View style={styles.dotSeparator} />
            <View style={styles.customerWrap}>
              <Ionicons name="person-outline" size={12} color="#64748B" style={{ marginRight: 3 }} />
              <Text style={styles.customerText} numberOfLines={1}>
                {customer}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Action Strip */}
      {isPending ? (
        <View style={styles.actionsRow}>
          <DashActionButton
            title="Reject"
            variant="white"
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
        <View style={styles.actionsRow}>
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
        <View style={styles.actionsRow}>
          <DashActionButton title="View Details" variant="outline" onPress={onPress} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  contentRow: {
    flexDirection: "row",
  },
  infoCol: {
    marginLeft: 14,
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  idBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  idText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#334155",
  },
  itemTitle: {
    marginTop: 5,
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  metaRow: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "900",
    color: "#078B87",
  },
  dotSeparator: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: "#CBD5E1",
    marginHorizontal: 8,
  },
  customerWrap: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  customerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  actionsRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    gap: 10,
  },
});
