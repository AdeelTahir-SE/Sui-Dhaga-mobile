import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

const suidhagaHeroBanner = require("@/assets/customer-tab-banner/suidhaga-hero-banner.png");
const sundropBanner = require("@/assets/customer-tab-banner/sundrop.png");

interface BannerItem {
  id: string;
  image: any;
  route: string;
  alt: string;
}

const BANNERS: BannerItem[] = [
  {
    id: "suidhaga-hero",
    image: suidhagaHeroBanner,
    route: "/tailors",
    alt: "Explore Tailors Banner",
  },
  {
    id: "sundrop-collab",
    image: sundropBanner,
    route: "/sundrop",
    alt: "Sundrop Exclusive Collaboration",
  },
];

const AUTO_SCROLL_DELAY = 4000;

export function CustomerHeroCarousel() {
  const [containerWidth, setContainerWidth] = useState(() => {
    const screenWidth = Dimensions.get("window").width;
    return Math.max(screenWidth - 40, 280); // px-5 is 20px on each side
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  const flatListRef = useRef<FlatList<BannerItem>>(null);
  const isInteractingRef = useRef(false);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Auto-scroll timer
  useEffect(() => {
    if (BANNERS.length <= 1) return;

    const interval = setInterval(() => {
      if (isInteractingRef.current) return;
      const nextIndex = (currentIndexRef.current + 1) % BANNERS.length;
      currentIndexRef.current = nextIndex;
      setCurrentIndex(nextIndex);

      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
    }, AUTO_SCROLL_DELAY);

    return () => clearInterval(interval);
  }, [containerWidth]);

  const handleMomentumScrollEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      isInteractingRef.current = false;
      const contentOffsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(contentOffsetX / containerWidth);
      const clampedIndex = Math.max(0, Math.min(BANNERS.length - 1, index));
      setCurrentIndex(clampedIndex);
      currentIndexRef.current = clampedIndex;
    },
    [containerWidth]
  );

  const bannerHeight = Math.round(containerWidth / 2.38);

  const renderBannerItem = ({ item }: { item: BannerItem }) => (
    <TouchableOpacity
      activeOpacity={0.92}
      onPress={() => router.push(item.route as never)}
      style={{
        width: containerWidth,
        height: bannerHeight,
      }}
    >
      <View
        style={[
          styles.cardContainer,
          {
            width: containerWidth,
            height: bannerHeight,
          },
        ]}
      >
        <Image
          source={item.image}
          contentFit="cover"
          transition={250}
          style={styles.bannerImage}
          accessibilityLabel={item.alt}
        />
      </View>
    </TouchableOpacity>
  );

  return (
    <View
      style={styles.wrapper}
      onLayout={(e) => {
        const layoutW = Math.round(e.nativeEvent.layout.width);
        if (layoutW > 0 && Math.abs(layoutW - containerWidth) > 2) {
          setContainerWidth(layoutW);
        }
      }}
    >
      <FlatList
        ref={flatListRef}
        data={BANNERS}
        renderItem={renderBannerItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={containerWidth}
        snapToAlignment="center"
        bounces={false}
        onScrollBeginDrag={() => {
          isInteractingRef.current = true;
        }}
        onScrollEndDrag={() => {
          isInteractingRef.current = false;
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        getItemLayout={(_, index) => ({
          length: containerWidth,
          offset: containerWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            offset: info.index * containerWidth,
            animated: true,
          });
        }}
        contentContainerStyle={styles.listContent}
      />

      {/* Pagination dots pill */}
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
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  listContent: {
    alignItems: "center",
  },
  cardContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.06)",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  paginationOverlay: {
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
  },
  paginationPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
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
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
});
