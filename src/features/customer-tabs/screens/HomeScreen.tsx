import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const allCategoriesList = [
  {
    id: "cat-1",
    title: "Kurtas & Shalwar Suits",
    description: "Casual, festive, daily & formal ethnic wear",
    image: categoryKurtas,
    tone: "mint" as const,
    count: "48+ Tailors",
  },
  {
    id: "cat-2",
    title: "Bridal & Party Lehengas",
    description: "Zardozi, heavy flare, velvet & organza lehengas",
    image: categoryLehengas,
    tone: "coral" as const,
    count: "36+ Tailors",
  },
  {
    id: "cat-3",
    title: "Sarees & Designer Blouses",
    description: "Pico, fall hem, backless & designer blouse styling",
    image: categorySarees,
    tone: "gold" as const,
    count: "52+ Tailors",
  },
  {
    id: "cat-4",
    title: "Bespoke Shirts & Trousers",
    description: "Sharp formal business, casual & custom fitted shirts",
    image: categoryShirts,
    tone: "blue" as const,
    count: "40+ Tailors",
  },
  {
    id: "cat-5",
    title: "Groom Sherwanis & Indo-Western",
    description: "Royal groom cuts, bandhgalas & celebratory attire",
    image: categoryKurtas,
    tone: "gold" as const,
    count: "28+ Tailors",
  },
  {
    id: "cat-6",
    title: "Anarkalis & Festive Gowns",
    description: "Flowing floor-length silhouettes & party gowns",
    image: categoryLehengas,
    tone: "coral" as const,
    count: "34+ Tailors",
  },
  {
    id: "cat-7",
    title: "Western Dresses & Tops",
    description: "Modern co-ords, linen dresses, skirts & jumpsuits",
    image: categoryShirts,
    tone: "mint" as const,
    count: "22+ Tailors",
  },
  {
    id: "cat-8",
    title: "Alterations & Restyling",
    description: "Size adjustment, hems, waist tapering & restyling",
    image: categorySarees,
    tone: "blue" as const,
    count: "60+ Tailors",
  },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  const user = useAuthStore((state) => state.user);
  const { tailors, isLoading: tailorsLoading } = useTailors();
  const { designs, isLoading: designsLoading } = useDesigns();

  const [activeModal, setActiveModal] = useState<
    "categories" | "tailors" | "designs" | "quickActions" | null
  >(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const emailPrefix = user?.email ? user.email.split("@")[0] : "User";
  const userName =
    user?.fullName?.trim() ||
    user?.name?.trim() ||
    emailPrefix;
  const recommendedTailor = tailors[0];

  const quickActionsList = [
    {
      id: "qa-1",
      title: "Appointments",
      description: "Manage upcoming fittings & tailor visits",
      icon: "calendar" as const,
      route: "/appointments",
    },
    {
      id: "qa-2",
      title: "Book Tailor",
      description: "Find & schedule master stitching experts",
      icon: "cut-outline" as const,
      route: "/tailors",
    },
    {
      id: "qa-3",
      title: "AI Studio",
      description: "Create bespoke outfits with AI visualization",
      icon: "color-wand-outline" as const,
      route: "/design-studio",
    },
    {
      id: "qa-4",
      title: "My Orders",
      description: "Track live stitching and delivery status",
      icon: "bag-handle-outline" as const,
      route: "/orders",
    },
    {
      id: "qa-5",
      title: "Measurements",
      description: "Save and update your custom body profiles",
      icon: "body-outline" as const,
      route: "/measurements",
    },
    {
      id: "qa-6",
      title: "AI Assistant",
      description: "Chat with AI stylist for fabric & cut advice",
      icon: "sparkles-outline" as const,
      route: "/design-studio/chat",
    },
    {
      id: "qa-7",
      title: "Tailor Map",
      description: "Locate nearby verified boutiques & studios",
      icon: "map-outline" as const,
      route: "/tailors/map",
    },
    {
      id: "qa-8",
      title: "Compare Tailors",
      description: "Side-by-side pricing & rating comparison",
      icon: "git-compare-outline" as const,
      route: "/tailors/compare",
    },
  ];

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

        {/* Quick Actions (Grid with Appointments included) */}
        <SectionTitle
          title="Quick Actions"
          action="View All"
          onPressAction={() => setActiveModal("quickActions")}
        />
        <View className="flex-row gap-2.5">
          <QuickAction
            title="Appointments"
            icon="calendar"
            onPress={() => router.push("/appointments" as never)}
          />
          <QuickAction
            title="Book Tailor"
            icon="cut-outline"
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
        </View>

        {/* Popular Categories */}
        <SectionTitle
          title="Popular Categories"
          action="View All"
          onPressAction={() => {
            setSelectedCategory(null);
            setActiveModal("categories");
          }}
        />
        <View className="flex-row gap-2.5">
          {categories.map((category) => (
            <TouchableOpacity
              key={category.title}
              activeOpacity={0.8}
              onPress={() => {
                setSelectedCategory(category.title);
                setActiveModal("categories");
              }}
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
          onPressAction={() => setActiveModal("tailors")}
        />
        {tailorsLoading ? (
          <View className="py-8 items-center justify-center">
            <ActivityIndicator size="small" color="#14919B" />
          </View>
        ) : recommendedTailor ? (
          <MainTailorCard
            id={recommendedTailor.id}
            name={
              recommendedTailor.shopName ||
              recommendedTailor.businessName ||
              recommendedTailor.name ||
              "Tailor Studio"
            }
            rating={
              recommendedTailor.rating
                ? `${Number(recommendedTailor.rating).toFixed(1)} (${recommendedTailor.reviewsCount ?? recommendedTailor.reviews ?? 0} reviews)`
                : "New (0 reviews)"
            }
            distance={
              recommendedTailor.city ||
              (typeof recommendedTailor.location === "object" ? recommendedTailor.location?.city : null) ||
              recommendedTailor.address ||
              recommendedTailor.distance ||
              "Nearby"
            }
            specialty={
              Array.isArray(recommendedTailor.specialties) && recommendedTailor.specialties.length > 0
                ? recommendedTailor.specialties.join(", ")
                : recommendedTailor.specialty ||
                  "Custom Tailoring"
            }
            price={
              recommendedTailor.startingPrice && Number(recommendedTailor.startingPrice) > 0
                ? `Rs. ${Number(recommendedTailor.startingPrice).toLocaleString()}`
                : recommendedTailor.services?.[0]?.price
                ? `Rs. ${Number(recommendedTailor.services[0].price).toLocaleString()}`
                : "Price on request"
            }
            image={
              recommendedTailor.imageUrl ||
              recommendedTailor.image ||
              recommendedTailor.avatar
            }
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
              action="View All"
              onPressAction={() => setActiveModal("designs")}
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

      {/* MODAL 1: All Categories Modal */}
      <Modal
        visible={activeModal === "categories"}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => {
          setSelectedCategory(null);
          setActiveModal(null);
        }}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          {/* Backdrop touch area to dismiss */}
          <TouchableWithoutFeedback
            onPress={() => {
              setSelectedCategory(null);
              setActiveModal(null);
            }}
          >
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          </TouchableWithoutFeedback>

          {/* Bottom Sheet Modal Container */}
          <View
            style={{
              height: Math.min(620, SCREEN_HEIGHT * 0.78),
              maxHeight: SCREEN_HEIGHT - insets.top - 50,
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 25,
            }}
          >
            {/* Drag Handle */}
            <View style={{ alignItems: "center", paddingVertical: 6 }}>
              <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: "#E2E8F0" }} />
            </View>

            {/* Pinned Header with Guaranteed Visible Close (X) Button */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#F1F5F9",
                marginBottom: 10,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#1A1D1F" }} numberOfLines={1}>
                  {selectedCategory ? `${selectedCategory}` : "All Categories"}
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "500", color: "#6F767E", marginTop: 2 }}>
                  Find master specialists for every garment
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setSelectedCategory(null);
                  setActiveModal(null);
                }}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#F4F5F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={22} color="#1A1D1F" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content inside Bounded Container */}
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <View className="gap-2.5">
                {allCategoriesList.map((cat) => {
                  const isHighlighted = selectedCategory && cat.title.toLowerCase().includes(selectedCategory.toLowerCase());
                  return (
                    <View
                      key={cat.id}
                      className={`rounded-xl border p-3.5 shadow-xs ${
                        isHighlighted
                          ? "border-primary bg-primary/5"
                          : "border-brand-border bg-white"
                      }`}
                    >
                      <View className="flex-row items-center">
                        <TabPlaceholder
                          image={cat.image}
                          variant="garment"
                          size="sm"
                          tone={cat.tone}
                        />
                        <View className="ml-3.5 flex-1">
                          <View className="flex-row items-center justify-between">
                            <Text className="text-[14px] font-bold text-brand-dark">
                              {cat.title}
                            </Text>
                            <View className="rounded-md bg-primary/10 px-2 py-0.5">
                              <Text className="text-[10px] font-bold text-primary">
                                {cat.count}
                              </Text>
                            </View>
                          </View>
                          <Text className="mt-1 text-[11px] font-medium text-brand-gray">
                            {cat.description}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => {
                          setSelectedCategory(null);
                          setActiveModal(null);
                          router.push("/tailors" as never);
                        }}
                        className="mt-3 flex-row items-center justify-center rounded-lg bg-primary/10 py-2 active:bg-primary/20"
                      >
                        <Text className="text-[12px] font-bold text-primary">
                          Explore {cat.title.split(" ")[0]} Tailors
                        </Text>
                        <Ionicons name="chevron-forward" size={14} color="#14919B" style={{ marginLeft: 4 }} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: All Quick Actions Modal */}
      <Modal
        visible={activeModal === "quickActions"}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          </TouchableWithoutFeedback>

          <View
            style={{
              height: Math.min(620, SCREEN_HEIGHT * 0.78),
              maxHeight: SCREEN_HEIGHT - insets.top - 50,
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 25,
            }}
          >
            <View style={{ alignItems: "center", paddingVertical: 6 }}>
              <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: "#E2E8F0" }} />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#F1F5F9",
                marginBottom: 10,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#1A1D1F" }} numberOfLines={1}>
                  All Quick Actions
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "500", color: "#6F767E", marginTop: 2 }}>
                  Fast shortcuts to everything in Sui Dhaga
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveModal(null)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#F4F5F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={22} color="#1A1D1F" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <View className="gap-2.5">
                {quickActionsList.map((action) => (
                  <TouchableOpacity
                    key={action.id}
                    activeOpacity={0.7}
                    onPress={() => {
                      setActiveModal(null);
                      router.push(action.route as never);
                    }}
                    className="flex-row items-center rounded-xl border border-brand-border bg-white p-3.5 shadow-xs active:bg-gray-50"
                  >
                    <View className="h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                      <Ionicons name={action.icon} size={22} color="#14919B" />
                    </View>
                    <View className="ml-3.5 flex-1">
                      <Text className="text-[14px] font-bold text-brand-dark">
                        {action.title}
                      </Text>
                      <Text className="mt-0.5 text-[11px] font-medium text-brand-gray">
                        {action.description}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: All Tailors Modal */}
      <Modal
        visible={activeModal === "tailors"}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          </TouchableWithoutFeedback>

          <View
            style={{
              height: Math.min(620, SCREEN_HEIGHT * 0.78),
              maxHeight: SCREEN_HEIGHT - insets.top - 50,
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 25,
            }}
          >
            <View style={{ alignItems: "center", paddingVertical: 6 }}>
              <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: "#E2E8F0" }} />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#F1F5F9",
                marginBottom: 10,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#1A1D1F" }} numberOfLines={1}>
                  Recommended Tailors
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "500", color: "#6F767E", marginTop: 2 }}>
                  Top rated verified stitching masters near you
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveModal(null)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#F4F5F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={22} color="#1A1D1F" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <View className="gap-3">
                {tailors.map((tailorItem) => (
                  <MainTailorCard
                    key={tailorItem.id}
                    id={tailorItem.id}
                    name={
                      tailorItem.shopName ||
                      tailorItem.businessName ||
                      tailorItem.name ||
                      "Tailor Studio"
                    }
                    rating={
                      tailorItem.rating
                        ? `${Number(tailorItem.rating).toFixed(1)} (${tailorItem.reviewsCount ?? tailorItem.reviews ?? 0} reviews)`
                        : "New (0 reviews)"
                    }
                    distance={
                      tailorItem.city ||
                      (typeof tailorItem.location === "object" ? tailorItem.location?.city : null) ||
                      tailorItem.address ||
                      tailorItem.distance ||
                      "Nearby"
                    }
                    specialty={
                      Array.isArray(tailorItem.specialties) && tailorItem.specialties.length > 0
                        ? tailorItem.specialties.join(", ")
                        : tailorItem.specialty ||
                          "Custom Tailoring"
                    }
                    price={
                      tailorItem.startingPrice && Number(tailorItem.startingPrice) > 0
                        ? `Rs. ${Number(tailorItem.startingPrice).toLocaleString()}`
                        : tailorItem.services?.[0]?.price
                        ? `Rs. ${Number(tailorItem.services[0].price).toLocaleString()}`
                        : "Price on request"
                    }
                    image={
                      tailorItem.imageUrl ||
                      tailorItem.image ||
                      tailorItem.avatar
                    }
                    topRated={
                      tailorItem.topRated ||
                      tailorItem.isTopRated ||
                      false
                    }
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 4: All Designs Modal */}
      <Modal
        visible={activeModal === "designs"}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setActiveModal(null)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} />
          </TouchableWithoutFeedback>

          <View
            style={{
              height: Math.min(620, SCREEN_HEIGHT * 0.78),
              maxHeight: SCREEN_HEIGHT - insets.top - 50,
              backgroundColor: "#FFFFFF",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              paddingHorizontal: 20,
              paddingTop: 10,
              paddingBottom: insets.bottom > 0 ? insets.bottom + 8 : 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -6 },
              shadowOpacity: 0.15,
              shadowRadius: 16,
              elevation: 25,
            }}
          >
            <View style={{ alignItems: "center", paddingVertical: 6 }}>
              <View style={{ width: 44, height: 5, borderRadius: 3, backgroundColor: "#E2E8F0" }} />
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: "#F1F5F9",
                marginBottom: 10,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "900", color: "#1A1D1F" }} numberOfLines={1}>
                  Design Gallery
                </Text>
                <Text style={{ fontSize: 12, fontWeight: "500", color: "#6F767E", marginTop: 2 }}>
                  Custom & AI created garment designs
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveModal(null)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: "#F4F5F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <Ionicons name="close" size={22} color="#1A1D1F" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <View className="flex-row flex-wrap justify-between gap-y-3">
                {designs.map((design, index) => (
                  <TouchableOpacity
                    key={design.id || index}
                    activeOpacity={0.8}
                    onPress={() => {
                      setActiveModal(null);
                      router.push("/design-studio" as never);
                    }}
                    className="w-[48%] rounded-md border border-brand-border bg-white p-3 shadow-xs active:bg-gray-50 items-center"
                  >
                    <TabPlaceholder
                      image={design.imageUrl || design.image}
                      variant="garment"
                      size="md"
                      tone="coral"
                    />
                    <Text
                      className="mt-2.5 text-center text-[13px] font-bold text-brand-dark leading-[16px]"
                      numberOfLines={1}
                    >
                      {design.name || "Custom Outfit"}
                    </Text>
                    <Text className="mt-0.5 text-center text-[11px] font-medium text-brand-gray">
                      {design.garmentType || design.category || "AI Generated"}
                    </Text>
                    <View className="mt-2.5 w-full rounded-md bg-primary/10 py-1.5 items-center">
                      <Text className="text-[11px] font-bold text-primary">
                        Customize in Studio
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </CustomerTabShell>
  );
}
