// Toast / Snackbar. Mounts at the root so it sits above tabs and modals.
// Replaces native Alert per design conventions.

import { Ionicons } from "@expo/vector-icons";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { palette, radii, spacing, typography } from "../theme";

type ToastKind = "info" | "success" | "error" | "reward";
type Toast = { id: number; kind: ToastKind; title: string; subtitle?: string };

const Ctx = createContext<(t: Omit<Toast, "id">) => void>(() => {});

let _id = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Toast[]>([]);

  const show = useCallback((t: Omit<Toast, "id">) => {
    _id += 1;
    const entry: Toast = { ...t, id: _id };
    setStack((s) => [...s, entry]);
    setTimeout(() => {
      setStack((s) => s.filter((x) => x.id !== entry.id));
    }, t.kind === "reward" ? 3600 : 2600);
  }, []);

  return (
    <Ctx.Provider value={show}>
      {children}
      <ToastViewport stack={stack} />
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}

function ToastViewport({ stack }: { stack: Toast[] }) {
  const insets = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={[styles.viewport, { top: insets.top + 8 }]}>
      {stack.map((t) => (
        <ToastView key={t.id} toast={t} />
      ))}
    </View>
  );
}

function ToastView({ toast }: { toast: Toast }) {
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(-12)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [fade, slide]);

  const colors = colorsFor(toast.kind);
  const icon =
    toast.kind === "success" ? "checkmark-circle" :
    toast.kind === "reward" ? "trophy" :
    toast.kind === "error" ? "alert-circle" : "information-circle";

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: colors.bg, transform: [{ translateY: slide }], opacity: fade },
      ]}
      testID={`toast-${toast.kind}`}
    >
      <Ionicons name={icon as any} size={22} color={colors.fg} style={{ marginRight: 10 }} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: colors.fg }]}>{toast.title}</Text>
        {toast.subtitle ? <Text style={[styles.subtitle, { color: colors.fg }]}>{toast.subtitle}</Text> : null}
      </View>
    </Animated.View>
  );
}

function colorsFor(kind: ToastKind) {
  switch (kind) {
    case "success":
      return { bg: palette.primary, fg: "#fff" };
    case "error":
      return { bg: palette.danger, fg: "#fff" };
    case "reward":
      return { bg: palette.accent, fg: "#fff" };
    default:
      return { bg: palette.text, fg: "#fff" };
  }
}

const styles = StyleSheet.create({
  viewport: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    elevation: 30,
    gap: spacing.sm,
  },
  toast: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    borderRadius: radii.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 6,
  },
  title: { ...typography.body, fontWeight: "700" },
  subtitle: { ...typography.small, opacity: 0.9 },
});
