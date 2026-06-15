// Bar chart — Per-category spend over a user-selectable period, with horizontal
// reference lines for the user's monthly minimum and maximum spending goals.
// Mandated by the Part 3 brief:
//   "The user must be able to view a graph showing the amount spent per
//   category over a user-selectable period. The graph must also display the
//   minimum and maximum goals."

import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Rect, Text as SvgText } from "react-native-svg";

import { palette, radii, spacing, typography } from "../theme";
import { formatZAR } from "../utils/currency";

type Datum = { label: string; value: number; color: string };

type Props = {
  data: Datum[];
  minGoal?: number | null;
  maxGoal?: number | null;
  testID?: string;
};

const BAR_WIDTH = 36;
const BAR_GAP = 22;
const CHART_HEIGHT = 220;
const TOP_PAD = 24;
const BOTTOM_PAD = 56;
const LEFT_PAD = 56;

export function CategoryBarChart({ data, minGoal, maxGoal, testID }: Props) {
  const filtered = data.filter((d) => d.value > 0 || true); // include zeros for context
  const maxValue = Math.max(
    1,
    ...filtered.map((d) => d.value),
    maxGoal ?? 0,
    minGoal ?? 0,
  );
  // Nice rounded "ceiling" for the Y axis.
  const niceMax = roundNice(maxValue * 1.1);
  const chartW = LEFT_PAD + filtered.length * (BAR_WIDTH + BAR_GAP) + BAR_GAP;
  const innerW = chartW - LEFT_PAD - BAR_GAP;
  const innerH = CHART_HEIGHT - TOP_PAD - BOTTOM_PAD;

  function yFor(v: number) {
    return TOP_PAD + innerH - (v / niceMax) * innerH;
  }

  const yMin = minGoal != null ? yFor(minGoal) : null;
  const yMax = maxGoal != null ? yFor(maxGoal) : null;

  // Three Y axis ticks
  const ticks = [0, niceMax / 2, niceMax];

  return (
    <View style={styles.card} testID={testID}>
      <View style={styles.legendRow}>
        {minGoal != null ? <LegendLine color={palette.primary} label={`Min goal ${formatZAR(minGoal)}`} dashed /> : null}
        {maxGoal != null ? <LegendLine color={palette.danger} label={`Max goal ${formatZAR(maxGoal)}`} dashed /> : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <Svg width={chartW} height={CHART_HEIGHT}>
          {/* Y axis ticks */}
          {ticks.map((t, i) => (
            <React.Fragment key={i}>
              <Line
                x1={LEFT_PAD}
                x2={chartW}
                y1={yFor(t)}
                y2={yFor(t)}
                stroke={palette.border}
                strokeWidth={1}
              />
              <SvgText
                x={LEFT_PAD - 6}
                y={yFor(t) + 4}
                fontSize={10}
                fill={palette.textMuted}
                textAnchor="end"
              >
                {formatZAR(t).replace(/\u00A0/g, " ")}
              </SvgText>
            </React.Fragment>
          ))}

          {/* Goal reference lines */}
          {yMin != null && minGoal! > 0 ? (
            <>
              <Line
                x1={LEFT_PAD}
                x2={chartW}
                y1={yMin}
                y2={yMin}
                stroke={palette.primary}
                strokeWidth={2}
                strokeDasharray="6,4"
              />
              <SvgText x={LEFT_PAD + 4} y={yMin - 4} fontSize={10} fill={palette.primary} fontWeight="700">
                MIN
              </SvgText>
            </>
          ) : null}
          {yMax != null && maxGoal! > 0 ? (
            <>
              <Line
                x1={LEFT_PAD}
                x2={chartW}
                y1={yMax}
                y2={yMax}
                stroke={palette.danger}
                strokeWidth={2}
                strokeDasharray="6,4"
              />
              <SvgText x={LEFT_PAD + 4} y={yMax - 4} fontSize={10} fill={palette.danger} fontWeight="700">
                MAX
              </SvgText>
            </>
          ) : null}

          {/* Bars */}
          {filtered.map((d, i) => {
            const x = LEFT_PAD + BAR_GAP + i * (BAR_WIDTH + BAR_GAP);
            const y = yFor(d.value);
            const h = Math.max(2, TOP_PAD + innerH - y);
            return (
              <React.Fragment key={i}>
                <Rect
                  x={x}
                  y={y}
                  width={BAR_WIDTH}
                  height={h}
                  rx={6}
                  fill={d.color}
                />
                <SvgText
                  x={x + BAR_WIDTH / 2}
                  y={TOP_PAD + innerH + 16}
                  fontSize={10}
                  fill={palette.textMuted}
                  textAnchor="middle"
                >
                  {truncate(d.label, 8)}
                </SvgText>
                <SvgText
                  x={x + BAR_WIDTH / 2}
                  y={TOP_PAD + innerH + 32}
                  fontSize={10}
                  fontWeight="700"
                  fill={palette.text}
                  textAnchor="middle"
                >
                  {compactZAR(d.value)}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
      </ScrollView>
      {filtered.length === 0 ? (
        <Text style={styles.empty}>No expenses in this period yet.</Text>
      ) : null}
    </View>
  );
}

function LegendLine({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.line,
          { backgroundColor: color, borderStyle: dashed ? "dashed" : "solid" },
        ]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

function roundNice(n: number): number {
  if (n <= 0) return 100;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const mant = n / pow;
  const niceMant = mant <= 1 ? 1 : mant <= 2 ? 2 : mant <= 5 ? 5 : 10;
  return niceMant * pow;
}

function truncate(s: string, max: number) {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function compactZAR(n: number): string {
  if (n >= 1000) return `R${(n / 1000).toFixed(1)}k`;
  return `R${Math.round(n)}`;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.card,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  line: { width: 16, height: 2 },
  legendText: { ...typography.small, color: palette.textMuted, fontWeight: "600" },
  empty: { ...typography.small, color: palette.textMuted, textAlign: "center", marginTop: spacing.sm },
});
