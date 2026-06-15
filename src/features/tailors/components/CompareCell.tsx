import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type CompareCellProps = {
  children?: React.ReactNode;
  check?: boolean;
};

export function CompareCell({ children, check }: CompareCellProps) {
  return (
    <View className="min-h-[46px] flex-1 items-center justify-center border-l border-brand-border px-1">
      {check ? (
        <View className="h-6 w-6 items-center justify-center rounded-full bg-primary">
          <Ionicons name="checkmark" size={14} color="#FFFFFF" />
        </View>
      ) : (
        <Text className="text-center text-[11px] leading-4 text-brand-dark">
          {children}
        </Text>
      )}
    </View>
  );
}
