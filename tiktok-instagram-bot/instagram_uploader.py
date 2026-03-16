"""Instagram uploader using instagrapi."""

import os
import time
from instagrapi import Client
from instagrapi.exceptions import (
    LoginRequired,
    TwoFactorRequired,
    ChallengeRequired,
)


SESSION_FILE = "./ig_session.json"


def create_client(username, password):
    """
    Login to Instagram. Reuses saved session if available to reduce login frequency.
    """
    cl = Client()

    # Mimic a real device
    cl.delay_range = [1, 3]

    # Try loading saved session first
    if os.path.exists(SESSION_FILE):
        try:
            cl.load_settings(SESSION_FILE)
            cl.login(username, password)
            cl.get_timeline_feed()  # verify session works
            print("[+] Logged in using saved session.")
            return cl
        except LoginRequired:
            print("[*] Saved session expired, logging in fresh...")
        except Exception as e:
            print(f"[*] Session load failed ({e}), logging in fresh...")

    # Fresh login
    try:
        cl.login(username, password)
        cl.dump_settings(SESSION_FILE)
        print("[+] Logged in successfully.")
        return cl
    except TwoFactorRequired:
        print("[!] Two-factor authentication required.")
        print("    Disable 2FA temporarily, or use an app password.")
        raise
    except ChallengeRequired:
        print("[!] Instagram challenge required (suspicious login detected).")
        print("    Log in manually on your phone first, then try again.")
        raise


def upload_reel(cl, video_path, caption):
    """
    Upload a video as an Instagram Reel.

    Returns the media object on success, None on failure.
    """
    if not os.path.exists(video_path):
        print(f"[!] Video file not found: {video_path}")
        return None

    try:
        print(f"[*] Uploading reel: {os.path.basename(video_path)}")
        media = cl.clip_upload(
            video_path,
            caption=caption,
        )
        print(f"[+] Reel uploaded successfully! Media ID: {media.pk}")
        return media
    except Exception as e:
        print(f"[!] Upload failed: {e}")
        return None


def build_caption(template, author, author_id, topic, description=""):
    """Build the post caption from the template."""
    caption = template.replace("{original_author}", author_id or author)
    caption = caption.replace("{topic}", topic)
    caption = caption.replace("{description}", description)
    return caption.strip()
