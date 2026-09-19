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

const tones = [
  { bg: "#EBF8F9", text: "#078B87", border: "#B2EBF2" }, // teal
  { bg: "#EFF6FF", text: "#2563EB", border: "#BFDBFE" }, // blue
  { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" }, // mint
  { bg: "#FFF9E6", text: "#D97706", border: "#FDE68A" }, // gold
  { bg: "#FFF1EE", text: "#E11D48", border: "#FECDD3" }, // coral
  { bg: "#FDF8F0", text: "#B45309", border: "#FDE68A" }, // cream
];

export function MeasurementCard({
  profile,
  index = 0,
  onEdit,
  onDelete,
  onShare,
  onPress,
}: MeasurementCardProps) {
  const activeTone = tones[index % tones.length];

  // Extract Person Name and Fit Preference from notes or profileName
  const { personName, fitLabel, cleanNotes } = useMemo(() => {
    let person = "";
    let fit = "Regular Fit";
    let notesText = profile.notes || "";

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
      else if (f.includes("loose")) fit = "Comfort / Loose";
      else fit = "Regular Fit";
    }

    const cleaned = notesText.replace(/\[Fit:[^\]]+\]\s*/g, "").trim();

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
    if (profile.shirtLength) list.push({ label: "Shirt L.", value: profile.shirtLength });
    if (profile.trouserLength) list.push({ label: "Bottom L.", value: profile.trouserLength });
    if (profile.inseam) list.push({ label: "Inseam", value: profile.inseam });
    if (profile.neck) list.push({ label: "Neck", value: profile.neck });
    return list;
  }, [profile]);

  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.92 : 1}
      onPress={() => onPress && onPress(profile)}
      style={styles.card}
    >
      {/* TOP ROW: AVATAR & METADATA */}
      <View style={styles.topRow}>
        {/* Avatar with initial and tone color */}
        <View style={[styles.avatarContainer, { backgroundColor: activeTone.bg }]}>
          <Text style={[styles.avatarText, { color: activeTone.text }]}>
            {initialLetter}
          </Text>
          <View style={[styles.avatarBadge, { backgroundColor: activeTone.text }]}>
            <Ionicons name="cut" size={8} color="#FFFFFF" />
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.infoBlock}>
          <View style={styles.headerRow}>
            <Text style={styles.personName} numberOfLines={1}>
              {personName}
            </Text>
            <View style={styles.garmentBadge}>
              <Text style={styles.garmentBadgeText}>Universal Fit</Text>
            </View>
          </View>

          {profile.profileName && profile.profileName !== personName ? (
            <Text style={styles.profileSubName} numberOfLines={1}>
              {profile.profileName}
            </Text>
          ) : null}

          {/* Badges Strip */}
          <View style={styles.badgesRow}>
            {/* Fit Pill */}
            <View style={[styles.badgePill, { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }]}>
              <Ionicons name="sparkles" size={10} color="#059669" style={{ marginRight: 3 }} />
              <Text style={[styles.badgePillText, { color: "#059669" }]}>{fitLabel}</Text>
            </View>

            {/* Unit Pill */}
            <View style={[styles.badgePill, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
              <Ionicons name="resize-outline" size={10} color="#2563EB" style={{ marginRight: 3 }} />
              <Text style={[styles.badgePillText, { color: "#2563EB" }]}>
                {profile.unit === "cm" ? "Centimeters (cm)" : "Inches (in)"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* DIMENSIONS CHIP GRID */}
      {dimensions.length > 0 ? (
        <View style={styles.dimensionsGrid}>
          {dimensions.map((dim) => (
            <View key={dim.label} style={styles.dimensionChip}>
              <Text style={styles.dimLabel}>{dim.label}</Text>
              <Text style={styles.dimValue}>
                {dim.value}{" "}
                <Text style={styles.dimUnit}>{unitStr}</Text>
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyDimensionsBox}>
          <Ionicons name="information-circle-outline" size={15} color="#94A3B8" style={{ marginRight: 5 }} />
          <Text style={styles.emptyDimensionsText}>
            No dimensions entered yet. Tap Edit to add chest, waist, etc.
          </Text>
        </View>
      )}

      {/* TAILOR NOTES (IF ANY) */}
      {cleanNotes ? (
        <View style={styles.notesContainer}>
          <View style={styles.notesHeader}>
            <Ionicons name="document-text-outline" size={11} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.notesTitle}>Tailor Notes</Text>
          </View>
          <Text style={styles.notesText} numberOfLines={2}>
            &ldquo;{cleanNotes}&rdquo;
          </Text>
        </View>
      ) : null}

      {/* FOOTER ACTIONS ROW */}
      <View style={styles.footerRow}>
        {/* Share Button */}
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => onShare(profile)}
          style={styles.shareButton}
        >
          <Ionicons name="share-social-outline" size={14} color="#475569" style={{ marginRight: 5 }} />
          <Text style={styles.shareButtonText}>Share</Text>
        </TouchableOpacity>

        {/* Edit & Delete Action Buttons */}
        <View style={styles.actionsRight}>
          {/* Edit Button */}
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => onEdit(profile)}
            style={styles.editButton}
          >
            <Ionicons name="create-outline" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() => onDelete(profile)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={14} color="#E11D48" style={{ marginRight: 4 }} />
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
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  avatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "800",
  },
  avatarBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  infoBlock: {
    flex: 1,
    marginLeft: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  personName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    marginRight: 6,
  },
  garmentBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 8,
  },
  garmentBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#475569",
  },
  profileSubName: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
    marginBottom: 2,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  badgePill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 10,
    fontWeight: "600",
  },
  dimensionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 14,
  },
  dimensionChip: {
    flexBasis: "31%",
    backgroundColor: "#F8FAFC",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  dimLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  dimValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },
  dimUnit: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
  },
  emptyDimensionsBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  emptyDimensionsText: {
    fontSize: 11,
    color: "#64748B",
    flex: 1,
    lineHeight: 15,
  },
  notesContainer: {
    marginTop: 10,
    backgroundColor: "#F8FAFC",
    borderRadius: 9,
    padding: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#00949D",
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  notesTitle: {
    fontSize: 9,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
  },
  notesText: {
    fontSize: 11,
    color: "#334155",
    fontStyle: "italic",
    lineHeight: 15,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 11,
    marginTop: 13,
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 11,
    paddingVertical: 6.5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  shareButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
  },
  actionsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#00949D",
    paddingHorizontal: 13,
    paddingVertical: 6.5,
    borderRadius: 9,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF1F2",
    paddingHorizontal: 11,
    paddingVertical: 6.5,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#FECDD3",
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#E11D48",
  },
});
