#!/usr/bin/env python3
"""
TikTok to Instagram Bot
Downloads TikTok videos by topic and posts one per day to Instagram as a Reel.

Usage:
    python main.py                  # Download + post one video
    python main.py --download-only  # Just download and queue videos
    python main.py --post-only      # Post next video from queue
    python main.py --status         # Show queue and posting stats
"""

import argparse
import os
import random
import sys

import yaml

from tiktok_downloader import search_and_download
from instagram_uploader import create_client, upload_reel, build_caption
from history import (
    load_history,
    save_history,
    add_to_queue,
    get_next_from_queue,
    mark_as_posted,
    get_all_known_ids,
    get_stats,
)


def load_config(config_path="config.yaml"):
    """Load configuration from YAML file."""
    if not os.path.exists(config_path):
        print(f"[!] Config file not found: {config_path}")
        print("    Copy config.yaml.example to config.yaml and fill in your details.")
        sys.exit(1)

    with open(config_path, "r") as f:
        return yaml.safe_load(f)


def download_videos(config, history):
    """Download videos from TikTok for all configured topics."""
    tiktok_cfg = config["tiktok"]
    download_dir = config["paths"]["downloads"]
    topics = tiktok_cfg["topics"]

    # Get all known video IDs to prevent duplicate downloads
    known_ids = get_all_known_ids(history)
    print(f"[*] {len(known_ids)} videos already known (posted + queued). Will skip these.")

    # Pick a random topic to keep content varied
    random.shuffle(topics)

    total_added = 0
    for topic in topics:
        print(f"\n[*] Searching TikTok for: #{topic}")
        videos = search_and_download(
            topic=topic,
            download_dir=download_dir,
            filters=tiktok_cfg,
            known_ids=known_ids,
        )

        print(f"    [*] {len(videos)} videos passed all filters")

        for video in videos:
            if add_to_queue(history, video):
                total_added += 1
                rate = f"{video['engagement_rate']:.1%}"
                print(
                    f"    [+] Queued: {video['id']} by @{video['author']}"
                    f" — {video['views']} views, {video['likes']} likes, {rate} engagement"
                )
                # Track newly queued IDs so later topics skip them too
                known_ids.add(video["id"])

        # Stop if we have enough queued
        queue_size = len(history.get("queue", []))
        if queue_size >= config["posting"].get("queue_size", 5):
            break

    print(f"\n[*] Added {total_added} new videos to queue.")
    return total_added


def post_next_video(config, history):
    """Post the next video from the queue to Instagram."""
    video = get_next_from_queue(history)
    if not video:
        print("[!] Queue is empty. Run with --download-only first to fill the queue.")
        return False

    ig_cfg = config["instagram"]
    posting_cfg = config["posting"]

    # Build caption
    caption = build_caption(
        template=posting_cfg.get("caption_template", "Credit: @{original_author} on TikTok"),
        author=video.get("author", "unknown"),
        author_id=video.get("author_id", "unknown"),
        topic=video.get("topic", ""),
        description=video.get("description", ""),
    )

    # Login and upload
    cl = create_client(ig_cfg["username"], ig_cfg["password"])
    media = upload_reel(cl, video["file"], caption)

    if media:
        mark_as_posted(history, video["id"])
        print(f"[+] Posted video {video['id']} to Instagram!")

        # Clean up video file after posting
        if os.path.exists(video["file"]):
            os.remove(video["file"])
        info_file = video.get("info_file")
        if info_file and os.path.exists(info_file):
            os.remove(info_file)

        return True
    else:
        print("[!] Failed to post video.")
        return False


def show_status(history):
    """Display current bot status."""
    stats = get_stats(history)
    print("\n=== TikTok → Instagram Bot Status ===")
    print(f"  Total posted:  {stats['total_posted']}")
    print(f"  Queue size:    {stats['queue_size']}")
    print(f"  Last posted:   {stats['last_posted']}")

    queue = history.get("queue", [])
    if queue:
        print("\n  Next up in queue:")
        for i, video in enumerate(queue[:5]):
            rate = f"{video.get('engagement_rate', 0):.1%}"
            print(
                f"    {i+1}. {video['id']} by @{video.get('author', '?')}"
                f" — #{video.get('topic', '?')} | {video.get('views', 0)} views | {rate} eng."
            )
    print()


def main():
    parser = argparse.ArgumentParser(description="TikTok to Instagram Repost Bot")
    parser.add_argument("--download-only", action="store_true", help="Only download and queue videos")
    parser.add_argument("--post-only", action="store_true", help="Only post the next queued video")
    parser.add_argument("--status", action="store_true", help="Show bot status and queue")
    parser.add_argument("--config", default="config.yaml", help="Path to config file")
    args = parser.parse_args()

    config = load_config(args.config)
    history_path = config["paths"]["history_db"]
    history = load_history(history_path)

    if args.status:
        show_status(history)
        return

    if args.download_only:
        download_videos(config, history)
        save_history(history_path, history)
        show_status(history)
        return

    if args.post_only:
        success = post_next_video(config, history)
        save_history(history_path, history)
        if success:
            show_status(history)
        return

    # Default: download new videos if queue is low, then post one
    queue_size = len(history.get("queue", []))
    if queue_size < 2:
        print("[*] Queue is low, downloading new videos...")
        download_videos(config, history)

    success = post_next_video(config, history)
    save_history(history_path, history)

    if success:
        show_status(history)


if __name__ == "__main__":
    main()
