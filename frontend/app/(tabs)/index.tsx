// Dashboard / Home — greeting + monthly progress gauge + recent expenses
// + recent badges.

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter, type Href } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { MonthlyProgressGauge } from "@/src/components/MonthlyProgressGauge";
import { useToast } from "@/src/components/Toast";
import { getGoal, grandTotal, listCategories, listEarnedBadges, listExpenses, listRecurringTemplates } from "@/src/db/queries";
import { BADGES, evaluateBadges } from "@/src/gamification/badges";
import { palette, radii, spacing, typography } from "@/src/theme";
import { formatZAR } from "@/src/utils/currency";
import { endOfToday, firstOfThisMonth, formatDate } from "@/src/utils/date";

export default function DashboardScreen() {
  const { session } = useAuth();
  const toast = useToast();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [spent, setSpent] = useState(0);
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(0);
  const [recent, setRecent] = useState<any[]>([]);
  const [earnedKeys, setEarnedKeys] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    if (!session) return;
    const from = firstOfThisMonth();
    const to = endOfToday();
    const [t, g, exp, categories, recurring, badges] = await Promise.all([
      grandTotal(session.userId, from, to),
      getGoal(session.userId),
      listExpenses(session.userId, from, to),
      listCategories(session.userId),
      listRecurringTemplates(session.userId),
      listEarnedBadges(session.userId),
    ]);
    setSpent(t);
    setMin(g?.minAmount ?? 0);
    setMax(g?.maxAmount ?? 0);
    setRecent(exp.slice(0, 5));

    // Evaluate badges (idempotent) and toast newly earned ones.
    const newly = await evaluateBadges(session.userId, {
      categoryCount: categories.length,
      recurringCount: recurring.length,
    });
    const all = await listEarnedBadges(session.userId);
    setEarnedKeys(new Set(all.map((b) => b.badgeKey)));
    for (const b of newly) {
      toast({ kind: "reward", title: `Badge unlocked: ${b.label}`, subtitle: b.description });
    }
  }, [session, toast]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const earnedBadges = BADGES.filter((b) => earnedKeys.has(b.key));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        testID="dashboard-scroll"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>Hi, {session?.username}</Text>
            <Text style={styles.subtle}>Let&apos;s see where your money went.</Text>
          </View>
          <Pressable
            onPress={() => router.push("/rewards" as Href)}
            style={styles.headerBtn}
            testID="dashboard-rewards-btn"
          >
            <Ionicons name="trophy-outline" size={22} color={palette.primary} />
          </Pressable>
        </View>

        {/* Monthly progress gauge */}
        <MonthlyProgressGauge
          spent={spent}
          min={min}
          max={max}
          testID="dashboard-monthly-gauge"
        />

        {/* Quick links */}
        <View style={styles.quickRow}>
          <QuickLink
            icon="pricetags"
            label="Categories"
            onPress={() => router.push("/categories" as Href)}
            testID="quick-categories"
          />
          <QuickLink
            icon="flag"
            label="Goals"
            onPress={() => router.push("/goals" as Href)}
            testID="quick-goals"
          />
          <QuickLink
            icon="repeat"
            label="Recurring"
            onPress={() => router.push("/recurring" as Href)}
            testID="quick-recurring"
          />
        </View>

        {/* Earned badges strip */}
        {earnedBadges.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent badges</Text>
              <Pressable
                onPress={() => router.push("/rewards" as Href)}
                testID="dashboard-see-badges"
              >
                <Text style={styles.sectionLink}>See all</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
              {earnedBadges.map((b) => (
                <View key={b.key} style={[styles.badgeChip, { backgroundColor: b.tint + "22" }]}>
                  <View style={[styles.badgeDot, { backgroundColor: b.tint }]}>
                    <Ionicons name={b.icon as any} size={16} color="#fff" />
                  </View>
                  <Text style={styles.badgeLabel}>{b.label}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : null}

        {/* Recent expenses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent expenses</Text>
            <Pressable onPress={() => router.push("/(tabs)/expenses" as Href)} testID="dashboard-see-expenses">
              <Text style={styles.sectionLink}>See all</Text>
            </Pressable>
          </View>
          {loading ? (
            <Text style={styles.muted}>Loading…</Text>
          ) : recent.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="receipt-outline" size={28} color={palette.textMuted} />
              <Text style={styles.emptyTitle}>No expenses yet</Text>
              <Text style={styles.muted}>Tap the + button to log your first expense.</Text>
            </View>
          ) : (
            <View>
              {recent.map((e) => (
                <Pressable
                  key={e.id}
                  onPress={() => router.push({ pathname: "/expense/[id]", params: { id: String(e.id) } })}
                  style={styles.row}
                  testID={`recent-expense-${e.id}`}
                >
                  <View style={[styles.rowDot, { backgroundColor: e.categoryColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{e.description}</Text>
                    <Text style={styles.muted}>{e.categoryName} • {formatDate(e.dateEpochMillis)}</Text>
                  </View>
                  <Text style={styles.amount}>{formatZAR(e.amount)}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickLink({
  icon,
  label,
  onPress,
  testID,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  return (
    <Pressable style={styles.quickCard} onPress={onPress} testID={testID}>
      <Ionicons name={icon} size={22} color={palette.primary} />
      <Text style={styles.quickLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  header: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  greeting: { ...typography.h2, color: palette.text },
  subtle: { ...typography.small, color: palette.textMuted, marginTop: 2 },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    backgroundColor: palette.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  quickCard: {
    flex: 1,
    backgroundColor: palette.card,
    paddingVertical: spacing.md,
    borderRadius: radii.md,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: palette.border,
  },
  quickLabel: { ...typography.small, color: palette.text, fontWeight: "600" },

  section: { marginTop: spacing.md },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  sectionTitle: { ...typography.h3, color: palette.text },
  sectionLink: { ...typography.small, color: palette.primary, fontWeight: "700" },

  badgeChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 6, borderRadius: radii.pill, gap: 8 },
  badgeDot: { width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  badgeLabel: { ...typography.small, fontWeight: "600", color: palette.text },

  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  rowDot: { width: 10, height: 10, borderRadius: 5 },
  rowTitle: { ...typography.body, color: palette.text, fontWeight: "600" },
  muted: { ...typography.small, color: palette.textMuted },
  amount: { ...typography.body, color: palette.text, fontWeight: "700" },

  emptyCard: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: palette.border,
  },
  emptyTitle: { ...typography.h3, color: palette.text },
});
