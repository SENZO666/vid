// Typed CRUD repositories. All functions accept the current userId so that
// data is scoped per local account (same model as the Kotlin app).

import { getDB, type Category, type Expense, type Goal, type BadgeRow, type User } from "./index";

// ---------- Users ----------
export async function findUserByUsername(username: string): Promise<User | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<User>(
    "SELECT id, username, passwordHash, salt FROM users WHERE username = ?",
    username,
  );
  return row ?? null;
}

export async function createUser(
  username: string,
  passwordHash: string,
  salt: string,
): Promise<number> {
  const db = await getDB();
  const res = await db.runAsync(
    "INSERT INTO users (username, passwordHash, salt) VALUES (?, ?, ?)",
    username,
    passwordHash,
    salt,
  );
  return res.lastInsertRowId as number;
}

// ---------- Categories ----------
export async function listCategories(userId: number): Promise<Category[]> {
  const db = await getDB();
  return db.getAllAsync<Category>(
    "SELECT id, userId, name, colorHex FROM categories WHERE userId = ? ORDER BY name COLLATE NOCASE",
    userId,
  );
}

export async function addCategory(
  userId: number,
  name: string,
  colorHex: string,
): Promise<number> {
  const db = await getDB();
  const res = await db.runAsync(
    "INSERT INTO categories (userId, name, colorHex) VALUES (?, ?, ?)",
    userId,
    name.trim(),
    colorHex,
  );
  return res.lastInsertRowId as number;
}

export async function deleteCategory(userId: number, id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync("DELETE FROM categories WHERE userId = ? AND id = ?", userId, id);
}

// ---------- Expenses ----------
export type ExpenseInput = Omit<Expense, "id">;

