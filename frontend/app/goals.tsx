// Goals — Monthly minimum + maximum. Uses a custom slider implemented with
// pan gestures so we don't need an extra library, plus a numeric text input
// for precise entry. The original Kotlin app used SeekBar; this is the RN
// equivalent.

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { PrimaryButton } from "@/src/components/PrimaryButton";
import { useToast } from "@/src/components/Toast";
import { getGoal, listCategories, listRecurringTemplates, upsertGoal } from "@/src/db/queries";
import { evaluateBadges } from "@/src/gamification/badges";
import { palette, radii, spacing, typography } from "@/src/theme";
import { formatZAR } from "@/src/utils/currency";

const MAX_SCALE = 50000; // R50k

export default function GoalsScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [min, setMin] = useState(0);
  const [max, setMax] = useState(5000);
  const [busy, setBusy] = useState(false);
  const [trackWidth, setTrackWidth] = useState(0);

  useFocusEffect(
    useCallback(() => {
      if (!session) return;
      (async () => {
        const g = await getGoal(session.userId);
        if (g) {
          setMin(g.minAmount);
          setMax(g.maxAmount);
        }
      })();
    }, [session]),
  );

  const save = async () => {
    if (!session) return;
    if (min < 0 || max <= 0) {
      toast({ kind: "error", title: "Both goals must be positive" });
      return;
    }
    if (min > max) {
      toast({ kind: "error", title: "Min must be less than max" });
      return;
    }
    setBusy(true);
    try {
      await upsertGoal(session.userId, min, max);
      const [cats, recurring] = await Promise.all([
        listCategories(session.userId),
        listRecurringTemplates(session.userId),
      ]);
      const newly = await evaluateBadges(session.userId, {
        categoryCount: cats.length,
        recurringCount: recurring.length,
      });
      for (const b of newly) {
        toast({ kind: "reward", title: `Badge unlocked: ${b.label}`, subtitle: b.description });
      }
      toast({ kind: "success", title: "Goals saved" });
      router.back();
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} testID="goals-back">
          <Ionicons name="chevron-back" size={22} color={palette.text} />
        </Pressable>
        <Text style={styles.title}>Monthly goals</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.sub}>Decide what you want to keep spending between every month. We&apos;ll celebrate when you stay inside this band.</Text>

        <GoalSlider
          label="Minimum"
          value={min}
          onChange={setMin}
          color={palette.primary}
          onWidth={setTrackWidth}
          width={trackWidth}
          testID="goal-min"
        />
        <TextInput
          value={String(Math.round(min))}
          onChangeText={(t) => setMin(Number(t.replace(/[^0-9]/g, "")) || 0)}
          keyboardType="number-pad"
          style={styles.numericInput}
          testID="goal-min-input"
        />

        <View style={{ height: spacing.lg }} />

        <GoalSlider
          label="Maximum"
          value={max}
          onChange={setMax}
          color={palette.danger}
          onWidth={setTrackWidth}
          width={trackWidth}
          testID="goal-max"
        />
        <TextInput
          value={String(Math.round(max))}
          onChangeText={(t) => setMax(Number(t.replace(/[^0-9]/g, "")) || 0)}
          keyboardType="number-pad"
          style={styles.numericInput}
          testID="goal-max-input"
        />

        <View style={styles.preview}>
          <Text style={styles.previewLabel}>Goal range</Text>
          <Text style={styles.previewAmount}>
            {formatZAR(min)} – {formatZAR(max)}
          </Text>
        </View>

        <PrimaryButton
          label={busy ? "Saving…" : "Save goals"}
          onPress={save}
          disabled={busy}
          testID="goals-save"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function GoalSlider({
  label,
  value,
  onChange,
  color,
  onWidth,
  width,
  testID,
}: {
  label: string;
  value: number;
  onChange: (next: number) => void;
  color: string;
  onWidth: (w: number) => void;
  width: number;
  testID?: string;
}) {
  const pct = Math.max(0, Math.min(1, value / MAX_SCALE));
  const knobX = width * pct;

  const responder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        if (width <= 0) return;
        const x = Math.max(0, Math.min(width, g.moveX - 16));
        const next = Math.round((x / width) * MAX_SCALE);
        onChange(next);
      },
    }),
  ).current;

  return (
    <View style={{ marginBottom: 8 }} testID={testID}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderLabel}>{label}</Text>
        <Text style={styles.sliderValue}>{formatZAR(value)}</Text>
      </View>
      <View
        style={styles.track}
        onLayout={(e) => onWidth(e.nativeEvent.layout.width)}
        {...responder.panHandlers}
      >
        <View style={[styles.trackFill, { width: knobX, backgroundColor: color }]} />
        <View style={[styles.knob, { left: knobX - 12, borderColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  header: { flexDirection: "row", alignItems: "center", padding: spacing.md, gap: spacing.sm },
  title: { ...typography.h2, color: palette.text, flex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: radii.md, alignItems: "center", justifyContent: "center", backgroundColor: palette.secondary },
  scroll: { padding: spacing.md, paddingTop: 0, gap: spacing.sm },
  sub: { ...typography.body, color: palette.textMuted, marginBottom: spacing.md },

  sliderHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  sliderLabel: { ...typography.small, fontWeight: "700", color: palette.textMuted },
  sliderValue: { ...typography.body, fontWeight: "700", color: palette.text },
  track: { height: 6, borderRadius: 3, backgroundColor: palette.muted, marginVertical: spacing.sm, position: "relative" },
  trackFill: { position: "absolute", height: 6, borderRadius: 3, top: 0, left: 0 },
  knob: { position: "absolute", width: 24, height: 24, borderRadius: 12, borderWidth: 4, top: -9, backgroundColor: "#fff" },

  numericInput: {
    height: 48,
    paddingHorizontal: spacing.md,
    backgroundColor: palette.card,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
    fontSize: 16,
    fontWeight: "600",
  },

  preview: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    padding: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  previewLabel: { ...typography.small, color: palette.textMuted },
  previewAmount: { ...typography.h2, color: palette.text, marginTop: 4 },
});
