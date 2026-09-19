import React, { useMemo } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MeasurementItem } from "../../../types/api";

type MeasurementCardProps = {
  profile: MeasurementItem;
  index?: number;
  onEdit: (profile: MeasurementItem) => void;
  onDelete: (profile: MeasurementItem) => void;
  onShare: (profile: MeasurementItem) => void;
  onPress?: (profile: MeasurementItem) => void;
};

export function MeasurementCard({
  profile,
  onEdit,
  onDelete,
  onShare,
  onPress,
}: MeasurementCardProps) {
  // Extract Person Name, Fit Preference, and notes cleanly
  const { personName, fitLabel, cleanNotes } = useMemo(() => {
    let person = "";
    let fit = "Regular Fit";
    const notesText = profile.notes || "";

    const forMatch = notesText.match(/For:\s*([^\]]+)/i);
    const fitMatch = notesText.match(/Fit:\s*([^,\s\]]+)/i);

    if (forMatch) {
      person = forMatch[1].trim();
    } else if (profile.profileName) {
      person = profile.profileName.replace(/'s Measurements.*/i, "").trim();
    } else {
      person = "Person";
    }

    if (fitMatch) {
      const f = fitMatch[1].toLowerCase();
      if (f.includes("fitted")) fit = "Fitted";
      else if (f.includes("loose")) fit = "Comfort Fit";
      else fit = "Regular Fit";
    }

    const cleaned = notesText.replace(/\[Fit:[^\]]+\]\s*/g, "").replace(/\[For:[^\]]+\]\s*/g, "").trim();

    return { personName: person, fitLabel: fit, cleanNotes: cleaned };
  }, [profile.notes, profile.profileName]);

  const unitStr = profile.unit === "cm" ? "cm" : "in";
  const initialLetter = (personName || "M").charAt(0).toUpperCase();

  // Non-empty dimensions list
  const dimensions = useMemo(() => {
    const list: Array<{ label: string; value: number }> = [];
    if (profile.chest) list.push({ label: "Chest", value: profile.chest });
    if (profile.waist) list.push({ label: "Waist", value: profile.waist });
    if (profile.hips) list.push({ label: "Hips", value: profile.hips });
    if (profile.shoulder) list.push({ label: "Shoulder", value: profile.shoulder });
    if (profile.sleeveLength) list.push({ label: "Sleeve", value: profile.sleeveLength });
    if (profile.shirtLength) list.push({ label: "Shirt Length", value: profile.shirtLength });
    if (profile.trouserLength) list.push({ label: "Trouser Length", value: profile.trouserLength });
    if (profile.inseam) list.push({ label: "Inseam", value: profile.inseam });
    if (profile.neck) list.push({ label: "Collar / Neck", value: profile.neck });
    return list;
  }, [profile]);

  const formattedDate = useMemo(() => {
    if (!profile.updatedAt) return "";
    try {
      return new Date(profile.updatedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  }, [profile.updatedAt]);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.92 : 1}
      onPress={() => onPress && onPress(profile)}
      style={styles.card}
    >
      {/* Top Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{initialLetter}</Text>
        </View>

        <View style={styles.titleContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.personName} numberOfLines={1}>
              {personName}
            </Text>
            {formattedDate ? (
              <Text style={styles.dateText}>{formattedDate}</Text>
            ) : null}
          </View>

          {profile.profileName && profile.profileName !== personName ? (
            <Text style={styles.subProfileName} numberOfLines={1}>
              {profile.profileName}
            </Text>
          ) : null}

          {/* Clean, Grounded Fit and Unit Row */}
          <View style={styles.metaRow}>
            <View style={styles.metaTag}>
              <Text style={styles.metaLabel}>Fit:</Text>
              <Text style={styles.metaValue}>{fitLabel}</Text>
            </View>
            <View style={styles.metaTag}>
              <Text style={styles.metaLabel}>Unit:</Text>
              <Text style={styles.metaValue}>
                {profile.unit === "cm" ? "Centimeters (cm)" : "Inches (in)"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Dimensions Grid */}
      {dimensions.length > 0 ? (
        <View style={styles.dimensionsGrid}>
          {dimensions.map((dim) => (
            <View key={dim.label} style={styles.dimChip}>
              <Text style={styles.dimLabel}>{dim.label}</Text>
              <Text style={styles.dimValue}>
                {dim.value} <Text style={styles.dimUnit}>{unitStr}</Text>
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            No dimensions entered yet. Tap Edit to record measurements.
          </Text>
        </View>
      )}

      {/* Grounded, Authentic Tailor Notes */}
      {cleanNotes ? (
        <View style={styles.notesBox}>
          <View style={styles.notesHeader}>
            <Ionicons
              name="document-text-outline"
              size={12}
              color="#6F767E"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.notesLabel}>Tailor Notes</Text>
          </View>
          <Text style={styles.notesBody} numberOfLines={3}>
            {cleanNotes}
          </Text>
        </View>
      ) : null}

      {/* Actions Footer */}
      <View style={styles.footerRow}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onShare(profile)}
          style={styles.shareButton}
        >
          <Ionicons
            name="share-social-outline"
            size={14}
            color="#475569"
            style={{ marginRight: 5 }}
          />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        <View style={styles.rightActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onEdit(profile)}
            style={styles.editButton}
          >
            <Ionicons
              name="create-outline"
              size={14}
              color="#FFFFFF"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onDelete(profile)}
            style={styles.deleteButton}
          >
            <Ionicons
              name="trash-outline"
              size={14}
              color="#DC2626"
              style={{ marginRight: 4 }}
            />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E6E8EC",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0FAFA",
    borderWidth: 1,
    borderColor: "#E0F7F7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#14919B",
  },
  titleContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  personName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1D1F",
    flex: 1,
  },
  dateText: {
    fontSize: 11,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  subProfileName: {
    fontSize: 11.5,
    color: "#6F767E",
    marginTop: 1,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },
  metaTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E6E8EC",
  },
  metaLabel: {
    fontSize: 10.5,
    fontWeight: "500",
    color: "#6F767E",
    marginRight: 4,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1A1D1F",
  },
  dimensionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 12,
  },
  dimChip: {
    backgroundColor: "#F7F8FA",
    borderWidth: 1,
    borderColor: "#E6E8EC",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    minWidth: 70,
  },
  dimLabel: {
    fontSize: 9.5,
    fontWeight: "600",
    color: "#6F767E",
    marginBottom: 2,
  },
  dimValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A1D1F",
  },
  dimUnit: {
    fontSize: 10,
    fontWeight: "500",
    color: "#6F767E",
  },
  emptyBox: {
    backgroundColor: "#F7F8FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6E8EC",
    padding: 10,
    marginTop: 12,
  },
  emptyText: {
    fontSize: 11.5,
    color: "#6F767E",
    lineHeight: 16,
  },
  notesBox: {
    marginTop: 11,
    backgroundColor: "#F7F8FA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6E8EC",
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#6F767E",
    textTransform: "uppercase",
    letterSpacing: 0.2,
  },
  notesBody: {
    fontSize: 12,
    fontWeight: "400",
    color: "#1A1D1F",
    lineHeight: 16,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 11,
    marginTop: 12,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E6E8EC",
  },
  shareButtonText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#475569",
  },
  rightActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14919B",
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },
  deleteButtonText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#DC2626",
  },
});
