import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, StyleSheet, View, type ViewStyle } from "react-native";

export function SkeletonPulse({
  children,
  style,
}: {
  children?: React.ReactNode;
  style?: ViewStyle;
}) {
  const animatedOpacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedOpacity, {
          toValue: 0.95,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedOpacity]);

  return (
    <Animated.View style={[{ opacity: animatedOpacity }, style]}>
      {children}
    </Animated.View>
  );
}

export function SkeletonBox({
  width,
  height,
  borderRadius = 6,
  style,
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) {
  return (
    <View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: "#E2E8F0",
        },
        style,
      ]}
    />
  );
}

/**
 * Tailor Card Skeleton (Mirrors MainTailorCard)
 */
export function TailorCardSkeleton() {
  return (
    <View style={tailorStyles.card}>
      <SkeletonPulse>
        {/* Top Row: Avatar + Info */}
        <View style={tailorStyles.topRow}>
          {/* Avatar Skeleton */}
          <SkeletonBox width={74} height={74} borderRadius={16} />

          {/* Info Block */}
          <View style={tailorStyles.infoBlock}>
            {/* Shop Name & Rating Badge */}
            <View style={tailorStyles.nameRatingRow}>
              <SkeletonBox width="52%" height={16} borderRadius={5} />
              <SkeletonBox width={46} height={20} borderRadius={8} />
            </View>

            {/* Location & Distance */}
            <View style={tailorStyles.locationRow}>
              <SkeletonBox width={13} height={13} borderRadius={6.5} />
              <SkeletonBox width="38%" height={12} borderRadius={4} />
              <SkeletonBox width={50} height={16} borderRadius={6} />
            </View>

            {/* Badges Row */}
            <View style={tailorStyles.badgesRow}>
              <SkeletonBox width={64} height={17} borderRadius={6} />
              <SkeletonBox width={72} height={17} borderRadius={6} />
            </View>
          </View>
        </View>

        {/* Specialties Tags */}
        <View style={tailorStyles.specialtiesWrap}>
          <SkeletonBox width={78} height={22} borderRadius={7} />
          <SkeletonBox width={92} height={22} borderRadius={7} />
          <SkeletonBox width={68} height={22} borderRadius={7} />
        </View>

        {/* Footer Row: Price + CTA */}
        <View style={tailorStyles.footerRow}>
          <View>
            <SkeletonBox
              width={55}
              height={9}
              borderRadius={3}
              style={{ marginBottom: 5 }}
            />
            <SkeletonBox width={85} height={17} borderRadius={4} />
          </View>
          <SkeletonBox width={108} height={38} borderRadius={10} />
        </View>
      </SkeletonPulse>
    </View>
  );
}

export function TailorsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={{ width: "100%" }}>
      {Array.from({ length: count }).map((_, i) => (
        <TailorCardSkeleton key={`tailor-skeleton-${i}`} />
      ))}
    </View>
  );
}

/**
 * Order Card Skeleton (Mirrors MainOrderCard & OrderRequestCard)
 */
export function OrderCardSkeleton() {
  return (
    <View style={orderStyles.card}>
      <SkeletonPulse>
        {/* Top Row: Avatar/Image + Order Details */}
        <View style={orderStyles.topRow}>
          {/* Avatar Thumbnail */}
          <SkeletonBox width={72} height={72} borderRadius={15} />

          {/* Info Block */}
          <View style={orderStyles.infoBlock}>
            {/* Header: Item Name + Status Badge */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <SkeletonBox width="52%" height={16} borderRadius={5} />
              <SkeletonBox width={68} height={22} borderRadius={6} />
            </View>

            {/* Tailor Row */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 6 }}>
              <SkeletonBox width={14} height={14} borderRadius={7} />
              <SkeletonBox width={95} height={13} borderRadius={4} />
            </View>

            {/* Customer-First Timeline Banner */}
            <View style={{ marginTop: 8 }}>
              <SkeletonBox width="85%" height={22} borderRadius={7} />
            </View>
          </View>
        </View>

        {/* Footer Row: Price + CTA */}
        <View style={orderStyles.footerRow}>
          <View>
            <SkeletonBox
              width={60}
              height={9}
              borderRadius={3}
              style={{ marginBottom: 4 }}
            />
            <SkeletonBox width={85} height={18} borderRadius={4} />
          </View>
          <SkeletonBox width={105} height={38} borderRadius={10} />
        </View>
      </SkeletonPulse>
    </View>
  );
}

