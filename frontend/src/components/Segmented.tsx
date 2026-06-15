import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { palette, radii, spacing, typography } from "../theme";

type Option<T extends string> = { value: T; label: string };

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (next: T) => void;
  testID?: string;
};

export function Segmented<T extends string>({ options, value, onChange, testID }: Props<T>) {
  return (
    <View style={styles.wrap} testID={testID}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.btn,
              { backgroundColor: active ? palette.primary : "transparent" },
            ]}
            testID={`${testID ?? "segmented"}-${opt.value}`}
          >
            <Text
              style={[
                styles.label,
                { color: active ? "#fff" : palette.textMuted },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: palette.muted,
    padding: 4,
    borderRadius: radii.pill,
    alignSelf: "stretch",
  },
  btn: {
    flex: 1,
    minHeight: 36,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  label: { ...typography.small, fontWeight: "700" },
});
