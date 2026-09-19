import { Ionicons } from "@expo/vector-icons";
import { Image, ImageSource } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { SectionTitle } from "./SectionTitle";

const postPastelAnarkali = require("@/assets/illustrations/measurements-community-checkout/community/post-pastel-anarkali.png");
const postNavyLehenga = require("@/assets/illustrations/measurements-community-checkout/community/post-navy-lehenga.png");
const authorRekha = require("@/assets/illustrations/measurements-community-checkout/community/author-rekha.png");
const authorStitchStyle = require("@/assets/illustrations/measurements-community-checkout/community/author-stitch-style.png");
const royalBlueLehenga = require("@/assets/illustrations/design-studio/previews/royal-blue-lehenga.png");
const goldSaree = require("@/assets/illustrations/design-studio/previews/gold-saree.png");
const tealSherwani = require("@/assets/illustrations/design-studio/previews/teal-sherwani.png");

export type TrendingDesignItem = {
  id: string;
  title: string;
  category: string;
  image: ImageSource | number | { uri: string };
  author: string;
  handle: string;
  authorAvatar?: ImageSource | number | { uri: string };
  verified?: boolean;
  likes: number;
  comments: number;
  route: string;
};

const TRENDING_DESIGNS: TrendingDesignItem[] = [
  {
    id: "1",
    title: "Pastel Floral Anarkali",
    category: "Anarkali",
    image: postPastelAnarkali,
    author: "Rekha Designs",
    handle: "@rekhadesigns",
    authorAvatar: authorRekha,
    verified: true,
    likes: 248,
    comments: 28,
    route: "/community/1",
  },
  {
    id: "2",
    title: "Navy Silk Bridal Lehenga",
    category: "Bridal",
    image: postNavyLehenga,
    author: "Stitch & Style",
    handle: "@stitchstyle",
    authorAvatar: authorStitchStyle,
    verified: true,
    likes: 315,
    comments: 45,
    route: "/community/2",
  },
  {
    id: "3",
    title: "Royal Zardozi Lehenga",
    category: "Lehenga",
    image: royalBlueLehenga,
    author: "Meera Studio",
    handle: "@meerastudio",
    authorAvatar: authorRekha,
    verified: true,
    likes: 189,
    comments: 19,
    route: "/community/1",
  },
  {
    id: "4",
    title: "Hand-worked Gold Saree",
    category: "Saree",
    image: goldSaree,
    author: "Crafted Fits",
    handle: "@craftedfits",
    authorAvatar: authorStitchStyle,
    verified: true,
    likes: 164,
    comments: 12,
    route: "/community/2",
  },
  {
    id: "5",
    title: "Ivory & Teal Sherwani",
    category: "Sherwani",
    image: tealSherwani,
    author: "Master Asif",
    handle: "@asiftailors",
    authorAvatar: authorRekha,
    verified: true,
    likes: 210,
    comments: 34,
    route: "/community/1",
  },
];

type TrendingCommunitySectionProps = {
  title?: string;
  onViewAll?: () => void;
};

