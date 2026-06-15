import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { BookingOrdersHeader } from "../components/BookingOrdersHeader";
import { BookingOrdersScreenShell } from "../components/BookingOrdersScreenShell";
import { InfoRow } from "../components/InfoRow";
import { PlaceholderImage } from "../components/PlaceholderImage";
import { SectionLabel } from "../components/SectionLabel";
import { StatusPill } from "../components/StatusPill";
import { TimelineItem } from "../components/TimelineItem";

export default function OrderDetailsScreen() {
  return (
    <BookingOrdersScreenShell>
      <BookingOrdersHeader title="Order Details" />
      <View className="px-5">
        <View className="mb-4 flex-row items-start justify-between">
          <View>
            <Text className="text-[17px] font-bold text-brand-dark">
              Order #ORD12345
            </Text>
            <Text className="mt-1 text-[11px] text-brand-gray">
              Placed on 20 May 2024
            </Text>
          </View>
          <StatusPill label="In Progress" tone="gold" />
        </View>

        <View className="flex-row rounded-xl border border-brand-border bg-white p-3">
          <PlaceholderImage variant="garment" size="md" tone="coral" />
          <View className="ml-3 flex-1">
            <Text className="text-[13px] font-semibold text-brand-dark">
              Custom Lehenga
            </Text>
            <Text className="mt-1 text-[11px] text-brand-gray">
              Rekha Tailors
            </Text>
            <Text className="mt-2 text-[13px] font-bold text-brand-dark">
              ₹18,900
            </Text>
          </View>
        </View>
        <Text className="mt-3 text-[11px] text-brand-gray">
          Est. Delivery: 05 Jun 2024
        </Text>

        <View className="mt-5 flex-row gap-4">
          <View className="flex-1">
            <SectionLabel title="Tracking Timeline" />
            <TimelineItem
              title="Order Confirmed"
              subtitle="20 May 2024, 10:30 AM"
              complete
            />
            <TimelineItem
              title="Design Discussion"
              subtitle="21 May 2024, 02:15 PM"
              complete
            />
            <TimelineItem
              title="Measurements Taken"
              subtitle="22 May 2024, 11:00 AM"
              complete
            />
            <TimelineItem
              title="In Production"
              subtitle="24 May 2024, 09:40 AM"
              complete
            />
            <TimelineItem title="Quality Check" subtitle="Pending" />
            <TimelineItem title="Out For Delivery" subtitle="Pending" />
            <TimelineItem title="Delivered" subtitle="Pending" />
          </View>

          <View className="flex-1">
            <SectionLabel title="Tailor Information" />
            <View className="rounded-xl border border-brand-border p-3">
              <PlaceholderImage size="sm" tone="coral" />
              <Text className="mt-3 text-[13px] font-semibold text-brand-dark">
                Rekha Tailors
              </Text>
              <View className="mt-1 flex-row items-center">
                <Ionicons name="star" size={12} color="#F4B400" />
                <Text className="ml-1 text-[11px] text-brand-dark">
                  4.8 (128)
                </Text>
              </View>
              <Text className="mt-1 text-[11px] text-brand-gray">
                C-Scheme, Jaipur
              </Text>
              <View className="mt-3 flex-row justify-between">
                <Text className="text-[11px] font-medium text-primary">Call</Text>
                <Text className="text-[11px] font-medium text-primary">
                  Message
                </Text>
              </View>
            </View>

            <SectionLabel title="Payment Summary" />
            <View className="rounded-xl bg-brand-surface p-3">
              <InfoRow label="Item Total" value="₹16,000" />
              <InfoRow label="Customization" value="₹2,000" />
              <InfoRow label="Delivery Charges" value="₹900" />
              <InfoRow label="Discount" value="-₹2,000" />
              <View className="mt-2 border-t border-brand-border pt-2">
                <InfoRow label="Total Paid" value="₹16,900" />
              </View>
              <View className="mt-1 self-start">
                <StatusPill label="Paid" tone="green" />
              </View>
            </View>
          </View>
        </View>

        <SectionLabel title="Order Details" />
        <View className="rounded-xl border border-brand-border px-4 py-2">
          <InfoRow label="Fabric" value="Net & Silk" />
          <InfoRow label="Color" value="Peach Pink" />
          <InfoRow label="Size" value="M (Custom)" />
          <InfoRow label="Work" value="Zari & Sequin Work" />
        </View>

        <View className="mt-5 rounded-xl bg-brand-surface p-4">
          <View className="flex-row">
            <Ionicons name="headset-outline" size={22} color="#1A1D1F" />
            <View className="ml-3 flex-1">
              <Text className="text-[13px] font-semibold text-brand-dark">
                Need Help?
              </Text>
              <Text className="mt-1 text-[11px] text-brand-gray">
                Our support team is here for you.
              </Text>
            </View>
          </View>
          <TouchableOpacity className="mt-4 h-[42px] items-center justify-center rounded-xl bg-white">
            <Text className="text-[13px] font-semibold text-primary">
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </BookingOrdersScreenShell>
  );
}
