import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";

import { palette, radii, spacing, typography } from "../theme";

type Props = {
  label: string;
  onPress?: () => void;
  testID?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
};

export function PrimaryButton({
  label,
  onPress,
  testID,
  variant = "primary",
  disabled,
  icon,
  style,
}: Props) {
  const bg =
    variant === "primary"
      ? palette.primary
      : variant === "danger"
        ? palette.danger
        : variant === "secondary"
          ? palette.secondary
          : "transparent";
  const fg =
    variant === "primary" || variant === "danger" ? "#fff" : palette.primary;
  const border =
    variant === "secondary" || variant === "ghost" ? palette.border : "transparent";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      android_ripple={{ color: "rgba(0,0,0,0.12)" }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon ? <View style={{ marginRight: 8 }}>{icon}</View> : null}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 48,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  label: { ...typography.h3, fontSize: 15 },
});
