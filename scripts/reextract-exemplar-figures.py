#!/usr/bin/env python3
"""
Re-extract figures from grid pages for images flagged as NEEDS_REEXTRACTION.

This script:
1. Reads the image review report to find images needing re-extraction
2. Maps each image to its source grid page
3. Re-extracts with improved bounding boxes using edge detection
4. Saves corrected images (backing up originals first)

Uses only local processing (Pillow) — no external APIs.
"""

import json
import os
import glob
import shutil
from pathlib import Path
from PIL import Image, ImageFilter, ImageStat

GRID_PAGES_DIR = "doc/Exemplar/grid_pages"
IMAGES_DIR = "doc/Exemplar/images"
REPORT_PATH = "doc/Exemplar/image-review-report.json"
BACKUP_DIR = "doc/Exemplar/images_backup"

# PDF source file to grid page mapping (extracted from JSON source_file + source_pages)
# Format: {image_prefix_pattern: {"grid_page": "...", "approx_location": (x, y, w, h)}}
# This will be auto-detected where possible


def parse_image_filename(filename: str) -> dict:
    """
    Parse image filename to extract metadata.
    Example: 6_mathematics_ch2_Fig__2_5.png
    Returns: {"class": 6, "subject": "mathematics", "chapter": 2, "fig_number": "2_5"}
    """
    name = filename.replace(".png", "")
    parts = name.split("_")
    
    # Pattern: {class}_{subject}_ch{chapter}_Fig__{fig_parts}
    if len(parts) < 5:
        return None
    
    try:
        class_level = int(parts[0])
        subject = parts[1]
        chapter_str = parts[2]  # e.g., "ch2"
        chapter = int(chapter_str.replace("ch", ""))
        fig_parts = parts[4:]  # e.g., ["2", "5"] or ["10", "6", "a"]
        fig_number = "_".join(fig_parts)
        
        return {
            "class": class_level,
            "subject": subject,
            "chapter": chapter,
            "fig_number": fig_number,
        }
    except (ValueError, IndexError):
        return None


def find_source_grid_page(meta: dict) -> str | None:
    """
    Find the grid page that likely contains this figure.
    
    Strategy:
    - Map subject/class/chapter to PDF source file
    - Find grid pages matching that PDF
    - Return the most likely page (may need manual refinement)
    """
    if meta is None:
        return None
    
    # PDF naming convention (from JSON source_file field):
    # 6 Mathematics: feep102.pdf (Exemplar Problems - Mathematics)
    # 6 Science: geep101.pdf (Exemplar Problems - Science)
    # etc.
    
    class_level = meta["class"]
    subject = meta["subject"]
    chapter = meta["chapter"]
    
    # Map to PDF prefix based on known Exemplar PDFs
    # These are extracted from the JSON source_file fields
    pdf_prefix_map = {
        (6, "mathematics"): "feep102",
        (6, "science"): "geep101",
        (7, "mathematics"): "feep201",
        (7, "science"): "geep201",
        (8, "mathematics"): "feep104",
        (8, "science"): "geep104",
    }
    
    prefix = pdf_prefix_map.get((class_level, subject))
    if prefix is None:
        return None
    
    # Find matching grid pages
    pattern = os.path.join(GRID_PAGES_DIR, f"{prefix}_page_*_grid.png")
    grid_pages = sorted(glob.glob(pattern))
    
    if not grid_pages:
        return None
    
    # For now, return all matching pages (manual mapping needed)
    # In production, we'd parse the JSON to get exact source_pages
    return grid_pages


def find_content_bbox(img: Image.Image, threshold: int = 240) -> tuple | None:
    """
    Find bounding box of non-white content in the image.
    Returns (left, top, right, bottom) or None if all white.
    """
    gray = img.convert("L")
    
    # Find non-white pixels (below threshold)
    pixels = gray.load()
    w, h = gray.size
    
    left, top, right, bottom = w, h, 0, 0
    has_content = False
    
    for y in range(h):
        for x in range(w):
            if pixels[x, y] < threshold:
                has_content = True
                left = min(left, x)
                top = min(top, y)
                right = max(right, x)
                bottom = max(bottom, y)
    
    if has_content:
        return (left, top, right + 1, bottom + 1)
    return None


