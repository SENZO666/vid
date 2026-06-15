// Web-only re-implementation of the queries module. On native, Metro picks
// `queries.ts` which uses expo-sqlite. On web, expo-sqlite's WebAssembly
// worker bundle fails to load through the ingress proxy, so we transparently
// fall back to an AsyncStorage-backed in-memory store with the same surface.
//
// This keeps every screen unchanged — they just import from "@/src/db/queries".

import { storage } from "../utils/storage";
import type { BadgeRow, Category, Expense, Goal, User } from "./index";

type DB = {
  users: User[];
  categories: Category[];
  expenses: Expense[];
  goals: Goal[];
  badges: BadgeRow[];
  ids: { users: number; categories: number; expenses: number; goals: number; badges: number };
};

const KEY = "bt.web.db.v1";

let _cache: DB | null = null;

async function read(): Promise<DB> {
  if (_cache) return _cache;
  const stored = await storage.getItem<string>(KEY, "");
  if (stored) {
    try {
      _cache = JSON.parse(stored) as DB;
      return _cache;
    } catch {
      /* fall through */
    }
  }
  _cache = {
    users: [],
    categories: [],
    expenses: [],
    goals: [],
    badges: [],
    ids: { users: 0, categories: 0, expenses: 0, goals: 0, badges: 0 },
  };
  await write();
  return _cache;
}

async function write(): Promise<void> {
  if (!_cache) return;
  await storage.setItem(KEY, JSON.stringify(_cache));
}

function nextId(db: DB, table: keyof DB["ids"]): number {
  db.ids[table] += 1;
  return db.ids[table];
}

// ---------- Users ----------
export async function findUserByUsername(username: string): Promise<User | null> {
  const db = await read();
  return db.users.find((u) => u.username === username) ?? null;
}

export async function createUser(
  username: string,
  passwordHash: string,
  salt: string,
): Promise<number> {
  const db = await read();
  const id = nextId(db, "users");
  db.users.push({ id, username, passwordHash, salt });
  await write();
  return id;
}

