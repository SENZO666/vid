// Categories — list + inline "add new" form (combines CategoriesActivity.kt
// and AddCategoryActivity.kt into a single screen).

import { Ionicons } from "@expo/vector-icons";
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { Field } from "@/src/components/Field";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { useToast } from "@/src/components/Toast";
import { addCategory, deleteCategory, listCategories, type Category } from "@/src/db/queries";
import { evaluateBadges } from "@/src/gamification/badges";
import { categoryColors, palette, radii, spacing, typography } from "@/src/theme";

export default function CategoriesScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [items, setItems] = useState<Category[]>([]);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(categoryColors[0]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!session) return;
    setItems(await listCategories(session.userId));
  }, [session]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const onAdd = async () => {
    if (!session || busy) return;
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      toast({ kind: "error", title: "Name must be at least 2 characters" });
      return;
    }
    setBusy(true);
    try {
      await addCategory(session.userId, trimmed, color);
      toast({ kind: "success", title: "Category added" });
      const newly = await evaluateBadges(session.userId, {
        categoryCount: items.length + 1,
        recurringCount: 0,
      });
      for (const b of newly) {
        toast({ kind: "reward", title: `Badge unlocked: ${b.label}`, subtitle: b.description });
      }
      setName("");
      setAdding(false);
      await load();
    } catch (e: any) {
      toast({ kind: "error", title: "Could not add", subtitle: e?.message ?? "Name might already exist." });
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: number) => {
    if (!session) return;
    await deleteCategory(session.userId, id);
    toast({ kind: "info", title: "Category removed" });
    await load();
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          testID="categories-back"
        >
          <Ionicons name="chevron-back" size={22} color={palette.text} />
        </Pressable>
        <Text style={styles.title}>Categories</Text>
        <Pressable
          onPress={() => setAdding(true)}
          style={styles.addBtn}
          testID="categories-add-btn"
        >
          <Ionicons name="add" size={22} color="#fff" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="albums-outline" size={28} color={palette.textMuted} />
            <Text style={styles.emptyTitle}>No categories yet</Text>
            <Text style={styles.muted}>Tap + to add your first category (e.g. Food).</Text>
          </View>
        ) : (
          items.map((c) => (
            <View key={c.id} style={styles.row} testID={`category-row-${c.id}`}>
              <View style={[styles.dot, { backgroundColor: c.colorHex }]} />
              <Text style={styles.rowName}>{c.name}</Text>
              <Pressable
                onPress={() => onDelete(c.id)}
                style={styles.removeBtn}
                testID={`category-delete-${c.id}`}
              >
                <Ionicons name="trash-outline" size={18} color={palette.danger} />
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={adding} transparent animationType="slide" onRequestClose={() => setAdding(false)}>
        <Pressable style={styles.backdrop} onPress={() => setAdding(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>New category</Text>
          <Field
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Groceries"
            testID="category-add-name"
          />
          <Text style={[styles.muted, { marginBottom: 6 }]}>Pick a colour</Text>
          <View style={styles.colorRow}>
            {categoryColors.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[
                  styles.colorChip,
                  { backgroundColor: c, borderColor: c === color ? palette.text : "transparent" },
                ]}
                testID={`category-color-${c}`}
              />
            ))}
          </View>
          <View style={{ marginTop: spacing.md }}>
            <PrimaryButton
              label={busy ? "Saving…" : "Save category"}
              onPress={onAdd}
              disabled={busy}
              testID="category-add-submit"
            />
            <View style={{ height: spacing.sm }} />
            <PrimaryButton
              variant="ghost"
              label="Cancel"
              onPress={() => setAdding(false)}
              testID="category-add-cancel"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.md, gap: spacing.sm },
  title: { ...typography.h2, color: palette.text, flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: radii.md, alignItems: "center", justifyContent: "center", backgroundColor: palette.secondary },
  addBtn: { width: 40, height: 40, borderRadius: radii.md, alignItems: "center", justifyContent: "center", backgroundColor: palette.primary },
  scroll: { padding: spacing.md, paddingTop: 0 },
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
    marginBottom: spacing.sm,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
  rowName: { ...typography.body, color: palette.text, fontWeight: "600", flex: 1 },
  removeBtn: { padding: 6 },
  emptyCard: { backgroundColor: palette.card, padding: spacing.lg, borderRadius: radii.lg, alignItems: "center", gap: 4, borderWidth: 1, borderColor: palette.border },
  emptyTitle: { ...typography.h3, color: palette.text },
  muted: { ...typography.small, color: palette.textMuted },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.32)" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: palette.card, padding: spacing.lg, borderTopLeftRadius: radii.xl, borderTopRightRadius: radii.xl },
  sheetHandle: { width: 44, height: 4, backgroundColor: palette.border, borderRadius: 2, alignSelf: "center", marginBottom: spacing.sm },
  sheetTitle: { ...typography.h3, color: palette.text, marginBottom: spacing.sm },
  colorRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  colorChip: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
});
