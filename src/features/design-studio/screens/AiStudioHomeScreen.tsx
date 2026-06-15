import { Text, View } from "react-native";
import { Image } from "expo-image";

import { PreviewCard } from "../components/PreviewCard";
import { ScreenShell } from "../components/ScreenShell";
import { SectionTitle } from "../components/SectionTitle";
import { StudioHeader } from "../components/StudioHeader";
import { StudioOptionCard } from "../components/StudioOptionCard";
import {
  imageDesignImage,
  sketchDesignImage,
  textDesignImage,
} from "../constants/designStudioAssets";

export default function AiStudioHomeScreen() {
  return (
    <ScreenShell>
      <StudioHeader title="AI Design Studio" />
      <View className="px-5">
        <View className="overflow-hidden rounded-2xl bg-primary-50">
          <View className="p-4">
            <Text className="text-[17px] font-bold text-brand-dark">
              Create. Customize. Captivate.
            </Text>
            <Text className="mt-1 w-[62%] text-[12px] leading-4 text-brand-gray">
              Design your dream outfit with the power of AI.
            </Text>
          </View>
          <Image
            source={textDesignImage}
            contentFit="cover"
            className="absolute bottom-0 right-0 h-[112px] w-[132px]"
          />
          <View className="absolute bottom-0 left-0 h-16 w-[68%] rounded-tr-[48px] bg-[#DDF1ED]" />
          <View className="absolute bottom-0 right-0 h-20 w-[44%] rounded-tl-[72px] bg-primary" />
        </View>

        <SectionTitle title="Design Options" action="View all" />
        <View className="flex-row flex-wrap justify-between gap-y-3">
          <StudioOptionCard
            icon="text"
            title="Text to Design"
            subtitle="Generate from text"
            href="/design-studio/text-to-design"
          />
          <StudioOptionCard
            icon="image-outline"
            title="Image to Design"
            subtitle="Upload reference image"
            href="/design-studio/image-to-design"
          />
          <StudioOptionCard
            icon="color-wand-outline"
            title="Sketch to Design"
            subtitle="Transform your sketch"
            href="/design-studio/sketch-to-design"
          />
          <StudioOptionCard
            icon="chatbubble-ellipses-outline"
            title="AI Chat"
            subtitle="Discuss outfit ideas"
            href="/design-studio/chat"
          />
        </View>

        <SectionTitle title="Recent Designs" action="View all" />
        <View className="flex-row justify-between">
          <PreviewCard
            image={textDesignImage}
            title="Anarkali Suit"
            subtitle="Today"
          />
          <PreviewCard
            image={imageDesignImage}
            title="Lehenga"
            subtitle="Yesterday"
          />
          <PreviewCard
            image={sketchDesignImage}
            title="Kurta Set"
            subtitle="2 days ago"
          />
        </View>

        <SectionTitle title="Templates" action="View all" />
        <View className="flex-row gap-2">
          {["Trending", "Festive", "Casual", "Bridal", "Men's"].map(
            (template, index) => (
              <View
                key={template}
                className={`rounded-lg px-3 py-2 ${
                  index === 0 ? "bg-primary" : "bg-brand-surface"
                }`}
              >
                <Text
                  className={`text-[11px] font-medium ${
                    index === 0 ? "text-white" : "text-brand-dark"
                  }`}
                >
                  {template}
                </Text>
              </View>
            ),
          )}
        </View>

        <View className="mb-3 mt-5 flex-row items-center">
          <Text className="text-[14px] font-semibold text-brand-dark">
            AI Suggestions for You
          </Text>
          <View className="ml-2 rounded bg-[#FFF5CF] px-2 py-0.5">
            <Text className="text-[10px] font-semibold text-[#D09700]">
              New
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between">
          <PreviewCard
            image={textDesignImage}
            title="Pastel Eid Look"
            subtitle="Soft palette"
          />
          <PreviewCard
            image={imageDesignImage}
            title="Wedding Set"
            subtitle="Royal style"
          />
          <PreviewCard
            image={sketchDesignImage}
            title="Festive Kurta"
            subtitle="Light work"
          />
        </View>
      </View>
    </ScreenShell>
  );
}