export async function addExpense(input: ExpenseInput): Promise<number> {
  const db = await getDB();
  const res = await db.runAsync(
    `INSERT INTO expenses
       (userId, categoryId, amount, description, dateEpochMillis,
        startTimeMinutes, endTimeMinutes, photoUri, isRecurring, recurringDay)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    input.userId,
    input.categoryId,
    input.amount,
    input.description,
    input.dateEpochMillis,
    input.startTimeMinutes,
    input.endTimeMinutes,
    input.photoUri,
    input.isRecurring,
    input.recurringDay,
  );
  return res.lastInsertRowId as number;
}

export async function deleteExpense(userId: number, id: number): Promise<void> {
  const db = await getDB();
  await db.runAsync("DELETE FROM expenses WHERE userId = ? AND id = ?", userId, id);
}

export async function getExpense(userId: number, id: number): Promise<Expense | null> {
  const db = await getDB();
  const row = await db.getFirstAsync<Expense>(
    `SELECT id, userId, categoryId, amount, description, dateEpochMillis,
            startTimeMinutes, endTimeMinutes, photoUri, isRecurring, recurringDay
     FROM expenses WHERE userId = ? AND id = ?`,
    userId,
    id,
  );
  return row ?? null;
}

export async function listExpenses(
  userId: number,
  from: number,
  to: number,
): Promise<(Expense & { categoryName: string; categoryColor: string })[]> {
  const db = await getDB();
  return db.getAllAsync(
    `SELECT e.id, e.userId, e.categoryId, e.amount, e.description, e.dateEpochMillis,
            e.startTimeMinutes, e.endTimeMinutes, e.photoUri, e.isRecurring, e.recurringDay,
            COALESCE(c.name, 'Uncategorised') AS categoryName,
            COALESCE(c.colorHex, '#888888') AS categoryColor
     FROM expenses e
     LEFT JOIN categories c ON c.id = e.categoryId
     WHERE e.userId = ? AND e.dateEpochMillis BETWEEN ? AND ?
     ORDER BY e.dateEpochMillis DESC, e.id DESC`,
    userId,
    from,
    to,
  );
}

export async function grandTotal(userId: number, from: number, to: number): Promise<number> {
  const db = await getDB();
  const r = await db.getFirstAsync<{ total: number | null }>(
    "SELECT SUM(amount) AS total FROM expenses WHERE userId = ? AND dateEpochMillis BETWEEN ? AND ?",
    userId,
    from,
    to,
  );
  return r?.total ?? 0;
}

export type CategoryTotal = {
  categoryId: number;
  name: string;
  colorHex: string;
  total: number;
  count: number;
};

export async function totalsByCategory(
  userId: number,
  from: number,
  to: number,
): Promise<CategoryTotal[]> {
  const db = await getDB();
  return db.getAllAsync<CategoryTotal>(
    `SELECT c.id AS categoryId,
            c.name AS name,
            c.colorHex AS colorHex,
            COALESCE(SUM(e.amount), 0) AS total,
            COUNT(e.id) AS count
     FROM categories c
     LEFT JOIN expenses e
       ON e.categoryId = c.id
       AND e.dateEpochMillis BETWEEN ? AND ?
     WHERE c.userId = ?
     GROUP BY c.id
     ORDER BY total DESC, c.name COLLATE NOCASE`,
    from,
    to,
    userId,
  );
}

export async function countExpenses(userId: number): Promise<number> {
  const db = await getDB();
  const r = await db.getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) AS c FROM expenses WHERE userId = ?",
    userId,
  );
  return r?.c ?? 0;
}

export async function countCategoriesWithExpense(
  userId: number,
  from: number,
  to: number,
): Promise<number> {
  const db = await getDB();
  const r = await db.getFirstAsync<{ c: number }>(
    `SELECT COUNT(DISTINCT categoryId) AS c
     FROM expenses
     WHERE userId = ? AND dateEpochMillis BETWEEN ? AND ?`,
    userId,
    from,
    to,
  );
  return r?.c ?? 0;
}

export async function distinctActiveDays(
  userId: number,
  from: number,
  to: number,
): Promise<number[]> {
  const db = await getDB();
  const rows = await db.getAllAsync<{ d: number }>(
    `SELECT DISTINCT CAST(dateEpochMillis / 86400000 AS INTEGER) AS d
     FROM expenses WHERE userId = ? AND dateEpochMillis BETWEEN ? AND ?
     ORDER BY d ASC`,
    userId,
    from,
    to,
  );
  return rows.map((r) => r.d);
}

// ---------- Recurring ----------
export async function listRecurringTemplates(userId: number): Promise<
  (Expense & { categoryName: string; categoryColor: string })[]
> {
  const db = await getDB();
  return db.getAllAsync(
    `SELECT e.id, e.userId, e.categoryId, e.amount, e.description, e.dateEpochMillis,
            e.startTimeMinutes, e.endTimeMinutes, e.photoUri, e.isRecurring, e.recurringDay,
            COALESCE(c.name, 'Uncategorised') AS categoryName,
            COALESCE(c.colorHex, '#888888') AS categoryColor
     FROM expenses e
     LEFT JOIN categories c ON c.id = e.categoryId
     WHERE e.userId = ? AND e.isRecurring = 1
     GROUP BY e.description, e.amount, e.categoryId, e.recurringDay
     ORDER BY e.description COLLATE NOCASE`,
    userId,
  );
}

// ---------- Goals ----------
export async function getGoal(userId: number): Promise<Goal | null> {
  const db = await getDB();
  const r = await db.getFirstAsync<Goal>(
    "SELECT id, userId, minAmount, maxAmount FROM goals WHERE userId = ?",
    userId,
  );
  return r ?? null;
}

export async function upsertGoal(
  userId: number,
  minAmount: number,
  maxAmount: number,
): Promise<void> {
  const db = await getDB();
  const existing = await getGoal(userId);
  if (existing) {
    await db.runAsync(
      "UPDATE goals SET minAmount = ?, maxAmount = ? WHERE userId = ?",
      minAmount,
      maxAmount,
      userId,
    );
  } else {
    await db.runAsync(
      "INSERT INTO goals (userId, minAmount, maxAmount) VALUES (?, ?, ?)",
      userId,
      minAmount,
      maxAmount,
    );
  }
}

// ---------- Badges ----------
export async function listEarnedBadges(userId: number): Promise<BadgeRow[]> {
  const db = await getDB();
  return db.getAllAsync<BadgeRow>(
    "SELECT id, userId, badgeKey, earnedAt FROM badges WHERE userId = ? ORDER BY earnedAt DESC",
    userId,
  );
}

export async function grantBadge(userId: number, badgeKey: string): Promise<boolean> {
  const db = await getDB();
  try {
    await db.runAsync(
      "INSERT INTO badges (userId, badgeKey, earnedAt) VALUES (?, ?, ?)",
      userId,
      badgeKey,
      Date.now(),
    );
    return true;
  } catch {
    return false; // already had it (UNIQUE constraint)
  }
}
