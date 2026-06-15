"""
Record a silent reference video of the Budget Tracker demo by driving the
web preview through every shot in the shot list. Outputs an MP4 at the path
printed at the end.

Run with:
    /opt/plugins-venv/bin/python /app/scripts/record_demo.py
"""

import asyncio
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

from playwright.async_api import async_playwright

APP_URL = "https://app-builder-kit-15.preview.emergentagent.com"
VIEWPORT = {"width": 412, "height": 900}  # portrait phone-ish
RECORD_SIZE = {"width": 540, "height": 1170}  # scale up
TMP_DIR = Path("/tmp/demo_recording")
OUT_DIR = Path("/app/docs/demo-video")
OUT_FILE = OUT_DIR / "reference-walkthrough.mp4"

USERNAME = f"demo{int(time.time()) % 100000}"
PASSWORD = "hello123"


def log(msg: str) -> None:
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


async def tap_test_id(page, test_id: str, timeout: int = 5000) -> bool:
    """Tap an element by testID; return True if it worked."""
    try:
        await page.get_by_test_id(test_id).click(timeout=timeout)
        return True
    except Exception as e:
        log(f"  ⚠️ could not tap testID={test_id}: {e}")
        return False


async def tap_tab_by_index(page, index: int) -> None:
    """Tap a bottom-tab by its 0-based index (Home=0, Expenses=1, +=2, Analytics=3, Settings=4)."""
    width = VIEWPORT["width"]
    x = int((index + 0.5) * width / 5)
    y = VIEWPORT["height"] - 32
    await page.mouse.click(x, y)


