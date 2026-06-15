import { Text, View } from "react-native";

export function StyleChips() {
  return (
    <View className="mb-5 flex-row gap-2">
      {["Traditional", "Modern", "Fusion"].map((style, index) => (
        <View
          key={style}
          className={`rounded-lg border px-4 py-2 ${
            index === 0
              ? "border-primary bg-primary"
              : "border-brand-border bg-white"
          }`}
        >
          <Text
            className={`text-[12px] font-medium ${
              index === 0 ? "text-white" : "text-brand-dark"
            }`}
          >
            {style}
          </Text>
        </View>
      ))}
    </View>
  );
}
