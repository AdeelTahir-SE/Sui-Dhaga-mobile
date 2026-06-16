import { View } from "react-native";

import { SearchAndFilters } from "../components/SearchAndFilters";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorHeader } from "../components/TailorHeader";
import { TailorListCard } from "../components/TailorListCard";
import { TailorScreenShell } from "../components/TailorScreenShell";

const tailorImages = {
  rekha: require("@/assets/illustrations/customer-tabs/tailors/rekha.png"),
  stitchCraft: require("@/assets/illustrations/customer-tabs/tailors/stitch-craft.png"),
  aarav: require("@/assets/illustrations/customer-tabs/tailors/aarav-bespoke.png"),
  noor: require("@/assets/illustrations/customer-tabs/tailors/noor-thread.png"),
};

export default function TailorsScreen() {
  return (
    <TailorScreenShell bottomTabs={<TailorBottomTabs />}>
      <TailorHeader
        title="Tailors"
        subtitle="Find the perfect tailor for your style"
      />
      <View className="px-5">
        <SearchAndFilters />

        <View className="mt-5">
          <TailorListCard
            image={tailorImages.rekha}
            name="Rekha Tailors"
            rating="4.8 (128)"
            distance="2.1 km"
            specialty="Specializes in Bridal, Suits, Sarees"
            topRated
            tone="coral"
          />
          <TailorListCard
            image={tailorImages.stitchCraft}
            name="Stitch Craft"
            rating="4.7 (96)"
            distance="3.4 km"
            specialty="Specializes in Men's Wear"
            tone="blue"
          />
          <TailorListCard
            image={tailorImages.aarav}
            name="Aarav Bespoke"
            rating="4.6 (72)"
            distance="4.2 km"
            specialty="Specializes in Indo-Western"
            tone="gold"
          />
          <TailorListCard
            image={tailorImages.noor}
            name="Noor & Thread"
            rating="4.5 (64)"
            distance="5.1 km"
            specialty="Specializes in Sarees"
            tone="teal"
          />
        </View>

      </View>
    </TailorScreenShell>
  );
}
