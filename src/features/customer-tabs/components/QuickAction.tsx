import { Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

type QuickActionProps = {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  image?: any;
  color?: string;
  bgColor?: string;
  borderColor?: string;
  onPress?: () => void;
};

export function QuickAction({
  title,
  icon = "apps-outline",
  image,
  color = "#14919B",
  bgColor = "#F0FAFA",
  borderColor = "#E0F7F7",
  onPress,
}: QuickActionProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={styles.card}
      className="flex-1 items-center justify-between rounded-xl bg-white pt-2.5 pb-2 px-1 border border-brand-border/60"
    >
      {image ? (
        <Image
          source={image}
          contentFit="contain"
          style={{ width: 44, height: 44 }}
        />
      ) : (
        <View className="h-11 w-11 items-center justify-center">
          <Ionicons name={icon} size={26} color={color} />
        </View>
      )}
      <View style={styles.textContainer}>
        <Text
          numberOfLines={2}
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          style={styles.text}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 90,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1.5,
  },
  textContainer: {
    minHeight: 30,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    paddingHorizontal: 1,
  },
  text: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#1A1D1F",
    textAlign: "center",
    lineHeight: 14,
    ...(Platform.OS === "android" ? { includeFontPadding: false } : {}),
  },
});

