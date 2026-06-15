# Demo Video — Shot List / Storyboard
**Budget Tracker · OPSC6311 Final POE**
**Target length: ~3 minutes**

Every row is one "shot" — a continuous take with no edit cut.
Tap the listed targets, wait for the visible result, then move on.
Captions are the **on-screen text overlay** to add later in OBS / your editor.

> Tip: enable **Developer Options → Pointer location** on Android so your taps show
> up as a small dot in the recording — markers make the video much more
> watchable.

| # | Time     | Shot                                                                | Voice section | Action                                                                                                                                            | On-screen caption                                  |
| - | -------- | ------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| 1 | 0:00     | App icon on launcher                                                | §1            | Tap the **Budget Tracker** icon, let splash show, land on Login                                                                                  | **Budget Tracker — Final POE Demo**                |
| 2 | 0:18     | Login screen                                                         | §2            | Tap **Create an account**                                                                                                                         | *Tap "Create an account"*                          |
| 3 | 0:21     | Register screen                                                      | §2            | Type **tester** → Tab to password → Type **hello123** → Tap **Create account**                                                                    | *Local-only auth · no internet*                    |
| 4 | 0:28     | Dashboard (empty)                                                    | §2 → §3       | Pause 1s on the "Set a goal" placeholder card                                                                                                     | *Offline · SQLite on-device*                       |
| 5 | 0:30     | Goals screen                                                         | §3            | Tap **Goals** quick-link → Drag **Min** slider to ~R3 000 → Tap **Max** input → type **8000** → Tap **Save goals**                                | *Min R3 000 · Max R8 000*                          |
| 6 | 0:43     | Toast "Goal Setter" + Home                                          | §3            | Wait for "Goals saved" + "Badge unlocked: Goal Setter" toasts → Back to Home (chevron-left)                                                       | *Badge: Goal Setter*                               |
| 7 | 0:45     | Add Expense tab                                                      | §4            | Tap centre **+** tab in bottom bar                                                                                                                | *Add an expense*                                   |
| 8 | 0:47     | Add Expense form                                                     | §4            | Type **320** in Amount → Type **Petrol** in Description → Tap **Category** → tap **Transport** → Tap **End time** → arrows to 18:00 → Apply       | *Amount · Category · Time*                         |
| 9 | 1:00     | Photo capture                                                        | §4            | Tap **Take photo** → grant Camera permission (only first time) → snap → photo preview appears                                                     | *Camera permission asked once*                     |
| 10| 1:06     | Recurring toggle                                                     | §4            | Flip **Recurring monthly** ON → Tap **Save expense**                                                                                              | **Custom feature #1 — Recurring expenses**         |
| 11| 1:10     | Settings → seed demo                                                 | §5            | Tap **Settings** tab (bottom right) → tap **Load demo data** → wait for "Seeded 12 demo expenses" toast (4–5s, multiple badge toasts will fire)   | *One-tap demo data*                                |
| 12| 1:20     | Home tab — gauge filled                                              | §5            | Tap **Home** tab → pause on the monthly progress gauge showing **In the zone** at ~R5 750                                                         | *Monthly progress — "In the zone"*                 |
| 13| 1:35     | Analytics tab — chart with goal lines                                | §6            | Tap **Analytics** tab → wait for chart to render → point cursor (or thumb) at the **Min** and **Max** dashed lines                                | **Rubric: Spend per category with Min/Max goals**  |
| 14| 1:50     | Analytics — period selector                                          | §6            | Tap **Week** → pause 1s → tap **Month** → pause 1s → tap **YTD** → pause 1s                                                                       | *User-selectable period*                           |
| 15| 2:00     | Analytics — scroll to totals                                         | §6            | Swipe up to reveal **Category totals** list                                                                                                       | *Sorted by spend*                                  |
| 16| 2:05     | Rewards screen                                                       | §7            | Tap **Home** tab → tap **🏆** icon (top right) **or** Settings → Achievements → scroll grid                                                       | **Gamification — 10 unlockable badges**            |
| 17| 2:25     | Settings → Export to CSV                                             | §8            | Tap **Settings** → tap **Export to CSV** → native Android share sheet opens                                                                       | **Custom feature #2 — CSV export & share**         |
| 18| 2:40     | Close share sheet                                                    | §8            | Tap back / dismiss → return to Settings                                                                                                           | (no caption)                                       |
| 19| 2:45     | Sign out & sign back in                                              | §8            | Tap **Sign out** → on Login type **tester** / **hello123** → tap **Sign in** → land on Dashboard with all data intact                              | *Data persists locally*                            |
| 20| 2:58     | Fade out                                                             | §8            | Hold on Dashboard for 2 seconds, fade to black                                                                                                    | **Khumela Sendelani · ST10436040 · OPSC6311**      |

---

## Re-shoot rules (so you don't have to redo the whole thing)

If a single shot goes wrong, **don't restart**. Just:

1. Pause the recording in OBS / phone recorder.
2. Reset the screen to the **starting state of that row** (e.g. for shot 7, get back to Home).
3. Resume recording — leave a 2-second buffer of silence so you can splice cleanly later.

Only shots **5, 9, 10, 11** depend on a fresh user account. If you mess one of those up:
- Sign out (Settings → Sign out)
- Register a new account (`tester2`, `tester3`, etc.)
- Re-run **Load demo data** to get back to a populated state
- Re-shoot from the top of that scene

---

## Camera framing

- Hold the phone **vertically** — both Android screen recording and Expo Router default to portrait, so anything else introduces ugly black bars.
- Reduce screen brightness to 70%-ish for a calmer-looking recording.
- Turn on **Do Not Disturb** before you start so no notifications cut across your demo.
- Disable any battery / time / status-bar widgets that show personal data.
