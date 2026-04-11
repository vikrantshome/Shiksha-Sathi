#!/usr/bin/env python3
"""
Tag all figure-dependent questions with:
  - image_required: true/false
  - figure_ref: ["Fig 2.5", ...] (extracted figure references)
  - qa_flags: adds "needs_figure" flag

Non-destructive: only ADDS new fields, never removes existing data.
"""
import json, glob, re

EXTRACTIONS_DIR = 'doc/NCERT/exemplars_extractions'
FIG_PATTERN = re.compile(
    r'(?:Fig\.?\s*\d+\.\d+|Figure\s*\d+\.\d+)',
    re.IGNORECASE
)
IMAGE_HINT_PATTERN = re.compile(
    r'(?i)(given figure|following figure|shown in|shown below|'
    r'adjoining figure|the figure|pictograph|bar graph|pie chart|'
    r'diagram|the picture|shaded portion|in the figure)',
)

total_tagged = 0
total_questions = 0

for filepath in sorted(glob.glob(f'{EXTRACTIONS_DIR}/6-mathematics-ch*.json')):
    filename = filepath.split('/')[-1]
    with open(filepath, 'r') as f:
        questions = json.load(f)

    tagged_count = 0
    for q in questions:
        text = q['question_text']
        # Extract explicit figure references (e.g. "Fig. 6.16", "Fig 2.5")
        fig_refs = list(set(FIG_PATTERN.findall(text)))
        # Check for implicit image hints
        has_image_hint = bool(IMAGE_HINT_PATTERN.search(text))

        needs_image = bool(fig_refs) or has_image_hint

        # Add fields (non-destructive)
        q['image_required'] = needs_image
        q['figure_ref'] = sorted(fig_refs) if fig_refs else []

        # Add qa_flag if needs figure
        if needs_image:
            if 'qa_flags' not in q:
                q['qa_flags'] = []
            if 'needs_figure' not in q['qa_flags']:
                q['qa_flags'].append('needs_figure')
            tagged_count += 1

    total_tagged += tagged_count
    total_questions += len(questions)

    # Write back
    with open(filepath, 'w') as f:
        json.dump(questions, f, indent=2, ensure_ascii=False)

    print(f'{filename}: {tagged_count}/{len(questions)} tagged as image_required')

print(f'\n✅ TOTAL: {total_tagged}/{total_questions} questions tagged across all files')
