// Recurring expense materializer.
//
// Behaviour:
//   - An expense flagged `isRecurring = 1` acts as a template.
//   - Each unique (description + amount + categoryId + recurringDay) combo is
//     materialised once per calendar month, on the chosen "recurringDay" (1-28
//     to dodge short months).
//   - We run on every app open + after login. Idempotent: we only insert
//     copies for months where one doesn't yet exist with the same key.
//
// This satisfies the "Custom Feature #1: Recurring expenses" requirement.

import { addExpense, listRecurringTemplates } from "../db/queries";
import { getDB } from "../db";

export async function materializeRecurring(userId: number): Promise<number> {
  const templates = await listRecurringTemplates(userId);
  if (templates.length === 0) return 0;

  const db = await getDB();
  const now = new Date();
  // We materialise for every month from the template's first occurrence up to
  // the current month. The seed template itself is left untouched.
  let created = 0;

  for (const t of templates) {
    const day = Math.min(28, Math.max(1, t.recurringDay ?? new Date(t.dateEpochMillis).getDate()));
    const startDate = new Date(t.dateEpochMillis);
    let cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);

    while (cursor.getTime() <= end.getTime()) {
      const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1).getTime();
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
      const occurrenceTs = new Date(
        cursor.getFullYear(),
        cursor.getMonth(),
        day,
        12,
        0,
        0,
        0,
      ).getTime();

      // Don't fire in the future (today's still in this month, but we don't
      // materialise an occurrence that hasn't reached its day yet).
      if (occurrenceTs > Date.now()) {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        continue;
      }

      // Skip the original template's own month – it already exists.
      const isOriginalMonth =
        cursor.getFullYear() === startDate.getFullYear() &&
        cursor.getMonth() === startDate.getMonth();

      // Has an entry with the same template signature already been created for
      // this month?
      const existing = await db.getFirstAsync<{ id: number }>(
        `SELECT id FROM expenses
         WHERE userId = ? AND categoryId = ? AND description = ? AND amount = ?
           AND dateEpochMillis BETWEEN ? AND ?`,
        userId,
        t.categoryId,
        t.description,
        t.amount,
        monthStart,
        monthEnd,
      );

      if (!existing && !isOriginalMonth) {
        await addExpense({
          userId,
          categoryId: t.categoryId,
          amount: t.amount,
          description: t.description,
          dateEpochMillis: occurrenceTs,
          startTimeMinutes: t.startTimeMinutes,
          endTimeMinutes: t.endTimeMinutes,
          photoUri: null,
          isRecurring: 0, // children are materialised, not templates
          recurringDay: null,
        });
        created++;
      }

      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  }
  return created;
}
