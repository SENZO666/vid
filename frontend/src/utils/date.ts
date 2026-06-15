// Date helpers — mirrors DateUtils.kt from the original Kotlin app.

export function firstOfThisMonth(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0).getTime();
}

export function endOfToday(): number {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
}

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0).getTime();
}

export function endOfDay(ts: number): number {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999).getTime();
}

export function daysAgo(n: number): number {
  return startOfDay(Date.now() - n * 24 * 60 * 60 * 1000);
}

export function formatDate(ts: number, withTime = false): string {
  if (!ts) return "—";
  const d = new Date(ts);
  const date = d.toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
  if (!withTime) return date;
  return `${date} • ${d.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" })}`;
}

export function minutesToHHmm(mins: number): string {
  const safe = Math.max(0, Math.min(1439, Math.floor(mins)));
  const h = Math.floor(safe / 60);
  const m = safe % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function hhmmToMinutes(hh: number, mm: number): number {
  return Math.max(0, Math.min(1439, hh * 60 + mm));
}

export function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function monthLabel(ts: number): string {
  return new Date(ts).toLocaleDateString("en-ZA", { month: "long", year: "numeric" });
}
