// Add Expense — full form with photo capture (camera or gallery), time
// pickers, category picker, and a "make this recurring" switch.

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { Field } from "@/src/components/Field";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { useToast } from "@/src/components/Toast";
import { addExpense, listCategories, type Category } from "@/src/db/queries";
import { evaluateBadges } from "@/src/gamification/badges";
import { palette, radii, spacing, typography } from "@/src/theme";
import { parseAmountInput } from "@/src/utils/currency";
import { hhmmToMinutes, minutesToHHmm, startOfDay } from "@/src/utils/date";

export default function AddExpenseScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState<number>(startOfDay(Date.now()));
  const [startMin, setStartMin] = useState(540); // 09:00
  const [endMin, setEndMin] = useState(600); // 10:00
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [recurring, setRecurring] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState<null | "date" | "start" | "end" | "category">(null);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      (async () => {
        const cats = await listCategories(session.userId);
        setCategories(cats);
        if (cats.length && !categoryId) setCategoryId(cats[0].id);
      })();
    }, [session, categoryId]),
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) ?? null,
    [categories, categoryId],
  );

  const askForPhoto = async () => {
    setPickerOpen(null);
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      toast({ kind: "error", title: "Camera permission denied", subtitle: "Try the gallery option instead." });
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.5, base64: true });
    if (!result.canceled && result.assets[0]?.base64) {
      setPhotoUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const pickFromGallery = async () => {
    setPickerOpen(null);
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast({ kind: "error", title: "Gallery permission denied" });
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets[0]?.base64) {
      setPhotoUri(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const submit = async () => {
    if (!session) return;
    const amt = parseAmountInput(amount);
    if (amt == null || amt <= 0) {
      toast({ kind: "error", title: "Enter a valid amount" });
      return;
    }
    if (!description.trim()) {
      toast({ kind: "error", title: "Add a short description" });
      return;
    }
    if (categoryId == null) {
      toast({ kind: "error", title: "Pick a category" });
      return;
    }
    if (endMin < startMin) {
      toast({ kind: "error", title: "End time must be after start" });
      return;
    }

    setBusy(true);
    try {
      const day = new Date(date);
      const ts = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12).getTime();
      await addExpense({
        userId: session.userId,
        categoryId,
        amount: amt,
        description: description.trim(),
        dateEpochMillis: ts,
        startTimeMinutes: startMin,
        endTimeMinutes: endMin,
        photoUri,
        isRecurring: recurring ? 1 : 0,
        recurringDay: recurring ? day.getDate() : null,
      });

      // Re-evaluate gamification with the updated state.
      const cats = await listCategories(session.userId);
      const newly = await evaluateBadges(session.userId, {
        categoryCount: cats.length,
        recurringCount: recurring ? 1 : 0,
      });
      for (const b of newly) {
        toast({ kind: "reward", title: `Badge unlocked: ${b.label}`, subtitle: b.description });
      }

      toast({ kind: "success", title: "Expense saved" });
      // Reset form
      setAmount("");
      setDescription("");
      setPhotoUri(null);
      setRecurring(false);
      router.push("/(tabs)/expenses" as any);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Add expense</Text>
          <Text style={styles.subtitle}>Log what you spent and when.</Text>

          <Field
            label="Amount (R)"
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            testID="add-amount-input"
          />

          <Field
            label="Description"
            value={description}
            onChangeText={setDescription}
            placeholder="Groceries at Pick n Pay"
            testID="add-description-input"
          />

          <Pressable
            style={styles.rowField}
            onPress={() => setPickerOpen("category")}
            testID="add-category-picker"
          >
            <Text style={styles.rowLabel}>Category</Text>
            <View style={styles.rowValue}>
              {selectedCategory ? (
                <>
                  <View style={[styles.dot, { backgroundColor: selectedCategory.colorHex }]} />
                  <Text style={styles.rowText}>{selectedCategory.name}</Text>
                </>
              ) : (
                <Text style={styles.rowText}>Choose a category</Text>
              )}
              <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
            </View>
          </Pressable>

          <Pressable
            style={styles.rowField}
            onPress={() => setPickerOpen("date")}
            testID="add-date-picker"
          >
            <Text style={styles.rowLabel}>Date</Text>
            <View style={styles.rowValue}>
              <Ionicons name="calendar-outline" size={16} color={palette.textMuted} />
              <Text style={styles.rowText}>{new Date(date).toLocaleDateString("en-ZA", { day: "2-digit", month: "short", year: "numeric" })}</Text>
              <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
            </View>
          </Pressable>

          <View style={{ flexDirection: "row", gap: spacing.sm }}>
            <Pressable
              style={[styles.rowField, { flex: 1 }]}
              onPress={() => setPickerOpen("start")}
              testID="add-start-time"
            >
              <Text style={styles.rowLabel}>Start</Text>
              <View style={styles.rowValue}>
                <Ionicons name="time-outline" size={16} color={palette.textMuted} />
                <Text style={styles.rowText}>{minutesToHHmm(startMin)}</Text>
              </View>
            </Pressable>
            <Pressable
              style={[styles.rowField, { flex: 1 }]}
              onPress={() => setPickerOpen("end")}
              testID="add-end-time"
            >
              <Text style={styles.rowLabel}>End</Text>
              <View style={styles.rowValue}>
                <Ionicons name="time-outline" size={16} color={palette.textMuted} />
                <Text style={styles.rowText}>{minutesToHHmm(endMin)}</Text>
              </View>
            </Pressable>
          </View>

          <View style={styles.recurringRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Recurring monthly</Text>
              <Text style={styles.muted}>Auto-create this expense on the same day every month.</Text>
            </View>
            <Switch
              value={recurring}
              onValueChange={setRecurring}
              trackColor={{ false: palette.muted, true: palette.primary }}
              testID="add-recurring-switch"
            />
          </View>

          <Pressable
            style={styles.photoCard}
            testID="add-photo-card"
          />

          <View style={styles.photoRow}>
            <PrimaryButton
              variant="secondary"
              label="Take photo"
              icon={<Ionicons name="camera-outline" size={16} color={palette.primary} />}
              onPress={askForPhoto}
              testID="add-photo-camera-btn"
            />
            <PrimaryButton
              variant="secondary"
              label="Choose photo"
              icon={<Ionicons name="image-outline" size={16} color={palette.primary} />}
              onPress={pickFromGallery}
              testID="add-photo-gallery-btn"
            />
          </View>
          {photoUri ? (
            <View style={styles.photoPreview} testID="add-photo-preview">
              <Image source={{ uri: photoUri }} style={{ width: "100%", height: 180, borderRadius: radii.md }} />
              <Pressable onPress={() => setPhotoUri(null)} style={styles.photoRemove} testID="add-photo-remove">
                <Ionicons name="close-circle" size={22} color="#fff" />
              </Pressable>
            </View>
          ) : null}

          <View style={{ height: spacing.lg }} />
          <PrimaryButton
            label={busy ? "Saving…" : "Save expense"}
            onPress={submit}
            disabled={busy}
            testID="add-submit-button"
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <PickerSheet
        visible={pickerOpen === "category"}
        title="Choose category"
        onClose={() => setPickerOpen(null)}
      >
        {categories.length === 0 ? (
          <Text style={styles.muted}>No categories yet. Add one from Categories.</Text>
        ) : (
          categories.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => {
                setCategoryId(c.id);
                setPickerOpen(null);
              }}
              style={styles.optionRow}
              testID={`category-option-${c.id}`}
            >
              <View style={[styles.dot, { backgroundColor: c.colorHex }]} />
              <Text style={styles.optionText}>{c.name}</Text>
              {c.id === categoryId ? <Ionicons name="checkmark" size={20} color={palette.primary} /> : null}
            </Pressable>
          ))
        )}
      </PickerSheet>

      <DateSheet
        visible={pickerOpen === "date"}
        initial={date}
        onClose={() => setPickerOpen(null)}
        onApply={(ts) => {
          setDate(ts);
          setPickerOpen(null);
        }}
      />
      <TimeSheet
        visible={pickerOpen === "start"}
        initial={startMin}
        title="Start time"
        onClose={() => setPickerOpen(null)}
        onApply={(m) => {
          setStartMin(m);
          setPickerOpen(null);
        }}
      />
      <TimeSheet
        visible={pickerOpen === "end"}
        initial={endMin}
        title="End time"
        onClose={() => setPickerOpen(null)}
        onApply={(m) => {
          setEndMin(m);
          setPickerOpen(null);
        }}
      />
    </SafeAreaView>
  );
}

function PickerSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{title}</Text>
        <ScrollView style={{ maxHeight: 360 }}>{children}</ScrollView>
        <PrimaryButton label="Close" variant="ghost" onPress={onClose} testID="sheet-close" />
      </View>
    </Modal>
  );
}

function DateSheet({
  visible,
  initial,
  onClose,
  onApply,
}: {
  visible: boolean;
  initial: number;
  onClose: () => void;
  onApply: (ts: number) => void;
}) {
  // Tiny inline calendar: shows current month + arrows.
  const [cursor, setCursor] = useState(initial);
  const d = new Date(cursor);
  const firstOfMonth = new Date(d.getFullYear(), d.getMonth(), 1);
  const lastOfMonth = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  const offset = firstOfMonth.getDay(); // 0 = Sunday
  const cells: (number | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let i = 1; i <= lastOfMonth; i++) cells.push(i);

  const month = d.toLocaleDateString("en-ZA", { month: "long", year: "numeric" });

  return (
    <PickerSheet visible={visible} title="Choose date" onClose={onClose}>
      <View style={styles.calHeader}>
        <Pressable
          onPress={() => setCursor(new Date(d.getFullYear(), d.getMonth() - 1, 1).getTime())}
          testID="date-prev"
        >
          <Ionicons name="chevron-back" size={22} color={palette.text} />
        </Pressable>
        <Text style={styles.calTitle}>{month}</Text>
        <Pressable
          onPress={() => setCursor(new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime())}
          testID="date-next"
        >
          <Ionicons name="chevron-forward" size={22} color={palette.text} />
        </Pressable>
      </View>
      <View style={styles.calGrid}>
        {["S", "M", "T", "W", "T", "F", "S"].map((s, i) => (
          <Text key={i} style={styles.calDow}>{s}</Text>
        ))}
        {cells.map((cell, i) => {
          if (cell == null) return <View key={i} style={styles.calCell} />;
          const cellTs = new Date(d.getFullYear(), d.getMonth(), cell).getTime();
          const isSelected = new Date(cellTs).toDateString() === new Date(initial).toDateString();
          return (
            <Pressable
              key={i}
              style={[styles.calCell, isSelected && { backgroundColor: palette.primary }]}
              onPress={() => onApply(cellTs)}
              testID={`date-cell-${cell}`}
            >
              <Text style={[styles.calCellText, isSelected && { color: "#fff" }]}>{cell}</Text>
            </Pressable>
          );
        })}
      </View>
    </PickerSheet>
  );
}

