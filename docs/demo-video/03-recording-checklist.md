# Demo Video — Recording Checklist
**Budget Tracker · OPSC6311 Final POE**

Total time you'll need: **~45 min** (10 min prep · 10 min recording · 25 min editing/export).

---

## 1. Phone setup (5 min)

- [ ] Charge to >70% — screen-recording draws a lot.
- [ ] Connect to wifi for the install only, then **turn it off** during recording (you want zero notifications).
- [ ] **Do Not Disturb ON**: Settings → Sound → Do Not Disturb → block everything.
- [ ] **Airplane mode OFF, mobile data OFF, wifi OFF** — your app is offline so this is fine and prevents any banner from sliding in.
- [ ] Lock orientation to **Portrait**: pull down quick-settings → tap the rotation icon.
- [ ] Brightness ~70% — pure white looks washed out on most phone cameras.
- [ ] **Developer Options → Show pointer location** ON — your taps now show as a small marker on screen. Hugely improves clarity.
- [ ] Status bar: keep clean — silence Bluetooth, hotspot, location, etc. Time and battery are fine.

---

## 2. Install the app (5 min)

You have two options for the actual demo binary:

### Option A — Expo Go (fast, requires Expo Go from Play Store)
1. On your dev machine: `cd frontend && yarn start`.
2. Scan the printed QR code with **Expo Go** on the phone.
3. The app downloads and launches inside Expo Go.

### Option B — Standalone debug `.apk` (more professional, no Expo Go branding)
1. From the Emergent platform, hit **Publish** (top-right) → choose **Android build** → wait ~5 min.
2. Download the `.apk` to your phone, install (you'll have to allow "Install from this source" once).
3. Launch from the home-screen icon — looks like a real installed app, no Expo Go shell.

> Option B is **strongly recommended** for the marker — the IIE rubric says
> *"The final app needs to run on a mobile phone and not an emulator."* — and an
> independently-installed APK demonstrates that more cleanly than Expo Go.

---

## 3. Screen recorder

Use Android's built-in screen recorder (Android 11+ all have it):

1. Pull down quick-settings twice → tap **Screen record**.
2. Settings (gear icon): **Sound source = None** (we'll add voice over later in OBS), **Resolution = max (1080p)**, **Frame rate = 30fps**, **Show taps = ON**.
3. Tap **Start** → 3-2-1 countdown begins → record.
4. To stop, pull down the notification shade and tap **Stop**. The MP4 lands in `Movies/Screenrecorder`.

> Don't pick the camera-mic option — you'll get fan noise, dog barks, and lip plosives.
> Audio is added cleanly in OBS in step 4.

---

## 4. OBS for the voice-over (15 min)

Why OBS? Because you can re-record the audio while watching your already-recorded screen track, sync them perfectly, and export a single MP4.

1. Install **OBS Studio** from https://obsproject.com (Windows / macOS / Linux — all free).
2. **Settings → Audio**:
   - Sample rate: 48 kHz.
   - **Mic / Auxiliary Audio**: pick your headset mic (NOT the laptop's internal mic — it picks up keyboard noise).
3. **Settings → Output → Recording**:
   - Recording Path: `~/Videos/`.
   - Recording Format: **mp4**.
   - Encoder: hardware (NVENC / QuickSync / VideoToolbox if available, else x264).
   - Rate Control: **CBR**. Bitrate **6000 kbps**.
4. **Scenes**:
   - One scene called "Demo".
   - In Sources, add a **Media Source** pointing at the screen-recorder MP4 from your phone.
   - Right-click → Transform → Fit to screen. The video should fill the canvas vertically.
5. **Audio mixer** at the bottom: confirm your mic shows green levels when you speak. Aim for the peak around **-12 dB to -6 dB**.
6. Click **Start Recording**.
7. Press space (or right-click → Restart) on the Media Source to start the phone video, and read the voice-over script in sync.
8. **Stop Recording**. The output is a single MP4 with screen + voice — done.

---

## 5. Compression (5 min)

The IIE brief reminds you to compress so uploads to Arc are fast.

If your OBS export is bigger than ~80 MB, recompress with **HandBrake** (free, https://handbrake.fr):

1. Open the OBS MP4.
2. Preset: **Fast 1080p30**.
3. Format: **MP4**.
4. Video tab → Quality → **Constant Quality RF 23** (visually identical, smaller file).
5. Click **Start Encode**. Output ends up around **20–35 MB** for a 3-minute clip.

> If you don't have a desktop with HandBrake, **VLC** can also re-encode via
> *Media → Convert/Save → Profile: Video for H.264 + MP3 (MP4)*.

---

## 6. Pre-flight checklist (final 2 min before you hit record)

Run through this in the actual app, **in order**:

- [ ] Open the app, register a fresh user (`tester` / `hello123`).
- [ ] Confirm starter categories show (Food / Transport / Entertainment).
- [ ] Sign out, sign back in — verifies persistence works.
- [ ] Sign out again — leave the app on the **Login screen** before recording.
- [ ] Switch to Do Not Disturb if you forgot earlier.
- [ ] Run a 10-second test recording, listen back, confirm voice is clear and screen is sharp.
- [ ] If the test sounds good — delete it, then start the real recording.

---

## 7. After recording — upload

1. Rename file to `OPSC6311-FinalPOE-Demo-Khumela-ST10436040.mp4`.
2. Upload to **Arc** (your module's submission platform).
3. Also upload to your **GitHub repo** under `/docs/demo-video/` so the link in your README points to the recorded artefact alongside the script.

> Pro tip: if the file is still > 100 MB, host it as an "Unlisted" YouTube video and link to it from the README + Arc upload. YouTube takes any size, the upload is one minute, and the marker just clicks a thumbnail. Plenty of IIE submissions do this.

---

## Troubleshooting

| Symptom                                  | Fix                                                                                                                                    |
| ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Screen-record is silent in OBS playback  | OBS Media Source → Properties → tick **Hide source when playback ends** OFF; check the mute icon next to the source in the mixer.       |
| Voice is too quiet                       | Add an **Filter → Gain** on your mic in OBS, set to +10 dB.                                                                            |
| Voice has hiss/buzz                      | Filter → **Noise suppression (RNNoise)** before the gain.                                                                              |
| Phone shows a notification banner during shot | Re-do that shot — Do Not Disturb missed something. Toggle DND off-on.                                                              |
| Bottom navigation bar (3 buttons) on screen | Settings → Display → Navigation bar → Gesture navigation. Removes the bar entirely.                                                 |
| Recording stops randomly                 | Phone went into battery-saver. Settings → Battery → disable Adaptive Battery for the recorder.                                          |
