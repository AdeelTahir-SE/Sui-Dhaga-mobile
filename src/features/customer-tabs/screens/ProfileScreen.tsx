import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { ProfileMenuRow } from "../components/ProfileMenuRow";
import { TabPlaceholder } from "../components/TabPlaceholder";

export default function ProfileScreen() {
  return (
    <CustomerTabShell>
      <View className="px-5 pt-5">
        <View className="items-end">
          <Ionicons name="settings-outline" size={20} color="#1A1D1F" />
        </View>
        <View className="items-center">
          <TabPlaceholder variant="person" size="md" tone="coral" />
          <View className="mt-4 flex-row items-center">
            <Text className="text-[18px] font-bold text-brand-dark">Ayesha Khan</Text>
            <Ionicons name="pencil-outline" size={15} color="#1A1D1F" style={{ marginLeft: 6 }} />
          </View>
          <Text className="mt-2 text-[12px] text-brand-gray">ayesha.khan@email.com</Text>
          <Text className="mt-1 text-[12px] text-brand-gray">+91 98765 43210</Text>
        </View>

        <View className="mt-7">
          <ProfileMenuRow title="My Measurements" subtitle="View & manage your measurements" icon="body-outline" highlighted />
          <ProfileMenuRow title="Saved Designs" subtitle="24 Designs" icon="bookmark-outline" />
          <ProfileMenuRow title="Payment Methods" subtitle="2 Cards Saved" icon="card-outline" />
          <ProfileMenuRow title="Addresses" subtitle="3 Saved Addresses" icon="location-outline" />
          <ProfileMenuRow title="Settings" subtitle="Notifications, Privacy & more" icon="settings-outline" />
        </View>

        <TouchableOpacity className="mt-4 h-[52px] items-center justify-center rounded-xl border border-[#F5D1D1] bg-[#FFF3F3]">
          <Text className="text-[14px] font-semibold text-[#D73232]">Logout</Text>
        </TouchableOpacity>

        <CustomerTabsPreview active="Profile" />
      </View>
    </CustomerTabShell>
  );
}
