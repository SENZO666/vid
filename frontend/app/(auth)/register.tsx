import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
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
import { addCategory } from "@/src/db/queries";
import { categoryColors, palette, radii, spacing, typography } from "@/src/theme";

const STARTER_CATEGORIES = [
  { name: "Food", color: categoryColors[1] },
  { name: "Transport", color: categoryColors[2] },
  { name: "Entertainment", color: categoryColors[4] },
];

export default function RegisterScreen() {
  const { register } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    const res = await register(username, password);
    if (!res.ok) {
      toast({ kind: "error", title: "Could not register", subtitle: res.error });
      setBusy(false);
      return;
    }
    // Seed a few starter categories so the new user has somewhere to log to.
    try {
      // The register call has already created a session, so we can grab it via
      // a tiny side-effect: just call addCategory with the freshly-created
      // user id from the session. We refetch via context.
      const { getSession } = await import("@/src/auth");
      const s = await getSession();
      if (s) {
        for (const c of STARTER_CATEGORIES) {
          try { await addCategory(s.userId, c.name, c.color); } catch { /* duplicate name */ }
        }
      }
    } catch (e) {
      console.warn("seed starter categories failed", e);
    }
    toast({ kind: "success", title: "Account created", subtitle: "Welcome to Budget Tracker." });
    setBusy(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name="leaf" size={32} color={palette.primary} />
            </View>
            <Text style={styles.brandName}>Create your account</Text>
            <Text style={styles.tagline}>
              Everything stays on this device. No accounts in the cloud.
            </Text>
          </View>

          <View style={styles.card}>
            <Field
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="At least 3 characters"
              autoCapitalize="none"
              testID="register-username-input"
            />
            <Field
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              autoCapitalize="none"
              testID="register-password-input"
            />

            <PrimaryButton
              label={busy ? "Creating account…" : "Create account"}
              onPress={submit}
              disabled={busy}
              testID="register-submit-button"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have one?</Text>
              <Link href={"/(auth)/login" as any} style={styles.link} testID="register-go-login-link">
                Sign in
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl, flexGrow: 1 },
  brand: { alignItems: "center", paddingTop: spacing.lg, paddingBottom: spacing.xl },
  logo: {
    width: 56,
    height: 56,
    borderRadius: radii.lg,
    backgroundColor: palette.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  brandName: { ...typography.h1, color: palette.text },
  tagline: { ...typography.body, color: palette.textMuted, marginTop: 4, textAlign: "center" },
  card: {
    backgroundColor: palette.card,
    padding: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: spacing.md },
  footerText: { ...typography.small, color: palette.textMuted },
  link: { ...typography.small, color: palette.primary, fontWeight: "700" },
});
