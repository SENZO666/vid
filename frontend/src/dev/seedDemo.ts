// Demo-data seeder. One-tap population of the app with a realistic month so
// the gauge, charts, and several badges look great on-camera.
//
// Triggered from Settings → "Load demo data". Idempotent enough — it tops up
// missing categories and only inserts expenses if there are fewer than 6
// already in the current month (so the seeder doesn't keep stacking).

import {
  addCategory,
  addExpense,
  countExpenses,
  grantBadge,
  listCategories,
  listEarnedBadges,
  upsertGoal,
} from "../db/queries";

const DEMO_CATEGORIES: { name: string; colorHex: string }[] = [
  { name: "Food", colorHex: "#D87E6A" },
  { name: "Transport", colorHex: "#6EA4D8" },
  { name: "Entertainment", colorHex: "#A58BA8" },
  { name: "Rent", colorHex: "#2C5545" },
  { name: "Subscriptions", colorHex: "#D8AC6A" },
];

// Recipe-style expense plan: amount, description, day-of-month, categoryName,
// optional recurring + recurringDay. We pin everything to the CURRENT month
// so the "This month" gauge always tells the full story on-camera regardless
// of when this is run.
const PLAN: {
  amount: number;
  description: string;
  dayOfMonth: number; // 1 = 1st of current month
  category: string;
  start: number;
  end: number;
  recurring?: boolean;
  recurringDay?: number;
}[] = [
  // Rent — chunky recurring on day 1
  { amount: 3500, description: "Monthly rent", dayOfMonth: 1, category: "Rent", start: 540, end: 600, recurring: true, recurringDay: 1 },
  // Subscriptions — recurring on day 5
  { amount: 199, description: "Netflix subscription", dayOfMonth: 5, category: "Subscriptions", start: 1140, end: 1200, recurring: true, recurringDay: 5 },
  // Food, scattered
  { amount: 245, description: "Pick n Pay groceries", dayOfMonth: 3,  category: "Food", start: 600, end: 660 },
  { amount: 89,  description: "Coffee with Lerato",  dayOfMonth: 6,  category: "Food", start: 540, end: 570 },
  { amount: 138, description: "Woolies lunch",       dayOfMonth: 8,  category: "Food", start: 720, end: 750 },
  { amount: 412, description: "Big shop",            dayOfMonth: 11, category: "Food", start: 660, end: 720 },
  { amount: 56,  description: "Bakery",              dayOfMonth: 13, category: "Food", start: 510, end: 540 },
  // Transport
  { amount: 320, description: "Petrol",         dayOfMonth: 2,  category: "Transport", start: 510, end: 540 },
  { amount: 75,  description: "Uber to campus", dayOfMonth: 7,  category: "Transport", start: 480, end: 510 },
  { amount: 320, description: "Petrol",         dayOfMonth: 12, category: "Transport", start: 1020, end: 1050 },
  // Entertainment
  { amount: 180, description: "Cinema night",     dayOfMonth: 4,  category: "Entertainment", start: 1140, end: 1290 },
  { amount: 220, description: "Concert tickets",  dayOfMonth: 10, category: "Entertainment", start: 1080, end: 1170 },
];

function dayOfMonthTs(day: number): number {
  const now = new Date();
  const safeDay = Math.min(day, now.getDate()); // never future
  return new Date(now.getFullYear(), now.getMonth(), safeDay, 12, 0, 0, 0).getTime();
}

export async function seedDemo(userId: number): Promise<{ added: number; goalSet: boolean }> {
  // 1) Top up categories.
  const existing = await listCategories(userId);
  const byName = new Map(existing.map((c) => [c.name.toLowerCase(), c]));
  for (const dc of DEMO_CATEGORIES) {
    if (!byName.has(dc.name.toLowerCase())) {
      try {
        await addCategory(userId, dc.name, dc.colorHex);
      } catch {
        /* duplicate race — ignore */
      }
    }
  }
  const cats = await listCategories(userId);
  const catByName = new Map(cats.map((c) => [c.name.toLowerCase(), c]));

  // 2) Set a nice on-camera goal range.
  await upsertGoal(userId, 3000, 8000);

  // 3) Skip topping up expenses if the user already has plenty.
  const totalExpenses = await countExpenses(userId);
  let added = 0;
  if (totalExpenses < 6) {
    for (const p of PLAN) {
      const cat = catByName.get(p.category.toLowerCase());
      if (!cat) continue;
      await addExpense({
        userId,
        categoryId: cat.id,
        amount: p.amount,
        description: p.description,
        dateEpochMillis: dayOfMonthTs(p.dayOfMonth),
        startTimeMinutes: p.start,
        endTimeMinutes: p.end,
        photoUri: null,
        isRecurring: p.recurring ? 1 : 0,
        recurringDay: p.recurring ? (p.recurringDay ?? null) : null,
      });
      added++;
    }
  }

  // 4) Grant a couple of badges that need explicit grants (most evaluate on
  //    every dashboard mount; this just speeds up the camera moment).
  const earned = new Set((await listEarnedBadges(userId)).map((b) => b.badgeKey));
  for (const key of ["goal_setter", "first_steps", "category_curator", "recurring_master"]) {
    if (!earned.has(key)) await grantBadge(userId, key);
  }

  return { added, goalSet: true };
}
