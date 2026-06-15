import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";

import { DetailRow } from "../components/DetailRow";
import { ExportRow } from "../components/ExportRow";
import { ScreenShell } from "../components/ScreenShell";
import { SectionTitle } from "../components/SectionTitle";
import { StudioHeader } from "../components/StudioHeader";
import {
  fabricColors,
  imageDesignImage,
  sketchDesignImage,
  textDesignImage,
} from "../constants/designStudioAssets";

export default function ExportTechPackScreen() {
  return (
    <ScreenShell>
      <StudioHeader title="Export / Tech Pack" rightIcon="cloud-upload-outline" />
      <View className="px-5">
        <SectionTitle title="Tech Pack Preview" />
        <View className="rounded-2xl border border-brand-border bg-white p-3">
          <View className="flex-row">
            <Image
              source={textDesignImage}
              contentFit="contain"
              className="h-[170px] flex-1 rounded-xl bg-[#F8F6F0]"
            />
            <View className="ml-3 flex-1 gap-2">
              <View className="flex-row gap-2">
                <Image
                  source={imageDesignImage}
                  contentFit="cover"
                  className="h-20 flex-1 rounded-lg"
                />
                <Image
                  source={sketchDesignImage}
                  contentFit="cover"
                  className="h-20 flex-1 rounded-lg"
                />
              </View>
              <View className="flex-row gap-2">
                {fabricColors.slice(0, 3).map((color) => (
                  <View
                    key={color}
                    className="h-20 flex-1 rounded-lg"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        <SectionTitle title="Garment Details" />
        <View>
          <DetailRow title="Name" value="Floral Embroidered Anarkali" />
          <DetailRow title="Category" value="Women's Ethnic" />
          <DetailRow title="Type" value="Anarkali Suit" />
          <DetailRow title="Occasion" value="Festive / Wedding" />
          <DetailRow title="Created On" value="20 May 2024" />
        </View>

        <View className="mt-5 rounded-xl border border-brand-border px-4">
          <ExportRow title="Size Chart" value="6 Sizes" />
          <ExportRow title="Color Palette" value="5 Colors" />
          <ExportRow title="Fabric Details" value="3 Fabrics" />
          <ExportRow title="Embroidery Details" value="Floral + Mirror Work" />
        </View>

        <View className="mt-6 flex-row gap-3">
          <TouchableOpacity className="h-[52px] flex-1 items-center justify-center rounded-xl bg-primary">
            <Text className="text-[15px] font-semibold text-white">
              Download PDF
            </Text>
          </TouchableOpacity>
          <TouchableOpacity className="h-[52px] flex-1 items-center justify-center rounded-xl border border-primary bg-white">
            <Text className="text-[15px] font-semibold text-primary">
              Share
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenShell>
  );
}
