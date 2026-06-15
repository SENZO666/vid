// Web stub for the DB module. The native version (`./index.ts`) opens an
// expo-sqlite database, but on web we use queries.web.ts which is backed by
// AsyncStorage — so the only export we need here is the shared type set.

export type User = { id: number; username: string; passwordHash: string; salt: string };
export type Category = { id: number; userId: number; name: string; colorHex: string };
export type Expense = {
  id: number;
  userId: number;
  categoryId: number;
  amount: number;
  description: string;
  dateEpochMillis: number;
  startTimeMinutes: number;
  endTimeMinutes: number;
  photoUri: string | null;
  isRecurring: number;
  recurringDay: number | null;
};
export type Goal = { id: number; userId: number; minAmount: number; maxAmount: number };
export type BadgeRow = { id: number; userId: number; badgeKey: string; earnedAt: number };

export async function getDB(): Promise<null> {
  // Web build never needs the underlying handle — queries.web.ts handles it.
  return null;
}
