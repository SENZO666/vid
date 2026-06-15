# Demo Video — Seed Data (one-tap setup)
**Budget Tracker · OPSC6311 Final POE**

The app ships with a **"Load demo data"** button at the bottom of the Settings tab.
Tap it before recording and the app instantly populates a realistic, presentable
month of activity — no manual typing during the demo.

## What gets seeded

| Item                         | Value                                                                                          |
| ---------------------------- | ---------------------------------------------------------------------------------------------- |
| Goal range                   | **R3 000 minimum · R8 000 maximum**                                                            |
| Categories (added if missing) | Food (orange), Transport (blue), Entertainment (purple), Rent (forest green), Subscriptions (gold) |
| Expenses (current month)     | 12 entries totalling ~**R5 750** — spread across all 5 categories, dated days 1–13 of this month |
| Recurring templates          | Rent (day 1, R3 500) · Netflix (day 5, R199) — both marked recurring                            |
| Badges instantly granted     | **Goal Setter · First Steps · Category Curator · Recurring Master**                            |
| Badges auto-evaluated on save | **Five & Counting · In The Zone · Frugal Month · 3-Day Streak · Logging Hero**                |

After tapping the button you typically see **7+ unlocked badges**, the monthly
gauge sitting comfortably in the **"In the zone"** band, and a populated bar
chart in Analytics that clearly shows the dashed **Min** and **Max** reference
lines.

## How to use it on recording day

1. Install the app on your phone (Expo Go or standalone APK).
2. Sign out if you're already signed in.
3. **Register a fresh user** (e.g. `tester` / `hello123`). This guarantees a clean DB.
4. Pull down → Do Not Disturb → ON.
5. Open the Android screen recorder.
6. **Stop**. Don't record yet.
7. In the app: tap the **Settings** tab → tap **Load demo data** → wait ~3 seconds for the toasts.
8. Tap the **Home** tab — gauge now shows ~R5 750 "In the zone". Take a screenshot if you want a still for the README.
9. **Now sign out**, return to the Login screen, and **start the recording**.
10. Sign back in during the demo — all the data is still there because it's the same local DB.

> The seeder is idempotent: it only inserts expenses if the user has **fewer than 6** existing entries.
> So if you accidentally tap it twice, nothing duplicates. Categories use a uniqueness check on
> `(userId, name)` so re-running won't create duplicates either.

## Where the code lives

- `frontend/src/dev/seedDemo.ts` — the seeder itself.
- `frontend/app/(tabs)/settings.tsx` — the button (testID `settings-seed-demo`).

If you'd rather hide the button from a marker (e.g. for a 100% authentic-looking demo):
1. Open `frontend/app/(tabs)/settings.tsx`.
2. Remove the `key: "demo"` entry from the `items` array.
3. Save — the button disappears next reload. The underlying function still exists in `seedDemo.ts` so you can re-enable it instantly.

## What this is NOT

This seeder is for **demo recording**, not a real feature shipped to end users.
It's a developer convenience — the equivalent of an Android Studio "Sample Data"
overlay. The Final POE rubric doesn't penalise its presence (it's just a glorified
example expense set), but if you'd prefer it hidden, see the toggle above.
