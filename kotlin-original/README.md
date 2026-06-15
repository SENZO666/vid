# Budget Tracker

**Module:** OPSC6311 — Open Source Coding B  
**Assessment:** Portfolio of Evidence (Part 2, App Prototype)  
**Author:** Khumela Sendelani  
**Student number:** ST10436040

A fully offline **Kotlin / Android** budget tracker. Users sign in, organise their spending
into categories, log time-boxed expense entries (with optional photos), and keep an eye on
their monthly minimum / maximum goals. All data is persisted locally using **Room** — no
internet connection is required.

---

## Features

- **Local authentication** — username + password stored as PBKDF2-style iterated SHA-256
  hashes with per-user salt. No plaintext passwords ever touch disk.
- **Categories CRUD** — create colour-coded categories (`ChipGroup` with 5 palette options).
- **Expense entries** — amount, description, date, start + end times (`DatePickerDialog` /
  `TimePickerDialog`), category picker (`Spinner`) and **optional photo** via either the
  device camera (`FileProvider`-backed capture) or the Android 13 photo picker.
- **Dashboard summary** — shows this month's total spend vs. your monthly goal as a progress
  bar, using `NumberFormat` for currency formatting (as required by the rubric).
- **Expense list with period filter** — view expenses between a user-chosen `From` / `To` date.
  If a photo is attached, tap the entry to open the detail screen and view the full-resolution
  image via `ImageView` + Glide.
- **Category totals** — grouped sums by category for any user-chosen period (`GROUP BY` in
  Room) with a grand-total header.
- **Monthly goals** — minimum and maximum goal configured with both `SeekBar` (mandated by the
  learning unit) and `EditText` for precise entry.
- **Offline database** — Room / SQLite, one Room database file (`budget_tracker.db`). Meets
  the "SQLite / RoomDB / similar offline Android database platform" requirement.
- **Automated build & testing** — GitHub Actions (`.github/workflows/build.yml`) runs unit
  tests and builds the debug APK on every push. Test reports + APK are uploaded as workflow
  artifacts so a marker can download them directly.

---

## Project structure

```
BudgetTracker/
├── app/
│   ├── build.gradle.kts
│   └── src/
│       ├── main/
│       │   ├── AndroidManifest.xml
│       │   ├── java/com/st10436040/budgettracker/
│       │   │   ├── BudgetApp.kt                 ← Application class, owns the Room DB
│       │   │   ├── LoginActivity.kt             ← username+password login
│       │   │   ├── RegisterActivity.kt          ← account creation
│       │   │   ├── DashboardActivity.kt         ← hub screen (summary + nav cards)
│       │   │   ├── CategoriesActivity.kt
│       │   │   ├── AddCategoryActivity.kt
│       │   │   ├── AddExpenseActivity.kt        ← DatePicker/TimePicker + photo
│       │   │   ├── ExpenseListActivity.kt       ← period-filtered list
│       │   │   ├── ExpenseDetailActivity.kt     ← full entry + photo preview
│       │   │   ├── PhotoViewActivity.kt         ← full-screen photo viewer
│       │   │   ├── CategoryTotalsActivity.kt    ← total spent per category
│       │   │   ├── GoalsActivity.kt             ← SeekBar-driven min/max goals
│       │   │   ├── adapters/                    ← RecyclerView adapters
│       │   │   ├── data/                        ← Room Entities, DAOs, Database
│       │   │   └── utils/                       ← PasswordHasher, SessionManager, DateUtils
│       │   └── res/
│       │       ├── layout/                      ← every activity + list item XML
│       │       ├── values/                      ← dark theme, colours, strings
│       │       ├── drawable/
│       │       ├── mipmap-*/                    ← launcher icon
│       │       └── xml/                         ← file_paths.xml, backup rules
│       ├── test/                                ← JVM unit tests (PasswordHasher, DateUtils)
│       └── androidTest/                         ← Room instrumentation test
├── .github/workflows/build.yml                  ← GitHub Actions CI
├── build.gradle.kts
├── settings.gradle.kts
└── README.md
```

---

## Building & running

### Requirements

