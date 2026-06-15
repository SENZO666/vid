# Demo Video — Voice-Over Script
**Budget Tracker · OPSC6311 Final POE · Khumela Sendelani (ST10436040)**
**Target length:** ~3 minutes (≈ 410 words at conversational pace)

> How to use this script:
> - Each section has a target duration and the **exact words** to read.
> - Lines in `[brackets]` are stage directions, do not read aloud.
> - Pause briefly between sections so video editing is easier.
> - Read at a friendly, calm pace — about 140 words per minute.
> - Recorded on a real Android phone (per the rubric), screen-recorder + OBS for audio.

---

## 🎬 SECTION 1 — Intro (0:00 – 0:18) · 18s

`[Cold open: app icon visible on Android home screen, then tap Budget Tracker]`

> "Hi, I'm Khumela Sendelani — student number S T one zero four three six zero four zero — and this is my OPSC6311 final POE submission, **Budget Tracker**. It's a fully offline Android app for personal budgeting, built with Expo and React Native. In the next three minutes I'll walk you through every feature the brief asks for, plus my two custom additions."

---

## 🎬 SECTION 2 — Sign in (0:18 – 0:30) · 12s

`[Screen: Login. Tap "Create an account", type tester, hello123, submit]`

> "Authentication is local-only — no internet, no server. Passwords are salted and hashed ten thousand times with S-H-A two-five-six, the same approach as my Part 2 Kotlin prototype. I'll create a fresh account now."

`[Land on empty Dashboard with "set a goal" placeholder]`

---

## 🎬 SECTION 3 — Set monthly goals (0:30 – 0:45) · 15s

`[Tap "Goals" quick-link from Home]`

> "First, I'll set my monthly goals. The brief asks for a minimum and maximum monthly spend — I'm setting mine between three thousand and eight thousand rand. You can use the sliders or type the exact amount."

`[Drag Min slider to ~3000, type 8000 into Max input, tap Save goals — toast: "Goals saved" + "Badge unlocked: Goal Setter"]`

> "That instantly unlocks the **Goal Setter** badge — one of ten achievements in the app."

---

## 🎬 SECTION 4 — Add an expense (0:45 – 1:10) · 25s

`[Tap centre + tab]`

> "Now let's log an expense. Three hundred and twenty rand for petrol, in the Transport category, today at five thirty PM. I'll add a photo of the receipt straight from the camera."

`[Type 320, type "Petrol", tap Category → Transport, tap Time → set 17:30/18:00, tap Take photo, allow permission, snap, save]`

> "I can also flag this as a **recurring monthly expense** — that's my first custom feature. The app will then automatically re-create this entry on the same day every month so I never forget."

`[Toggle Recurring monthly ON, tap Save expense — toast: "Expense saved" + badges]`

---

## 🎬 SECTION 5 — Seed the rest, show the gauge (1:10 – 1:35) · 25s

`[Open Settings tab, tap "Load demo data" — toast: "Seeded 12 demo expenses"]`

> "To keep the demo short, I've added a one-tap demo-data loader that pre-populates a typical month — rent, groceries, Uber, subscriptions, the lot."

`[Tap Home tab]`

> "Back on the Home dashboard, the **monthly progress gauge** answers the one question this app exists to answer: *am I spending inside the band I set for myself?* The marker sits clearly in the **green** zone — under-min on the left, on-track in the middle, over-max on the right. Right now I'm at five thousand seven hundred rand — comfortably in the zone."

---

## 🎬 SECTION 6 — Analytics + the rubric chart (1:35 – 2:05) · 30s

`[Tap Analytics tab]`

> "The Analytics tab has the graph the rubric specifically asks for: **amount spent per category** over a **user-selectable period**, with the **minimum and maximum goals** shown as the two dashed reference lines."

`[Tap Period segmented: Week → Month → YTD]`

> "I can change the period from week to month to year-to-date — the bars and the dashed Min and Max lines re-scale automatically."

`[Scroll down to show category totals]`

> "Below the chart is a sorted breakdown by category — rent is the biggest at three and a half thousand, followed by food, transport, and entertainment."

---

## 🎬 SECTION 7 — Gamification (2:05 – 2:25) · 20s

`[Tap Home → trophy icon top-right OR Settings → Achievements]`

> "The rubric asks for gamification — the app has **ten unlockable badges** for things like logging your first expense, hitting your goal range, three-day and seven-day streaks, and creating your first recurring template. Earned badges are coloured; locked ones show a padlock. Every time I save an expense or change my goals, the engine re-evaluates and pops a toast for anything new."

---

## 🎬 SECTION 8 — Second custom feature + close (2:25 – 3:00) · 35s

`[Tap Settings tab → Export to CSV — share sheet opens]`

> "My second custom feature is **CSV export**. The app writes every expense — date, time, category, amount, recurring flag — into a comma-separated file and opens the native Android share sheet, so I can drop it into WhatsApp, Gmail, or Google Drive. Useful for end-of-year reconciliation."

`[Close share sheet, return to Settings, tap Sign out → land on Login]`

> "And finally, sign out — and because everything is stored on-device, all my data is still here when I sign back in."

`[Sign in again with the same credentials → all data preserved → Dashboard]`

> "That's Budget Tracker — every Final POE requirement, two custom features, gamification, and an automated GitHub Actions pipeline that builds the Android export on every push. Thanks for watching."

`[Fade out on Dashboard, then black]`

---

## Vocal delivery cheat-sheet

| Tone target           | How to hit it                                                      |
| --------------------- | ------------------------------------------------------------------ |
| Warm, not robotic     | Smile slightly while reading — it changes your tone audibly.       |
| Steady pace           | 140 wpm = one comfortable breath per sentence.                     |
| Clear consonants      | "Bud-get **Track**-er", "**Re**-curr-ing", "**Gam**-i-fi-cation".    |
| Brand pronunciation   | "**Expo**" /ɛkspoʊ/, "**React Native**", "**SHA two-five-six**".    |
| Numbers as words      | "three thousand to eight thousand rand", **not** "R3 000 – R8 000". |
| Pause on cuts         | Take a half-second of silence at every section boundary — gives the editor an easy splice point. |

If you need to re-record a single section, just match the timing in the table at the top
— the rest of the audio still aligns.