export function OrdersListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={{ width: "100%", marginTop: 4 }}>
      {Array.from({ length: count }).map((_, i) => (
        <OrderCardSkeleton key={`order-skeleton-${i}`} />
      ))}
    </View>
  );
}

/**
 * Person Message Skeleton (Mirrors MessageRow)
 */
export function PersonMessageSkeleton() {
  return (
    <View style={messageStyles.row}>
      <SkeletonPulse
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
        }}
      >
        {/* Person Avatar with status dot placeholder */}
        <View style={messageStyles.avatarWrap}>
          <SkeletonBox width={44} height={44} borderRadius={22} />
        </View>

        {/* Message Info */}
        <View style={messageStyles.infoBlock}>
          <SkeletonBox
            width="42%"
            height={15}
            borderRadius={4}
            style={{ marginBottom: 7 }}
          />
          <SkeletonBox width="80%" height={13} borderRadius={4} />
        </View>

        {/* Time & Unread Badge */}
        <View style={messageStyles.rightBlock}>
          <SkeletonBox
            width={36}
            height={11}
            borderRadius={3}
            style={{ marginBottom: 6 }}
          />
          <SkeletonBox width={16} height={16} borderRadius={8} />
        </View>
      </SkeletonPulse>
    </View>
  );
}

export function PersonMessagesListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <View style={{ width: "100%" }}>
      {Array.from({ length: count }).map((_, i) => (
        <PersonMessageSkeleton key={`message-skeleton-${i}`} />
      ))}
    </View>
  );
}

/**
 * Chat Conversation Skeleton (Mirrors chat thread bubbles in ConversationChatScreen)
 */
export function ChatConversationSkeleton() {
  return (
    <View style={{ paddingVertical: 16, paddingHorizontal: 8 }}>
      <SkeletonPulse style={{ gap: 14 }}>
        {/* Left incoming bubble */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
          <SkeletonBox width={32} height={32} borderRadius={16} />
          <View style={{ gap: 4 }}>
            <SkeletonBox width={190} height={44} borderRadius={16} />
            <SkeletonBox width={45} height={10} borderRadius={3} />
          </View>
        </View>

        {/* Right outgoing bubble */}
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <SkeletonBox width={210} height={52} borderRadius={16} />
          <SkeletonBox width={40} height={10} borderRadius={3} />
        </View>

        {/* Left incoming bubble */}
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8 }}>
          <SkeletonBox width={32} height={32} borderRadius={16} />
          <View style={{ gap: 4 }}>
            <SkeletonBox width={140} height={38} borderRadius={16} />
            <SkeletonBox width={45} height={10} borderRadius={3} />
          </View>
        </View>

        {/* Right outgoing bubble */}
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <SkeletonBox width={170} height={42} borderRadius={16} />
          <SkeletonBox width={40} height={10} borderRadius={3} />
        </View>
      </SkeletonPulse>
    </View>
  );
}

/**
 * Trending Design Card Skeleton (Mirrors community trending card)
 */
export function TrendingDesignCardSkeleton() {
  return (
    <View style={trendingStyles.card}>
      <SkeletonPulse>
        {/* Image Showcase */}
        <View style={trendingStyles.imageWrapper}>
          <SkeletonBox width="100%" height={155} borderRadius={0} />
          {/* Category Pill Tag Overlay */}
          <View style={trendingStyles.categoryBadge}>
            <SkeletonBox width={50} height={14} borderRadius={6} />
          </View>
          {/* Like Button Overlay */}
          <View style={trendingStyles.likeBtn}>
            <SkeletonBox width={36} height={14} borderRadius={8} />
          </View>
        </View>

        {/* Content Details */}
        <View style={trendingStyles.contentContainer}>
          <SkeletonBox
            width="78%"
            height={15}
            borderRadius={4}
            style={{ marginBottom: 8 }}
          />

          {/* Author row */}
          <View style={trendingStyles.authorRow}>
            <SkeletonBox
              width={26}
              height={26}
              borderRadius={13}
              style={{ marginRight: 8 }}
            />
            <SkeletonBox width="52%" height={12} borderRadius={4} />
          </View>

          {/* Footer row */}
          <View style={trendingStyles.footerRow}>
            <SkeletonBox width={35} height={12} borderRadius={4} />
            <SkeletonBox width={72} height={14} borderRadius={4} />
          </View>
        </View>
      </SkeletonPulse>
    </View>
  );
}

