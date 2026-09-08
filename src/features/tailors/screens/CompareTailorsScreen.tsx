import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { CompareCell } from "../components/CompareCell";
import { TailorBottomTabs } from "../components/TailorBottomTabs";
import { TailorHeader } from "../components/TailorHeader";
import { TailorPlaceholder } from "../components/TailorPlaceholder";
import { TailorScreenShell } from "../components/TailorScreenShell";
import { useTailors } from "../hooks/useTailors";

const tones: ("coral" | "blue" | "gold" | "teal")[] = ["coral", "blue", "gold", "teal"];

function FeatureRow({
  feature,
  values,
  checks,
  count = 3,
}: {
  feature: string;
  values?: string[];
  checks?: boolean[];
  count?: number;
}) {
  const indices = Array.from({ length: count }, (_, i) => i);
  return (
    <View className="flex-row border-t border-brand-border">
      <View className="min-h-[46px] w-[84px] justify-center px-2">
        <Text className="text-[11px] font-medium text-brand-dark">
          {feature}
        </Text>
      </View>
      {indices.map((index) => (
        <CompareCell key={index} check={checks?.[index]}>
          {values?.[index] ?? "-"}
        </CompareCell>
      ))}
    </View>
  );
}

export default function CompareTailorsScreen() {
  const { tailors, isLoading } = useTailors();
  const comparedTailors = tailors.slice(0, 3);
  const count = Math.max(comparedTailors.length, 1);

  return (
    <TailorScreenShell bottomTabs={<TailorBottomTabs />}>
      <TailorHeader
        title="Compare Tailors"
        subtitle="Compare and choose the best for you"
        showBack
        rightIcon="settings-outline"
      />
      <View className="px-5 pb-6">
        {isLoading ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="small" color="#14919B" />
          </View>
        ) : comparedTailors.length === 0 ? (
          <View className="py-12 items-center justify-center">
            <Text className="text-[14px] text-brand-gray">
              No tailors available to compare
            </Text>
          </View>
        ) : (
          <>
            <View className="mb-5 flex-row items-start justify-between">
              {comparedTailors.map((tailor, index) => {
                const name =
                  tailor.shopName ||
                  tailor.businessName ||
                  tailor.name ||
                  "Tailor Studio";
                const tone = tones[index % tones.length];
                const image = tailor.imageUrl || tailor.image || tailor.avatar;

                return (
                  <View key={tailor.id || index} className="items-center flex-1 max-w-[80px]">
                    <View className="relative">
                      <TailorPlaceholder image={image} size="sm" tone={tone} />
                      <View className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm">
                        <Ionicons name="close" size={12} color="#1A1D1F" />
                      </View>
                    </View>
                    <Text
                      className="mt-2 text-center text-[10px] font-medium text-brand-dark"
                      numberOfLines={2}
                    >
                      {name}
                    </Text>
                  </View>
                );
              })}
              {comparedTailors.length < 3 && (
                <View className="items-center flex-1 max-w-[80px]">
                  <TouchableOpacity
                    onPress={() => router.push("/tailors" as never)}
                    className="h-16 w-16 items-center justify-center rounded-md border border-dashed border-primary"
                  >
                    <Ionicons name="add" size={22} color="#14919B" />
                  </TouchableOpacity>
                  <Text className="mt-2 text-center text-[10px] font-medium text-brand-dark">
                    Add Tailor
                  </Text>
                </View>
              )}
            </View>

            <View className="overflow-hidden rounded-md border border-brand-border">
              <View className="flex-row bg-brand-surface">
                <View className="h-[56px] w-[84px] justify-center px-2">
                  <Text className="text-[12px] font-bold text-brand-dark">
                    Feature
                  </Text>
                </View>
                {comparedTailors.map((tailor, index) => {
                  const tone = tones[index % tones.length];
                  const image = tailor.imageUrl || tailor.image || tailor.avatar;
                  return (
                    <View
                      key={tailor.id || index}
                      className="flex-1 items-center justify-center border-l border-brand-border"
                    >
                      <TailorPlaceholder image={image} size="xs" tone={tone} />
                    </View>
                  );
                })}
              </View>

              <FeatureRow
                feature="Rating"
                count={count}
                values={comparedTailors.map((t) =>
                  t.rating
                    ? `${Number(t.rating).toFixed(1)} ★\n(${t.reviewsCount ?? t.reviews ?? 0})`
                    : "New"
                )}
              />
              <FeatureRow
                feature="Experience"
                count={count}
                values={comparedTailors.map((t) =>
                  t.experienceYears
                    ? `${t.experienceYears}+ Years`
                    : "5+ Years"
                )}
              />
              <FeatureRow
                feature="Specialties"
                count={count}
                values={comparedTailors.map((t) =>
                  Array.isArray(t.specialties) && t.specialties.length > 0
                    ? t.specialties.slice(0, 2).join(",\n")
                    : (t.specialty || "-")
                )}
              />
              <FeatureRow
                feature="Starting Price"
                count={count}
                values={comparedTailors.map((t) =>
                  t.startingPrice ? `₹${t.startingPrice}` : (t.hourlyRate ? `₹${t.hourlyRate}/hr` : "-")
                )}
              />
              <FeatureRow
                feature="Location"
                count={count}
                values={comparedTailors.map(
                  (t) =>
                    t.city ||
                    (typeof t.location === "object" ? t.location?.city : null) ||
                    t.address ||
                    "Nearby"
                )}
              />
              <FeatureRow
                feature="Verified"
                count={count}
                checks={comparedTailors.map(
                  (t) => Boolean(t.isVerified || (t.verified ?? true))
                )}
              />
              <FeatureRow
                feature="Top Rated"
                count={count}
                checks={comparedTailors.map(
                  (t) =>
                    Boolean(
                      t.topRated ||
                        t.isTopRated ||
                        (t.rating && Number(t.rating) >= 4.5)
                    )
                )}
              />

              <View className="flex-row border-t border-brand-border">
                <View className="h-[58px] w-[84px]" />
                {comparedTailors.map((tailor, index) => (
                  <View
                    key={tailor.id || index}
                    className="flex-1 items-center justify-center border-l border-brand-border px-2"
                  >
                    <TouchableOpacity
                      onPress={() =>
                        router.push(
                          (tailor.id
                            ? `/tailors/${tailor.id}`
                            : "/tailors") as never
                        )
                      }
                      className="w-full rounded-md bg-primary py-2"
                    >
                      <Text className="text-center text-[11px] font-semibold text-white">
                        Book
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </View>
    </TailorScreenShell>
  );
}
