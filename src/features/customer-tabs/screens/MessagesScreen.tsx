import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CustomerHeader } from "../components/CustomerHeader";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MessageRow } from "../components/MessageRow";

const messageRekha = require("@/assets/illustrations/customer-tabs/messages/rekha.png");
const messageStitchCraft = require("@/assets/illustrations/customer-tabs/messages/stitch-craft.png");
const messageAarav = require("@/assets/illustrations/customer-tabs/messages/aarav-bespoke.png");
const messageNoor = require("@/assets/illustrations/customer-tabs/messages/noor-thread.png");
const messageThreads = require("@/assets/illustrations/customer-tabs/messages/threads.png");
const messagePooja = require("@/assets/illustrations/customer-tabs/messages/pooja-mehta.png");
const messageDesignTeam = require("@/assets/illustrations/customer-tabs/messages/design-studio-team.png");

export default function MessagesScreen() {
  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Messages" />}>
      <CustomerHeader title="Messages" rightIcon="settings-outline" />
      <View className="px-5">
        <View className="mb-4 h-[48px] flex-row items-center rounded-xl border border-brand-border px-4">
          <Ionicons name="search" size={17} color="#6F767E" />
          <Text className="ml-3 flex-1 text-[12px] text-brand-gray">
            Search messages
          </Text>
          <Ionicons name="options-outline" size={18} color="#1A1D1F" />
        </View>
        <MessageRow
          name="Rekha Tailors"
          message="Your order #SD1256 is in progress..."
          time="10:30 AM"
          image={messageRekha}
          unread="2"
          tone="coral"
        />
        <MessageRow
          name="Stitch Craft"
          message="We have received your measurements."
          time="9:15 AM"
          image={messageStitchCraft}
          unread="1"
          tone="blue"
        />
        <MessageRow
          name="Aarav Bespoke"
          message="Can you share the reference image?"
          time="Yesterday"
          image={messageAarav}
          tone="gold"
        />
        <MessageRow
          name="Noor & Thread"
          message="Your appointment is confirmed."
          time="Yesterday"
          image={messageNoor}
          tone="teal"
        />
        <MessageRow
          name="Ethnic Weaves"
          message="Thank you!"
          time="2 May"
          image={messageThreads}
          tone="cream"
        />
        <MessageRow
          name="Pooja Mehta"
          message="Let me know if any changes."
          time="1 May"
          image={messagePooja}
          tone="mint"
        />
        <MessageRow
          name="Design Studio Team"
          message="Check out new templates!"
          time="30 Apr"
          image={messageDesignTeam}
          tone="blue"
        />
      </View>
    </CustomerTabShell>
  );
}
