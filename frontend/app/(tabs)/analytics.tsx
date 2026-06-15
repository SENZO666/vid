// Analytics — the graph the Part 3 brief requires:
//   "The user must be able to view a graph showing the amount spent per
//   category over a user-selectable period. The graph must also display the
//   minimum and maximum goals."
//
// Plus the visual "how am I doing this month vs my goals" gauge from
// MonthlyProgressGauge.

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { CategoryBarChart } from "@/src/components/CategoryBarChart";
import { MonthlyProgressGauge } from "@/src/components/MonthlyProgressGauge";
import { Segmented } from "@/src/components/Segmented";
import { getGoal, grandTotal, totalsByCategory, type CategoryTotal } from "@/src/db/queries";
import { palette, radii, spacing, typography } from "@/src/theme";
import { formatZAR } from "@/src/utils/currency";
import { daysAgo, endOfToday, firstOfThisMonth, formatDate } from "@/src/utils/date";

type Period = "week" | "month" | "ytd" | "all";

export default function AnalyticsScreen() {
  const { session } = useAuth();
  const [period, setPeriod] = useState<Period>("month");
  const [totals, setTotals] = useState<CategoryTotal[]>([]);
  const [min, setMin] = useState<number | null>(null);
  const [max, setMax] = useState<number | null>(null);
  const [spentThisMonth, setSpentThisMonth] = useState(0);
  const [periodTotal, setPeriodTotal] = useState(0);

  const { from, to, label } = useMemo(() => {
    if (period === "week") return { from: daysAgo(6), to: endOfToday(), label: "Last 7 days" };
    if (period === "month") return { from: firstOfThisMonth(), to: endOfToday(), label: "This month" };
    if (period === "ytd") {
      const d = new Date();
      return { from: new Date(d.getFullYear(), 0, 1).getTime(), to: endOfToday(), label: "Year to date" };
    }
    return { from: 0, to: endOfToday(), label: "All time" };
  }, [period]);

  const load = useCallback(async () => {
    if (!session) return;
    const [cats, goal, monthSpent, pTotal] = await Promise.all([
      totalsByCategory(session.userId, from, to),
      getGoal(session.userId),
      grandTotal(session.userId, firstOfThisMonth(), endOfToday()),
      grandTotal(session.userId, from, to),
    ]);
    setTotals(cats);
    setMin(goal?.minAmount ?? null);
    setMax(goal?.maxAmount ?? null);
    setSpentThisMonth(monthSpent);
    setPeriodTotal(pTotal);
  }, [session, from, to]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Map to chart data. Use the category's color from the DB.
  const chartData = totals.map((t) => ({
    label: t.name,
    value: t.total,
    color: t.colorHex,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Analytics</Text>
          <Text style={styles.subtle}>See where the money goes.</Text>
        </View>

        <MonthlyProgressGauge
          spent={spentThisMonth}
          min={min ?? 0}
          max={max ?? 1}
          testID="analytics-monthly-gauge"
        />

        <View style={styles.periodCard}>
          <Text style={styles.periodLabel}>Period</Text>
          <Segmented
            options={[
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
              { value: "ytd", label: "YTD" },
              { value: "all", label: "All" },
            ]}
            value={period}
            onChange={setPeriod}
            testID="analytics-period"
          />
          <View style={styles.periodSummary}>
            <View>
              <Text style={styles.muted}>{label}</Text>
              <Text style={styles.periodSummaryAmount}>{formatZAR(periodTotal)}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.muted}>{formatDate(from)}</Text>
              <Text style={styles.muted}>→ {formatDate(to)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Spend per category</Text>
        <Text style={styles.muted}>Dashed lines show your monthly minimum and maximum goals.</Text>

        <CategoryBarChart
          data={chartData}
          minGoal={min}
          maxGoal={max}
          testID="analytics-bar-chart"
        />

        <Text style={styles.sectionTitle}>Category totals</Text>
        {totals.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="bar-chart-outline" size={28} color={palette.textMuted} />
            <Text style={styles.muted}>No categories yet. Add a few from the Categories screen.</Text>
          </View>
        ) : (
          totals.map((t) => (
            <View key={t.categoryId} style={styles.totalRow} testID={`category-total-${t.categoryId}`}>
              <View style={[styles.dot, { backgroundColor: t.colorHex }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{t.name}</Text>
                <Text style={styles.muted}>{t.count} expense{t.count === 1 ? "" : "s"}</Text>
              </View>
              <Text style={styles.amount}>{formatZAR(t.total)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  header: { marginBottom: spacing.xs },
  title: { ...typography.h1, color: palette.text },
  subtle: { ...typography.small, color: palette.textMuted, marginTop: 2 },

  periodCard: {
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  periodLabel: { ...typography.small, fontWeight: "600", color: palette.textMuted },
  periodSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginTop: spacing.sm },
  periodSummaryAmount: { ...typography.h2, color: palette.text, marginTop: 2 },

  sectionTitle: { ...typography.h3, color: palette.text, marginTop: spacing.md },
  muted: { ...typography.small, color: palette.textMuted },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowTitle: { ...typography.body, color: palette.text, fontWeight: "600" },
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
});
