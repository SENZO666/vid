// Gamification engine — defines badges the user can earn, plus an evaluator that
// reads the current DB state and grants any newly-qualifying badges.
//
// All badge keys are stable; once a badge is in the DB it stays.

import {
  countExpenses,
  distinctActiveDays,
  getGoal,
  grandTotal,
  grantBadge,
  listEarnedBadges,
} from "../db/queries";
import { daysAgo, firstOfThisMonth, endOfToday } from "../utils/date";

export type Badge = {
  key: string;
  label: string;
  description: string;
  icon: string; // Ionicons name
  tint: string;
};

export const BADGES: Badge[] = [
  {
    key: "first_steps",
    label: "First Steps",
    description: "Log your first expense.",
    icon: "footsteps",
    tint: "#48826C",
  },
  {
    key: "five_logged",
    label: "Five & Counting",
    description: "Log 5 expenses.",
    icon: "checkmark-done",
    tint: "#6EA4D8",
  },
  {
    key: "twenty_five_logged",
    label: "Quarter Century",
    description: "Log 25 expenses.",
    icon: "ribbon",
    tint: "#D8AC6A",
  },
  {
    key: "category_curator",
    label: "Category Curator",
    description: "Add at least 3 categories.",
    icon: "albums",
    tint: "#A58BA8",
  },
  {
    key: "goal_setter",
    label: "Goal Setter",
    description: "Set your monthly minimum and maximum goals.",
    icon: "flag",
    tint: "#2C5545",
  },
  {
    key: "in_the_zone",
    label: "In The Zone",
    description: "Stay between your min and max spending goal for the month.",
    icon: "trending-up",
    tint: "#48826C",
  },
  {
    key: "frugal_month",
    label: "Frugal Month",
    description: "Stay below your maximum spending goal for the month.",
    icon: "leaf",
    tint: "#8BA89D",
  },
  {
    key: "streak_3",
    label: "3-Day Streak",
    description: "Log expenses on 3 different days in a week.",
    icon: "flame",
    tint: "#D87E6A",
  },
  {
    key: "streak_7",
    label: "Logging Hero",
    description: "Log expenses on 7 different days in a month.",
    icon: "trophy",
    tint: "#E9B949",
  },
  {
    key: "recurring_master",
    label: "Recurring Master",
    description: "Create your first recurring expense.",
    icon: "repeat",
    tint: "#6EA4D8",
  },
];

/**
 * Evaluate the user's stats and grant any badges they qualify for that
 * haven't been earned yet. Returns the list of badges newly granted in
 * this run (so the UI can surface a "Badge unlocked!" toast).
 */
export async function evaluateBadges(
  userId: number,
  ctx: {
    categoryCount: number;
    recurringCount: number;
  },
): Promise<Badge[]> {
  const earned = new Set((await listEarnedBadges(userId)).map((b) => b.badgeKey));
  const granted: Badge[] = [];

  const tryGrant = async (key: string) => {
    if (earned.has(key)) return;
    const ok = await grantBadge(userId, key);
    if (ok) {
      const def = BADGES.find((b) => b.key === key);
      if (def) granted.push(def);
    }
  };

  const total = await countExpenses(userId);
  if (total >= 1) await tryGrant("first_steps");
  if (total >= 5) await tryGrant("five_logged");
  if (total >= 25) await tryGrant("twenty_five_logged");
  if (ctx.categoryCount >= 3) await tryGrant("category_curator");
  if (ctx.recurringCount >= 1) await tryGrant("recurring_master");

  const goal = await getGoal(userId);
  if (goal && goal.minAmount >= 0 && goal.maxAmount > 0) {
    await tryGrant("goal_setter");
    const spentMonth = await grandTotal(userId, firstOfThisMonth(), endOfToday());
    if (spentMonth >= goal.minAmount && spentMonth <= goal.maxAmount) {
      await tryGrant("in_the_zone");
    }
    if (spentMonth <= goal.maxAmount && spentMonth > 0) {
      await tryGrant("frugal_month");
    }
  }

  const daysThisWeek = await distinctActiveDays(userId, daysAgo(6), endOfToday());
  if (daysThisWeek.length >= 3) await tryGrant("streak_3");
  const daysThisMonth = await distinctActiveDays(userId, firstOfThisMonth(), endOfToday());
  if (daysThisMonth.length >= 7) await tryGrant("streak_7");

  return granted;
}
