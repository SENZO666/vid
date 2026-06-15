// Settings — destination for the secondary screens (categories, goals,
// recurring, rewards) plus CSV export and logout.

import { Ionicons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/src/auth/context";
import { useToast } from "@/src/components/Toast";
import { seedDemo } from "@/src/dev/seedDemo";
import { exportExpensesCsv } from "@/src/export/csv";
import { palette, radii, spacing, typography } from "@/src/theme";
import { endOfToday, firstOfThisMonth } from "@/src/utils/date";

type Item = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
  testID: string;
};

export default function SettingsScreen() {
  const { session, logout } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [exporting, setExporting] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const onSeedDemo = async () => {
    if (!session || seeding) return;
    setSeeding(true);
    try {
      const res = await seedDemo(session.userId);
      toast({
        kind: "success",
        title: res.added > 0 ? `Seeded ${res.added} demo expenses` : "Demo data already loaded",
        subtitle: "Goal set to R3 000 – R8 000 for the month.",
      });
    } finally {
      setSeeding(false);
    }
  };

  const onExport = async () => {
    if (!session || exporting) return;
    setExporting(true);
    try {
      // Default to "all time" up to today so the user always gets every row.
      const res = await exportExpensesCsv(session.userId, 0, endOfToday());
      if (res.ok) {
        toast({
          kind: "success",
          title: `Exported ${res.rowCount} expense${res.rowCount === 1 ? "" : "s"}`,
          subtitle: "Saved as CSV — share it from the dialog.",
        });
      } else {
        toast({ kind: "error", title: "Export failed", subtitle: res.error });
      }
    } finally {
      setExporting(false);
    }
  };

  const items: Item[] = [
    {
      key: "categories",
      icon: "pricetags",
      label: "Manage categories",
      description: "Create, colour-code and remove categories.",
      onPress: () => router.push("/categories" as Href),
      testID: "settings-categories",
    },
    {
      key: "goals",
      icon: "flag",
      label: "Monthly goals",
      description: "Set your minimum and maximum monthly spend.",
      onPress: () => router.push("/goals" as Href),
      testID: "settings-goals",
    },
    {
      key: "recurring",
      icon: "repeat",
      label: "Recurring expenses",
      description: "View what auto-creates each month.",
      onPress: () => router.push("/recurring" as Href),
      testID: "settings-recurring",
    },
    {
      key: "rewards",
      icon: "trophy",
      label: "Achievements",
      description: "Track unlocked and locked badges.",
      onPress: () => router.push("/rewards" as Href),
      testID: "settings-rewards",
    },
    {
      key: "export",
      icon: "share-outline",
      label: exporting ? "Preparing export…" : "Export to CSV",
      description: "Share all your expenses as a spreadsheet.",
      onPress: onExport,
      testID: "settings-export",
    },
    {
      key: "demo",
      icon: "sparkles-outline",
      label: seeding ? "Loading demo data…" : "Load demo data",
      description: "One-tap setup for a polished demo (categories, expenses, goals).",
      onPress: onSeedDemo,
      testID: "settings-seed-demo",
    },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.profile} testID="settings-profile">
          <View style={styles.avatar}>
            <Ionicons name="person" size={26} color={palette.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileName}>{session?.username}</Text>
            <Text style={styles.muted}>Local account · everything stays on this device.</Text>
          </View>
        </View>

        <View style={styles.list}>
          {items.map((item) => (
            <Pressable
              key={item.key}
              style={styles.item}
              onPress={item.onPress}
              testID={item.testID}
            >
              <View style={styles.itemIcon}>
                <Ionicons name={item.icon} size={20} color={palette.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                <Text style={styles.muted}>{item.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={palette.textMuted} />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.item, { marginTop: spacing.lg, backgroundColor: palette.danger + "11" }]}
          onPress={logout}
          testID="settings-logout"
        >
          <View style={[styles.itemIcon, { backgroundColor: palette.danger + "22" }]}>
            <Ionicons name="log-out-outline" size={20} color={palette.danger} />
          </View>
          <Text style={[styles.itemLabel, { color: palette.danger }]}>Sign out</Text>
        </Pressable>

        <Text style={styles.versionNote}>Budget Tracker · v1.0.0 · OPSC6311 Part 3 build</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  title: { ...typography.h1, color: palette.text },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: palette.card,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: palette.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  profileName: { ...typography.h3, color: palette.text },
  muted: { ...typography.small, color: palette.textMuted, marginTop: 2 },
  list: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
    overflow: "hidden",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: palette.border,
  },
  itemIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    backgroundColor: palette.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  itemLabel: { ...typography.body, fontWeight: "600", color: palette.text },
  versionNote: { ...typography.small, color: palette.textMuted, textAlign: "center", marginTop: spacing.lg },
});