def detect_figure_regions(img: Image.Image) -> list[tuple]:
    """
    Detect potential figure regions in a grid page.
    Uses edge detection to find distinct visual elements.
    
    Returns list of (x, y, w, h) bounding boxes.
    """
    gray = img.convert("L")
    
    # Apply edge detection
    edges = gray.filter(ImageFilter.FIND_EDGES)
    
    # Threshold to get strong edges
    edges_binary = edges.point(lambda p: 255 if p > 50 else 0)
    
    # Find content regions using projection profiles
    w, h = edges_binary.size
    pixels = edges_binary.load()
    
    # Horizontal projection (sum of edge pixels per row)
    h_proj = [sum(1 for x in range(w) if pixels[x, y] > 128) for y in range(h)]
    
    # Vertical projection (sum of edge pixels per column)
    v_proj = [sum(1 for y in range(h) if pixels[x, y] > 128) for x in range(w)]
    
    # Find regions with significant content
    regions = []
    min_content = max(w, h) * 0.05  # At least 5% of dimension
    
    # Simple region detection from projections
    # This is a simplified approach - may need refinement
    row_start = None
    for y in range(h):
        if h_proj[y] > min_content and row_start is None:
            row_start = y
        elif h_proj[y] <= min_content and row_start is not None:
            # Found end of a region
            regions.append((0, row_start, w, y - row_start))
            row_start = None
    
    if row_start is not None:
        regions.append((0, row_start, w, h - row_start))
    
    return regions


def extract_figure_from_grid(grid_page_path: str, target_bbox: tuple | None = None) -> Image.Image | None:
    """
    Extract a figure region from a grid page.
    
    Args:
        grid_page_path: Path to the grid page image
        target_bbox: Optional hint for where to look (x, y, w, h)
    
    Returns:
        Cropped figure image or None
    """
    try:
        grid_img = Image.open(grid_page_path)
        
        if target_bbox:
            x, y, w, h = target_bbox
            # Ensure bounds
            x = max(0, x)
            y = max(0, y)
            w = min(w, grid_img.width - x)
            h = min(h, grid_img.height - y)
            return grid_img.crop((x, y, x + w, y + h))
        
        # Auto-detect figure regions
        regions = detect_figure_regions(grid_img)
        
        if regions:
            # Return the largest region as a starting point
            largest = max(regions, key=lambda r: r[2] * r[3])
            x, y, w, h = largest
            return grid_img.crop((x, y, x + w, y + h))
        
        return None
        
    except Exception as e:
        print(f"  ERROR extracting from {grid_page_path}: {e}")
        return None


def reextract_image(filename: str, report_entry: dict) -> bool:
    """
    Attempt to re-extract a single image.
    
    Returns True if successful, False otherwise.
    """
    # Parse filename to get metadata
    meta = parse_image_filename(filename)
    if meta is None:
        print(f"  SKIP: Could not parse filename: {filename}")
        return False
    
    # Find source grid pages
    grid_pages = find_source_grid_page(meta)
    if not grid_pages:
        print(f"  SKIP: No matching grid pages found for {filename}")
        return False
    
    # For now, try the first matching grid page
    # (In production, we'd use JSON source_pages to pick the right one)
    grid_page = grid_pages[0]
    
    print(f"  Source grid page: {os.path.basename(grid_page)}")
    
    # Extract figure from grid page
    extracted = extract_figure_from_grid(grid_page)
    if extracted is None:
        print(f"  FAIL: Could not extract figure from grid page")
        return False
    
    # Save re-extracted image
    output_path = os.path.join(IMAGES_DIR, filename)
    
    # Backup original
    backup_path = os.path.join(BACKUP_DIR, filename)
    os.makedirs(BACKUP_DIR, exist_ok=True)
    if os.path.exists(output_path):
        shutil.copy2(output_path, backup_path)
        print(f"  Backed up original to: {backup_path}")
    
    # Save new extraction
    extracted.save(output_path)
    print(f"  Saved re-extracted image: {output_path}")
    print(f"  Size: {extracted.width}x{extracted.height}")
    
    return True


def main():
    """Main entry point."""
    # Load report
    if not os.path.exists(REPORT_PATH):
        print(f"ERROR: Report not found: {REPORT_PATH}")
        print("Run review-exemplar-images.py first.")
        return
    
    with open(REPORT_PATH, "r") as f:
        report = json.load(f)
    
    # Get images needing re-extraction
    needs_reextract = [
        img for img in report["images"]
        if img["classification"] == "NEEDS_REEXTRACTION"
    ]
    
    if not needs_reextract:
        print("No images need re-extraction.")
        return
    
    print(f"Found {len(needs_reextract)} images needing re-extraction:\n")
    
    success_count = 0
    fail_count = 0
    
    for entry in needs_reextract:
        filename = entry["filename"]
        print(f"\nProcessing: {filename}")
        print(f"  Reason: {entry['reasons'][0] if entry['reasons'] else 'Unknown'}")
        
        if reextract_image(filename, entry):
            success_count += 1
        else:
            fail_count += 1
    
    # Summary
    print(f"\n{'='*60}")
    print(f"RE-EXTRACTION SUMMARY")
    print(f"{'='*60}")
    print(f"  SUCCESS:  {success_count}")
    print(f"  FAILED:   {fail_count}")
    print(f"  TOTAL:    {len(needs_reextract)}")
    
    if fail_count > 0:
        print(f"\n⚠️  {fail_count} images could not be auto-re-extracted.")
        print("   These may need manual intervention.")


if __name__ == "__main__":
    main()
