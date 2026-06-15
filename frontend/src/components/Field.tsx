import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type KeyboardTypeOptions,
  type TextInputProps,
} from "react-native";

import { palette, radii, spacing, typography } from "../theme";

type Props = {
  label: string;
  value: string;
  onChangeText: (next: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  testID?: string;
  rightSlot?: React.ReactNode;
  helper?: string | null;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  editable?: boolean;
};

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  multiline,
  testID,
  rightSlot,
  helper,
  autoCapitalize,
  editable = true,
}: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          focused && { borderColor: palette.primary },
          !editable && { backgroundColor: palette.muted },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={palette.textMuted}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          multiline={multiline}
          testID={testID}
          editable={editable}
          autoCapitalize={autoCapitalize ?? "sentences"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[styles.input, multiline && { minHeight: 80, textAlignVertical: "top" }]}
        />
        {rightSlot}
      </View>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { ...typography.small, color: palette.textMuted, marginBottom: 6, fontWeight: "600" },
  inputWrap: {
    minHeight: 48,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.card,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: palette.text,
    fontSize: 15,
  },
  helper: { ...typography.small, color: palette.textMuted, marginTop: 6 },
});
