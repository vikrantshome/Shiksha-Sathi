#!/usr/bin/env python3
"""
Update Exemplar JSON files based on image review report.

For images classified as IRRELEVANT:
  - Set image_required: false
  - Clear figure_ref: []
  - Remove "needs_figure" from qa_flags
  - Add "image_removed_no_figure" to qa_flags for tracking

Non-destructive: backs up original JSON before modification.
"""

import json
import os
import glob
import shutil
from datetime import datetime

EXEMPLAR_DIR = "doc/Exemplar"
REPORT_PATH = os.path.join(EXEMPLAR_DIR, "image-review-report.json")
BACKUP_DIR = os.path.join(EXEMPLAR_DIR, "json_backup")


def load_irrelevant_images() -> set[str]:
    """Load list of irrelevant image filenames from report."""
    irrelevant_path = os.path.join(EXEMPLAR_DIR, "irrelevant-images.txt")
    if not os.path.exists(irrelevant_path):
        return set()
    
    with open(irrelevant_path, "r") as f:
        return set(line.strip() for line in f if line.strip())


def find_json_for_image(image_filename: str, json_files: list[str]) -> list[str]:
    """
    Find JSON files that reference this image.
    
    Images are named like: 6_mathematics_ch2_Fig__2_5.png
    JSON files are named like: 6-mathematics-ch2.json
    
    We match by class, subject, and chapter.
    """
    # Extract class, subject, chapter from image filename
    name = image_filename.replace(".png", "")
    parts = name.split("_")
    
    if len(parts) < 4:
        return []
    
    try:
        class_level = parts[0]
        subject = parts[1]
        chapter_str = parts[2]  # e.g., "ch2"
        chapter = chapter_str.replace("ch", "")
        
        # Build expected JSON filename pattern
        expected_pattern = f"{class_level}-{subject}-ch{chapter}.json"
        
        # Find matching files
        matching = [jf for jf in json_files if os.path.basename(jf) == expected_pattern]
        
        # Also check "all" files (e.g., 6-mathematics-all.json)
        all_pattern = f"{class_level}-{subject}-all.json"
        matching_all = [jf for jf in json_files if os.path.basename(jf) == all_pattern]
        
        return matching + matching_all
        
    except (ValueError, IndexError):
        return []


def update_question_json(filepath: str, irrelevant_images: set[str]) -> dict:
    """
    Update a single JSON file.
    
    Returns dict with update stats.
    """
    with open(filepath, "r") as f:
        data = json.load(f)
    
    # Handle different JSON structures
    if isinstance(data, dict):
        # Could be a single question or a dict wrapper
        questions = [data] if "question_id" in data else data.get("questions", [])
    elif isinstance(data, list):
        questions = data
    else:
        return {"filepath": filepath, "checked": 0, "updated": 0, "error": "Unexpected structure"}
    
    updated_count = 0
    checked_count = 0
    
    for q in questions:
        checked_count += 1
        
        # Skip if image_required is already false
        if not q.get("image_required", False):
            continue
        
        # Check if any figure_ref points to an irrelevant image
        figure_refs = q.get("figure_ref", [])
        has_irrelevant = False
        
        for ref in figure_refs:
            # Extract image filename from ref (e.g., "images/6_mathematics_ch2_Fig__2_5.png")
            if "/" in ref:
                img_name = ref.split("/")[-1]
            else:
                img_name = ref
            
            if img_name in irrelevant_images:
                has_irrelevant = True
                break
        
        if not has_irrelevant:
            continue
        
        # Update the question
        q["image_required"] = False
        q["figure_ref"] = []
        
        # Update qa_flags
        if "qa_flags" not in q:
            q["qa_flags"] = []
        
        # Remove "needs_figure" if present
        if "needs_figure" in q["qa_flags"]:
            q["qa_flags"].remove("needs_figure")
        
        # Add tracking flag
        if "image_removed_no_figure" not in q["qa_flags"]:
            q["qa_flags"].append("image_removed_no_figure")
        
        updated_count += 1
    
    return {
        "filepath": filepath,
        "checked": checked_count,
        "updated": updated_count,
    }


def main():
    """Main entry point."""
    # Load irrelevant images list
    irrelevant_images = load_irrelevant_images()
    
    if not irrelevant_images:
        print("No irrelevant images found. Nothing to update.")
        return
    
    print(f"Found {len(irrelevant_images)} irrelevant images to process.\n")
    
    # Find all JSON files
    json_files = sorted(glob.glob(os.path.join(EXEMPLAR_DIR, "*.json")))
    
    if not json_files:
        print(f"No JSON files found in {EXEMPLAR_DIR}")
        return
    
    print(f"Scanning {len(json_files)} JSON files...\n")
    
    # Create backup directory
    os.makedirs(BACKUP_DIR, exist_ok=True)
    
    total_updated = 0
    total_checked = 0
    updated_files = []
    
    for filepath in json_files:
        filename = os.path.basename(filepath)
        
        # Read file
        with open(filepath, "r") as f:
            data = json.load(f)
        
        # Backup original
        backup_path = os.path.join(BACKUP_DIR, filename)
        shutil.copy2(filepath, backup_path)
        
        # Handle different structures
        if isinstance(data, dict):
            if "question_id" in data:
                questions = [data]
                is_wrapper = False
            else:
                questions = data.get("questions", [])
                is_wrapper = True
        elif isinstance(data, list):
            questions = data
            is_wrapper = False
        else:
            continue
        
        # Update questions
        updated_count = 0
        checked_count = 0
        
        for q in questions:
            if not isinstance(q, dict):
                continue
            checked_count += 1
            
            # Skip if image_required is already false
            if not q.get("image_required", False):
                continue
            
            # Check if any figure_ref points to an irrelevant image
            figure_refs = q.get("figure_ref", [])
            has_irrelevant = False
            
            for ref in figure_refs:
                img_name = ref.split("/")[-1] if "/" in ref else ref
                if img_name in irrelevant_images:
                    has_irrelevant = True
                    break
            
            if not has_irrelevant:
                continue
            
            # Update the question
            q["image_required"] = False
            q["figure_ref"] = []
            
            # Update qa_flags
            if "qa_flags" not in q:
                q["qa_flags"] = []
            
            # Remove "needs_figure" if present
            if "needs_figure" in q["qa_flags"]:
                q["qa_flags"].remove("needs_figure")
            
            # Add tracking flag
            if "image_removed_no_figure" not in q["qa_flags"]:
                q["qa_flags"].append("image_removed_no_figure")
            
            updated_count += 1
        
        total_updated += updated_count
        total_checked += checked_count
        
        if updated_count > 0:
            updated_files.append({"filepath": filepath, "updated": updated_count, "checked": checked_count})
            print(f"  ✅ {filename}: {updated_count}/{checked_count} questions updated")
            
            # Save updated data
            with open(filepath, "w") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
    
    # Summary
    print(f"\n{'='*60}")
    print(f"JSON UPDATE SUMMARY")
    print(f"{'='*60}")
    print(f"  JSON files scanned:    {len(json_files)}")
    print(f"  JSON files updated:    {len(updated_files)}")
    print(f"  Questions checked:     {total_checked}")
    print(f"  Questions updated:     {total_updated}")
    print(f"  Backups saved to:      {BACKUP_DIR}/")
    
    if updated_files:
        print(f"\nUpdated files:")
        for f in updated_files:
            print(f"  - {os.path.basename(f['filepath'])}: {f['updated']} questions")


if __name__ == "__main__":
    main()