export function TrendingCommunitySection({
  title = "Trending Designs",
  onViewAll,
}: TrendingCommunitySectionProps) {
  const [likesMap, setLikesMap] = useState<
    Record<string, { liked: boolean; count: number }>
  >(() => {
    const initial: Record<string, { liked: boolean; count: number }> = {};
    TRENDING_DESIGNS.forEach((item) => {
      initial[item.id] = { liked: false, count: item.likes };
    });
    return initial;
  });

  const toggleLike = (id: string) => {
    setLikesMap((prev) => {
      const current = prev[id] || { liked: false, count: 0 };
      const nextLiked = !current.liked;
      return {
        ...prev,
        [id]: {
          liked: nextLiked,
          count: nextLiked ? current.count + 1 : current.count - 1,
        },
      };
    });
  };

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      router.push("/community" as never);
    }
  };

  return (
    <View className="mt-2">
      {/* Section Header */}
      <SectionTitle
        title={title}
        action="Explore Feed"
        onPressAction={handleViewAll}
      />

      {/* Horizontal Scroll of Trending Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        className="-mx-5 px-5"
      >
        {TRENDING_DESIGNS.map((item) => {
          const itemLike = likesMap[item.id] || {
            liked: false,
            count: item.likes,
          };

          return (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => router.push(item.route as never)}
              style={styles.card}
            >
              {/* Image Showcase */}
              <View style={styles.imageWrapper}>
                <Image
                  source={item.image}
                  contentFit="cover"
                  transition={200}
                  style={styles.image}
                />

                {/* Category Pill Tag */}
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category}</Text>
                </View>

                {/* Quick Like Button on Card */}
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() => toggleLike(item.id)}
                  style={styles.likeBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name={itemLike.liked ? "heart" : "heart-outline"}
                    size={16}
                    color={itemLike.liked ? "#E11D48" : "#FFFFFF"}
                  />
                  <Text
                    style={[
                      styles.likeCountText,
                      itemLike.liked ? styles.likeCountActive : null,
                    ]}
                  >
                    {itemLike.count}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Design Details */}
              <View style={styles.contentContainer}>
                <Text numberOfLines={1} style={styles.designTitle}>
                  {item.title}
                </Text>

                {/* Tailor / Creator row */}
                <View style={styles.authorRow}>
                  {item.authorAvatar ? (
                    <Image
                      source={item.authorAvatar}
                      contentFit="cover"
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <Ionicons name="person" size={12} color="#14919B" />
                    </View>
                  )}
                  <View style={styles.authorTextContainer}>
                    <View style={styles.authorNameRow}>
                      <Text numberOfLines={1} style={styles.authorName}>
                        {item.author}
                      </Text>
                      {item.verified && (
                        <Ionicons
                          name="checkmark-circle"
                          size={13}
                          color="#14919B"
                          style={{ marginLeft: 3 }}
                        />
                      )}
                    </View>
                    <Text numberOfLines={1} style={styles.handleText}>
                      {item.handle}
                    </Text>
                  </View>
                </View>

                {/* Engagement / Action Footer */}
                <View style={styles.footerRow}>
                  <View style={styles.commentRow}>
                    <Ionicons
                      name="chatbubble-outline"
                      size={13}
                      color="#6F767E"
                    />
                    <Text style={styles.commentText}>{item.comments}</Text>
                  </View>
                  <View style={styles.viewBadge}>
                    <Text style={styles.viewBadgeText}>View Details</Text>
                    <Ionicons
                      name="chevron-forward"
                      size={12}
                      color="#14919B"
                    />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* "View All in Community" Card at End of Slider */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleViewAll}
          style={styles.exploreMoreCard}
        >
          <View style={styles.exploreIconCircle}>
            <Ionicons name="people" size={24} color="#14919B" />
          </View>
          <Text style={styles.exploreTitle}>Explore All Community</Text>
          <Text style={styles.exploreSubtitle}>
            Connect, share & find tailor inspiration
          </Text>
          <View style={styles.exploreBtn}>
            <Text style={styles.exploreBtnText}>Open Feed</Text>
            <Ionicons name="arrow-forward" size={13} color="#FFFFFF" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingRight: 20,
    gap: 12,
    paddingVertical: 2,
  },
  card: {
    width: 220,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#EAEAEA",
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  imageWrapper: {
    width: "100%",
    height: 155,
    backgroundColor: "#F4F5F6",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  categoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "rgba(255, 255, 255, 0.92)",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryBadgeText: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#14919B",
    letterSpacing: 0.2,
  },
  likeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  likeCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  likeCountActive: {
    color: "#FFD1DC",
  },
  contentContainer: {
    padding: 12,
  },
  designTitle: {
    fontSize: 13.5,
    fontWeight: "800",
    color: "#1A1D1F",
    lineHeight: 18,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E2E8F0",
  },
  avatarPlaceholder: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
  },
  authorTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  authorNameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#1A1D1F",
  },
  handleText: {
    fontSize: 10,
    color: "#6F767E",
    marginTop: 0.5,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  commentText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6F767E",
  },
  viewBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  viewBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#14919B",
  },
  exploreMoreCard: {
    width: 150,
    backgroundColor: "#F0FAFA",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#CCEBEB",
    borderStyle: "dashed",
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  exploreIconCircle: {
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
  },
  exploreTitle: {
    fontSize: 12.5,
    fontWeight: "800",
    color: "#1A1D1F",
    textAlign: "center",
    lineHeight: 16,
  },
  exploreSubtitle: {
    fontSize: 10,
    color: "#6F767E",
    textAlign: "center",
    marginTop: 4,
    lineHeight: 13,
  },
  exploreBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14919B",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
    gap: 4,
  },
  exploreBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
