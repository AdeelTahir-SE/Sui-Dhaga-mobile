import { Text, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenShell } from "../components/ScreenShell";
import { StudioHeader } from "../components/StudioHeader";
import { Swatches } from "../components/Swatches";
import {
  editorColors,
  fabricColors,
  textDesignImage,
} from "../constants/designStudioAssets";

export default function DesignEditorScreen() {
  return (
    <ScreenShell>
      <StudioHeader title="Design Editor" rightLabel="Save design" />
      <View className="px-5">
        <View className="mb-5 flex-row">
          <View className="w-12 gap-3 pt-4">
            {[
              ["arrow-undo-outline", "Undo"],
              ["arrow-redo-outline", "Redo"],
              ["sparkles-outline", "AI"],
            ].map(([icon, label]) => (
              <View key={label} className="items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl border border-brand-border">
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={17}
                    color="#6F767E"
                  />
                </View>
                <Text className="mt-1 text-[9px] text-brand-gray">
                  {label}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-1 items-center rounded-2xl bg-[#F8F6F0] py-4">
            <Image
              source={textDesignImage}
              contentFit="contain"
              className="h-[320px] w-full"
            />
          </View>

          <View className="w-12 gap-3 pt-4">
            {[
              ["eye-outline", "Preview"],
              ["cube-outline", "3D View"],
            ].map(([icon, label]) => (
              <View key={label} className="items-center">
                <View className="h-10 w-10 items-center justify-center rounded-xl border border-brand-border">
                  <Ionicons
                    name={icon as keyof typeof Ionicons.glyphMap}
                    size={17}
                    color="#6F767E"
                  />
                </View>
                <Text className="mt-1 text-[9px] text-brand-gray">
                  {label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="mb-4 flex-row rounded-xl bg-brand-surface p-1">
          {["Colors", "Fabrics", "Embroidery", "Details"].map((tab, index) => (
            <View
              key={tab}
              className={`flex-1 rounded-lg py-2 ${
                index === 0 ? "bg-white" : ""
              }`}
            >
              <Text
                className={`text-center text-[11px] font-medium ${
                  index === 0 ? "text-primary" : "text-brand-dark"
                }`}
              >
                {tab}
              </Text>
            </View>
          ))}
        </View>

        <Swatches colors={editorColors} />

        <Text className="mb-3 mt-5 text-[13px] font-semibold text-brand-dark">
          Fabric
        </Text>
        <View className="mb-5 flex-row gap-3">
          {["Silk", "Georgette", "Net", "Chiffon", "Cotton"].map(
            (fabric, index) => (
              <View key={fabric} className="items-center">
                <View
                  className={`h-12 w-12 rounded-xl border ${
                    index === 1 ? "border-primary" : "border-brand-border"
                  }`}
                  style={{ backgroundColor: fabricColors[index] }}
                />
                <Text
                  className={`mt-1 text-[10px] ${
                    index === 1 ? "text-primary" : "text-brand-gray"
                  }`}
                >
                  {fabric}
                </Text>
              </View>
            ),
          )}
        </View>

        <PrimaryButton
          title="AI Suggestions"
          onPress={() => router.push("/design-studio/export/sample-design" as never)}
        />
      </View>
    </ScreenShell>
  );
}
