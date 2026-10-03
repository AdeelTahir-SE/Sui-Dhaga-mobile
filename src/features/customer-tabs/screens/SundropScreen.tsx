import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const sundropBanner = require("../../../../assets/customer-tab-banner/sundrop.png");

const CATEGORIES = [
  "All Tailors",
  "Zardozi Craft",
  "Heritage Silk",
  "Bridal Couture",
  "Bespoke Cuts",
];

export default function SundropScreen() {
  const insets = useSafeAreaInsets();
  const screenWidth = Dimensions.get("window").width;
  const [selectedCategory, setSelectedCategory] = useState("All Tailors");

  const bannerHeight = Math.round((screenWidth - 32) / 2.5);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar style="light" />

      {/* Top Navigation Bar */}
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
          <View style={styles.collabBadge}>
            <Ionicons name="sparkles" size={10} color="#F59E0B" />
            <Text style={styles.collabBadgeText}>EXCLUSIVE COLLABORATION</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/tailors" as never)}
          activeOpacity={0.7}
          style={styles.actionButton}
          accessibilityLabel="Browse All Tailors"
        >
          <Ionicons name="search-outline" size={18} color="#FDE68A" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 36 },
        ]}
        showsVerticalScrollIndicator={false}
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

        {/* Narrative / About Tagline */}
        <View style={styles.storyCard}>
          <View style={styles.storyHeader}>
            <View style={styles.goldLine} />
            <Text style={styles.storyTag}>SUNDROP × SUI DHAGA</Text>
            <View style={styles.goldLine} />
          </View>
          <Text style={styles.storyHeading}>Traditional Craft. Modern You.</Text>
          <Text style={styles.storyDescription}>
            An exclusive collaboration celebrating heritage zardozi, artisanal
            embroidery, and bespoke silhouettes crafted with master precision.
          </Text>
        </View>

        {/* Category Filters */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterList}
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  activeOpacity={0.8}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.filterChip,
                    isActive
                      ? styles.filterChipActive
                      : styles.filterChipInactive,
                  ]}
                >
                  {isActive && (
                    <Ionicons
                      name="sparkles"
                      size={12}
                      color="#1A0B2E"
                      style={{ marginRight: 4 }}
                    />
                  )}
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive
                        ? styles.filterChipTextActive
                        : styles.filterChipTextInactive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tailors Section Header */}
        <View style={styles.tailorsHeader}>
          <View style={styles.tailorsHeaderLeft}>
            <Text style={styles.tailorsSectionTitle}>Curated Artisans</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>0 Active</Text>
            </View>
          </View>
          <Text style={styles.curationNotice}>By Invitation Only</Text>
        </View>

        {/* Minimal Empty State Card */}
        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyIconHalo}>
            <View style={styles.emptyIconCore}>
              <Ionicons name="sunny" size={32} color="#F59E0B" />
            </View>
          </View>

          <Text style={styles.emptyTitle}>No Tailors Yet</Text>
          <Text style={styles.emptySubtitle}>
            We are curating certified master artisans specializing in exclusive
            Sundrop embroidery & bespoke royal cuts. Profiles will appear here
            as they are onboarded.
          </Text>

          {/* Feature Highlights */}
          <View style={styles.featureHighlights}>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#F59E0B" />
              <Text style={styles.featureText}>
                Handcrafted Zardozi & Thread Specialists
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#F59E0B" />
              <Text style={styles.featureText}>
                Premium Quality Certified by Sui Dhaga
              </Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={16} color="#F59E0B" />
              <Text style={styles.featureText}>
                Exclusive Fitting & Doorstep Consultations
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionGroup}>
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push("/tailors" as never)}
              style={styles.primaryActionButton}
            >
              <Text style={styles.primaryActionText}>Explore All Tailors</Text>
              <Ionicons name="arrow-forward" size={16} color="#1A0B2E" />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.back()}
              style={styles.secondaryActionButton}
            >
              <Text style={styles.secondaryActionText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(245, 158, 11, 0.15)",
  },
  backButton: {
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
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  collabBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  collabBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#FDE68A",
    letterSpacing: 0.8,
  },
  actionButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.25)",
    alignItems: "center",
    justifyContent: "center",
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
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  storyCard: {
    backgroundColor: "rgba(42, 18, 73, 0.65)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.2)",
    padding: 16,
    marginBottom: 18,
    alignItems: "center",
  },
  storyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  goldLine: {
    width: 24,
    height: 1,
    backgroundColor: "#F59E0B",
    opacity: 0.6,
  },
  storyTag: {
    fontSize: 10,
    fontWeight: "800",
    color: "#FBBF24",
    letterSpacing: 1.2,
  },
  storyHeading: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 6,
    textAlign: "center",
  },
  storyDescription: {
    fontSize: 12.5,
    lineHeight: 18,
    color: "#DDD6FE",
    textAlign: "center",
    opacity: 0.9,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterList: {
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: "#F59E0B",
    borderColor: "#FBBF24",
  },
  filterChipInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(245, 158, 11, 0.2)",
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
  },
  filterChipTextActive: {
    color: "#1A0B2E",
  },
  filterChipTextInactive: {
    color: "#E9D5FF",
  },
  tailorsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  tailorsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tailorsSectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  countBadge: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#FDE68A",
  },
  curationNotice: {
    fontSize: 11,
    fontWeight: "600",
    color: "#C4B5FD",
  },
  emptyStateContainer: {
    backgroundColor: "rgba(35, 14, 60, 0.8)",
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "rgba(245, 158, 11, 0.25)",
    padding: 24,
    alignItems: "center",
  },
  emptyIconHalo: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.35)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyIconCore: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#FFFFFF",
    marginBottom: 6,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: "#DDD6FE",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  featureHighlights: {
    width: "100%",
    backgroundColor: "rgba(20, 8, 36, 0.6)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.15)",
    padding: 14,
    gap: 10,
    marginBottom: 22,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FEF3C7",
    flex: 1,
  },
  actionGroup: {
    width: "100%",
    gap: 10,
  },
  primaryActionButton: {
    backgroundColor: "#F59E0B",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1A0B2E",
    letterSpacing: 0.3,
  },
  secondaryActionButton: {
    backgroundColor: "transparent",
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#DDD6FE",
  },
});
