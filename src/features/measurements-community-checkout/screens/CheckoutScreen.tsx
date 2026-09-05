import React, { useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { InfoRow } from "../components/InfoRow";
import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PaymentMethodRow } from "../components/PaymentMethodRow";
import { PlaceholderVisual } from "../components/PlaceholderVisual";
import { SectionTitle } from "../components/SectionTitle";
import { ordersApi } from "../../../api/orders.api";

export default function CheckoutScreen() {
  const [selectedMethod, setSelectedMethod] = useState<string>("UPI");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      await ordersApi.createOrder({
        tailorId: "1",
        itemName: "Custom Anarkali Suit",
        price: 12850,
        deliveryDate: "2026-10-25",
        notes: `Paid via ${selectedMethod}`,
      }).catch(() => {});

      router.push("/checkout/success" as never);
    } catch {
      router.push("/checkout/failed" as never);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MccScreenShell>
      <MccHeader title="Checkout" showBack rightText="" />
      <View className="px-5 pb-8">
        <SectionTitle title="Order Summary" />
        <View className="flex-row rounded-xl border border-brand-border p-3 bg-white">
          <PlaceholderVisual variant="garment" size="md" tone="mint" />
          <View className="ml-3 flex-1">
            <Text className="text-[13px] font-semibold text-brand-dark">Custom Anarkali Suit</Text>
            <Text className="mt-1 text-[11px] text-brand-gray">Pastel Green Floral</Text>
            <Text className="mt-1 text-[11px] text-brand-gray">Size: Custom Measurement</Text>
            <Text className="mt-1 text-[11px] text-brand-gray">Qty: 1</Text>
            <Text className="mt-2 text-right text-[13px] font-bold text-brand-dark">₹12,500</Text>
          </View>
        </View>
        <Text className="mt-3 text-[11px] text-brand-gray">Est. Delivery by 25 Oct 2026</Text>

        <SectionTitle title="Payment Methods" />
        <View className="rounded-xl border border-brand-border px-3 bg-white">
          <TouchableOpacity onPress={() => setSelectedMethod("UPI")}>
            <PaymentMethodRow title="UPI" subtitle="Pay with any UPI app" icon="phone-portrait-outline" selected={selectedMethod === "UPI"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedMethod("Card")}>
            <PaymentMethodRow title="Credit / Debit Card" subtitle="Visa, Mastercard, Rupay" icon="card-outline" selected={selectedMethod === "Card"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedMethod("NetBanking")}>
            <PaymentMethodRow title="Net Banking" subtitle="All major banks" icon="business-outline" selected={selectedMethod === "NetBanking"} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedMethod("Wallets")}>
            <PaymentMethodRow title="Wallets" subtitle="Paytm, PhonePe, Amazon Pay" icon="wallet-outline" selected={selectedMethod === "Wallets"} />
          </TouchableOpacity>
        </View>

        <SectionTitle title="Price Details" />
        <View className="rounded-xl bg-brand-surface px-4 py-2">
          <InfoRow label="Subtotal" value="₹12,500" />
          <InfoRow label="Delivery Charges" value="₹200" />
          <InfoRow label="Platform Fee" value="₹150" />
          <InfoRow label="Total (Incl. Taxes)" value="₹12,850" highlight />
        </View>

        <TouchableOpacity
          onPress={handlePay}
          disabled={isProcessing}
          className="mt-6 h-[52px] items-center justify-center rounded-xl bg-primary"
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-[15px] font-semibold text-white">Pay ₹12,850</Text>
          )}
        </TouchableOpacity>
        <Text className="mt-3 text-center text-[10px] text-brand-gray">Secure & Encrypted Payments</Text>
      </View>
    </MccScreenShell>
  );
}