// ---------- Categories ----------
export async function listCategories(userId: number): Promise<Category[]> {
  const db = await read();
  return db.categories
    .filter((c) => c.userId === userId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function addCategory(
  userId: number,
  name: string,
  colorHex: string,
): Promise<number> {
  const db = await read();
  const trimmed = name.trim();
  if (db.categories.some((c) => c.userId === userId && c.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new Error("A category with that name already exists.");
  }
  const id = nextId(db, "categories");
  db.categories.push({ id, userId, name: trimmed, colorHex });
  await write();
  return id;
}

export async function deleteCategory(userId: number, id: number): Promise<void> {
  const db = await read();
  db.categories = db.categories.filter((c) => !(c.userId === userId && c.id === id));
  await write();
}

// ---------- Expenses ----------
export type ExpenseInput = Omit<Expense, "id">;

export async function addExpense(input: ExpenseInput): Promise<number> {
  const db = await read();
  const id = nextId(db, "expenses");
  db.expenses.push({ id, ...input });
  await write();
  return id;
}

export async function deleteExpense(userId: number, id: number): Promise<void> {
  const db = await read();
  db.expenses = db.expenses.filter((e) => !(e.userId === userId && e.id === id));
  await write();
}

export async function getExpense(userId: number, id: number): Promise<Expense | null> {
  const db = await read();
  return db.expenses.find((e) => e.userId === userId && e.id === id) ?? null;
}

function joinCategory<T extends Expense>(db: DB, e: T) {
  const c = db.categories.find((cat) => cat.id === e.categoryId);
  return {
    ...e,
    categoryName: c?.name ?? "Uncategorised",
    categoryColor: c?.colorHex ?? "#888888",
  };
}

export async function listExpenses(
  userId: number,
  from: number,
  to: number,
): Promise<(Expense & { categoryName: string; categoryColor: string })[]> {
  const db = await read();
  return db.expenses
    .filter(
      (e) => e.userId === userId && e.dateEpochMillis >= from && e.dateEpochMillis <= to,
    )
    .map((e) => joinCategory(db, e))
    .sort((a, b) =>
      a.dateEpochMillis !== b.dateEpochMillis
        ? b.dateEpochMillis - a.dateEpochMillis
        : b.id - a.id,
    );
}

export async function grandTotal(userId: number, from: number, to: number): Promise<number> {
  const db = await read();
  return db.expenses
    .filter(
      (e) => e.userId === userId && e.dateEpochMillis >= from && e.dateEpochMillis <= to,
    )
    .reduce((acc, e) => acc + e.amount, 0);
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
  const db = await read();
  const cats = db.categories.filter((c) => c.userId === userId);
  const filteredExpenses = db.expenses.filter(
    (e) => e.userId === userId && e.dateEpochMillis >= from && e.dateEpochMillis <= to,
  );
  const totals = cats.map<CategoryTotal>((c) => {
    const matching = filteredExpenses.filter((e) => e.categoryId === c.id);
    return {
      categoryId: c.id,
      name: c.name,
      colorHex: c.colorHex,
      total: matching.reduce((acc, e) => acc + e.amount, 0),
      count: matching.length,
    };
  });
  return totals.sort((a, b) =>
    b.total !== a.total ? b.total - a.total : a.name.localeCompare(b.name),
  );
}

export async function countExpenses(userId: number): Promise<number> {
  const db = await read();
  return db.expenses.filter((e) => e.userId === userId).length;
}

export async function countCategoriesWithExpense(
  userId: number,
  from: number,
  to: number,
): Promise<number> {
  const db = await read();
  const set = new Set<number>();
  for (const e of db.expenses) {
    if (e.userId !== userId) continue;
    if (e.dateEpochMillis < from || e.dateEpochMillis > to) continue;
    set.add(e.categoryId);
  }
  return set.size;
}

export async function distinctActiveDays(
  userId: number,
  from: number,
  to: number,
): Promise<number[]> {
  const db = await read();
  const days = new Set<number>();
  for (const e of db.expenses) {
    if (e.userId !== userId) continue;
    if (e.dateEpochMillis < from || e.dateEpochMillis > to) continue;
    days.add(Math.floor(e.dateEpochMillis / 86_400_000));
  }
  return Array.from(days).sort((a, b) => a - b);
}

// ---------- Recurring ----------
export async function listRecurringTemplates(userId: number): Promise<
  (Expense & { categoryName: string; categoryColor: string })[]
> {
  const db = await read();
  const seen = new Set<string>();
  const out: (Expense & { categoryName: string; categoryColor: string })[] = [];
  for (const e of db.expenses) {
    if (e.userId !== userId || !e.isRecurring) continue;
    const key = `${e.description}|${e.amount}|${e.categoryId}|${e.recurringDay ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(joinCategory(db, e));
  }
  return out.sort((a, b) => a.description.localeCompare(b.description));
}

// ---------- Goals ----------
export async function getGoal(userId: number): Promise<Goal | null> {
  const db = await read();
  return db.goals.find((g) => g.userId === userId) ?? null;
}

export async function upsertGoal(
  userId: number,
  minAmount: number,
  maxAmount: number,
): Promise<void> {
  const db = await read();
  const existing = db.goals.find((g) => g.userId === userId);
  if (existing) {
    existing.minAmount = minAmount;
    existing.maxAmount = maxAmount;
  } else {
    const id = nextId(db, "goals");
    db.goals.push({ id, userId, minAmount, maxAmount });
  }
  await write();
}

// ---------- Badges ----------
export async function listEarnedBadges(userId: number): Promise<BadgeRow[]> {
  const db = await read();
  return db.badges
    .filter((b) => b.userId === userId)
    .sort((a, b) => b.earnedAt - a.earnedAt);
}

export async function grantBadge(userId: number, badgeKey: string): Promise<boolean> {
  const db = await read();
  if (db.badges.some((b) => b.userId === userId && b.badgeKey === badgeKey)) {
    return false;
  }
  const id = nextId(db, "badges");
  db.badges.push({ id, userId, badgeKey, earnedAt: Date.now() });
  await write();
  return true;
}
