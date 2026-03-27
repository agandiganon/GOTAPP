#!/usr/bin/env python3
"""
Script to find and update early-season character images from Game of Thrones Fandom Wiki.
"""

import json
import requests
import re
from typing import Optional, List, Dict
from urllib.parse import urlparse

# Characters to fix with their first appearance season
CHARACTERS_TO_FIX = {
    "alliser-thorne": {"name": "Alliser", "first_season": "S1", "current_image": "Alliser-Thorne-S4-EP-04.jpg"},
    "gilly": {"name": "Gilly", "first_season": "S2", "current_image": "Gilly_%26_Sam_EW_S8_Cover.jpg"},
    "shireen-baratheon": {"name": "Shireen", "first_season": "S2", "current_image": "Shireen_Baratheon_S4.jpg"},
    "missandei": {"name": "Missandei", "first_season": "S3", "current_image": "Missandei_S7.jpg"},
    "tyene-sand": {"name": "Tyene", "first_season": "S5", "current_image": "TyeneS7E3.png"},
    "shae": {"name": "Shae", "first_season": "S1", "current_image": "ShaePortal.png"},
}

FANDOM_API = "https://gameofthrones.fandom.com/api.php"

def search_character_images(char_name: str) -> List[Dict]:
    """Search for images of a character on the Fandom wiki."""
    print(f"\n  Searching for images with prefix: {char_name}")

    params = {
        "action": "query",
        "list": "allimages",
        "aiprefix": char_name,
        "aiprop": "url",
        "ailimit": 50,
        "format": "json"
    }

    try:
        response = requests.get(FANDOM_API, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()

        images = data.get("query", {}).get("allimages", [])
        print(f"  Found {len(images)} images")

        return images
    except Exception as e:
        print(f"  Error searching for {char_name}: {e}")
        return []

def is_early_season_image(filename: str, target_seasons: List[str], max_seasons_after: int = 2) -> bool:
    """Check if filename indicates an early season image.

    Args:
        filename: The image filename
        target_seasons: List like ["S2"] for first appearance season
        max_seasons_after: Allow images up to this many seasons after first appearance
    """
    filename_lower = filename.lower()

    # Get the target season number from first appearance
    target_season_num = int(target_seasons[0][1])
    max_allowed_season = target_season_num + max_seasons_after

    # Check for season patterns: S1, S2, S3, etc. (case insensitive)
    season_match = re.search(r's(\d+)', filename_lower)
    if season_match:
        season_num = int(season_match.group(1))
        if season_num <= max_allowed_season:
            return True

    # Check for episode patterns like 1x03, 2x05, 3x06
    episode_pattern = r'(\d+)x(\d{2})'
    episode_match = re.search(episode_pattern, filename_lower)
    if episode_match:
        season_num = int(episode_match.group(1))
        if season_num <= max_allowed_season:
            return True

    # Check for "Season1", "Season2" patterns
    season_word_match = re.search(r'season\s*(\d+)', filename_lower)
    if season_word_match:
        season_num = int(season_word_match.group(1))
        if season_num <= max_allowed_season:
            return True

    return False

def verify_image_url(url: str) -> bool:
    """Verify that an image URL returns 200 status."""
    try:
        response = requests.head(url, timeout=5, allow_redirects=True)
        return response.status_code == 200
    except Exception as e:
        print(f"    Error verifying {url}: {e}")
        return False

def find_best_image(character_id: str, char_info: Dict) -> Optional[str]:
    """Find the best early-season image for a character."""
    print(f"\nProcessing: {character_id}")
    print(f"  First appearance: {char_info['first_season']}")
    print(f"  Current image: {char_info['current_image']}")

    # Try different search patterns
    search_terms = [
        char_info['name'],
        char_info['name'].replace(" ", ""),
    ]

    all_candidates = []

    for search_term in search_terms:
        images = search_character_images(search_term)
        all_candidates.extend(images)

    if not all_candidates:
        print(f"  No images found for {character_id}")
        return None

    # Filter for early season images
    target_seasons = [char_info['first_season']]
    early_images = []
    other_images = []

    for image in all_candidates:
        filename = image.get("name", "")
        url = image.get("url", "")

        if is_early_season_image(filename, target_seasons):
            early_images.append((filename, url))
        else:
            other_images.append((filename, url))

    candidates_to_try = early_images if early_images else other_images

    if candidates_to_try:
        print(f"  Found {len(candidates_to_try)} candidates:")
        for filename, url in candidates_to_try[:5]:  # Show top 5
            print(f"    - {filename}")
            if verify_image_url(url):
                print(f"      ✓ URL verified")
                return url
            else:
                print(f"      ✗ URL verification failed")
    else:
        print(f"  No images found for {character_id}")

    return None

def update_characters_json(updates: Dict[str, str]):
    """Update the characters.json file with new image URLs."""
    json_path = "/sessions/magical-tender-maxwell/mnt/new_GOTSPOIL/src/data/json/characters.json"

    print("\n" + "="*80)
    print("UPDATING characters.json")
    print("="*80)

    with open(json_path, 'r', encoding='utf-8') as f:
        characters = json.load(f)

    changes_made = []

    for char in characters:
        char_id = char.get("id")
        if char_id in updates and updates[char_id]:
            old_url = char.get("characterImageUrl", "")
            new_url = updates[char_id]

            if old_url != new_url:
                char["characterImageUrl"] = new_url
                changes_made.append({
                    "id": char_id,
                    "old_url": old_url,
                    "new_url": new_url
                })
                print(f"\n✓ Updated {char_id}")
                print(f"  Old: {old_url[:100]}...")
                print(f"  New: {new_url[:100]}...")

    # Write back to file
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(characters, f, ensure_ascii=False, indent=2)

    print(f"\n{'='*80}")
    print(f"Total changes made: {len(changes_made)}")
    print(f"{'='*80}")

    return changes_made

def main():
    print("Game of Thrones Character Image Updater")
    print("="*80)
    print("Finding early-season images for:")
    for char_id, info in CHARACTERS_TO_FIX.items():
        print(f"  - {char_id}: {info['name']} (first appears {info['first_season']})")

    # Find best images for each character
    updates = {}
    for char_id, char_info in CHARACTERS_TO_FIX.items():
        best_url = find_best_image(char_id, char_info)
        if best_url:
            updates[char_id] = best_url

    # Update the JSON file
    if updates:
        changes = update_characters_json(updates)
        print("\nSummary of changes:")
        for change in changes:
            print(f"  {change['id']}: Updated")
    else:
        print("\nNo suitable images found to update.")

if __name__ == "__main__":
    main()
