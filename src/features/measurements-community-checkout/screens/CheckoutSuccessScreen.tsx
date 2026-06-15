import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { MccButton } from "../components/MccButton";
import { MccScreenShell } from "../components/MccScreenShell";

export default function CheckoutSuccessScreen() {
  return (
    <MccScreenShell>
      <View className="flex-1 items-center px-7 pt-24">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-[#EAF8EE]">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#29A45B]">
            <Ionicons name="checkmark" size={36} color="#FFFFFF" />
          </View>
        </View>
        <Text className="mt-10 text-center text-[22px] font-bold text-brand-dark">
          Order Placed Successfully!
        </Text>
        <Text className="mt-4 text-center text-[12px] leading-5 text-brand-gray">
          Thank you! Your order has been placed successfully.
        </Text>
        <View className="my-8 w-full rounded-xl bg-brand-surface p-5">
          <Text className="text-center text-[11px] text-brand-gray">Order ID</Text>
          <Text className="mt-2 text-center text-[13px] font-bold text-brand-dark">#ORD123456</Text>
        </View>
        <Text className="mb-7 text-center text-[11px] text-brand-gray">
          A confirmation email has been sent to you.
        </Text>
        <View className="w-full">
          <MccButton title="Track Order" />
        </View>
        <Text className="mt-5 text-[12px] font-medium text-primary">Continue Shopping</Text>
      </View>
    </MccScreenShell>
  );
}
