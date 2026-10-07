import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { router } from "expo-router";

const suidhagaHeroBanner = require("../../../../assets/customer-tab-banner/suidhaga-hero-banner.png");
const sundropBanner = require("../../../../assets/customer-tab-banner/sundrop.png");
const aiStudioBanner = require("../../../../assets/customer-tab-banner/ai-studio-banner.png");

interface BannerItem {
  id: string;
  image: any;
  route: string;
  title: string;
}

const BANNERS: BannerItem[] = [
  {
    id: "suidhaga-hero",
    image: suidhagaHeroBanner,
    route: "/tailors",
    title: "Explore Tailors",
  },
  {
    id: "sundrop-collab",
    image: sundropBanner,
    route: "/sundrop",
    title: "Sundrop Exclusive Collaboration",
  },
  {
    id: "ai-studio",
    image: aiStudioBanner,
    route: "/design-studio",
    title: "AI Studio",
  },
];

const AUTO_SCROLL_DELAY = 4000;

export function CustomerHeroCarousel() {
  const screenWidth = Dimensions.get("window").width;
  // Account for px-5 (20px horizontal padding on each side of the screen container)
  const initialWidth = Math.max(screenWidth - 40, 280);

  const [containerWidth, setContainerWidth] = useState(initialWidth);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef<ScrollView>(null);
  const currentIndexRef = useRef(0);
  const isInteractingRef = useRef(false);

  // Aspect ratio is ~2.38 for the 1920x800 banner
  const bannerHeight = Math.round(containerWidth / 2.38);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Auto-scrolling timer loop
  useEffect(() => {
    if (BANNERS.length <= 1) return;

    const timer = setInterval(() => {
      if (isInteractingRef.current) return;

      const nextIndex = (currentIndexRef.current + 1) % BANNERS.length;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);

      scrollRef.current?.scrollTo({
        x: nextIndex * containerWidth,
        animated: true,
      });
    }, AUTO_SCROLL_DELAY);

    return () => clearInterval(timer);
  }, [containerWidth]);

  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / containerWidth);
      const clamped = Math.max(0, Math.min(BANNERS.length - 1, index));
      if (clamped !== currentIndexRef.current) {
        currentIndexRef.current = clamped;
        setCurrentIndex(clamped);
      }
    },
    [containerWidth]
  );

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: "100%",
          height: bannerHeight,
        },
      ]}
      onLayout={(e) => {
        const measuredWidth = Math.round(e.nativeEvent.layout.width);
        if (measuredWidth > 0 && Math.abs(measuredWidth - containerWidth) > 2) {
          setContainerWidth(measuredWidth);
        }
      }}
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEventThrottle={16}
        onScroll={handleScroll}
        onScrollBeginDrag={() => {
          isInteractingRef.current = true;
        }}
        onScrollEndDrag={() => {
          // Re-enable auto-scroll after a short pause
          setTimeout(() => {
            isInteractingRef.current = false;
          }, 1000);
        }}
        onMomentumScrollEnd={(e) => {
          isInteractingRef.current = false;
          handleScroll(e);
        }}
        style={{
          width: containerWidth,
          height: bannerHeight,
        }}
        contentContainerStyle={{
          width: containerWidth * BANNERS.length,
          height: bannerHeight,
        }}
      >
        {BANNERS.map((banner) => (
          <TouchableOpacity
            key={banner.id}
            activeOpacity={0.92}
            onPress={() => router.push(banner.route as never)}
            style={{
              width: containerWidth,
              height: bannerHeight,
            }}
          >
            <View
              style={[
                styles.card,
                {
                  width: containerWidth,
                  height: bannerHeight,
                },
              ]}
            >
              <Image
                source={banner.image}
                style={{
                  width: containerWidth,
                  height: bannerHeight,
                }}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Floating indicator dots pill */}
      <View pointerEvents="none" style={styles.paginationOverlay}>
        <View style={styles.paginationPill}>
          {BANNERS.map((banner, index) => {
            const isActive = index === currentIndex;
            return (
              <View
                key={banner.id}
                style={[
                  styles.dot,
                  isActive ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  paginationOverlay: {
    position: "absolute",
    bottom: 8,
    alignSelf: "center",
  },
  paginationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 5,
  },
  dot: {
    height: 5,
    borderRadius: 2.5,
  },
  activeDot: {
    width: 16,
    backgroundColor: "#FFFFFF",
  },
  inactiveDot: {
    width: 5,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },
});
