#!/usr/bin/env python3
"""
Review and classify Exemplar images.

Scans all images in doc/Exemplar/images/ and classifies each as:
  - VALID: Proper figures (diagrams, charts, grids, illustrations)
  - NEEDS_REEXTRACTION: Partial crops, text bleeding, too tight
  - IRRELEVANT: Headers, footers, question text only, blank

Uses only local processing (Pillow) — no external APIs.
"""

import json
import os
import glob
from pathlib import Path
from PIL import Image, ImageFilter, ImageStat

IMAGES_DIR = "doc/Exemplar/images"
REPORT_PATH = "doc/Exemplar/image-review-report.json"

# Thresholds (tunable)
# Valid figures can have very low content ratio (thin lines ~2-5%)
# Blank images have 0% content
BLANK_CONTENT_RATIO = 0.005  # If <0.5% pixels have content, consider blank
TEXT_HEAVY_EDGE_RATIO = 0.08  # Low edge density suggests text-only (not figures)
MIN_CONTENT_RATIO = 0.01  # Minimum non-white content area for valid figure

# Known header/footer patterns (detected via position analysis)
HEADER_TOP_CUTOFF = 0.20  # If content is only in top 20%, likely header
FOOTER_BOTTOM_CUTOFF = 0.20  # If content is only in bottom 20%, likely footer

# Text detection: text has different characteristics than figures
# Figures: geometric shapes, lines, curves
# Text: horizontal lines, letter shapes
TEXT_ASPECT_RATIO_MIN = 0.5  # Text blocks tend to be wider than tall
TEXT_ASPECT_RATIO_MAX = 2.0


def is_blank_or_near_blank(img: Image.Image) -> tuple[bool, float]:
    """Check if image is blank or nearly blank (no meaningful content)."""
    gray = img.convert("L")
    pixels = gray.load()
    w, h = gray.size
    
    # Count non-white pixels (anything darker than 240)
    non_white = sum(1 for x in range(w) for y in range(h) if pixels[x, y] < 240)
    total = w * h
    content_ratio = non_white / total if total > 0 else 0
    
    return content_ratio < BLANK_CONTENT_RATIO, content_ratio


def get_edge_density(img: Image.Image) -> float:
    """Calculate edge density using Sobel-like filter."""
    gray = img.convert("L")
    edges = gray.filter(ImageFilter.FIND_EDGES)
    stat = ImageStat.Stat(edges)
    # Normalize: higher value = more edges (figures have more edges than plain text)
    return stat.mean[0] / 255.0


def get_content_bbox(img: Image.Image) -> tuple[int, int, int, int]:
    """Get bounding box of non-white content."""
    gray = img.convert("L")
    # Invert: content becomes dark
    bbox = gray.getbbox()
    if bbox is None:
        return (0, 0, img.width, img.height)
    return bbox


def analyze_content_position(img: Image.Image, bbox: tuple) -> dict:
    """Analyze where content is positioned in the image."""
    w, h = img.size
    x0, y0, x1, y1 = bbox
    content_w = x1 - x0
    content_h = y1 - y0
    
    # Position ratios
    top_ratio = y0 / h if h > 0 else 0
    bottom_ratio = (h - y1) / h if h > 0 else 0
    left_ratio = x0 / w if w > 0 else 0
    right_ratio = (w - x1) / w if w > 0 else 0
    content_area_ratio = (content_w * content_h) / (w * h) if w * h > 0 else 0
    
    return {
        "top_ratio": round(top_ratio, 3),
        "bottom_ratio": round(bottom_ratio, 3),
        "left_ratio": round(left_ratio, 3),
        "right_ratio": round(right_ratio, 3),
        "content_width_ratio": round(content_w / w, 3) if w > 0 else 0,
        "content_height_ratio": round(content_h / h, 3) if h > 0 else 0,
        "content_area_ratio": round(content_area_ratio, 3),
    }


