"""Track which videos have been posted to avoid duplicates."""

import json
import os
from datetime import datetime


def load_history(history_path):
    """Load posting history from JSON file."""
    if os.path.exists(history_path):
        with open(history_path, "r") as f:
            return json.load(f)
    return {"posted": [], "queue": []}


def save_history(history_path, history):
    """Save posting history to JSON file."""
    os.makedirs(os.path.dirname(history_path), exist_ok=True)
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)


def is_already_posted(history, video_id):
    """Check if a video has already been posted."""
    return video_id in [entry["id"] for entry in history.get("posted", [])]


def is_in_queue(history, video_id):
    """Check if a video is already in the queue."""
    return video_id in [entry["id"] for entry in history.get("queue", [])]


def add_to_queue(history, video_info):
    """Add a video to the posting queue."""
    if not is_already_posted(history, video_info["id"]) and not is_in_queue(history, video_info["id"]):
        history.setdefault("queue", []).append(video_info)
        return True
    return False


def get_next_from_queue(history):
    """Get the next video from the queue to post."""
    queue = history.get("queue", [])
    if queue:
        return queue[0]
    return None


def mark_as_posted(history, video_id):
    """Move a video from queue to posted list."""
    queue = history.get("queue", [])
    posted = history.get("posted", [])

    for i, entry in enumerate(queue):
        if entry["id"] == video_id:
            entry["posted_at"] = datetime.now().isoformat()
            posted.append(entry)
            queue.pop(i)
            break

    history["queue"] = queue
    history["posted"] = posted


def get_all_known_ids(history):
    """Get a set of all video IDs that have been posted or are in the queue."""
    posted_ids = {entry["id"] for entry in history.get("posted", [])}
    queued_ids = {entry["id"] for entry in history.get("queue", [])}
    return posted_ids | queued_ids


def get_stats(history):
    """Get posting statistics."""
    return {
        "total_posted": len(history.get("posted", [])),
        "queue_size": len(history.get("queue", [])),
        "last_posted": history["posted"][-1]["posted_at"] if history.get("posted") else "Never",
    }
