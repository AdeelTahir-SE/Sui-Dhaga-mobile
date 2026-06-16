import { Text, TextInput, View } from "react-native";

import { MccButton } from "../components/MccButton";
import { MccHeader } from "../components/MccHeader";
import { MccScreenShell } from "../components/MccScreenShell";
import { PlaceholderVisual } from "../components/PlaceholderVisual";
import { SectionTitle } from "../components/SectionTitle";

const uploadCoralLehenga = require("@/assets/illustrations/measurements-community-checkout/community/upload-coral-lehenga.png");
const uploadNavyLehenga = require("@/assets/illustrations/measurements-community-checkout/community/upload-navy-lehenga.png");
const uploadCoralAnarkali = require("@/assets/illustrations/measurements-community-checkout/community/upload-coral-anarkali.png");

export default function CreatePostScreen() {
  return (
    <MccScreenShell>
      <MccHeader title="Create Post" showBack rightText="" />
      <View className="px-5">
        <SectionTitle title="Upload Images" />
        <View className="flex-row flex-wrap gap-3">
          <PlaceholderVisual image={uploadCoralLehenga} variant="garment" size="md" tone="coral" />
          <PlaceholderVisual image={uploadNavyLehenga} variant="garment" size="md" tone="blue" />
          <PlaceholderVisual image={uploadCoralAnarkali} variant="garment" size="md" tone="gold" />
          <PlaceholderVisual variant="card" size="md" tone="cream" label="Add More" />
        </View>

        <SectionTitle title="Caption" />
        <View className="rounded-xl border border-brand-border px-4 py-3">
          <TextInput
            editable={false}
            multiline
            value="Sharing my latest custom bridal lehenga with zardozi work. What do you think?"
            className="min-h-[92px] text-[12px] leading-5 text-brand-dark"
            textAlignVertical="top"
          />
          <Text className="self-end text-[10px] text-brand-gray">72/300</Text>
        </View>

        <SectionTitle title="Tags" />
        <View className="mb-4 flex-row gap-2">
          {["#Bridal", "#Lehenga", "#Zardozi", "Add more"].map((tag) => (
            <View key={tag} className="rounded-lg border border-[#F05A57] px-3 py-2">
              <Text className="text-[11px] font-medium text-[#F05A57]">{tag}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Who can see this?" />
        <View className="mb-6 h-[48px] justify-center rounded-xl border border-brand-border px-4">
          <Text className="text-[12px] text-brand-dark">Everyone</Text>
        </View>
        <MccButton title="Post" variant="danger" />
      </View>
    </MccScreenShell>
  );
}