def is_likely_text_only(img: Image.Image, edge_density: float, content_ratio: float) -> bool:
    """
    Heuristic: text-only images (question text fragments, headers) tend to have:
    - Very low edge density (plain text has simple horizontal strokes)
    - Content in a narrow band (single line or two of text)
    - Low content ratio (<5%) with horizontal layout
    """
    bbox = get_content_bbox(img)
    pos = analyze_content_position(img, bbox)
    
    # Text-only: low edge density AND narrow content strip
    if edge_density < TEXT_HEAVY_EDGE_RATIO:
        # If content is a thin horizontal strip, likely text
        if pos["content_height_ratio"] < 0.25 and pos["content_width_ratio"] > 0.7:
            return True
        # If content ratio is very low and mostly horizontal, likely text fragment
        if content_ratio < 0.03 and pos["content_width_ratio"] > 0.6:
            return True
    
    return False


def is_likely_header_or_footer(img: Image.Image) -> tuple[bool, str]:
    """Check if content is only at top (header) or bottom (footer)."""
    bbox = get_content_bbox(img)
    pos = analyze_content_position(img, bbox)
    
    if pos["top_ratio"] < HEADER_TOP_CUTOFF and pos["content_height_ratio"] < 0.3:
        return True, "header"
    if pos["bottom_ratio"] < FOOTER_BOTTOM_CUTOFF and pos["content_height_ratio"] < 0.3:
        return True, "footer"
    return False, ""


def has_figure_label_only(img: Image.Image) -> bool:
    """
    Check if image only contains a figure label (e.g., "Fig. 2.5") without actual figure.
    Heuristic: very small content area at bottom of image.
    """
    bbox = get_content_bbox(img)
    pos = analyze_content_position(img, bbox)
    
    # Figure labels are typically at bottom, small area
    if pos["bottom_ratio"] < 0.1 and pos["content_area_ratio"] < 0.1:
        return True
    return False


def is_partial_crop(img: Image.Image) -> tuple[bool, str]:
    """
    Detect if image appears to be a partial crop (content cut off mid-figure).
    
    This is hard to detect reliably without reference to the source page.
    For now, we skip this check — most "edge-touching" figures are actually
    properly framed, not partial crops.
    """
    return False, ""


def classify_image(img_path: str) -> dict:
    """Classify a single image."""
    result = {
        "path": img_path,
        "filename": os.path.basename(img_path),
        "size": None,
        "classification": None,
        "confidence": 0.0,
        "reasons": [],
        "metrics": {},
    }
    
    try:
        img = Image.open(img_path)
        result["size"] = {"width": img.width, "height": img.height}
        
        # 1. Check for blank image
        is_blank, content_ratio = is_blank_or_near_blank(img)
        result["metrics"]["content_ratio"] = round(content_ratio, 4)
        
        if is_blank:
            result["classification"] = "IRRELEVANT"
            result["confidence"] = 0.95
            result["reasons"] = ["Image is blank (no visible content)"]
            return result
        
        # 2. Get edge density
        edge_density = get_edge_density(img)
        result["metrics"]["edge_density"] = round(edge_density, 3)
        
        # 3. Check for header/footer only
        is_header_footer, hf_type = is_likely_header_or_footer(img)
        if is_header_footer:
            result["classification"] = "IRRELEVANT"
            result["confidence"] = 0.85
            result["reasons"] = [f"Image contains only {hf_type} content (no actual figure)"]
            return result
        
        # 4. Check for figure label only
        if has_figure_label_only(img):
            result["classification"] = "IRRELEVANT"
            result["confidence"] = 0.80
            result["reasons"] = ["Image contains only figure label, no actual figure content"]
            return result
        
        # 5. Check for text-only content (question text fragments, headers)
        if is_likely_text_only(img, edge_density, content_ratio):
            result["classification"] = "IRRELEVANT"
            result["confidence"] = 0.75
            result["reasons"] = ["Image appears to contain only text (question text, not a figure)"]
            return result
        
        # 6. Check for partial crop
        is_partial, partial_reason = is_partial_crop(img)
        if is_partial:
            result["classification"] = "NEEDS_REEXTRACTION"
            result["confidence"] = 0.70
            result["reasons"] = [f"Partial crop detected: {partial_reason}"]
            return result
        
        # 7. Content position analysis
        bbox = get_content_bbox(img)
        pos = analyze_content_position(img, bbox)
        result["metrics"]["content_position"] = pos
        
        # If content area is very small relative to image, might need re-extraction
        if pos["content_area_ratio"] < MIN_CONTENT_RATIO:
            result["classification"] = "NEEDS_REEXTRACTION"
            result["confidence"] = 0.65
            result["reasons"] = ["Content area is very small relative to image size"]
            return result
        
        # Default: VALID figure
        result["classification"] = "VALID"
        result["confidence"] = 0.80
        result["reasons"] = ["Image appears to contain valid figure content"]
        
    except Exception as e:
        result["classification"] = "ERROR"
        result["confidence"] = 0.0
        result["reasons"] = [f"Error processing image: {str(e)}"]
    
    return result