export function TrendingDesignsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingRight: 20,
        gap: 12,
        paddingVertical: 8,
      }}
      className="-mx-5 px-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <TrendingDesignCardSkeleton key={`trending-skeleton-${i}`} />
      ))}
    </ScrollView>
  );
}

/**
 * Minimal Order Card Skeleton (Mirrors MinimalOrderCard in HomeScreen)
 */
export function MinimalOrderCardSkeleton() {
  return (
    <View style={minimalCardStyles.card}>
      <SkeletonPulse>
        {/* Top Image Area */}
        <SkeletonBox width="100%" height={96} borderRadius={0} />

        {/* Card Content */}
        <View style={minimalCardStyles.content}>
          <SkeletonBox
            width="70%"
            height={14}
            borderRadius={4}
            style={{ marginBottom: 6 }}
          />
          <SkeletonBox
            width="52%"
            height={12}
            borderRadius={4}
            style={{ marginBottom: 6 }}
          />
          <SkeletonBox
            width="60%"
            height={11}
            borderRadius={4}
            style={{ marginBottom: 8 }}
          />

          {/* Footer */}
          <View style={minimalCardStyles.footerRow}>
            <SkeletonBox width={60} height={14} borderRadius={4} />
            <SkeletonBox width={48} height={20} borderRadius={6} />
          </View>
        </View>
      </SkeletonPulse>
    </View>
  );
}

export function PendingOrdersListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingRight: 20,
        gap: 12,
        paddingVertical: 8,
      }}
      className="-mx-5 px-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <MinimalOrderCardSkeleton key={`pending-order-skeleton-${i}`} />
      ))}
    </ScrollView>
  );
}

/**
 * Minimal Appointment Card Skeleton (Mirrors MinimalAppointmentCard in HomeScreen)
 */
export function MinimalAppointmentCardSkeleton() {
  return (
    <View style={minimalCardStyles.card}>
      <SkeletonPulse>
        {/* Top Banner / Avatar Area */}
        <View style={minimalCardStyles.bannerContainer}>
          <SkeletonBox width={48} height={48} borderRadius={24} />
        </View>

        {/* Card Content */}
        <View style={minimalCardStyles.content}>
          <SkeletonBox
            width="65%"
            height={14}
            borderRadius={4}
            style={{ marginBottom: 6 }}
          />
          <SkeletonBox
            width="50%"
            height={12}
            borderRadius={4}
            style={{ marginBottom: 6 }}
          />
          <SkeletonBox
            width="60%"
            height={11}
            borderRadius={4}
            style={{ marginBottom: 8 }}
          />

          {/* Footer */}
          <View style={minimalCardStyles.footerRow}>
            <SkeletonBox width={65} height={18} borderRadius={5} />
            <SkeletonBox width={50} height={20} borderRadius={6} />
          </View>
        </View>
      </SkeletonPulse>
    </View>
  );
}

export function UpcomingAppointmentsListSkeleton({
  count = 3,
}: {
  count?: number;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingRight: 20,
        gap: 12,
        paddingVertical: 8,
      }}
      className="-mx-5 px-5"
    >
      {Array.from({ length: count }).map((_, i) => (
        <MinimalAppointmentCardSkeleton key={`appointment-skeleton-${i}`} />
      ))}
    </ScrollView>
  );
}

/**
 * Designs Grid Skeleton (Mirrors 2-column grid in Designs modal)
 */
export function DesignsGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        gap: 12,
        paddingVertical: 8,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <View
          key={`design-skeleton-${i}`}
          style={{
            width: "48%",
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#EAEAEA",
            backgroundColor: "#FFFFFF",
            padding: 12,
            alignItems: "center",
          }}
        >
          <SkeletonPulse style={{ width: "100%", alignItems: "center" }}>
            <SkeletonBox width={64} height={64} borderRadius={12} />
            <SkeletonBox
              width="80%"
              height={14}
              borderRadius={4}
              style={{ marginTop: 10 }}
            />
            <SkeletonBox
              width="55%"
              height={11}
              borderRadius={4}
              style={{ marginTop: 4 }}
            />
            <SkeletonBox
              width="100%"
              height={26}
              borderRadius={6}
              style={{ marginTop: 10 }}
            />
          </SkeletonPulse>
        </View>
      ))}
    </View>
  );
}

/**
 * Appointment Card Skeleton (Mirrors AppointmentCard in AppointmentsScreen)
 */
