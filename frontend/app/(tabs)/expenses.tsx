// Expenses list — filtered by a From / To date range, mirrors
// ExpenseListActivity.kt with a date picker tied to two inputs.

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { Segmented } from "@/src/components/Segmented";
import { listExpenses } from "@/src/db/queries";
import { palette, radii, spacing, typography } from "@/src/theme";
import { formatZAR } from "@/src/utils/currency";
import { endOfDay, endOfToday, firstOfThisMonth, formatDate, startOfDay, daysAgo } from "@/src/utils/date";

type Period = "week" | "month" | "all";

export default function ExpensesScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("month");
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { from, to } = useMemo(() => {
    if (period === "week") return { from: daysAgo(6), to: endOfToday() };
    if (period === "month") return { from: firstOfThisMonth(), to: endOfToday() };
    return { from: 0, to: endOfToday() };
  }, [period]);

  const load = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    const data = await listExpenses(session.userId, from, to);
    setRows(data);
    setLoading(false);
  }, [session, from, to]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const total = rows.reduce((acc, r) => acc + r.amount, 0);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Pressable
          style={styles.headerBtn}
          onPress={() => router.push("/categories" as any)}
          testID="expenses-go-categories"
        >
          <Ionicons name="pricetags-outline" size={20} color={palette.primary} />
        </Pressable>
      </View>

      <View style={styles.headerFilter}>
        <Segmented
          options={[
            { value: "week", label: "This week" },
            { value: "month", label: "This month" },
            { value: "all", label: "All time" },
          ]}
          value={period}
          onChange={setPeriod}
          testID="expenses-period"
        />
      </View>

      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>{rows.length} expense{rows.length === 1 ? "" : "s"} • {formatDate(from)} → {formatDate(to)}</Text>
        <Text style={styles.summaryAmount}>{formatZAR(total)}</Text>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingBottom: spacing.xxl }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="receipt-outline" size={32} color={palette.textMuted} />
            <Text style={styles.emptyTitle}>{loading ? "Loading…" : "Nothing logged in this period"}</Text>
            <Text style={styles.muted}>Try a wider date range, or tap + to add an expense.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: "/expense/[id]", params: { id: String(item.id) } })}
            style={styles.row}
            testID={`expense-row-${item.id}`}
          >
            <View style={[styles.dot, { backgroundColor: item.categoryColor }]} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>
                {item.description}{" "}
                {item.photoUri ? <Ionicons name="image-outline" size={13} color={palette.textMuted} /> : null}
                {item.isRecurring ? <Ionicons name="repeat" size={13} color={palette.textMuted} /> : null}
              </Text>
              <Text style={styles.muted}>{item.categoryName} • {formatDate(item.dateEpochMillis)}</Text>
            </View>
            <Text style={styles.amount}>{formatZAR(item.amount)}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.md, paddingBottom: 0 },
  title: { ...typography.h1, color: palette.text, flex: 1 },
  headerBtn: { width: 40, height: 40, borderRadius: radii.md, backgroundColor: palette.secondary, alignItems: "center", justifyContent: "center" },
  headerFilter: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  summary: { paddingHorizontal: spacing.md, paddingVertical: spacing.md },
  summaryLabel: { ...typography.small, color: palette.textMuted },
  summaryAmount: { ...typography.h2, color: palette.text, marginTop: 4 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12, gap: spacing.sm, borderBottomWidth: 1, borderBottomColor: palette.border },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowTitle: { ...typography.body, color: palette.text, fontWeight: "600" },
  muted: { ...typography.small, color: palette.textMuted },
  amount: { ...typography.body, color: palette.text, fontWeight: "700" },
  emptyCard: {
    marginTop: spacing.xxl,
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
