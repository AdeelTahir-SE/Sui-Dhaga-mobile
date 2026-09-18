import { Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

type StudioHeaderProps = {
  title: string;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  rightLabel?: string;
  rightAction?: React.ReactNode;
};

export function StudioHeader({
  title,
  rightIcon = "information-circle-outline",
  rightLabel,
  rightAction,
}: StudioHeaderProps) {
  return (
    <View
      style={{
        height: 56,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#EAE5DD",
      }}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => router.back()}
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: "#F8F6F0",
          borderWidth: 1,
          borderColor: "#EAE5DD",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="arrow-back" size={20} color="#1A1D1F" />
      </TouchableOpacity>
      <Text style={{ fontSize: 16, fontWeight: "700", color: "#1A1D1F" }}>
        {title}
      </Text>
      {rightAction ? (
        rightAction
      ) : (
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={rightLabel ?? "More information"}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: "#F8F6F0",
            borderWidth: 1,
            borderColor: "#EAE5DD",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name={rightIcon} size={18} color="#1A1D1F" />
        </TouchableOpacity>
      )}
    </View>
  );
}
