// Web equivalent of `materialize.ts` — uses the AsyncStorage-backed queries
// instead of the SQLite handle.

import { addExpense, listExpenses, listRecurringTemplates } from "../db/queries";

export async function materializeRecurring(userId: number): Promise<number> {
  const templates = await listRecurringTemplates(userId);
  if (templates.length === 0) return 0;
  const now = new Date();
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

      if (occurrenceTs > Date.now()) {
        cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
        continue;
      }

      const isOriginalMonth =
        cursor.getFullYear() === startDate.getFullYear() &&
        cursor.getMonth() === startDate.getMonth();

      if (!isOriginalMonth) {
        const monthExpenses = await listExpenses(userId, monthStart, monthEnd);
        const dup = monthExpenses.find(
          (e) =>
            e.categoryId === t.categoryId &&
            e.description === t.description &&
            e.amount === t.amount,
        );
        if (!dup) {
          await addExpense({
            userId,
            categoryId: t.categoryId,
            amount: t.amount,
            description: t.description,
            dateEpochMillis: occurrenceTs,
            startTimeMinutes: t.startTimeMinutes,
            endTimeMinutes: t.endTimeMinutes,
            photoUri: null,
            isRecurring: 0,
            recurringDay: null,
          });
          created++;
        }
      }

      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
  }
  return created;
}
