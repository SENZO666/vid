// CSV export for expenses. Saves to FileSystem cache then triggers the share sheet.

import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

import { listExpenses } from "../db/queries";
import { formatDate, minutesToHHmm } from "../utils/date";

function csvEscape(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function exportExpensesCsv(
  userId: number,
  from: number,
  to: number,
): Promise<{ ok: true; uri: string; rowCount: number } | { ok: false; error: string }> {
  try {
    const rows = await listExpenses(userId, from, to);
    const header = [
      "Date",
      "Start time",
      "End time",
      "Category",
      "Description",
      "Amount (ZAR)",
      "Recurring",
    ].join(",");
    const body = rows
      .map((r) =>
        [
          formatDate(r.dateEpochMillis),
          minutesToHHmm(r.startTimeMinutes),
          minutesToHHmm(r.endTimeMinutes),
          r.categoryName,
          r.description,
          r.amount.toFixed(2),
          r.isRecurring ? "Yes" : "No",
        ]
          .map(csvEscape)
          .join(","),
      )
      .join("\n");
    const csv = `${header}\n${body}`;
    const filename = `budget-tracker-${new Date().toISOString().slice(0, 10)}.csv`;
    const uri = `${FileSystem.cacheDirectory ?? FileSystem.documentDirectory ?? ""}${filename}`;
    await FileSystem.writeAsStringAsync(uri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const available = await Sharing.isAvailableAsync();
    if (available) {
      await Sharing.shareAsync(uri, {
        mimeType: "text/csv",
        dialogTitle: "Export expenses",
        UTI: "public.comma-separated-values-text",
      });
    }
    return { ok: true, uri, rowCount: rows.length };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Failed to export expenses." };
  }
}