function TimeSheet({
  visible,
  initial,
  title,
  onClose,
  onApply,
}: {
  visible: boolean;
  initial: number;
  title: string;
  onClose: () => void;
  onApply: (mins: number) => void;
}) {
  const [val, setVal] = useState(initial);
  const h = Math.floor(val / 60);
  const m = val % 60;

  return (
    <PickerSheet visible={visible} title={title} onClose={onClose}>
      <View style={styles.timeWrap}>
        <View style={styles.timeBox}>
          <Text style={styles.timeBoxLabel}>Hours</Text>
          <View style={styles.timeRow}>
            <Pressable onPress={() => setVal(hhmmToMinutes((h + 23) % 24, m))} testID="time-h-down">
              <Ionicons name="chevron-down" size={22} color={palette.textMuted} />
            </Pressable>
            <Text style={styles.timeNum}>{h.toString().padStart(2, "0")}</Text>
            <Pressable onPress={() => setVal(hhmmToMinutes((h + 1) % 24, m))} testID="time-h-up">
              <Ionicons name="chevron-up" size={22} color={palette.textMuted} />
            </Pressable>
          </View>
        </View>
        <View style={styles.timeBox}>
          <Text style={styles.timeBoxLabel}>Minutes</Text>
          <View style={styles.timeRow}>
            <Pressable onPress={() => setVal(hhmmToMinutes(h, (m + 55) % 60))} testID="time-m-down">
              <Ionicons name="chevron-down" size={22} color={palette.textMuted} />
            </Pressable>
            <Text style={styles.timeNum}>{m.toString().padStart(2, "0")}</Text>
            <Pressable onPress={() => setVal(hhmmToMinutes(h, (m + 5) % 60))} testID="time-m-up">
              <Ionicons name="chevron-up" size={22} color={palette.textMuted} />
            </Pressable>
          </View>
        </View>
      </View>
      <PrimaryButton label="Apply" onPress={() => onApply(val)} testID="time-apply" />
    </PickerSheet>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl, gap: 4 },
  title: { ...typography.h1, color: palette.text },
  subtitle: { ...typography.body, color: palette.textMuted, marginBottom: spacing.md },

  rowField: {
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  rowLabel: { ...typography.small, color: palette.textMuted, fontWeight: "600" },
  rowValue: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  rowText: { ...typography.body, color: palette.text, fontWeight: "600", flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  muted: { ...typography.small, color: palette.textMuted },

  recurringRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: palette.card,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },

  photoCard: { height: 0 },

  photoRow: { flexDirection: "row", gap: spacing.sm },
  photoPreview: { marginTop: spacing.md, position: "relative" },
  photoRemove: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(0,0,0,0.55)", borderRadius: 14, padding: 2 },

  // Picker sheet
  backdrop: { position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.32)", top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.card,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  sheetHandle: { width: 44, height: 4, backgroundColor: palette.border, borderRadius: 2, alignSelf: "center" },
  sheetTitle: { ...typography.h3, color: palette.text, marginVertical: spacing.sm },
  optionRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: 12 },
  optionText: { ...typography.body, color: palette.text, fontWeight: "600", flex: 1 },

  // Calendar
  calHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  calTitle: { ...typography.h3, color: palette.text },
  calGrid: { flexDirection: "row", flexWrap: "wrap" },
  calDow: { width: "14.28%", textAlign: "center", color: palette.textMuted, fontWeight: "700", marginBottom: 4 },
  calCell: { width: "14.28%", aspectRatio: 1, alignItems: "center", justifyContent: "center", borderRadius: 100 },
  calCellText: { color: palette.text, fontWeight: "600" },

  // Time picker
  timeWrap: { flexDirection: "row", gap: spacing.md, justifyContent: "center", marginVertical: spacing.lg },
  timeBox: { alignItems: "center" },
  timeBoxLabel: { ...typography.small, color: palette.textMuted, marginBottom: 4 },
  timeRow: { alignItems: "center", gap: 4 },
  timeNum: { fontSize: 32, color: palette.text, fontWeight: "700" },
});
