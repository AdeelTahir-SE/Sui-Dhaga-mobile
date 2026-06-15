import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { MccButton } from "../components/MccButton";
import { MccScreenShell } from "../components/MccScreenShell";

export default function CheckoutFailedScreen() {
  return (
    <MccScreenShell>
      <View className="flex-1 items-center px-7 pt-24">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-[#FFF0F0]">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-[#F05A57]">
            <Ionicons name="close" size={36} color="#FFFFFF" />
          </View>
        </View>
        <Text className="mt-10 text-center text-[22px] font-bold text-brand-dark">
          Payment Failed
        </Text>
        <Text className="mt-4 text-center text-[12px] leading-5 text-brand-gray">
          Oops! We couldn't complete your payment.
        </Text>
        <View className="my-8 w-full rounded-xl bg-brand-surface p-5">
          <Text className="text-[11px] text-brand-gray">Reason</Text>
          <Text className="mt-2 text-[12px] text-brand-dark">
            Your payment was declined by the bank.
          </Text>
        </View>
        <View className="w-full gap-3">
          <MccButton title="Try Again" variant="danger" />
          <MccButton title="Change Payment Method" variant="outline" />
        </View>
        <Text className="mt-8 text-[12px] font-medium text-primary">Contact Support</Text>
      </View>
    </MccScreenShell>
  );
}
