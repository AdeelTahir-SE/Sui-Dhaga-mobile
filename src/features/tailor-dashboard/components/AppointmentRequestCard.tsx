import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { ImageSource } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { DashActionButton } from "./DashActionButton";
import { StatusPill } from "./StatusPill";
import { TailorDashPlaceholder } from "./TailorDashPlaceholder";

type AppointmentRequestCardProps = {
  image?: ImageSource;
  name: string;
  service: string;
  date: string;
  time: string;
  status?: string;
  newRequest?: boolean;
  tone?: "teal" | "coral" | "gold" | "blue" | "mint" | "cream";
  onPress?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  isProcessing?: boolean;
};

export function AppointmentRequestCard({
  image,
  name,
  service,
  date,
  time,
  status,
  newRequest,
  tone = "teal",
  onPress,
  onAccept,
  onReject,
  isProcessing,
}: AppointmentRequestCardProps) {
  const normStatus = (status || (newRequest ? "requests" : "upcoming")).toLowerCase();
  const isCompleted = normStatus === "completed";
  const isCancelled = normStatus === "cancelled" || normStatus === "canceled" || normStatus === "declined";
  const isUpcoming = normStatus === "upcoming" || normStatus === "confirmed";
  const isPending = !isCompleted && !isCancelled && !isUpcoming;

  const statusLabel = isCompleted
    ? "Completed"
    : isCancelled
    ? "Cancelled"
    : isUpcoming
    ? "Upcoming"
    : "New Request";

  const statusTone: "gold" | "teal" | "blue" | "green" | "red" | "gray" = isCompleted
    ? "green"
    : isCancelled
    ? "red"
    : isUpcoming
    ? "blue"
    : "gold";

  const CardContainer = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { activeOpacity: 0.88, onPress } : {};

  return (
    <CardContainer style={styles.card} {...containerProps}>
      <View style={styles.contentRow}>
        <TailorDashPlaceholder image={image} variant="person" size="md" tone={tone} />
        <View style={styles.infoCol}>
          <View style={styles.headerRow}>
            <Text style={styles.customerName} numberOfLines={1}>{name}</Text>
            <StatusPill label={statusLabel} tone={statusTone} />
          </View>

          <Text style={styles.serviceText} numberOfLines={1}>
            {service}
          </Text>

          <View style={styles.scheduleRow}>
            <View style={styles.scheduleBadge}>
              <Ionicons name="calendar-outline" size={13} color="#078B87" style={{ marginRight: 4 }} />
              <Text style={styles.scheduleText}>{date}</Text>
            </View>
            <View style={styles.scheduleBadge}>
              <Ionicons name="time-outline" size={13} color="#078B87" style={{ marginRight: 4 }} />
              <Text style={styles.scheduleText}>{time}</Text>
            </View>
          </View>
        </View>
      </View>

      {newRequest ? (
        <View style={styles.actionsRow}>
          <DashActionButton
            title="Reject"
            variant="white"
            onPress={onReject}
            disabled={isProcessing}
          />
          <DashActionButton
            title="Accept"
            variant="primary"
            onPress={onAccept}
            disabled={isProcessing}
          />
        </View>
      ) : null}
    </CardContainer>
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
  customerName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 8,
  },
  serviceText: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
  },
  scheduleRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  scheduleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#CCFBF1",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  scheduleText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#0F766E",
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