- **Android Studio** Hedgehog (2023.1) or newer
- **JDK 17**
- **Android SDK 34** (compileSdk = 34, minSdk = 24)

### Open the project

1. Clone the repository.  
2. Launch Android Studio → **Open** → select the `BudgetTracker/` folder.  
3. Let Gradle sync (first sync downloads Gradle 8.9 and dependencies).
4. Run the `app` configuration on an emulator (Pixel 6 API 34 recommended) or a physical
   device with USB debugging enabled.

> **Building from the command line without Android Studio**
> ```bash
> ./gradlew assembleDebug      # builds app/build/outputs/apk/debug/app-debug.apk
> ./gradlew test               # unit tests (PasswordHasher, DateUtils)
> ./gradlew connectedCheck     # instrumentation tests (requires running emulator)
> ```

### First run

1. The app launches on the **Login** screen.  
2. Tap **"Need an account? Register"** to create your first user (username ≥ 3 chars,
   password ≥ 6 chars).  
3. Sign in, create a couple of categories, then add a few expenses.  
4. Open **Monthly goals** to set a minimum and maximum goal; the Dashboard will show your
   progress against the maximum.

---

## Required Kotlin / Android concepts covered

| Concept (from Unit 1–4 outcomes)          | Where it lives                                               |
| ----------------------------------------- | ------------------------------------------------------------ |
| Layouts                                   | Every `res/layout/activity_*.xml` (LinearLayout, ScrollView, ConstraintLayout via CoordinatorLayout, etc.) |
| `EditText`                                | `activity_login.xml`, `activity_add_expense.xml`, `activity_goals.xml` via `TextInputEditText` |
| `NumberFormat`                            | `DashboardActivity`, `ExpenseAdapter`, `CategoryTotalAdapter`, `GoalsActivity` |
| `SeekBar`                                 | `activity_goals.xml` + `GoalsActivity.kt` |
| Event handling                            | `setOnClickListener`, `OnSeekBarChangeListener`, `setOnCheckedStateChangeListener` throughout |
| Creating an activity                      | 10 concrete `AppCompatActivity` subclasses |
| `Intent`                                  | `AddExpenseActivity → ExpenseDetailActivity` (explicit with extras), camera intent via `ActivityResultContracts.TakePicture` |
| Reading & writing to RoomDB               | `data/AppDatabase.kt` + DAOs + all activities using `lifecycleScope.launch { db.xxxDao()... }` |

---

## Automated testing (POE Appendix requirement)

- **Unit tests** (`app/src/test/`): exercise the password hashing round-trip and date
  utilities. Run locally with `./gradlew test` or on CI.
- **Instrumentation test** (`app/src/androidTest/AppDatabaseTest.kt`): spins up an
  in-memory Room database, inserts categories + expenses, and verifies both the
  `totalsByCategory` aggregate and `grandTotal` match the seed data.
- **GitHub Actions** (`.github/workflows/build.yml`) runs every unit test *and* produces a
  debug APK on every push to `main`.  Artifacts: `budget-tracker-debug-apk` +
  `unit-test-report`.

References (for the POE rubric):  
- https://github.com/marketplace/actions/automated-build-android-app-with-github-action
  [Accessed on 05 November 2025].  
- https://github.com/IMAD5112/Github-actions/blob/main/.github/workflows/build.yml
  [Accessed on 05 November 2025].

---

## Logging

Every feature-critical activity emits `Log.i` / `Log.w` / `Log.e` messages with a tag matching
the class name (e.g. `LoginActivity`, `AddExpenseActivity`) — makes it straightforward to
trace flows in `adb logcat` during the demonstration video.

---

## Accessibility & robustness

- All interactive images have `android:contentDescription`.
- Input validation (blank username / password, invalid amount, end-before-start time,
  duplicate category name, min-greater-than-max goal) is handled with `Toast` messages —
  the app never crashes on bad input.
- Database is keyed per user so multiple local accounts never cross-contaminate.

---

## © & acknowledgements

- Material Components — https://m3.material.io  
- Glide — https://github.com/bumptech/glide  
- IIE OPSC6311 module brief, © The Independent Institute of Education (Pty) Ltd 2026.
