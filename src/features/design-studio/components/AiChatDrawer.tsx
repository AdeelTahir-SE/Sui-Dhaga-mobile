import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const aiAssistantIcon = require("@/assets/illustrations/customer-tabs/home/ai-assistant-icon.png");
const aiAssistantIcon2 = require("@/assets/illustrations/customer-tabs/home/image-ai-assistant.png");

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  attachedImageUri?: string;
  designCard?: {
    title: string;
    subtitle: string;
    image: any;
    tags: string[];
    priceEstimate?: string;
    itemName: string;
  };
  suggestions?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  mode: "assistant" | "designer";
  createdAt: string;
  lastMessageSnippet: string;
  messages: ChatMessage[];
}

interface AiChatDrawerProps {
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  onNewChat: () => void;
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (session: ChatSession) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAll: () => void;
}

export function AiChatDrawer({
  visible,
  onClose,
  onBack,
  onNewChat,
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onClearAll,
}: AiChatDrawerProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const drawerWidth = Math.min(width * 0.84, 340);

  const [activeFilter, setActiveFilter] = useState<"all" | "assistant" | "designer">("all");
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const filteredSessions = sessions.filter((s) => {
    if (activeFilter === "all") return true;
    return s.mode === activeFilter;
  });

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={handleClose}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        {/* Backdrop overlay */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.backdrop,
            {
              opacity: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.45],
              }),
            },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Slide-out Drawer from Right */}
        <Animated.View
          style={[
            styles.drawerContainer,
            {
              width: drawerWidth,
              paddingTop: Math.max(insets.top, 14),
              paddingBottom: Math.max(insets.bottom, 16),
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [drawerWidth, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Drawer Top Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.brandRow}>
              <View style={styles.brandIconWrapper}>
                <Image
                  source={aiAssistantIcon}
                  style={{ width: 22, height: 22 }}
                  contentFit="contain"
                />
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.brandTitle}>Sui Dhaga AI</Text>
                <Text style={styles.brandSubtitle}>Design Studio & Tailoring</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              activeOpacity={0.7}
              style={styles.closeBtn}
              accessibilityRole="button"
              accessibilityLabel="Close Menu"
            >
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Quick Actions Header: New Chat button */}
          <View style={styles.quickActionsContainer}>
            {/* New Chat Button */}
            <TouchableOpacity
              onPress={() => {
                handleClose();
                onNewChat();
              }}
              activeOpacity={0.85}
              style={styles.newChatBtn}
            >
              <View style={styles.newChatIconCircle}>
                <Ionicons name="add" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.newChatTitle}>New Chat</Text>
                <Text style={styles.newChatSubtitle}>Start a fresh AI session</Text>
              </View>
              <Ionicons name="sparkles" size={16} color="rgba(255, 255, 255, 0.7)" />
            </TouchableOpacity>
          </View>

          {/* Section Divider & Title: Previous Chats */}
          <View style={styles.sectionHeaderRow}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons name="time-outline" size={15} color="#0E7490" style={{ marginRight: 6 }} />
              <Text style={styles.sectionTitle}>PREVIOUS CHATS</Text>
            </View>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{sessions.length}</Text>
            </View>
          </View>

          {/* Filter Pills: All / Designer / Assistant */}
          <View style={styles.filterRow}>
            {(["all", "designer", "assistant"] as const).map((filter) => {
              const isActive = activeFilter === filter;
              const label =
                filter === "all"
                  ? "All"
                  : filter === "designer"
                  ? "Designer"
                  : "Assistant";
              return (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  activeOpacity={0.7}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Previous Chats List */}
          <ScrollView
            style={styles.chatListScroll}
            contentContainerStyle={styles.chatListContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredSessions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Ionicons name="chatbubbles-outline" size={32} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>No chats found</Text>
                <Text style={styles.emptySubtitle}>
                  {activeFilter === "all"
                    ? "Start a new conversation with Sui Dhaga AI to save it here."
                    : `No previous ${activeFilter} conversations.`}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    handleClose();
                    onNewChat();
                  }}
                  activeOpacity={0.8}
                  style={styles.emptyNewChatBtn}
                >
                  <Ionicons name="add" size={16} color="#14919B" />
                  <Text style={styles.emptyNewChatText}>Start New Chat</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = session.id === currentSessionId;
                const isDesigner = session.mode === "designer";
                return (
                  <TouchableOpacity
                    key={session.id}
                    onPress={() => {
                      handleClose();
                      onSelectSession(session);
                    }}
                    activeOpacity={0.75}
                    style={[
                      styles.sessionCard,
                      isSelected && styles.sessionCardSelected,
                    ]}
                  >
                    {/* Left Icon */}
                    <View
                      style={[
                        styles.sessionIconCircle,
                        isDesigner
                          ? styles.designerIconCircle
                          : styles.assistantIconCircle,
                      ]}
                    >
                      <Ionicons
                        name={isDesigner ? "sparkles" : "chatbubble-ellipses-outline"}
                        size={16}
                        color={isDesigner ? "#D97706" : "#0E7490"}
                      />
                    </View>

                    {/* Middle Info */}
                    <View style={styles.sessionMiddle}>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.sessionTitle,
                            isSelected && styles.sessionTitleSelected,
                          ]}
                        >
                          {session.title}
                        </Text>
                      </View>

                      <View style={styles.sessionMetaRow}>
                        <View
                          style={[
                            styles.modeBadge,
                            isDesigner
                              ? styles.designerBadge
                              : styles.assistantBadge,
                          ]}
                        >
                          <Text
                            style={[
                              styles.modeBadgeText,
                              isDesigner
                                ? styles.designerBadgeText
                                : styles.assistantBadgeText,
                            ]}
                          >
                            {isDesigner ? "Designer" : "Assistant"}
                          </Text>
                        </View>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.sessionTime}>{session.createdAt}</Text>
                      </View>

                      <Text numberOfLines={1} style={styles.sessionSnippet}>
                        {session.lastMessageSnippet}
                      </Text>
                    </View>

                    {/* Right Delete Button */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        onDeleteSession(session.id);
                      }}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      activeOpacity={0.6}
                      style={styles.deleteBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Delete chat"
                    >
                      <Ionicons name="trash-outline" size={16} color="#94A3B8" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>

          {/* Drawer Footer Actions */}
          <View style={styles.drawerFooter}>
            {sessions.length > 0 && (
              <TouchableOpacity
                onPress={onClearAll}
                activeOpacity={0.7}
                style={styles.clearAllBtn}
              >
                <Ionicons name="trash-outline" size={15} color="#EF4444" style={{ marginRight: 6 }} />
                <Text style={styles.clearAllText}>Clear All History</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.footerVersionText}>Sui Dhaga AI Studio • v1.2</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  backdrop: {
    backgroundColor: "#0F172A",
  },
  drawerContainer: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  brandIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#E6F7F7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#B2EBF2",
  },
  brandTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: -0.2,
  },
  brandSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  quickActionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  newChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#14919B",
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 12,
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  newChatIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  newChatTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  newChatSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.85)",
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  backIconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#EDF2F7",
    alignItems: "center",
    justifyContent: "center",
  },
  backTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  backSubtitle: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748B",
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0E7490",
    letterSpacing: 0.6,
  },
  countBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: "#E0F2FE",
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0369A1",
  },
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 6,
  },
  filterChip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "transparent",
  },
  filterChipActive: {
    backgroundColor: "#E6F7F7",
    borderColor: "#B2EBF2",
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  filterChipTextActive: {
    color: "#0E7490",
    fontWeight: "800",
  },
  chatListScroll: {
    flex: 1,
  },
  chatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  sessionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    borderRadius: 13,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sessionCardSelected: {
    backgroundColor: "#F0FDFA",
    borderColor: "#14919B",
    shadowColor: "#14919B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  sessionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  designerIconCircle: {
    backgroundColor: "#FEF3C7",
  },
  assistantIconCircle: {
    backgroundColor: "#E0F2FE",
  },
  sessionMiddle: {
    flex: 1,
    marginRight: 6,
  },
  sessionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  sessionTitleSelected: {
    color: "#0F766E",
    fontWeight: "800",
  },
  sessionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginBottom: 2,
  },
  modeBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  designerBadge: {
    backgroundColor: "#FEF3C7",
  },
  assistantBadge: {
    backgroundColor: "#E0F2FE",
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  designerBadgeText: {
    color: "#B45309",
  },
  assistantBadgeText: {
    color: "#0369A1",
  },
  metaDot: {
    marginHorizontal: 5,
    color: "#94A3B8",
    fontSize: 10,
  },
  sessionTime: {
    fontSize: 10,
    color: "#94A3B8",
    fontWeight: "500",
  },
  sessionSnippet: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
  },
  deleteBtn: {
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 16,
  },
  emptyNewChatBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16,
    backgroundColor: "#E6F7F7",
    borderWidth: 1,
    borderColor: "#B2EBF2",
    gap: 4,
  },
  emptyNewChatText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0E7490",
  },
  drawerFooter: {
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "center",
  },
  clearAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  clearAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#EF4444",
  },
  footerVersionText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#94A3B8",
  },
});
