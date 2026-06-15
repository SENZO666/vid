# Budget Tracker — Product Requirements (Final POE)

## Summary
A fully offline, mobile-first **Expo React Native** rebuild of the OPSC6311 Part 2 Kotlin prototype
that adds the Final POE features: per-category spend graph w/ Min & Max goal lines, monthly
progress gauge, and gamification (badges). Plus two custom features — recurring expenses and CSV
export — and a full GitHub Actions CI workflow.

## Personas
- **Student / young professional in South Africa** keeping their monthly spend between a minimum
  goal (so essentials are covered) and a maximum goal (so they don't overshoot). Currency: ZAR.

## Core flows
1. **Auth** — local account: register → starter categories seeded → straight into dashboard.
   Login uses SHA-256 × 10 000 with per-user salt.
2. **Categories CRUD** — name + colour swatch, scoped per user.
3. **Add expense** — amount, description, date, start / end time, category, optional photo
   (camera or gallery), recurring monthly toggle.
4. **Expenses list** — segmented period filter (Week / Month / All time), tap → detail w/ photo.
5. **Goals** — Min + Max monthly amount with slider + numeric input.
6. **Analytics** — period selector + category bar chart with dashed Min/Max reference lines +
   3-zone monthly progress gauge.
7. **Achievements** — 10 badges (first expense, streaks, in the zone, etc).
8. **Recurring** — manage templates that auto-create monthly.
9. **CSV export** — share button on Settings.

## Non-functional
- Works **fully offline** — no backend calls, no internet permission.
- Native Android-first, also bundles cleanly for iOS / web preview.
- Passes ESLint + TypeScript + `expo export` on every push (GitHub Actions).
- Every interactive element carries a `testID` for automated testing.
- Local SQLite database via `expo-sqlite` on native; AsyncStorage-backed fallback for web preview.

## Out of scope
- Cloud sync / multi-device — explicitly offline-only.
- Push notifications — not part of the rubric.
- Sharing expenses between users.

## Future enhancements
- Encrypted SQLite via SQLCipher (currently DB is plain on-device).
- More badge tiers (50/100 expenses, year-long streak, etc).
- Multiple currency support — currently ZAR-only.