def main():
    """Main entry point."""
    if not os.path.exists(IMAGES_DIR):
        print(f"ERROR: Images directory not found: {IMAGES_DIR}")
        return
    
    # Find all PNG images
    image_files = sorted(glob.glob(os.path.join(IMAGES_DIR, "*.png")))
    
    if not image_files:
        print(f"No images found in {IMAGES_DIR}")
        return
    
    print(f"Found {len(image_files)} images to classify...\n")
    
    results = []
    stats = {"VALID": 0, "NEEDS_REEXTRACTION": 0, "IRRELEVANT": 0, "ERROR": 0}
    
    for img_path in image_files:
        result = classify_image(img_path)
        results.append(result)
        stats[result["classification"]] = stats.get(result["classification"], 0) + 1
        
        # Print progress
        filename = os.path.basename(img_path)
        print(f"  [{result['classification']}] {filename} (confidence: {result['confidence']:.0%})")
        if result["reasons"]:
            print(f"    → {result['reasons'][0]}")
    
    # Summary
    print(f"\n{'='*60}")
    print(f"CLASSIFICATION SUMMARY")
    print(f"{'='*60}")
    print(f"  VALID:               {stats['VALID']:>4}")
    print(f"  NEEDS_REEXTRACTION:  {stats['NEEDS_REEXTRACTION']:>4}")
    print(f"  IRRELEVANT:          {stats['IRRELEVANT']:>4}")
    print(f"  ERROR:               {stats['ERROR']:>4}")
    print(f"  TOTAL:               {len(results):>4}")
    
    # Save report
    report = {
        "total_images": len(results),
        "stats": stats,
        "images": results,
    }
    
    os.makedirs(os.path.dirname(REPORT_PATH), exist_ok=True)
    with open(REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Report saved to: {REPORT_PATH}")
    
    # Save lists for downstream scripts
    irrelevant_list = [r["filename"] for r in results if r["classification"] == "IRRELEVANT"]
    reextract_list = [r["filename"] for r in results if r["classification"] == "NEEDS_REEXTRACTION"]
    
    irrelevant_path = os.path.join(os.path.dirname(REPORT_PATH), "irrelevant-images.txt")
    reextract_path = os.path.join(os.path.dirname(REPORT_PATH), "needs-reextraction.txt")
    
    with open(irrelevant_path, "w") as f:
        f.write("\n".join(irrelevant_list))
    
    with open(reextract_path, "w") as f:
        f.write("\n".join(reextract_list))
    
    print(f"✅ Irrelevant images list: {irrelevant_path} ({len(irrelevant_list)} files)")
    print(f"✅ Needs re-extraction list: {reextract_path} ({len(reextract_list)} files)")


if __name__ == "__main__":
    main()