async def main() -> None:
    if TMP_DIR.exists():
        shutil.rmtree(TMP_DIR)
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-dev-shm-usage"],
        )
        ctx = await browser.new_context(
            viewport=VIEWPORT,
            record_video_dir=str(TMP_DIR),
            record_video_size=RECORD_SIZE,
            device_scale_factor=2,
        )
        page = await ctx.new_page()

        log(f"Opening {APP_URL}")
        await page.goto(APP_URL, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(9000)  # Metro bundle warm-up

        # ── Shot 1–4 — Login → Register → Dashboard
        log("Tap: Create an account")
        await tap_test_id(page, "login-go-register-link")
        await page.wait_for_timeout(2200)

        log("Fill registration")
        await page.get_by_test_id("register-username-input").fill(USERNAME)
        await page.wait_for_timeout(900)
        await page.get_by_test_id("register-password-input").fill(PASSWORD)
        await page.wait_for_timeout(900)
        await tap_test_id(page, "register-submit-button")
        await page.wait_for_timeout(5500)

        # ── Shot 5–6 — Set goals
        log("Quick link: Goals")
        await tap_test_id(page, "quick-goals")
        await page.wait_for_timeout(3000)

        # Drag the Min slider via direct numeric input + set Max via input
        try:
            await page.get_by_test_id("goal-min-input").fill("3000")
            await page.wait_for_timeout(800)
            await page.get_by_test_id("goal-max-input").fill("8000")
            await page.wait_for_timeout(1500)
        except Exception as e:
            log(f"  ⚠️ goal input fill failed: {e}")

        await tap_test_id(page, "goals-save")
        await page.wait_for_timeout(3500)

        # We're back on Home automatically after save
        await page.wait_for_timeout(1500)

        # ── Shot 11 — Settings → Load demo data
        log("Tab: Settings → Load demo data")
        await tap_tab_by_index(page, 4)
        await page.wait_for_timeout(2500)
        await tap_test_id(page, "settings-seed-demo")
        await page.wait_for_timeout(5500)  # toast cascade

        # ── Shot 12 — Home — gauge filled
        log("Tab: Home — linger on gauge")
        await tap_tab_by_index(page, 0)
        await page.wait_for_timeout(5000)
        # Scroll to show recent expenses
        await page.mouse.wheel(0, 250)
        await page.wait_for_timeout(2500)
        await page.mouse.wheel(0, -250)
        await page.wait_for_timeout(1500)

        # ── Shot 7–10 — Add expense (after seed data so it shows in list)
        log("Tab: Add expense")
        await tap_tab_by_index(page, 2)
        await page.wait_for_timeout(3000)

        try:
            await page.get_by_test_id("add-amount-input").fill("89")
            await page.wait_for_timeout(700)
            await page.get_by_test_id("add-description-input").fill("Cappuccino at Mugg & Bean")
            await page.wait_for_timeout(900)
            # Tap category picker → pick first option (Food)
            await tap_test_id(page, "add-category-picker")
            await page.wait_for_timeout(1700)
            # The sheet renders category-option-{id} — try a few likely ids
            for cid in range(1, 8):
                if await tap_test_id(page, f"category-option-{cid}", timeout=600):
                    break
            await page.wait_for_timeout(1500)
            # Flip recurring toggle ON
            try:
                await page.get_by_test_id("add-recurring-switch").click()
                await page.wait_for_timeout(1000)
            except Exception:
                pass
            await tap_test_id(page, "add-submit-button")
            await page.wait_for_timeout(4500)
        except Exception as e:
            log(f"  ⚠️ add-expense flow hiccup: {e}")

        # ── Shot 13–15 — Analytics
        log("Tab: Analytics")
        await tap_tab_by_index(page, 3)
        await page.wait_for_timeout(4500)
        # Cycle through period segmented
        for period in ["analytics-period-week", "analytics-period-month", "analytics-period-ytd", "analytics-period-all"]:
            await tap_test_id(page, period, timeout=1500)
            await page.wait_for_timeout(1500)
        # Scroll to show the chart + category totals
        await page.mouse.wheel(0, 350)
        await page.wait_for_timeout(2500)
        await page.mouse.wheel(0, 350)
        await page.wait_for_timeout(2500)
        await page.mouse.wheel(0, -700)
        await page.wait_for_timeout(1500)

        # ── Shot 16 — Rewards
        log("Tab: Home → Trophy → Rewards")
        await tap_tab_by_index(page, 0)
        await page.wait_for_timeout(2500)
        await tap_test_id(page, "dashboard-rewards-btn")
        await page.wait_for_timeout(4000)
        await page.mouse.wheel(0, 300)
        await page.wait_for_timeout(2500)
        await page.mouse.wheel(0, 300)
        await page.wait_for_timeout(2500)
        # Back
        await tap_test_id(page, "rewards-back")
        await page.wait_for_timeout(2000)

        # ── Shot 17 — Settings → Export to CSV (web won't share, but visible toast)
        log("Tab: Settings → Export")
        await tap_tab_by_index(page, 4)
        await page.wait_for_timeout(2500)
        await tap_test_id(page, "settings-export")
        await page.wait_for_timeout(4000)

        # ── Shot 19 — Sign out + sign back in
        log("Sign out")
        await tap_test_id(page, "settings-logout")
        await page.wait_for_timeout(3500)
        await page.get_by_test_id("login-username-input").fill(USERNAME)
        await page.wait_for_timeout(900)
        await page.get_by_test_id("login-password-input").fill(PASSWORD)
        await page.wait_for_timeout(900)
        await tap_test_id(page, "login-submit-button")
        await page.wait_for_timeout(5500)

        # ── Shot 20 — Hold on dashboard for the closing 2s
        log("Hold final dashboard")
        await page.wait_for_timeout(3000)

        # Save video
        await ctx.close()
        await browser.close()

    # ── Convert WebM → MP4
    webms = list(TMP_DIR.glob("*.webm"))
    if not webms:
        log("❌ No video captured.")
        sys.exit(1)
    src = webms[0]
    log(f"Raw video: {src} ({src.stat().st_size / 1024 / 1024:.1f} MB)")

    log(f"Converting to MP4 → {OUT_FILE}")
    if OUT_FILE.exists():
        OUT_FILE.unlink()
    cmd = [
        "ffmpeg", "-y",
        "-i", str(src),
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(OUT_FILE),
    ]
    subprocess.run(cmd, check=True, capture_output=True)
    size_mb = OUT_FILE.stat().st_size / 1024 / 1024
    log(f"✅ Final MP4: {OUT_FILE} ({size_mb:.1f} MB)")
    log("Hand this file to the user for review.")


if __name__ == "__main__":
    asyncio.run(main())
