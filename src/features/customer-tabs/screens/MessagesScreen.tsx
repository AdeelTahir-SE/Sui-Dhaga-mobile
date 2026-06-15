import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MessageRow } from "../components/MessageRow";

export default function MessagesScreen() {
  return (
    <CustomerTabShell>
      <CustomerHeader title="Messages" rightIcon="settings-outline" />
      <View className="px-5">
        <View className="mb-4 h-[48px] flex-row items-center rounded-xl border border-brand-border px-4">
          <Ionicons name="search" size={17} color="#6F767E" />
          <Text className="ml-3 flex-1 text-[12px] text-brand-gray">Search messages</Text>
          <Ionicons name="options-outline" size={18} color="#1A1D1F" />
        </View>
        <MessageRow name="Rekha Tailors" message="Your order #SD1256 is in progress..." time="10:30 AM" unread="2" tone="coral" />
        <MessageRow name="Stitch Craft" message="We have received your measurements." time="9:15 AM" unread="1" tone="blue" />
        <MessageRow name="Aarav Bespoke" message="Can you share the reference image?" time="Yesterday" tone="gold" />
        <MessageRow name="Noor & Thread" message="Your appointment is confirmed." time="Yesterday" tone="teal" />
        <MessageRow name="Ethnic Weaves" message="Thank you! 🙏" time="2 May" tone="cream" />
        <MessageRow name="Pooja Mehta" message="Let me know if any changes." time="1 May" tone="mint" />
        <MessageRow name="Design Studio Team" message="Check out new templates!" time="30 Apr" tone="blue" />
        <CustomerTabsPreview active="Messages" />
      </View>
    </CustomerTabShell>
  );
}
