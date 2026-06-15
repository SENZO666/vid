// Local offline database for the Budget Tracker.
//
// Mirrors the Room schema from the original Kotlin app:
//   users(id, username, passwordHash, salt)
//   categories(id, userId, name, colorHex)
//   expenses(id, userId, categoryId, amount, description, dateEpochMillis,
//            startTimeMinutes, endTimeMinutes, photoUri, isRecurring, recurringDay)
//   goals(userId UNIQUE, minAmount, maxAmount)
//   badges(userId, badgeKey, earnedAt UNIQUE per (userId, badgeKey))
//
// We use expo-sqlite synchronous API where possible — it's faster and avoids
// stale closures on multi-statement migrations.

import * as SQLite from "expo-sqlite";

const DB_NAME = "budget_tracker.db";

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;
  _db = await SQLite.openDatabaseAsync(DB_NAME);
  await migrate(_db);
  return _db;
}

async function migrate(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      passwordHash TEXT NOT NULL,
      salt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      name TEXT NOT NULL,
      colorHex TEXT NOT NULL DEFAULT '#2C5545',
      UNIQUE(userId, name)
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      categoryId INTEGER NOT NULL,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      dateEpochMillis INTEGER NOT NULL,
      startTimeMinutes INTEGER NOT NULL,
      endTimeMinutes INTEGER NOT NULL,
      photoUri TEXT,
      isRecurring INTEGER NOT NULL DEFAULT 0,
      recurringDay INTEGER
    );

    CREATE INDEX IF NOT EXISTS idx_exp_user_date ON expenses(userId, dateEpochMillis);
    CREATE INDEX IF NOT EXISTS idx_exp_cat ON expenses(categoryId);

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL UNIQUE,
      minAmount REAL NOT NULL,
      maxAmount REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      badgeKey TEXT NOT NULL,
      earnedAt INTEGER NOT NULL,
      UNIQUE(userId, badgeKey)
    );
  `);
}

/** Domain types — mirror Kotlin Entities.kt */
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
