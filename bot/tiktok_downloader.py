"""TikTok video downloader using yt-dlp."""

import json
import os
import subprocess
import re


def search_and_download(topic, download_dir, max_duration=90, min_views=1000, limit=5):
    """
    Search TikTok for videos matching a topic and download them.

    Returns a list of dicts with video metadata for each downloaded video.
    """
    os.makedirs(download_dir, exist_ok=True)

    url = f"https://www.tiktok.com/tag/{topic}"

    output_template = os.path.join(download_dir, "%(id)s.%(ext)s")
    info_file = os.path.join(download_dir, "%(id)s.info.json")

    cmd = [
        "yt-dlp",
        "--no-warnings",
        "--write-info-json",
        "--max-downloads", str(limit),
        "--match-filter", f"duration<={max_duration}",
        "--output", output_template,
        "--format", "mp4",
        "--no-playlist" if False else "--yes-playlist",
        url,
    ]

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,
        )
    except subprocess.TimeoutExpired:
        print(f"[!] Download timed out for topic: {topic}")
        return []

    downloaded = []
    for filename in os.listdir(download_dir):
        if filename.endswith(".info.json"):
            info_path = os.path.join(download_dir, filename)
            try:
                with open(info_path, "r") as f:
                    info = json.load(f)

                video_id = info.get("id", "")
                video_file = os.path.join(download_dir, f"{video_id}.mp4")

                if not os.path.exists(video_file):
                    continue

                view_count = info.get("view_count", 0) or 0
                if view_count < min_views:
                    os.remove(video_file)
                    os.remove(info_path)
                    continue

                downloaded.append({
                    "id": video_id,
                    "file": video_file,
                    "info_file": info_path,
                    "author": info.get("uploader", "unknown"),
                    "author_id": info.get("uploader_id", "unknown"),
                    "description": info.get("description", ""),
                    "views": view_count,
                    "duration": info.get("duration", 0),
                    "topic": topic,
                })
            except (json.JSONDecodeError, KeyError):
                continue

    return downloaded


def download_single_video(video_url, download_dir):
    """Download a single TikTok video by URL."""
    os.makedirs(download_dir, exist_ok=True)

    output_template = os.path.join(download_dir, "%(id)s.%(ext)s")

    cmd = [
        "yt-dlp",
        "--no-warnings",
        "--write-info-json",
        "--output", output_template,
        "--format", "mp4",
        video_url,
    ]

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    except subprocess.TimeoutExpired:
        print(f"[!] Download timed out for: {video_url}")
        return None

    for filename in os.listdir(download_dir):
        if filename.endswith(".info.json"):
            info_path = os.path.join(download_dir, filename)
            with open(info_path, "r") as f:
                info = json.load(f)

            video_id = info.get("id", "")
            video_file = os.path.join(download_dir, f"{video_id}.mp4")

            if os.path.exists(video_file):
                return {
                    "id": video_id,
                    "file": video_file,
                    "info_file": info_path,
                    "author": info.get("uploader", "unknown"),
                    "author_id": info.get("uploader_id", "unknown"),
                    "description": info.get("description", ""),
                    "views": info.get("view_count", 0),
                    "duration": info.get("duration", 0),
                    "topic": "custom",
                }

    return None
