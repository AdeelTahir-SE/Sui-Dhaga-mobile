import { Text, View } from "react-native";
import { router } from "expo-router";

import { InfoRow } from "../components/InfoRow";
import { MccButton } from "../components/MccButton";
import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PaymentMethodRow } from "../components/PaymentMethodRow";
import { PlaceholderVisual } from "../components/PlaceholderVisual";
import { SectionTitle } from "../components/SectionTitle";

export default function CheckoutScreen() {
  return (
    <MccScreenShell>
      <MccHeader title="Checkout" showBack rightText="" />
      <View className="px-5">
        <SectionTitle title="Order Summary" />
        <View className="flex-row rounded-xl border border-brand-border p-3">
          <PlaceholderVisual variant="garment" size="md" tone="mint" />
          <View className="ml-3 flex-1">
            <Text className="text-[13px] font-semibold text-brand-dark">Custom Anarkali Suit</Text>
            <Text className="mt-1 text-[11px] text-brand-gray">Pastel Green Floral</Text>
            <Text className="mt-1 text-[11px] text-brand-gray">Size: Custom</Text>
            <Text className="mt-1 text-[11px] text-brand-gray">Qty: 1</Text>
            <Text className="mt-2 text-right text-[13px] font-bold text-brand-dark">₹12,500</Text>
          </View>
        </View>
        <Text className="mt-3 text-[11px] text-brand-gray">Est. Delivery by 25 May 2024</Text>

        <SectionTitle title="Payment Methods" />
        <View className="rounded-xl border border-brand-border px-3">
          <PaymentMethodRow title="UPI" subtitle="Pay with any UPI app" icon="phone-portrait-outline" selected />
          <PaymentMethodRow title="Credit / Debit Card" subtitle="Visa, Mastercard, Rupay" icon="card-outline" />
          <PaymentMethodRow title="Net Banking" subtitle="All major banks" icon="business-outline" />
          <PaymentMethodRow title="Wallets" subtitle="Paytm, PhonePe, Amazon Pay" icon="wallet-outline" />
        </View>

        <SectionTitle title="Price Details" />
        <View className="rounded-xl bg-brand-surface px-4 py-2">
          <InfoRow label="Subtotal" value="₹12,500" />
          <InfoRow label="Delivery Charges" value="₹200" />
          <InfoRow label="Platform Fee" value="₹150" />
          <InfoRow label="Total (Incl. Taxes)" value="₹12,850" highlight />
        </View>
        <View className="mt-5">
          <MccButton title="Pay ₹12,850" variant="gold" onPress={() => router.push("/checkout/success" as never)} />
        </View>
        <Text className="mt-3 text-center text-[10px] text-brand-gray">Secure & Encrypted Payments</Text>
      </View>
    </MccScreenShell>
  );
}
