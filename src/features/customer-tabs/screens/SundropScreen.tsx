import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useTailors } from "../../tailors/hooks/useTailors";
import { MainTailorCard } from "../components/MainTailorCard";

const sundropBanner = require("../../../../assets/customer-tab-banner/sundrop.png");

export default function SundropScreen() {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const { tailors, isLoading, isRefreshing, refresh } = useTailors();

  const bannerHeight = Math.round((screenWidth - 32) / 2.5);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Top Navigation Bar: Back button at top-left, Heading centered */}
      <View style={styles.navBar}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          style={styles.backButton}
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={20} color="#FDE68A" />
        </TouchableOpacity>

        <View style={styles.navTitleContainer}>
          <Text style={styles.navTitle}>Sundrop Atelier</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#F59E0B"
            colors={["#F59E0B"]}
          />
        }
      >
        {/* Banner Hero Card */}
        <View style={styles.bannerWrapper}>
          <View
            style={[
              styles.bannerCard,
              {
                width: screenWidth - 32,
                height: bannerHeight,
              },
            ]}
          >
            <Image
              source={sundropBanner}
              resizeMode="cover"
              style={{
                width: screenWidth - 32,
                height: bannerHeight,
              }}
            />
          </View>
        </View>

        {/* Tailors List Section */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#F59E0B" />
          </View>
        ) : tailors.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tailors yet</Text>
          </View>
        ) : (
          <View style={styles.tailorsList}>
            {tailors.map((tailor, index) => (
              <MainTailorCard
                key={tailor.id || index}
                id={tailor.id}
                name={
                  tailor.shopName ||
                  tailor.businessName ||
                  tailor.name ||
                  "Tailor Studio"
                }
                rating={
                  tailor.rating
                    ? `${Number(tailor.rating).toFixed(1)} (${tailor.reviewsCount ?? tailor.reviews ?? 0} reviews)`
                    : "New (0 reviews)"
                }
                distance={
                  tailor.distanceKm !== undefined
                    ? `${tailor.distanceKm.toFixed(1)} km away`
                    : tailor.city ||
                      (typeof tailor.location === "object"
                        ? tailor.location?.city
                        : null) ||
                      tailor.address ||
                      tailor.distance ||
                      "Nearby"
                }
                city={
                  tailor.city ||
                  (typeof tailor.location === "object"
                    ? tailor.location?.city
                    : undefined)
                }
                address={
                  tailor.address ||
                  (typeof tailor.location === "object"
                    ? tailor.location?.address
                    : undefined)
                }
                distanceKm={tailor.distanceKm}
                reviewsCount={tailor.reviewsCount ?? tailor.reviews}
                specialty={
                  Array.isArray(tailor.specialties) &&
                  tailor.specialties.length > 0
                    ? tailor.specialties.join(", ")
                    : tailor.specialty || "Custom Tailoring"
                }
                specialties={
                  Array.isArray(tailor.specialties) &&
                  tailor.specialties.length > 0
                    ? tailor.specialties
                    : tailor.specialty
                      ? [tailor.specialty]
                      : ["Custom Tailoring"]
                }
                price={
                  tailor.startingPrice && Number(tailor.startingPrice) > 0
                    ? `Rs. ${Number(tailor.startingPrice).toLocaleString()}`
                    : tailor.services?.[0]?.price
                      ? `Rs. ${Number(tailor.services[0].price).toLocaleString()}`
                      : "Price on request"
                }
                image={
                  tailor.avatarUrl ||
                  tailor.avatar ||
                  tailor.imageUrl ||
                  tailor.image
                }
                experienceYears={tailor.experienceYears}
                isVerified={tailor.isVerified ?? tailor.verified ?? true}
                topRated={tailor.topRated ?? tailor.isTopRated}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#160B24",
  },
  navBar: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 158, 11, 0.15)",
    minHeight: 56,
  },
  backButton: {
    position: "absolute",
    left: 16,
    zIndex: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  navTitleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
    textAlign: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  bannerWrapper: {
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
  },
  bannerCard: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "rgba(245, 158, 11, 0.4)",
    backgroundColor: "#200E34",
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
    backgroundColor: "rgba(35, 14, 60, 0.5)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.15)",
    marginTop: 8,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#DDD6FE",
    textAlign: "center",
  },
  tailorsList: {
    paddingTop: 4,
  },
});
