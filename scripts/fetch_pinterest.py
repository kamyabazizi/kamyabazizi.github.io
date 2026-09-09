#!/usr/bin/env python3
"""Fetch the latest pins from a Pinterest profile's public RSS feed and write
them to data/pinterest.json for the website's Photography tab.

Uses only the Python standard library so it runs in GitHub Actions without
any extra dependencies.
"""
import json
import re
import sys
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from xml.etree import ElementTree

PROFILE = "kamyabazizi"
FEED_URL = f"https://www.pinterest.com/{PROFILE}/feed.rss"
OUT_PATH = Path(__file__).resolve().parent.parent / "data" / "pinterest.json"
MAX_PINS = 24

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0 Safari/537.36"
    ),
}


def fetch_feed() -> bytes:
    request = urllib.request.Request(FEED_URL, headers=HEADERS)
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def upscale(image_url: str) -> str:
    """Convert the small 236x thumbnail to a larger 736x version."""
    return re.sub(r"/236x/", "/736x/", image_url)


def parse_feed(raw: bytes) -> list:
    root = ElementTree.fromstring(raw)
    channel = root.find("channel")
    if channel is None:
        raise ValueError("RSS <channel> element not found")

    pins = []
    for item in channel.findall("item"):
        link = (item.findtext("link") or "").strip()
        if not link:
            continue

        image = ""
        description = item.findtext("description") or ""
        match = re.search(r'<img\s+src="([^"]+)"', description)
        if match:
            image = upscale(match.group(1))

        pins.append({"url": link, "image": image})

    return pins[:MAX_PINS]


def main() -> None:
    raw = fetch_feed()
    pins = parse_feed(raw)
    if not pins:
        print("No pins found in the RSS feed.", file=sys.stderr)
        sys.exit(1)

    payload = {
        "profile": f"https://www.pinterest.com/{PROFILE}/",
        "updated": datetime.now(timezone.utc).isoformat(),
        "pins": pins,
    }

    OUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUT_PATH.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(pins)} pins to {OUT_PATH}")


if __name__ == "__main__":
    main()
