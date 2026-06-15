#!/usr/bin/env bash
# Polish the raw walkthrough recording with intro + outro cards.
# Produces: /app/docs/demo-video/reference-walkthrough-polished.mp4
set -euo pipefail

SRC="/app/docs/demo-video/reference-walkthrough.mp4"
OUT="/app/docs/demo-video/reference-walkthrough-polished.mp4"
TMP=/tmp/demo_polish
mkdir -p "$TMP"

W=540
H=1170
FPS=25

# Intro card: 3 seconds, brand green background, two lines of text
ffmpeg -y \
  -f lavfi -i "color=c=0x2C5545:s=${W}x${H}:r=${FPS}:d=3" \
  -vf "drawtext=text='Budget Tracker':fontcolor=white:fontsize=56:x=(w-text_w)/2:y=(h/2)-100:fontfile=/usr/share/fonts/truetype/dejavu/DejaVu-Sans-Bold.ttf,\
drawtext=text='Reference walkthrough — silent':fontcolor=0xE8EFEA:fontsize=28:x=(w-text_w)/2:y=(h/2)-20:fontfile=/usr/share/fonts/truetype/dejavu/DejaVu-Sans.ttf,\
drawtext=text='OPSC6311 Final POE':fontcolor=0xE8EFEA:fontsize=26:x=(w-text_w)/2:y=(h/2)+40:fontfile=/usr/share/fonts/truetype/dejavu/DejaVu-Sans.ttf,\
drawtext=text='Khumela Sendelani · ST10436040':fontcolor=0xE8EFEA:fontsize=22:x=(w-text_w)/2:y=(h/2)+90:fontfile=/usr/share/fonts/truetype/dejavu/DejaVu-Sans.ttf" \
  -c:v libx264 -pix_fmt yuv420p -preset medium -crf 23 \
  "$TMP/intro.mp4" 2>/dev/null

# Outro card: 3 seconds
ffmpeg -y \
  -f lavfi -i "color=c=0x2C5545:s=${W}x${H}:r=${FPS}:d=3" \
  -vf "drawtext=text='Reference walkthrough':fontcolor=white:fontsize=46:x=(w-text_w)/2:y=(h/2)-110:fontfile=/usr/share/fonts/truetype/dejavu/DejaVu-Sans-Bold.ttf,\
drawtext=text='complete':fontcolor=white:fontsize=46:x=(w-text_w)/2:y=(h/2)-50:fontfile=/usr/share/fonts/truetype/dejavu/DejaVu-Sans-Bold.ttf,\
drawtext=text='Re-record on a real Android phone':fontcolor=0xE8EFEA:fontsize=26:x=(w-text_w)/2:y=(h/2)+30:fontfile=/usr/share/fonts/truetype/dejavu/DejaVu-Sans.ttf,\
drawtext=text='for the IIE Final POE submission.':fontcolor=0xE8EFEA:fontsize=26:x=(w-text_w)/2:y=(h/2)+70:fontfile=/usr/share/fonts/truetype/dejavu/DejaVu-Sans.ttf,\
drawtext=text='See docs/demo-video/ for the script.':fontcolor=0xC8D4CC:fontsize=22:x=(w-text_w)/2:y=(h/2)+140:fontfile=/usr/share/fonts/truetype/dejavu/DejaVu-Sans.ttf" \
  -c:v libx264 -pix_fmt yuv420p -preset medium -crf 23 \
  "$TMP/outro.mp4" 2>/dev/null

# Concatenate intro + main + outro
cat > "$TMP/concat.txt" <<EOF
file '$TMP/intro.mp4'
file '$SRC'
file '$TMP/outro.mp4'
EOF

ffmpeg -y -f concat -safe 0 -i "$TMP/concat.txt" \
  -c:v libx264 -pix_fmt yuv420p -preset medium -crf 23 \
  -movflags +faststart \
  "$OUT" 2>/dev/null

ls -la "$OUT"
ffprobe -v error -show_entries format=duration:stream=width,height "$OUT" 2>&1 | grep -E "(duration|width|height)"
