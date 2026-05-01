import os
import sys
import re
import argparse
from pymongo import MongoClient

def get_db():
    uri = os.environ.get("MONGODB_URI")
    if not uri:
        # Check .env.local
        try:
            with open(".env.local", "r") as f:
                for line in f:
                    if line.startswith("MONGODB_URI="):
                        uri = line.strip().split("=", 1)[1]
                        # Remove quotes if present
                        if uri.startswith('"') and uri.endswith('"'):
                            uri = uri[1:-1]
                        break
        except FileNotFoundError:
            pass
            
    if not uri:
        print("Error: MONGODB_URI not found in environment or .env.local")
        sys.exit(1)
        
    client = MongoClient(uri)
    return client.get_default_database()

def normalize_chapter_title(title):
    if not title:
        return title
        
    # Match "Chapter X: Title" or "Chapter X - Title"
    pattern = r'^Chapter\s*\d+\s*[:\-]\s*(.+)$'
    match = re.match(pattern, title, re.IGNORECASE)
    
    if match:
        return match.group(1).strip()
    return title

def main():
    parser = argparse.ArgumentParser(description="Clean up duplicate chapters and misclassifications")
    parser.add_argument("--apply", action="store_true", help="Apply changes to the database (default is dry-run)")
    args = parser.parse_args()
    
    is_dry_run = not args.apply
    
    print(f"Running in {'DRY RUN' if is_dry_run else 'APPLY'} mode")
    print("-" * 50)
    
    db = get_db()
    questions_coll = db.questions
    
    # 1. Fix Chapter Title Formatting
    print("1. Checking for chapter title formatting issues...")
    
    # We need to find all unique chapter titles first to identify ones that need fixing
    pipeline = [
        {"$match": {"provenance.chapterTitle": {"$regex": "^Chapter", "$options": "i"}}},
        {"$group": {"_id": "$provenance.chapterTitle", "count": {"$sum": 1}}}
    ]
    
    titles_to_fix = list(questions_coll.aggregate(pipeline))
    
    total_title_updates = 0
    for item in titles_to_fix:
        old_title = item["_id"]
        count = item["count"]
        new_title = normalize_chapter_title(old_title)
        
        if old_title != new_title:
            print(f"  Will update {count} questions: '{old_title}' -> '{new_title}'")
            total_title_updates += count
            
            if not is_dry_run:
                result = questions_coll.update_many(
                    {"provenance.chapterTitle": old_title},
                    {"$set": {"provenance.chapterTitle": new_title}}
                )
                print(f"    Updated {result.modified_count} documents.")
                
    if total_title_updates == 0:
        print("  No chapter titles need fixing.")
    else:
        print(f"  Total questions to update for title formats: {total_title_updates}")
        
    print("\n" + "-" * 50)
    
    # 2. Fix Class 12 Math questions misclassified as Class 11
    # Identify by finding questions with classLevel "11" but book containing "Class 12" or similar
    print("2. Checking for misclassified Class 12 questions...")
    
    # Query to find class 11 questions that belong to class 12
    # Could be based on book name or other properties
    misclassified_query = {
        "classLevel": "11",
        "$or": [
            {"provenance.book": {"$regex": "12|XII", "$options": "i"}},
            # Add any other specific criteria we found earlier
        ]
    }
    
    misclassified_count = questions_coll.count_documents(misclassified_query)
    
    if misclassified_count > 0:
        print(f"  Found {misclassified_count} questions misclassified as Class 11 (should be 12).")
        
        # Show sample
        sample = questions_coll.find(misclassified_query).limit(3)
        for q in sample:
            print(f"    Sample: ID={q.get('_id')} Book='{q.get('provenance', {}).get('book')}' Subject='{q.get('subject')}'")
            
        if not is_dry_run:
            result = questions_coll.update_many(
                misclassified_query,
                {"$set": {"classLevel": "12"}}
            )
            print(f"    Updated {result.modified_count} documents.")
    else:
        # Try finding the exact 40 questions another way if the regex didn't catch them
        # Let's find exactly what they are
        alt_query = {"classLevel": "11", "subject": "Mathematics"}
        pipeline2 = [
            {"$match": alt_query},
            {"$group": {"_id": "$provenance.book", "count": {"$sum": 1}}}
        ]
        books_in_11 = list(questions_coll.aggregate(pipeline2))
        print("  Class 11 Math books in DB:")
        for b in books_in_11:
            print(f"    '{b['_id']}': {b['count']} questions")
            
        print("  No obvious misclassifications found with default regex.")

    print("\n" + "-" * 50)
    print("Done.")

if __name__ == "__main__":
    main()
