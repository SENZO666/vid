# Budget Tracker (OPSC6311 — Final POE)

**Module:** OPSC6311 — Open Source Coding B  
**Assessment:** Portfolio of Evidence (Part 3 — Final App Development)  
**Author:** Khumela Sendelani  
**Student number:** ST10436040

A polished, **fully offline** mobile budget tracker built with **Expo (React Native)** and **expo-sqlite**.
Users sign in locally, log expenses (with optional photos), set monthly minimum / maximum spending goals,
and unlock badges as they hit milestones. The Final POE adds:

- A **bar chart of spend per category** for a user-selectable period, with **dashed reference lines for the Min and Max monthly goals**;
- A **visual gauge of how you're doing against your monthly goals** (under-min ➜ in-the-zone ➜ over-max);
- **Gamification** — 10 achievement badges that unlock for first-time logging, streaks, staying inside the goal range, and more;
- Two custom features documented below: **Recurring expenses** and **CSV export**.

The original Kotlin / Android Studio Part 2 prototype is preserved in `/kotlin-original/` for reference.

> Built and demonstrated on Android. The app runs entirely on-device — no backend, no internet, no
> tracking. All data is stored in a local SQLite database (`budget_tracker.db`).

---

## Table of contents

1. [Purpose & key features](#1-purpose--key-features)
2. [Screens](#2-screens)
3. [Final POE requirements coverage](#3-final-poe-requirements-coverage)
4. [Custom features (lecturer — look here)](#4-custom-features-lecturer--look-here)
5. [Design considerations](#5-design-considerations)
6. [Tech stack](#6-tech-stack)
7. [Project structure](#7-project-structure)
8. [Running locally](#8-running-locally)
9. [Building on a physical phone](#9-building-on-a-physical-phone)
10. [Automated testing & GitHub Actions](#10-automated-testing--github-actions)
11. [App icon & assets](#11-app-icon--assets)
12. [Acknowledgements](#12-acknowledgements)

---

## 1. Purpose & key features

Budget Tracker exists to help a student or young professional answer one question every month —
**"am I spending inside the band I set for myself?"** It does that by being:

- **Offline-first**: no account servers, no sync delay, no internet permission requested.
- **Glanceable**: the Home tab tells you at a glance where you sit between your Min and Max goal.
- **Encouraging not punishing**: gamification rewards consistency, not shaming overspending.
- **Trustworthy with your data**: passwords are hashed with a per-user salt over 10 000 SHA-256 iterations (mirrors the original Kotlin `PasswordHasher`), and all expense data lives on the device only.

| Feature                          | Where to find it                          |
| -------------------------------- | ----------------------------------------- |
| Local username + password auth   | Login / Register                          |
| Categories CRUD                  | Home → Categories                         |
| Add expense w/ photo & recurring | Centre `+` tab                            |
| Filter expenses by period        | Expenses tab → segmented header           |
| Tap expense → full detail        | Expense detail screen                     |
| Per-category spend with goals    | Analytics tab → bar chart                 |
| Monthly progress against goals   | Home + Analytics → 3-zone gauge           |
| Min / Max goals (slider + input) | Home → Goals                              |
| 10 unlockable badges             | Home → 🏆 / Settings → Achievements       |
| Recurring monthly expenses       | Add screen → toggle / Settings → Recurring|
| CSV export of all expenses       | Settings → Export to CSV                  |
| Sign out                         | Settings → Sign out                       |

---

## 2. Screens

- **Login & Register** — local accounts, no internet.
- **Dashboard (Home)** — greeting, monthly gauge, quick links, recent badges, recent expenses.
- **Expenses** — segmented date filter (Week / Month / All time), tap row to see detail + photo.
- **Add Expense** — amount, description, date, start / end time, category, recurring toggle, photo (camera or gallery).
- **Analytics** — selectable period (Week / Month / YTD / All), category bar chart with **dashed Min / Max reference lines**, category totals list.
- **Categories** — list + add new with name + colour swatches.
- **Goals** — Min and Max monthly spend, slider + numeric inputs, formatted preview.
- **Achievements (Rewards)** — full badge grid with unlocked vs locked state and earned-at timestamps.
- **Recurring** — manage automatic monthly expenses.
- **Settings** — profile, manage categories / goals / recurring, achievements, CSV export, sign out.
- **Expense detail** — full record with photo preview + delete.

---

## 3. Final POE requirements coverage

| Rubric line                                                                                                                          | How it's implemented                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| *"The user must be able to view a graph showing the amount spent per category over a user-selectable period."*                       | Analytics tab → `CategoryBarChart` (SVG, `react-native-svg`). Period selectable via Week / Month / YTD / All segmented control.                                                   |
| *"The graph must also display the minimum and maximum goals."*                                                                       | The bar chart renders two dashed reference lines labelled **MIN** (primary green) and **MAX** (red) at the user's goal levels.                                                    |
| *"The app must display in a visual format how well the user is doing with staying between their minimum and maximum spending goals."* | `MonthlyProgressGauge` — a three-zone horizontal bar (Under min ➜ In the zone ➜ Over max), with a marker showing where the user's total currently sits. Appears on Home + Analytics. |
| *"Gamification elements such as rewards or badges for meeting budget goals or consistent expense logging."*                          | Ten badges in `src/gamification/badges.ts`. Evaluated on every dashboard load / expense save / goal save. Toast pops when a new one unlocks.                                       |
| *"Apply event handling in an app."*                                                                                                  | Press, change, switch, swipe (gauge slider via `PanResponder`), pull-to-refresh, segmented control, photo picker callbacks. Every interactive element is wired through React events. |
| *"Create an activity."*                                                                                                              | Each Expo Router file inside `app/` is its own self-contained screen (the React Native equivalent of an Android Activity). 13 of them, including the Add, Detail, Goals, Rewards, Recurring, Settings, etc. |
| *"Integrate gamification into an app."*                                                                                              | See the Rewards screen + dashboard chips + post-save toasts.                                                                                                                       |

---

## 4. Custom features (lecturer — look here)

Two completely original features in addition to the rubric:

### Custom Feature #1 — Recurring monthly expenses

Tick **"Recurring monthly"** when logging an expense. The app stores the template and an automatic
materialiser (`src/recurring/materialize.ts`) runs on every app launch, copying the template forward
to each new month on the same calendar day. The Recurring screen lists every template so you can see
what's scheduled. Idempotent — re-running never creates duplicates for the same `(description, amount,
category, day)` key in a given month.

### Custom Feature #2 — CSV export & share

**Settings → Export to CSV** writes every expense (Date, Start, End, Category, Description, Amount,
Recurring?) into a `budget-tracker-YYYY-MM-DD.csv` file in the app's cache directory and then opens
the native share sheet (Gmail, WhatsApp, Drive, etc.) via `expo-sharing`. Handy if you want to
process your data in Excel / Google Sheets, or just keep a record off-device.

---

## 5. Design considerations

The design language is intentionally **earthy and grounded** — not the default fintech "purple-on-white"
slop. Choices documented in `design_guidelines.json` and applied throughout:

- **Primary `#2C5545`** (forest green) — calm, financial-but-not-corporate.
- **Accent `#D87E6A`** (terracotta) — celebrates achievement, used for badges & rewards.
- **Typography** — system font stack with strong hierarchy (`h1` 30/700, `h2` 22/600, `body` 15/400, `overline` 11/700 uppercase tracked +1.6).
- **8pt spacing scale** — every padding/margin is a multiple of 4 / 8 / 16 / 24.
- **Touch targets ≥ 44pt** — buttons are 48 minimum, inputs 48 minimum.
- **Bottom tab nav (5 tabs max)** — Home, Expenses, **+ FAB** (Add), Analytics, Settings — the Add tab is a circular primary-coloured FAB, never confused with the others.
- **SafeArea everywhere** — `react-native-safe-area-context` wraps every screen; the tab bar pads itself by `insets.bottom` so nothing hides behind it.
- **Toasts not Alerts** — every confirmation / error uses an in-app toast that mounts above tabs (`<ToastProvider />` at the root layout).
- **Charts** — built with `react-native-svg` rather than recharts so they render natively on Android and iOS. Goal reference lines are dashed (6/4 dash array) and labelled `MIN` / `MAX` directly on the line.

UI also follows the IIE feedback from Part 2: clearer hierarchy in the dashboard, more breathing room
between cards, and a single primary action per screen.

---

## 6. Tech stack

| Concern               | Choice                                                                                       |
| --------------------- | -------------------------------------------------------------------------------------------- |
| Framework             | Expo SDK 54, React Native 0.81                                                               |
| Navigation            | `expo-router` (file-based) — `_layout.tsx` files compose the navigator tree                  |
| Local DB              | `expo-sqlite` (WAL mode, foreign keys ON)                                                    |
| Auth & password hash  | `expo-crypto` SHA-256 × 10 000 iterations + per-user salt                                    |
| Session persistence   | `@react-native-async-storage/async-storage` via `@/src/utils/storage`                        |
| Photos                | `expo-image-picker` (camera + gallery), images stored as base64 strings                      |
| Charts                | `react-native-svg`                                                                           |
| CSV export & share    | `expo-file-system` + `expo-sharing`                                                          |
| Web fallback (dev)    | AsyncStorage-backed `queries.web.ts` so the app boots fully on Metro's web preview          |
| Linting               | `eslint-config-expo`                                                                         |

---

## 7. Project structure

```
.
├── BudgetTracker/              # NOTE: kept for marker reference — the original Kotlin prototype
│                               # also lives in /kotlin-original/ in this repo
├── frontend/                   # The Expo Final POE app
│   ├── app/                    # All routes (file-based)
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # auth gate
│   │   ├── (auth)/             # login, register
│   │   ├── (tabs)/             # bottom tabs (home, expenses, add, analytics, settings)
│   │   ├── categories.tsx
│   │   ├── goals.tsx
│   │   ├── rewards.tsx
│   │   ├── recurring.tsx
│   │   └── expense/[id].tsx    # expense detail
│   ├── src/
│   │   ├── auth/               # context + local password hash
│   │   ├── components/         # reusable UI (PrimaryButton, Field, Toast, charts, etc.)
│   │   ├── db/                 # schema + typed queries (native + web fallback)
│   │   ├── export/             # CSV exporter
│   │   ├── gamification/       # badge definitions + evaluator
│   │   ├── recurring/          # materialiser for recurring templates
│   │   ├── theme.ts            # design tokens
│   │   └── utils/              # currency, date, storage helpers
│   ├── app.json                # Expo config + Android/iOS permissions
│   ├── eslint.config.js
│   └── package.json
├── kotlin-original/            # Kotlin / Android Studio prototype from Part 2 (preserved)
├── backend/                    # FastAPI scaffold (not used — app is offline)
└── .github/workflows/expo-ci.yml  # automated lint + Android build on every push
```

---

## 8. Running locally

Requirements: **Node 18+** and **Yarn 1**. Then:

```bash
cd frontend
yarn install
yarn start            # opens Metro on port 3000
# Then scan the QR with the Expo Go app on Android, or open the web preview at
# http://localhost:3000 to use the AsyncStorage-backed dev mode.
```

To run only on Android (Expo Go or a connected device):

```bash
yarn android
```

The first time you register a local account, the app seeds three starter categories
(Food / Transport / Entertainment) so you have somewhere to log immediately.

---

## 9. Building on a physical phone

The Final POE brief requires the demo video to be recorded on **a real Android phone**. To install
a debug build:

1. Install the Expo Go app from Play Store (https://expo.dev/go).
2. Run `yarn start` on your dev machine.
3. Scan the QR code printed in your terminal with Expo Go on the phone.

For a release `.apk`, use `eas build --platform android --profile preview` (requires an EAS
account — free tier is enough).

> Native features that require a real device (or development build) — camera capture and the share
> sheet — only fully work in Expo Go or a dev/production build, not the web preview. The web build
> exists purely to make automated browser testing possible.

---

## 10. Automated testing & GitHub Actions

We use **GitHub Actions** to verify the app on every push.

The workflow (`.github/workflows/expo-ci.yml`) does the following on every push and pull request to `main`:

1. Checks out the source.
2. Installs **Node 20** + project dependencies (`yarn install --frozen-lockfile`).
3. Runs **ESLint** across the whole frontend (`yarn lint`) — every blocking error must be fixed for the build to be green.
4. Verifies the **TypeScript** types compile cleanly (`yarn tsc --noEmit`).
5. Runs a **headless Expo Android export** (`yarn expo export --platform android`) — this is the equivalent of "the app will build on someone else's computer", which is the explicit ask in the rubric.
6. Uploads the export bundle as a workflow artifact so it can be downloaded directly from the Actions run page.

Why a GitHub Actions workflow and not just unit tests?
> The Final POE rubric says: *"Make use of GitHub actions to run tests and build your code to
> make sure it will work on not just your computer."* — the workflow does **both** linting (which catches
> typos, unused imports, accidental re-renders) **and** a full Android export (which catches missing
> assets, broken native modules, and configuration drift).

### References (as required by the rubric)

- GitHub Marketplace: *Automated build Android App with GitHub Actions* — https://github.com/marketplace/actions/automated-build-android-app-with-github-action [Accessed on 05 November 2025].
- Example workflow from IMAD5112 module — https://github.com/IMAD5112/Github-actions/blob/main/.github/workflows/build.yml [Accessed on 05 November 2025].

### Manual smoke test (no CI required)

```bash
cd frontend
yarn lint              # static analysis
yarn tsc --noEmit      # type check
yarn expo export --platform android   # full Android bundle build
```

---

## 11. App icon & assets

- Launcher icon — `frontend/assets/images/icon.png` (square, used for iOS and adaptive Android fallback).
- Android adaptive icon — `frontend/assets/images/adaptive-icon.png` foreground on the brand green `#2C5545` background.
- Splash — same brand green background, lockup centred via `expo-splash-screen`.

---

## 12. Acknowledgements

- IIE OPSC6311 module brief — © The Independent Institute of Education (Pty) Ltd 2026.
- Expo team — `expo`, `expo-router`, `expo-sqlite`, `expo-image-picker`, `expo-sharing`, `expo-crypto`.
- `react-native-svg` for the bar chart and gauge.
- `@expo/vector-icons` (Ionicons) — every icon in the UI.
- The original Kotlin Part 2 prototype (preserved under `kotlin-original/`) — same author, ST10436040.
