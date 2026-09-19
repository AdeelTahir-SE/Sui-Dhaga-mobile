import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Image as RNImage,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuthStore } from "../../../stores/auth.store";
import { useDesigns } from "../../design-studio/hooks/useDesigns";
import { useOrders } from "../../booking-orders/hooks/useOrders";
import { useAppointments } from "../../booking-orders/hooks/useAppointments";
import { ButtonTexture } from "../../../components/ui/ButtonTexture";
import { CustomerTabShell } from "../components/CustomerTabShell";
import { CustomerTabsPreview } from "../components/CustomerTabsPreview";
import { QuickAction } from "../components/QuickAction";
import { SectionTitle } from "../components/SectionTitle";
import { TabPlaceholder } from "../components/TabPlaceholder";
import { TrendingCommunitySection } from "../components/TrendingCommunitySection";
import { MinimalOrderCard } from "../components/MinimalOrderCard";
import { MinimalAppointmentCard } from "../components/MinimalAppointmentCard";

const homeHero = require("@/assets/illustrations/customer-tabs/home-hero.png");
const skinTexture = require("@/assets/texture/skin-texture.png");

const appointmentsIcon = require("@/assets/illustrations/customer-tabs/home/appointments-icon.png");
const bookTailorIcon = require("@/assets/illustrations/customer-tabs/home/book-tailor-icon.png");
const aiStudioIcon = require("@/assets/illustrations/customer-tabs/home/ai-studio-icon.png");
const ordersIcon = require("@/assets/illustrations/customer-tabs/home/orders-icon.png");
const measurementsIcon = require("@/assets/illustrations/customer-tabs/home/measurements-icon.png");
const aiAssistantIcon = require("@/assets/illustrations/customer-tabs/home/ai-assistant-icon.png");
const messagesIcon = require("@/assets/illustrations/customer-tabs/home/messages-icon.png");
const communityIcon = require("@/assets/illustrations/customer-tabs/home/community-icon.png");

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  const user = useAuthStore((state) => state.user);
  const { designs, isLoading: designsLoading } = useDesigns();
  const { orders, isLoading: ordersLoading } = useOrders();
  const { appointments, isLoading: appointmentsLoading } = useAppointments();

  const pendingOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const s = (o.status || "").toLowerCase();
        return s === "pending" || s === "in progress" || s === "confirmed";
      })
      .slice(0, 8);
  }, [orders]);

  const upcomingAppointments = useMemo(() => {
    return appointments
      .filter((a) => {
        const s = (a.status || "").toLowerCase();
        return s === "pending" || s === "confirmed" || s === "scheduled" || s === "upcoming";
      })
      .slice(0, 8);
  }, [appointments]);

  const [activeModal, setActiveModal] = useState<
    "designs" | "quickActions" | null
  >(null);

  const emailPrefix = user?.email ? user.email.split("@")[0] : "User";
  const userName = user?.fullName?.trim() || user?.name?.trim() || emailPrefix;

  const quickActionsList = [
    {
      id: "qa-1",
      title: "Appointments",
      description: "Manage upcoming fittings & tailor visits",
      icon: "calendar" as const,
      image: appointmentsIcon,
      route: "/appointments",
      color: "#2563EB",
      bgColor: "#EFF6FF",
      borderColor: "#DBEAFE",
    },
    {
      id: "qa-2",
      title: "Book Tailor",
      description: "Find & schedule master stitching experts",
      icon: "cut-outline" as const,
      image: bookTailorIcon,
      route: "/tailors",
      color: "#D97706",
      bgColor: "#FFFBEB",
      borderColor: "#FEF3C7",
    },
    {
      id: "qa-3",
      title: "Design Studio",
      description: "Create bespoke outfits & view saved designs",
      icon: "color-wand-outline" as const,
      image: aiStudioIcon,
      route: "/design",
      color: "#7C3AED",
      bgColor: "#F5F3FF",
      borderColor: "#EDE9FE",
    },
    {
      id: "qa-4",
      title: "My Orders",
      description: "Track live stitching and delivery status",
      icon: "bag-handle-outline" as const,
      image: ordersIcon,
      route: "/orders",
      color: "#0D9488",
      bgColor: "#F0FDFA",
      borderColor: "#CCFBF1",
    },
    {
      id: "qa-5",
      title: "Measurements",
      description: "Save and update your custom body profiles",
      icon: "body-outline" as const,
      image: measurementsIcon,
      route: "/measurements",
      color: "#E11D48",
      bgColor: "#FFF1F2",
      borderColor: "#FFE4E6",
    },
    {
      id: "qa-6",
      title: "AI Chat",
      description: "Styling queries & custom outfit designer",
      icon: "sparkles-outline" as const,
      image: aiAssistantIcon,
      route: "/design-studio/chat",
      color: "#EA580C",
      bgColor: "#FFF7ED",
      borderColor: "#FFEDD5",
    },
    {
      id: "qa-7",
      title: "Messages",
      description: "Chat with tailors and discuss custom orders",
      icon: "chatbubbles-outline" as const,
      image: messagesIcon,
      route: "/messages",
      color: "#0284C7",
      bgColor: "#F0F9FF",
      borderColor: "#BAE6FD",
    },
    {
      id: "qa-8",
      title: "Community",
      description: "Connect & share designs with fashion enthusiasts",
      icon: "people-outline" as const,
      image: communityIcon,
      route: "/community",
      color: "#4F46E5",
      bgColor: "#EEF2FF",
      borderColor: "#E0E7FF",
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
          <View className="flex-row items-center">
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
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <RNImage
              source={skinTexture}
              resizeMode="repeat"
              style={[
                StyleSheet.absoluteFill,
                {
                  width: "100%",
                  height: "100%",
                },
              ]}
            />
          </View>
          <Text className="w-[56%] text-[23px] font-black leading-[29px] text-brand-dark">
            Your Style, Your Story, Our Craft.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/tailors" as never)}
            activeOpacity={0.85}
            className="relative overflow-hidden mt-3.5 self-start rounded-md bg-[#00949D] px-5 py-3 shadow-sm flex-row items-center gap-1.5"
          >
            <ButtonTexture variant="greenish" borderRadius={6} />
            <View className="z-10 flex-row items-center gap-1.5">
              <Text
                className="text-[13px] font-bold text-white tracking-wide"
                style={{
                  textShadowColor: "rgba(0,0,0,0.22)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                Explore Tailors
              </Text>
              <Ionicons name="arrow-forward" size={15} color="#FFFFFF" />
            </View>
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

        {/* Quick Actions (2 Rows of 4) */}
        <SectionTitle
          title="Quick Actions"
          action="View All"
          onPressAction={() => setActiveModal("quickActions")}
        />
        <View className="gap-2">
          <View className="flex-row gap-2">
            {quickActionsList.slice(0, 4).map((quickAction) => (
              <QuickAction
                key={quickAction.id}
                title={quickAction.title}
                icon={quickAction.icon}
                image={quickAction.image}
                color={quickAction.color}
                bgColor={quickAction.bgColor}
                borderColor={quickAction.borderColor}
                onPress={() => router.push(quickAction.route as never)}
              />
            ))}
          </View>
          <View className="flex-row gap-2">
            {quickActionsList.slice(4, 8).map((quickAction) => (
              <QuickAction
                key={quickAction.id}
                title={quickAction.title}
                icon={quickAction.icon}
                image={quickAction.image}
                color={quickAction.color}
                bgColor={quickAction.bgColor}
                borderColor={quickAction.borderColor}
                onPress={() => router.push(quickAction.route as never)}
              />
            ))}
          </View>
        </View>

        {/* Section: Trending Designs in Community */}
        <TrendingCommunitySection />

        {/* Section: Your Pending Orders */}
        <View className="mt-2">
          <SectionTitle
            title="Pending Orders"
            action="View All"
            onPressAction={() => router.push("/orders" as never)}
          />
          {ordersLoading && orders.length === 0 ? (
            <View className="py-6 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 my-1">
              <ActivityIndicator size="small" color="#14919B" />
              <Text className="mt-2 text-[12px] font-medium text-brand-gray">
                Checking pending orders...
              </Text>
            </View>
          ) : pendingOrders.length === 0 ? (
            <View className="py-6 px-4 items-center justify-center rounded-xl border border-dashed border-brand-border bg-gray-50/50 my-1">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-50 mb-2">
                <Ionicons name="bag-handle-outline" size={20} color="#14919B" />
              </View>
              <Text className="text-[13.5px] font-bold text-brand-dark text-center">
                No Pending Orders
              </Text>
              <Text className="mt-1 text-[11px] text-brand-gray text-center max-w-[240px]">
                You don't have any custom orders in progress right now.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/tailors" as never)}
                activeOpacity={0.8}
                className="mt-3 rounded-lg bg-primary px-3.5 py-1.5 flex-row items-center gap-1"
              >
                <Ionicons name="cut-outline" size={13} color="#FFFFFF" />
                <Text className="text-[11.5px] font-bold text-white">
                  Find a Tailor
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20, gap: 12, paddingVertical: 3 }}
              className="-mx-5 px-5"
            >
              {pendingOrders.map((order, idx) => {
                const o = order as any;
                const itemTitle =
                  o.itemName ||
                  o.item_name ||
                  o.garmentName ||
                  o.garment_name ||
                  "Custom Tailored Outfit";

                const tailorName =
                  o.tailorName ||
                  o.tailor_name ||
                  o.tailor?.shopName ||
                  o.tailor?.name ||
                  "Master Tailor";

                const deliveryInfo =
                  o.deliveryDate ||
                  o.delivery_date ||
                  o.dueDate ||
                  o.deliveryTimeline ||
                  "In Progress";

                const priceValue =
                  order.price ?? order.totalAmount ?? o.total_amount ?? o.estimatedPrice ?? 0;

                const firstDesignImg =
                  (order.designImages && order.designImages.length > 0 ? order.designImages[0] : null) ||
                  (order.design_images && order.design_images.length > 0 ? order.design_images[0] : null) ||
                  (o.designImages && o.designImages.length > 0 ? o.designImages[0] : null) ||
                  (o.design_images && o.design_images.length > 0 ? o.design_images[0] : null) ||
                  order.imageUrl ||
                  order.image ||
                  o.imageUrl ||
                  o.image ||
                  null;

                const tones: ("teal" | "coral" | "gold" | "blue")[] = [
                  "teal",
                  "coral",
                  "gold",
                  "blue",
                ];
                const tone = tones[idx % tones.length];

                return (
                  <MinimalOrderCard
                    key={order.id}
                    id={order.id}
                    orderNumber={order.orderNumber}
                    item={itemTitle}
                    tailor={tailorName}
                    delivery={deliveryInfo}
                    price={priceValue}
                    status={order.status || "Pending"}
                    image={firstDesignImg}
                    designImages={order.designImages || order.design_images || o.designImages || o.design_images}
                    tone={tone}
                    onPress={() => router.push(`/orders/${order.id}` as any)}
                  />
                );
              })}

              {/* Explore All Orders Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/orders" as never)}
                style={{
                  width: 140,
                  backgroundColor: "#F0FAFA",
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: "#CCEBEB",
                  borderStyle: "dashed",
                  padding: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#14919B",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                    marginBottom: 10,
                  }}
                >
                  <Ionicons name="receipt-outline" size={22} color="#14919B" />
                </View>
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: "800",
                    color: "#1A1D1F",
                    textAlign: "center",
                    lineHeight: 16,
                  }}
                >
                  View All Orders
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#6F767E",
                    textAlign: "center",
                    marginTop: 4,
                    lineHeight: 13,
                  }}
                >
                  {orders.length} total orders
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#14919B",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    marginTop: 10,
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    Explore
                  </Text>
                  <Ionicons name="arrow-forward" size={11} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>

        {/* Section: Upcoming Appointments */}
        <View className="mt-2">
          <SectionTitle
            title="Upcoming Appointments"
            action="View All"
            onPressAction={() => router.push("/appointments" as never)}
          />
          {appointmentsLoading && appointments.length === 0 ? (
            <View className="py-6 items-center justify-center rounded-xl bg-gray-50 border border-gray-100 my-1">
              <ActivityIndicator size="small" color="#14919B" />
              <Text className="mt-2 text-[12px] font-medium text-brand-gray">
                Checking appointments...
              </Text>
            </View>
          ) : upcomingAppointments.length === 0 ? (
            <View className="py-6 px-4 items-center justify-center rounded-xl border border-dashed border-brand-border bg-gray-50/50 my-1">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-50 mb-2">
                <Ionicons name="calendar-outline" size={20} color="#14919B" />
              </View>
              <Text className="text-[13.5px] font-bold text-brand-dark text-center">
                No Upcoming Appointments
              </Text>
              <Text className="mt-1 text-[11px] text-brand-gray text-center max-w-[240px]">
                Schedule a consultation, fitting, or measurement visit.
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/appointments" as never)}
                activeOpacity={0.8}
                className="mt-3 rounded-lg bg-primary px-3.5 py-1.5 flex-row items-center gap-1"
              >
                <Ionicons name="calendar" size={13} color="#FFFFFF" />
                <Text className="text-[11.5px] font-bold text-white">
                  Schedule Now
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 20, gap: 12, paddingVertical: 3 }}
              className="-mx-5 px-5"
            >
              {upcomingAppointments.map((apt, idx) => {
                const statusLower = (apt.status || "").toLowerCase();
                const tone: "teal" | "gold" | "blue" | "coral" =
                  statusLower === "confirmed"
                    ? "teal"
                    : statusLower === "pending"
                    ? "gold"
                    : "blue";

                const tailorAvatar =
                  apt.tailorAvatar ||
                  apt.tailor?.avatar ||
                  apt.tailor?.avatar_url ||
                  apt.tailor?.imageUrl ||
                  apt.tailor?.image;

                return (
                  <MinimalAppointmentCard
                    key={apt.id}
                    id={apt.id}
                    tailor={apt.tailorName || apt.tailor?.name || "Master Tailor"}
                    avatar={tailorAvatar}
                    service={apt.serviceType || "Custom Fitting"}
                    date={apt.appointmentDate || apt.date || "Scheduled"}
                    time={apt.appointmentTime || apt.time || ""}
                    status={apt.status || "Upcoming"}
                    tone={tone}
                    onPress={() => router.push(`/appointments/${apt.id}` as any)}
                  />
                );
              })}

              {/* Explore All Appointments Card */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push("/appointments" as never)}
                style={{
                  width: 140,
                  backgroundColor: "#F0F9FF",
                  borderRadius: 16,
                  borderWidth: 1.5,
                  borderColor: "#BAE6FD",
                  borderStyle: "dashed",
                  padding: 14,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: "#FFFFFF",
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#0284C7",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 2,
                    marginBottom: 10,
                  }}
                >
                  <Ionicons name="calendar-outline" size={22} color="#0284C7" />
                </View>
                <Text
                  style={{
                    fontSize: 12.5,
                    fontWeight: "800",
                    color: "#1A1D1F",
                    textAlign: "center",
                    lineHeight: 16,
                  }}
                >
                  View All Visits
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: "#6F767E",
                    textAlign: "center",
                    marginTop: 4,
                    lineHeight: 13,
                  }}
                >
                  {appointments.length} total visits
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: "#0284C7",
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 8,
                    marginTop: 10,
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10.5,
                      fontWeight: "700",
                      color: "#FFFFFF",
                    }}
                  >
                    Explore
                  </Text>
                  <Ionicons name="arrow-forward" size={11} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>

      {/* Modal: All Quick Actions */}
      <Modal
        visible={activeModal === "quickActions"}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setActiveModal(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
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
              <View
                style={{
                  width: 44,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: "#E2E8F0",
                }}
              />
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
                <Text
                  style={{ fontSize: 18, fontWeight: "900", color: "#1A1D1F" }}
                  numberOfLines={1}
                >
                  All Quick Actions
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: "#6F767E",
                    marginTop: 2,
                  }}
                >
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
                    {action.image ? (
                      <Image
                        source={action.image}
                        contentFit="contain"
                        style={{ width: 44, height: 44 }}
                      />
                    ) : (
                      <View
                        style={{
                          backgroundColor: action.bgColor,
                          borderColor: action.borderColor,
                          borderWidth: 1,
                        }}
                        className="h-11 w-11 items-center justify-center rounded-xl"
                      >
                        <Ionicons
                          name={action.icon}
                          size={22}
                          color={action.color}
                        />
                      </View>
                    )}
                    <View className="ml-3.5 flex-1">
                      <Text className="text-[14px] font-bold text-brand-dark">
                        {action.title}
                      </Text>
                      <Text className="mt-0.5 text-[11px] font-medium text-brand-gray">
                        {action.description}
                      </Text>
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: All Designs */}
      <Modal
        visible={activeModal === "designs"}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setActiveModal(null)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <TouchableWithoutFeedback onPress={() => setActiveModal(null)}>
            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
            />
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
              <View
                style={{
                  width: 44,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: "#E2E8F0",
                }}
              />
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
                <Text
                  style={{ fontSize: 18, fontWeight: "900", color: "#1A1D1F" }}
                  numberOfLines={1}
                >
                  Design Gallery
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: "#6F767E",
                    marginTop: 2,
                  }}
                >
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
