// Currency formatting helpers for ZAR (South African Rand).
// Matches the rubric's use of NumberFormat in the original Kotlin code.

export function formatZAR(amount: number): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  // Intl.NumberFormat with ZAR locale renders as "R 1 234.56" — exactly what
  // the IIE Kotlin reference uses.
  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safe);
  } catch {
    return `R ${safe.toFixed(2)}`;
  }
}

export function parseAmountInput(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}
