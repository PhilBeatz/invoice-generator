"""TikTok video downloader using yt-dlp with smart filtering."""

import json
import os
import subprocess


def search_and_download(topic, download_dir, filters, known_ids=None):
    """
    Search TikTok for videos matching a topic, apply filters, and return the best ones.

    Args:
        topic: Hashtag to search (without #)
        download_dir: Directory to save videos
        filters: Dict of filter settings from config["tiktok"]
        known_ids: Set of video IDs already posted or queued (to skip duplicates)

    Returns a list of dicts with video metadata, sorted by the configured ranking.
    """
    if known_ids is None:
        known_ids = set()

    os.makedirs(download_dir, exist_ok=True)

    url = f"https://www.tiktok.com/tag/{topic}"
    output_template = os.path.join(download_dir, "%(id)s.%(ext)s")

    max_duration = filters.get("max_duration", 90)
    fetch_limit = filters.get("fetch_limit", 20)

    cmd = [
        "yt-dlp",
        "--no-warnings",
        "--write-info-json",
        "--max-downloads", str(fetch_limit),
        "--match-filter", f"duration<={max_duration}",
        "--output", output_template,
        "--format", "mp4",
        "--yes-playlist",
        url,
    ]

    try:
        subprocess.run(cmd, capture_output=True, text=True, timeout=300)
    except subprocess.TimeoutExpired:
        print(f"[!] Download timed out for topic: {topic}")
        return []

    # Collect all downloaded video info
    candidates = []
    for filename in os.listdir(download_dir):
        if not filename.endswith(".info.json"):
            continue

        info_path = os.path.join(download_dir, filename)
        try:
            with open(info_path, "r") as f:
                info = json.load(f)
        except (json.JSONDecodeError, OSError):
            continue

        video_id = info.get("id", "")
        video_file = os.path.join(download_dir, f"{video_id}.mp4")

        if not os.path.exists(video_file):
            continue

        video = {
            "id": video_id,
            "file": video_file,
            "info_file": info_path,
            "author": info.get("uploader", "unknown"),
            "author_id": info.get("uploader_id", "unknown"),
            "description": info.get("description", ""),
            "views": info.get("view_count", 0) or 0,
            "likes": info.get("like_count", 0) or 0,
            "comments": info.get("comment_count", 0) or 0,
            "duration": info.get("duration", 0) or 0,
            "topic": topic,
        }

        # Calculate engagement rate
        if video["views"] > 0:
            video["engagement_rate"] = video["likes"] / video["views"]
        else:
            video["engagement_rate"] = 0

        candidates.append(video)

    # Apply filters
    filtered = _apply_filters(candidates, filters, known_ids)

    # Sort by configured ranking
    sorted_videos = _sort_videos(filtered, filters.get("sort_by", "engagement"))

    # Clean up rejected videos (downloaded but didn't pass filters)
    accepted_ids = {v["id"] for v in sorted_videos}
    for video in candidates:
        if video["id"] not in accepted_ids:
            _remove_video_files(video)

    return sorted_videos


def _apply_filters(candidates, filters, known_ids):
    """Apply all configured filters to candidate videos."""
    min_views = filters.get("min_views", 1000)
    min_likes = filters.get("min_likes", 0)
    min_comments = filters.get("min_comments", 0)
    min_engagement = filters.get("min_engagement_rate", 0)
    min_duration = filters.get("min_duration", 0)
    max_duration = filters.get("max_duration", 90)
    require_keywords = [kw.lower() for kw in filters.get("require_keywords", [])]
    exclude_keywords = [kw.lower() for kw in filters.get("exclude_keywords", [])]

    filtered = []
    for video in candidates:
        # Skip duplicates — already posted or queued
        if video["id"] in known_ids:
            print(f"    [skip] {video['id']} — already posted or queued")
            continue

        # View count filter
        if video["views"] < min_views:
            print(f"    [skip] {video['id']} — {video['views']} views (min: {min_views})")
            continue

        # Like count filter
        if video["likes"] < min_likes:
            print(f"    [skip] {video['id']} — {video['likes']} likes (min: {min_likes})")
            continue

        # Comment count filter
        if video["comments"] < min_comments:
            print(f"    [skip] {video['id']} — {video['comments']} comments (min: {min_comments})")
            continue

        # Engagement rate filter
        if video["engagement_rate"] < min_engagement:
            rate_pct = f"{video['engagement_rate']:.1%}"
            min_pct = f"{min_engagement:.1%}"
            print(f"    [skip] {video['id']} — {rate_pct} engagement (min: {min_pct})")
            continue

        # Duration filter
        if video["duration"] < min_duration:
            print(f"    [skip] {video['id']} — {video['duration']}s too short (min: {min_duration}s)")
            continue

        if video["duration"] > max_duration:
            print(f"    [skip] {video['id']} — {video['duration']}s too long (max: {max_duration}s)")
            continue

        desc_lower = video["description"].lower()

        # Keyword requirement — description must contain at least one keyword
        if require_keywords:
            if not any(kw in desc_lower for kw in require_keywords):
                print(f"    [skip] {video['id']} — no required keywords in description")
                continue

        # Keyword exclusion — skip if description contains any excluded keyword
        if exclude_keywords:
            excluded = [kw for kw in exclude_keywords if kw in desc_lower]
            if excluded:
                print(f"    [skip] {video['id']} — contains excluded keyword: {excluded[0]}")
                continue

        filtered.append(video)

    return filtered


def _sort_videos(videos, sort_by):
    """Sort videos by the configured ranking method."""
    if sort_by == "engagement":
        return sorted(videos, key=lambda v: v["engagement_rate"], reverse=True)
    elif sort_by == "views":
        return sorted(videos, key=lambda v: v["views"], reverse=True)
    elif sort_by == "recent":
        return videos  # yt-dlp already returns most recent first
    else:
        return sorted(videos, key=lambda v: v["engagement_rate"], reverse=True)


def _remove_video_files(video):
    """Clean up video and info files."""
    for key in ("file", "info_file"):
        path = video.get(key)
        if path and os.path.exists(path):
            os.remove(path)


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
        subprocess.run(cmd, capture_output=True, text=True, timeout=120)
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
                    "likes": info.get("like_count", 0) or 0,
                    "comments": info.get("comment_count", 0) or 0,
                    "duration": info.get("duration", 0),
                    "engagement_rate": 0,
                    "topic": "custom",
                }

    return None