export function AppointmentCardSkeleton() {
  return (
    <View style={appointmentStyles.card}>
      <SkeletonPulse>
        {/* Top Row: Avatar + Info + Status */}
        <View style={appointmentStyles.topRow}>
          {/* Avatar / Icon Container */}
          <SkeletonBox width={52} height={52} borderRadius={13} />

          {/* Info Block */}
          <View style={appointmentStyles.infoBlock}>
            {/* Tailor Name Row */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <SkeletonBox width="58%" height={15} borderRadius={4} />
              <SkeletonBox width={14} height={14} borderRadius={7} />
            </View>

            {/* Service Row */}
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 }}>
              <SkeletonBox width={12} height={12} borderRadius={6} />
              <SkeletonBox width="68%" height={12} borderRadius={4} />
            </View>

            {/* Date & Time Pill */}
            <View style={{ marginTop: 7 }}>
              <SkeletonBox width={135} height={20} borderRadius={6} />
            </View>
          </View>

          {/* Right Status Pill */}
          <SkeletonBox width={72} height={24} borderRadius={8} />
        </View>

        {/* Subtle Divider */}
        <View style={appointmentStyles.divider} />

        {/* Bottom Action Row */}
        <View style={appointmentStyles.bottomRow}>
          {/* Location */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5, flex: 1, marginRight: 8 }}>
            <SkeletonBox width={12} height={12} borderRadius={6} />
            <SkeletonBox width="60%" height={12} borderRadius={4} />
          </View>

          {/* Details Button */}
          <SkeletonBox width={58} height={22} borderRadius={6} />
        </View>
      </SkeletonPulse>
    </View>
  );
}

export function AppointmentsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <View style={{ width: "100%", marginTop: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <AppointmentCardSkeleton key={`appointment-skeleton-${i}`} />
      ))}
    </View>
  );
}

/**
 * Tailor Appointment Request Card Skeleton (Mirrors AppointmentRequestCard in TailorAppointmentsScreen)
 */
export function AppointmentRequestCardSkeleton() {
  return (
    <View style={appointmentRequestStyles.card}>
      <SkeletonPulse>
        <View style={appointmentRequestStyles.contentRow}>
          <SkeletonBox width={48} height={48} borderRadius={12} />
          <View style={appointmentRequestStyles.infoCol}>
            <View style={appointmentRequestStyles.headerRow}>
              <SkeletonBox width="48%" height={16} borderRadius={5} />
              <SkeletonBox width={70} height={22} borderRadius={6} />
            </View>
            <View style={{ marginTop: 6 }}>
              <SkeletonBox width="64%" height={13} borderRadius={4} />
            </View>
            <View style={appointmentRequestStyles.scheduleRow}>
              <SkeletonBox width={85} height={22} borderRadius={6} />
              <SkeletonBox width={72} height={22} borderRadius={6} />
            </View>
          </View>
        </View>
        <View style={appointmentRequestStyles.actionsRow}>
          <SkeletonBox width="48%" height={38} borderRadius={10} />
          <SkeletonBox width="48%" height={38} borderRadius={10} />
        </View>
      </SkeletonPulse>
    </View>
  );
}

export function TailorAppointmentsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View style={{ width: "100%", marginTop: 2 }}>
      {Array.from({ length: count }).map((_, i) => (
        <AppointmentRequestCardSkeleton key={`tailor-appointment-skeleton-${i}`} />
      ))}
    </View>
  );
}


const tailorStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoBlock: {
    flex: 1,
    marginLeft: 13,
    justifyContent: "space-between",
  },
  nameRatingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  specialtiesWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 11,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
});

const orderStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 15,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoBlock: {
    flex: 1,
    marginLeft: 13,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    gap: 4,
  },
  badgesRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 7,
  },
  tagsWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 10,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
});

const messageStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E6E8EC",
    paddingVertical: 14,
    paddingHorizontal: 2,
  },
  avatarWrap: {
    marginRight: 14,
  },
  infoBlock: {
    flex: 1,
    paddingRight: 8,
  },
  rightBlock: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
});

const trendingStyles = StyleSheet.create({
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
    position: "relative",
  },
  categoryBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  likeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  contentContainer: {
    padding: 12,
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
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
});

const minimalCardStyles = StyleSheet.create({
  card: {
    width: 215,
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
  bannerContainer: {
    width: "100%",
    height: 96,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    padding: 11,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
});

const appointmentStyles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoBlock: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginTop: 12,
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

const appointmentRequestStyles = StyleSheet.create({
  card: {
    marginBottom: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    padding: 14,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  contentRow: {
    flexDirection: "row",
  },
  infoCol: {
    marginLeft: 14,
    flex: 1,
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scheduleRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionsRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});

