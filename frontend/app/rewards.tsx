// Rewards / Achievements — grid of badges showing earned vs locked.
// Implements the Part 3 "gamification" requirement.

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { listEarnedBadges, type BadgeRow } from "@/src/db/queries";
import { BADGES } from "@/src/gamification/badges";
import { palette, radii, spacing, typography } from "@/src/theme";
import { formatDate } from "@/src/utils/date";

export default function RewardsScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [earned, setEarned] = useState<BadgeRow[]>([]);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      (async () => {
        setEarned(await listEarnedBadges(session.userId));
      })();
    }, [session]),
  );

  const earnedMap = new Map(earned.map((b) => [b.badgeKey, b]));
  const unlockedCount = earnedMap.size;
  const totalCount = BADGES.length;
  const progressPct = totalCount === 0 ? 0 : (unlockedCount / totalCount) * 100;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="rewards-back">
          <Ionicons name="chevron-back" size={22} color={palette.text} />
        </Pressable>
        <Text style={styles.title}>Achievements</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.summaryCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryLabel}>You&apos;ve unlocked</Text>
            <Text style={styles.summaryAmount}>
              {unlockedCount} / {totalCount}
            </Text>
            <Text style={styles.muted}>Keep logging to collect them all.</Text>
          </View>
          <View style={styles.gauge}>
            <View
              style={[
                styles.gaugeFill,
                { width: `${progressPct}%`, backgroundColor: palette.accent },
              ]}
            />
          </View>
        </View>

        <View style={styles.grid}>
          {BADGES.map((b) => {
            const earnedAt = earnedMap.get(b.key)?.earnedAt;
            const unlocked = earnedAt != null;
            return (
              <View
                key={b.key}
                style={[
                  styles.card,
                  unlocked
                    ? { borderColor: b.tint, backgroundColor: b.tint + "10" }
                    : { borderColor: palette.border, backgroundColor: palette.card },
                ]}
                testID={`badge-${b.key}-${unlocked ? "earned" : "locked"}`}
              >
                <View
                  style={[
                    styles.badgeIcon,
                    { backgroundColor: unlocked ? b.tint : palette.muted },
                  ]}
                >
                  <Ionicons
                    name={unlocked ? (b.icon as any) : "lock-closed"}
                    size={22}
                    color={unlocked ? "#fff" : palette.textMuted}
                  />
                </View>
                <Text style={[styles.badgeLabel, !unlocked && { color: palette.textMuted }]}>
                  {b.label}
                </Text>
                <Text style={styles.muted}>{b.description}</Text>
                {unlocked ? (
                  <Text style={styles.earnedAt}>Earned {formatDate(earnedAt!)}</Text>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.md, gap: spacing.sm },
  title: { ...typography.h2, color: palette.text, flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: radii.md, alignItems: "center", justifyContent: "center", backgroundColor: palette.secondary },
  scroll: { padding: spacing.md, paddingTop: 0, paddingBottom: spacing.xxl },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: palette.card,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryLabel: { ...typography.small, color: palette.textMuted },
  summaryAmount: { ...typography.h1, color: palette.text },
  muted: { ...typography.small, color: palette.textMuted },
  gauge: { width: 80, height: 8, borderRadius: 4, backgroundColor: palette.muted, overflow: "hidden" },
  gaugeFill: { height: "100%", borderRadius: 4 },

  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  card: {
    width: "48%",
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    gap: 4,
  },
  badgeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: spacing.xs },
  badgeLabel: { ...typography.body, fontWeight: "700", color: palette.text },
  earnedAt: { ...typography.small, color: palette.primary, fontWeight: "600", marginTop: 4 },
});
