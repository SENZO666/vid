// Expense detail — full info + photo preview. Mirrors ExpenseDetailActivity.

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { useToast } from "@/src/components/Toast";
import { deleteExpense, getExpense, listCategories, type Expense, type Category } from "@/src/db/queries";
import { palette, radii, spacing, typography } from "@/src/theme";
import { formatZAR } from "@/src/utils/currency";
import { formatDate, minutesToHHmm } from "@/src/utils/date";

export default function ExpenseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [category, setCategory] = useState<Category | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (!session || !id) return;
      (async () => {
        const e = await getExpense(session.userId, Number(id));
        setExpense(e);
        if (e) {
          const cats = await listCategories(session.userId);
          setCategory(cats.find((c) => c.id === e.categoryId) ?? null);
        }
      })();
    }, [session, id]),
  );

  const onDelete = async () => {
    if (!session || !expense) return;
    await deleteExpense(session.userId, expense.id);
    toast({ kind: "info", title: "Expense deleted" });
    router.back();
  };

  if (!expense) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} testID="detail-back">
            <Ionicons name="chevron-back" size={22} color={palette.text} />
          </Pressable>
          <Text style={styles.title}>Expense</Text>
        </View>
        <Text style={[styles.muted, { padding: spacing.lg }]}>Not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="detail-back">
          <Ionicons name="chevron-back" size={22} color={palette.text} />
        </Pressable>
        <Text style={styles.title}>Expense</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.amount}>{formatZAR(expense.amount)}</Text>
        <View style={styles.row}>
          {category ? <View style={[styles.dot, { backgroundColor: category.colorHex }]} /> : null}
          <Text style={styles.muted}>{category?.name ?? "Uncategorised"}</Text>
        </View>
        <Text style={styles.desc} testID="detail-description">{expense.description}</Text>

        <View style={styles.detailBlock}>
          <DetailRow label="Date" value={formatDate(expense.dateEpochMillis)} />
          <DetailRow label="Time" value={`${minutesToHHmm(expense.startTimeMinutes)} – ${minutesToHHmm(expense.endTimeMinutes)}`} />
          <DetailRow label="Recurring" value={expense.isRecurring ? "Yes — auto-creates monthly" : "No"} />
        </View>

        {expense.photoUri ? (
          <View style={{ marginTop: spacing.md }}>
            <Text style={styles.sectionTitle}>Receipt</Text>
            <Image
              source={{ uri: expense.photoUri }}
              style={{ width: "100%", height: 320, borderRadius: radii.lg, marginTop: spacing.sm }}
              resizeMode="contain"
              testID="detail-photo"
            />
          </View>
        ) : null}

        <View style={{ height: spacing.lg }} />
        <PrimaryButton
          variant="danger"
          label="Delete expense"
          onPress={onDelete}
          icon={<Ionicons name="trash-outline" size={16} color="#fff" />}
          testID="detail-delete-btn"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.md, gap: spacing.sm },
  title: { ...typography.h2, color: palette.text, flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: radii.md, alignItems: "center", justifyContent: "center", backgroundColor: palette.secondary },
  scroll: { padding: spacing.md, paddingTop: 0 },
  amount: { ...typography.h1, color: palette.text, fontSize: 36, marginBottom: spacing.xs },
  row: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  muted: { ...typography.small, color: palette.textMuted },
  desc: { ...typography.h3, color: palette.text, marginBottom: spacing.md },
  detailBlock: { backgroundColor: palette.card, borderRadius: radii.lg, borderWidth: 1, borderColor: palette.border, paddingHorizontal: spacing.md },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: palette.border },
  detailLabel: { ...typography.small, color: palette.textMuted, fontWeight: "600" },
  detailValue: { ...typography.body, color: palette.text, fontWeight: "600" },
  sectionTitle: { ...typography.h3, color: palette.text },
});
