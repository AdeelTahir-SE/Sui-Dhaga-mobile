import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuthStore } from "../../../stores/auth.store";
import { useDesigns } from "../../design-studio/hooks/useDesigns";
import { useTailors } from "../../tailors/hooks/useTailors";
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

const categories = [
  { title: "Kurtas & Suits", image: categoryKurtas, tone: "mint" },
  { title: "Lehengas", image: categoryLehengas, tone: "coral" },
  { title: "Sarees", image: categorySarees, tone: "gold" },
  { title: "Shirts", image: categoryShirts, tone: "blue" },
] as const;

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);
  const { tailors, isLoading: tailorsLoading } = useTailors();
  const { designs, isLoading: designsLoading } = useDesigns();

  const emailPrefix = user?.email ? user.email.split("@")[0] : "User";
  const userName =
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    emailPrefix;
  const recommendedTailor = tailors[0];

  return (
    <CustomerTabShell bottomTabs={<CustomerTabsPreview active="Home" />}>
      <View className="px-5 pt-3 pb-8">
        {/* Prominent Header / User Welcome Bar */}
        <View className="mb-5 flex-row items-center justify-between">
          <View>
            <Text className="text-[20px] font-black text-brand-dark tracking-tight">
              Hello, {userName} 👋
            </Text>
            <Text className="mt-0.5 text-[13px] font-medium text-brand-gray">
              Ready to look your best today?
            </Text>
          </View>

          {/* Action Icons */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => router.push("/tailors" as never)}
              activeOpacity={0.7}
              className="h-11 w-11 items-center justify-center rounded-md border border-brand-border/80 bg-white shadow-xs"
            >
              <Ionicons name="search-outline" size={22} color="#1A1D1F" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.push("/messages" as never)}
              activeOpacity={0.7}
              className="relative h-11 w-11 items-center justify-center rounded-md border border-brand-border/80 bg-white shadow-xs"
            >
              <Ionicons
                name="notifications-outline"
                size={22}
                color="#1A1D1F"
              />
              <View className="absolute top-2.5 right-2.5 h-2.5 w-2.5 rounded-full bg-red-500" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Prominent Hero Banner */}
        <View className="relative overflow-hidden rounded-md bg-[#FFF7EA] border border-[#FFE8C7] p-5 shadow-sm min-h-[168px] justify-center">
          <Text className="w-[56%] text-[23px] font-black leading-[29px] text-brand-dark">
            Your Style, Your Story, Our Craft.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/tailors" as never)}
            activeOpacity={0.8}
            className="mt-3.5 self-start rounded-md bg-primary px-5 py-3 shadow-sm active:bg-primary-dark flex-row items-center gap-1.5"
          >
            <Text className="text-[13px] font-bold text-white tracking-wide">
              Explore Tailors
            </Text>
            <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
          </TouchableOpacity>
          <Image
            source={homeHero}
            contentFit="cover"
            style={{
              position: "absolute",
              bottom: 0,
              right: -5,
              height: "105%",
              width: "56%",
            }}
          />
        </View>

        {/* Quick Actions (Prominent 4-Tile Grid) */}
        <SectionTitle title="Quick Actions" />
        <View className="flex-row gap-2.5">
          <QuickAction
            title="Book Tailor"
            icon="calendar-outline"
            onPress={() => router.push("/tailors" as never)}
          />
          <QuickAction
            title="AI Studio"
            icon="color-wand-outline"
            onPress={() => router.push("/design-studio" as never)}
          />
          <QuickAction
            title="My Orders"
            icon="bag-handle-outline"
            onPress={() => router.push("/orders" as never)}
          />
          <QuickAction
            title="Assistant"
            icon="sparkles-outline"
            onPress={() => router.push("/design-studio/chat" as never)}
          />
        </View>

        {/* Popular Categories */}
        <SectionTitle
          title="Popular Categories"
          action="View All"
          onPressAction={() => router.push("/tailors" as never)}
        />
        <View className="flex-row gap-2.5">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.title}
              activeOpacity={0.8}
              onPress={() => router.push("/tailors" as never)}
              className="flex-1 items-center"
            >
              <TabPlaceholder
                image={category.image}
                variant="garment"
                size="sm"
                tone={category.tone}
              />
              <Text
                className="mt-2 text-center text-[12px] font-bold text-brand-dark leading-[16px]"
                numberOfLines={2}
              >
                {category.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommended Tailors */}
        <SectionTitle
          title="Recommended Tailors"
          action="See All"
          onPressAction={() => router.push("/tailors" as never)}
        />
        {tailorsLoading ? (
            <ActivityIndicator size="small" color="#14919B" />
        ) : recommendedTailor ? (
          <MainTailorCard
            name={
              recommendedTailor.name ||
              recommendedTailor.businessName ||
              "Tailor"
            }
            rating={`${recommendedTailor.rating || 0} (${recommendedTailor.reviews || recommendedTailor.reviewsCount || 0} reviews)`}
            distance={recommendedTailor.distance || "Nearby"}
            specialty={
              recommendedTailor.specialty ||
              recommendedTailor.specialties?.join(", ") ||
              "Bespoke Tailoring"
            }
            image={recommendedTailor.image || recommendedTailor.imageUrl}
            topRated={
              recommendedTailor.topRated ||
              recommendedTailor.isTopRated ||
              false
            }
          />
        ) : (
          <View className="rounded-md border border-brand-border p-6 items-center justify-center bg-white shadow-sm">
            <Text className="text-[14px] font-medium text-brand-gray">
              No tailors available right now
            </Text>
          </View>
        )}

        {/* Recent Designs */}
        {designs?.length > 0 ? (
          <>
            <SectionTitle
              title="Recent Designs"
              action="Open Studio"
              onPressAction={() => router.push("/design-studio" as never)}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12, paddingRight: 10 }}
            >
              {designs?.slice(0, 5)?.map((design, index) => (
                <TouchableOpacity
                  key={design.id || index}
                  activeOpacity={0.8}
                  onPress={() => router.push("/design-studio" as never)}
                  className="w-[110px] items-center"
                >
                  <TabPlaceholder
                    image={design.imageUrl || design.image}
                    variant="garment"
                    size="md"
                    tone="coral"
                  />
                  <Text
                    className="mt-2 text-center text-[12px] font-bold text-brand-dark leading-[16px]"
                    numberOfLines={1}
                  >
                    {design.name || "Custom Outfit"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        ) : null}
      </View>
    </CustomerTabShell>
  );
}
