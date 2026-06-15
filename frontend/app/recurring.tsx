// Recurring expenses screen — lists templates and shows how many auto-instances
// have been created. Implements custom feature #1.

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { useToast } from "@/src/components/Toast";
import { listRecurringTemplates } from "@/src/db/queries";
import { materializeRecurring } from "@/src/recurring/materialize";
import { palette, radii, spacing, typography } from "@/src/theme";
import { formatZAR } from "@/src/utils/currency";

export default function RecurringScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    setItems(await listRecurringTemplates(session.userId));
  }, [session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const runNow = async () => {
    if (!session || busy) return;
    setBusy(true);
    try {
      const created = await materializeRecurring(session.userId);
      toast({
        kind: created > 0 ? "success" : "info",
        title: created > 0 ? `Created ${created} recurring expense${created === 1 ? "" : "s"}` : "Nothing new to materialise",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="recurring-back">
          <Ionicons name="chevron-back" size={22} color={palette.text} />
        </Pressable>
        <Text style={styles.title}>Recurring expenses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.infoCard}>
          <Ionicons name="repeat" size={22} color={palette.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Auto-create monthly bills</Text>
            <Text style={styles.muted}>
              When you tick &ldquo;Recurring monthly&rdquo; on an expense, we&apos;ll copy it forward each
              month so you don&apos;t have to log it again.
            </Text>
          </View>
        </View>

        <Pressable style={styles.actionRow} onPress={runNow} testID="recurring-run">
          <Ionicons name="play" size={18} color={palette.primary} />
          <Text style={styles.actionText}>{busy ? "Running…" : "Materialise now"}</Text>
        </Pressable>

        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="repeat-outline" size={28} color={palette.textMuted} />
            <Text style={styles.emptyTitle}>No recurring expenses yet</Text>
            <Text style={styles.muted}>Tick &ldquo;Recurring monthly&rdquo; the next time you log a regular bill.</Text>
          </View>
        ) : (
          items.map((t) => (
            <View key={t.id} style={styles.row} testID={`recurring-row-${t.id}`}>
              <View style={[styles.dot, { backgroundColor: t.categoryColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{t.description}</Text>
                <Text style={styles.muted}>{t.categoryName} • Day {t.recurringDay ?? new Date(t.dateEpochMillis).getDate()}</Text>
              </View>
              <Text style={styles.amount}>{formatZAR(t.amount)}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.md, gap: spacing.sm },
  title: { ...typography.h2, color: palette.text, flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: radii.md, alignItems: "center", justifyContent: "center", backgroundColor: palette.secondary },
  scroll: { padding: spacing.md, paddingTop: 0, gap: spacing.md },
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: spacing.md,
    backgroundColor: palette.secondary,
    borderRadius: radii.lg,
    gap: spacing.sm,
  },
  cardTitle: { ...typography.body, fontWeight: "700", color: palette.text },
  muted: { ...typography.small, color: palette.textMuted, marginTop: 2 },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
  },
  actionText: { ...typography.body, fontWeight: "600", color: palette.primary },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
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
  emptyTitle: { ...typography.h3, color: palette.text },
});
