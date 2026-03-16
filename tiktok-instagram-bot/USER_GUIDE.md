# TikTok to Instagram Bot — User Guide

## What This Bot Does

This bot automatically downloads TikTok videos based on topics you choose (e.g. music producer content) and reposts them as Instagram Reels — one per day. It filters for high-quality, engaging content and gives credit to the original creators.

---

## Requirements

- **Python 3.8+** — [Download here](https://www.python.org/downloads/)
  - During install, **check "Add Python to PATH"**
- **Git** (to clone the repo) — [Download here](https://git-scm.com/downloads)
- An **Instagram account** for posting

---

## Setup (Windows)

### 1. Get the files onto your computer

```powershell
cd C:\Users\Phil
git clone -b claude/tiktok-instagram-bot-e5fW2 https://github.com/PhilBeatz/invoice-generator.git tiktok-bot-temp
Move-Item tiktok-bot-temp\tiktok-instagram-bot C:\Users\Phil\tiktok-instagram-bot
Remove-Item tiktok-bot-temp -Recurse -Force
cd C:\Users\Phil\tiktok-instagram-bot
```

### 2. Create a virtual environment and install dependencies

```powershell
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install yt-dlp
```

### 3. Configure the bot

Open `config.yaml` in any text editor (Notepad, VS Code, etc.) and fill in your details.

---

## Configuration Guide (config.yaml)

### Instagram Credentials

```yaml
instagram:
  username: "your_instagram_username"
  password: "your_instagram_password"
```

> **Tip:** Use a secondary/burner account while testing to avoid any risk to your main account.

### Topics — What Content to Search For

```yaml
tiktok:
  topics:
    - "producer"
    - "beatmaker"
    - "musicproducer"
    - "producing"
```

Change these to anything you want. Each topic is a TikTok hashtag. Examples:
- For cooking content: `"cooking"`, `"recipe"`, `"foodtok"`
- For fitness: `"gym"`, `"workout"`, `"fitnesstips"`
- For comedy: `"comedy"`, `"funny"`, `"skit"`

### Filtering — Control What Gets Downloaded

```yaml
  min_views: 1000          # Skip videos with fewer than 1,000 views
  min_likes: 100           # Skip videos with fewer than 100 likes
  min_comments: 5          # Skip videos with fewer than 5 comments
  min_engagement_rate: 0.03  # Skip if less than 3% of viewers liked it
```

**Engagement rate** = likes ÷ views. A 3% rate means 3 out of every 100 viewers liked the video. Higher = better quality content. Adjust this up or down:
- `0.01` (1%) — more lenient, more videos will qualify
- `0.05` (5%) — stricter, only viral/high-quality content
- `0.10` (10%) — very strict, only the best performers

```yaml
  max_duration: 90         # Max length in seconds (Instagram Reels limit)
  min_duration: 5          # Skip clips shorter than 5 seconds
```

### Keyword Filters — Fine-Tune by Description

**Require keywords** — only download videos that mention at least one of these in the description:

```yaml
  require_keywords:
    - "beat"
    - "producer"
    - "studio"
    - "mixing"
    - "FL Studio"
    - "Ableton"
    - "melody"
    - "sample"
    - "drum"
    - "808"
```

To disable this filter (accept any description), set it to:
```yaml
  require_keywords: []
```

**Exclude keywords** — automatically skip videos that contain these words:

```yaml
  exclude_keywords:
    - "sponsored"
    - "ad"
    - "giveaway"
    - "follow for follow"
    - "f4f"
```

### Sorting — Pick the Best Videos First

```yaml
  sort_by: "engagement"    # Options: "engagement", "views", "recent"
```

- `"engagement"` — prioritizes videos with the best likes-to-views ratio (recommended)
- `"views"` — prioritizes the most-viewed videos
- `"recent"` — prioritizes the newest videos

### Fetch Limit

```yaml
  fetch_limit: 20
```

How many videos to grab from TikTok per topic **before** filtering. Higher = better selection but slower. 20 is a good default.

### Caption & Hashtags

```yaml
posting:
  caption_template: |
    🎵 Credit: @{original_author} on TikTok
    .
    Follow for daily {topic} content!
    .
    #producer #beatmaker #musicproducer #beats #studiolife
```

This is your Instagram caption. Customize it however you want. Available variables:
- `{original_author}` — the TikTok creator's username
- `{topic}` — the hashtag/topic that matched this video
- `{description}` — the original TikTok video description

**Example custom caption:**
```yaml
  caption_template: |
    🔥 Shoutout to @{original_author} on TikTok!
    .
    Original: {description}
    .
    #producer #beatmaker #musicproducer #beats #studiolife #hiphop #trap
```

Instagram allows up to **30 hashtags** and **2,200 characters** per caption.

### Queue Size

```yaml
  queue_size: 5
```

How many videos to keep downloaded and ready to post. The bot will download more when the queue drops below 2.

---

## Running the Bot

Always activate the virtual environment first:

```powershell
cd C:\Users\Phil\tiktok-instagram-bot
venv\Scripts\activate
```

### Commands

| Command | What it does |
|---------|-------------|
| `python main.py` | Downloads (if queue is low) + posts 1 video |
| `python main.py --download-only` | Just download and queue videos, don't post |
| `python main.py --post-only` | Post the next video from the queue |
| `python main.py --status` | See what's queued and posting history |

### Recommended workflow

1. **First time** — run `--download-only` to fill your queue and review what it found:
   ```powershell
   python main.py --download-only
   python main.py --status
   ```

2. **Check the downloads** — look in the `downloads/` folder to preview the videos before posting.

3. **Post one** — when you're happy with the queue:
   ```powershell
   python main.py --post-only
   ```

4. **Daily auto mode** — once you trust the filtering, just run:
   ```powershell
   python main.py
   ```

---

## Automating (1 Post Per Day)

### Option A: Windows Task Scheduler (Recommended)

1. Open **Task Scheduler** (search for it in the Start menu)
2. Click **Create Basic Task**
3. Name it: `TikTok Instagram Bot`
4. Trigger: **Daily**, pick your time (e.g. 10:00 AM)
5. Action: **Start a Program**
   - Program: `C:\Users\Phil\tiktok-instagram-bot\venv\Scripts\python.exe`
   - Arguments: `main.py`
   - Start in: `C:\Users\Phil\tiktok-instagram-bot`
6. Finish

### Option B: Run it manually

Just run `python main.py` once a day whenever you want to post.

---

## Duplicate Prevention

The bot tracks every video it has ever downloaded or posted in `history.json`. It will **never**:
- Download the same video twice
- Post the same video twice
- Queue a video that's already been posted

This file is created automatically. Don't delete it unless you want to reset the history.

---

## Troubleshooting

### "Instagram challenge required"
Instagram detected an unusual login. Open Instagram on your phone, complete any verification, then try the bot again.

### "Two-factor authentication required"
The bot doesn't support 2FA. Either disable 2FA on your posting account or create an app-specific password.

### "No videos passed filters"
Your filters might be too strict. Try:
- Lowering `min_views` to `500`
- Lowering `min_engagement_rate` to `0.01`
- Setting `require_keywords: []` to disable keyword filtering
- Increasing `fetch_limit` to `30` or `40`

### "Queue is empty"
Run `python main.py --download-only` first to fill the queue.

### Videos are too long for Instagram
Make sure `max_duration` is set to `90` or less (Instagram Reels limit).

### Bot downloads but nothing shows in queue
The videos are being filtered out. Run with `--download-only` and watch the `[skip]` messages to see why. Adjust your filters accordingly.

---

## File Overview

| File | Purpose |
|------|---------|
| `main.py` | Entry point — run this |
| `config.yaml` | All your settings |
| `tiktok_downloader.py` | Downloads and filters TikTok videos |
| `instagram_uploader.py` | Uploads Reels to Instagram |
| `history.py` | Tracks posted/queued videos |
| `requirements.txt` | Python package dependencies |
| `setup.sh` | Linux/Mac setup script |
| `history.json` | Auto-created — your posting history (don't delete) |
| `ig_session.json` | Auto-created — saved Instagram login session |
| `downloads/` | Auto-created — temporary video storage |

---

## Important Notes

- **Terms of Service**: This bot operates in a gray area of both TikTok's and Instagram's ToS. Use at your own risk.
- **Copyright**: Always credit original creators (the default caption does this). Consider reaching out to creators for permission.
- **Account Safety**: Start slow. One post per day is safe. Don't increase posting frequency.
- **Test First**: Use `--download-only` and review videos before enabling auto-posting.
