import { Text, TouchableOpacity, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { MainTailorCard } from "../components/MainTailorCard";
import { QuickAction } from "../components/QuickAction";
import { SectionTitle } from "../components/SectionTitle";
import { TabPlaceholder } from "../components/TabPlaceholder";

const homeHero = require("@/assets/illustrations/customer-tabs/home-hero.png");
const categoryKurtas = require("@/assets/illustrations/customer-tabs/home/category-kurtas-suits.png");
const categoryLehengas = require("@/assets/illustrations/customer-tabs/home/category-lehengas.png");
const categorySarees = require("@/assets/illustrations/customer-tabs/home/category-sarees.png");
const categoryShirts = require("@/assets/illustrations/customer-tabs/home/category-shirts.png");
const tailorRekha = require("@/assets/illustrations/customer-tabs/home/tailor-rekha.png");
const recentLook1 = require("@/assets/illustrations/customer-tabs/home/recent-look-1.png");
const recentLook2 = require("@/assets/illustrations/customer-tabs/home/recent-look-2.png");
const recentLook3 = require("@/assets/illustrations/customer-tabs/home/recent-look-3.png");
const recentLook4 = require("@/assets/illustrations/customer-tabs/home/recent-look-4.png");

const categories = [
  { title: "Kurtas & Suits", image: categoryKurtas, tone: "mint" },
  { title: "Lehengas", image: categoryLehengas, tone: "coral" },
  { title: "Sarees", image: categorySarees, tone: "gold" },
  { title: "Shirts", image: categoryShirts, tone: "blue" },
] as const;

const recentDesigns = [
  { title: "Look 1", image: recentLook1, tone: "coral" },
  { title: "Look 2", image: recentLook2, tone: "mint" },
  { title: "Look 3", image: recentLook3, tone: "blue" },
  { title: "Look 4", image: recentLook4, tone: "cream" },
] as const;

export default function HomeScreen() {
  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Home" />}>
      <View className="px-5 pt-3">
        <View className="mb-4 flex-row items-start justify-between">
          <View>
            <Text className="text-[17px] font-bold text-brand-dark">
              Hello, Ayesha 👋
            </Text>
            <Text className="mt-1 text-[11px] text-brand-gray">
              Ready to look your best today?
            </Text>
          </View>
          <Text className="text-[20px]">♧</Text>
        </View>

        <View className="overflow-hidden rounded-2xl bg-[#FFF7EA] p-4">
          <Text className="w-[48%] text-[22px] font-bold leading-7 text-brand-dark">
            Your Style, Your Story, Our Craft.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/tailors" as never)}
            className="mt-4 self-start rounded-lg bg-primary px-4 py-3"
          >
            <Text className="text-[12px] font-semibold text-white">
              Explore Tailors
            </Text>
          </TouchableOpacity>
          <Image
            source={homeHero}
            contentFit="cover"
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              height: "100%",
              width: "58%",
            }}
          />
        </View>

        <SectionTitle title="Quick Actions" />
        <View className="flex-row gap-2">
          <QuickAction title="Book Appointment" icon="calendar-outline" />
          <QuickAction title="AI Design Studio" icon="color-wand-outline" />
          <QuickAction title="My Orders" icon="bag-handle-outline" />
          <QuickAction title="Style Assistant" icon="sparkles-outline" />
        </View>

        <SectionTitle title="Popular Categories" />
        <View className="flex-row gap-2">
          {categories.map((category) => (
            <View key={category.title} className="flex-1">
              <TabPlaceholder
                image={category.image}
                variant="garment"
                size="sm"
                tone={category.tone}
                label={category.title}
              />
            </View>
          ))}
        </View>

        <SectionTitle title="Recommended Tailors" />
        <MainTailorCard
          name="Rekha Tailors"
          rating="4.8 (128 reviews)"
          distance="2.1 km away"
          specialty="Bridal, Suits, Sarees"
          image={tailorRekha}
          topRated
        />

        <SectionTitle title="Recent Designs" />
        <View className="flex-row gap-2">
          {recentDesigns.map((design) => (
            <View key={design.title} className="flex-1">
              <TabPlaceholder
                image={design.image}
                variant="garment"
                size="sm"
                tone={design.tone}
                label={design.title}
              />
            </View>
          ))}
        </View>
      </View>
    </CustomerTabShell>
  );
}
