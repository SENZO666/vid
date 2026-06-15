// Monthly progress gauge — a horizontal 3-zone bar that visually shows where
// the user's total spend sits relative to their min and max monthly goals.
//
// Zones (left → right):
//   • 0   → Min     : "Under budget" — encouraged area (soft amber, you may be
//                     under-spending categories you actually need)
//   • Min → Max     : "In the zone"  — primary green, on track
//   • Max → 1.25×Max: "Over budget"  — red accent
//
// A dark marker indicates the user's current spend within the scale.
// Fulfils the Part 3 brief:
//   "The app must display in a visual format how well the user is doing with
//   staying between their minimum and maximum spending goals over the past month."

import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect, Circle } from "react-native-svg";

import { palette, radii, spacing, typography } from "../theme";
import { formatZAR } from "../utils/currency";

type Props = {
  spent: number;
  min: number;
  max: number;
  testID?: string;
};

const HEIGHT = 28;

export function MonthlyProgressGauge({ spent, min, max, testID }: Props) {
  // If neither min nor max is configured yet, show a CTA instead of a 0→1 gauge.
  if (max <= 0) {
    return (
      <View style={styles.card} testID={testID}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>This month</Text>
        </View>
        <Text style={styles.spent}>{formatZAR(spent)}</Text>
        <Text style={styles.subtle}>
          Set a monthly minimum and maximum goal to start tracking how well you&apos;re doing.
        </Text>
      </View>
    );
  }

  const safeMax = Math.max(max, 1);
  const safeMin = Math.max(0, Math.min(min, safeMax));
  const scaleMax = Math.max(safeMax * 1.25, spent * 1.05, 1);
  const w = 320;
  const xMin = (safeMin / scaleMax) * w;
  const xMax = (safeMax / scaleMax) * w;
  const xSpent = Math.min(w, Math.max(0, (spent / scaleMax) * w));

  let statusLabel = "Under min";
  let statusColor = palette.warning;
  if (spent > safeMax) {
    statusLabel = "Over max";
    statusColor = palette.danger;
  } else if (spent >= safeMin && spent <= safeMax) {
    statusLabel = "In the zone";
    statusColor = palette.primary;
  }

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>This month</Text>
        <View style={[styles.pill, { backgroundColor: statusColor }]}>
          <Text style={styles.pillText}>{statusLabel}</Text>
        </View>
      </View>
      <Text style={styles.spent}>{formatZAR(spent)}</Text>
      <Text style={styles.subtle}>
        Goal range {formatZAR(safeMin)} – {formatZAR(safeMax)}
      </Text>
      <View style={{ marginTop: spacing.md }}>
        <Svg width={w} height={HEIGHT + 28} viewBox={`0 0 ${w} ${HEIGHT + 28}`}>
          {/* under-min zone */}
          <Rect
            x={0}
            y={6}
            width={Math.max(0, xMin)}
            height={HEIGHT}
            fill={palette.warning}
            opacity={0.35}
            rx={radii.sm}
          />
          {/* in-zone */}
          <Rect
            x={xMin}
            y={6}
            width={Math.max(0, xMax - xMin)}
            height={HEIGHT}
            fill={palette.primary}
            opacity={0.32}
            rx={radii.sm}
          />
          {/* over-max */}
          <Rect
            x={xMax}
            y={6}
            width={Math.max(0, w - xMax)}
            height={HEIGHT}
            fill={palette.danger}
            opacity={0.32}
            rx={radii.sm}
          />
          {/* Min / Max ticks */}
          <Line x1={xMin} x2={xMin} y1={2} y2={HEIGHT + 10} stroke={palette.primary} strokeWidth={2} />
          <Line x1={xMax} x2={xMax} y1={2} y2={HEIGHT + 10} stroke={palette.danger} strokeWidth={2} />
          {/* Spent marker */}
          <Circle
            cx={xSpent}
            cy={6 + HEIGHT / 2}
            r={9}
            fill={statusColor}
            stroke="#fff"
            strokeWidth={3}
          />
        </Svg>
        <View style={styles.legendRow}>
          <LegendDot color={palette.warning} label="Under min" />
          <LegendDot color={palette.primary} label="On track" />
          <LegendDot color={palette.danger} label="Over max" />
        </View>
      </View>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: palette.border,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { ...typography.overline, color: palette.textMuted },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  pillText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  spent: { ...typography.h1, color: palette.text, marginTop: 4 },
  subtle: { ...typography.small, color: palette.textMuted, marginTop: 2 },
  legendRow: { flexDirection: "row", marginTop: spacing.sm, gap: spacing.md },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, color: palette.textMuted, fontWeight: "600" },
});
