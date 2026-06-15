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
import { palette, radii, spacing, typography } from "@/src/theme";

export default function LoginScreen() {
  const { login } = useAuth();
  const toast = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    setBusy(true);
    const res = await login(username, password);
    if (!res.ok) {
      toast({ kind: "error", title: "Sign in failed", subtitle: res.error });
    } else {
      toast({ kind: "success", title: `Welcome back, ${username.trim()}` });
    }
    setBusy(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brand}>
            <View style={styles.logo}>
              <Ionicons name="leaf" size={32} color={palette.primary} />
            </View>
            <Text style={styles.brandName}>Budget Tracker</Text>
            <Text style={styles.tagline}>Calm, offline budgeting in your pocket.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Sign in</Text>
            <Text style={styles.subtitle}>Use your local account — no internet required.</Text>

            <View style={{ marginTop: spacing.lg }}>
              <Field
                label="Username"
                value={username}
                onChangeText={setUsername}
                placeholder="e.g. khumela"
                autoCapitalize="none"
                testID="login-username-input"
              />
              <Field
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Your password"
                secureTextEntry
                autoCapitalize="none"
                testID="login-password-input"
              />
            </View>

            <PrimaryButton
              label={busy ? "Signing in…" : "Sign in"}
              onPress={submit}
              disabled={busy}
              testID="login-submit-button"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>New here?</Text>
              <Link href={"/(auth)/register" as any} style={styles.link} testID="login-go-register-link">
                Create an account
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
  title: { ...typography.h2, color: palette.text },
  subtitle: { ...typography.body, color: palette.textMuted, marginTop: 4 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: spacing.md },
  footerText: { ...typography.small, color: palette.textMuted },
  link: { ...typography.small, color: palette.primary, fontWeight: "700" },
});
