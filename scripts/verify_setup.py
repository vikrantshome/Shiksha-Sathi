#!/usr/bin/env python3
# scripts/verify_setup.py
import sys
import os
import yaml


def verify_setup():
    print("=" * 60)
    print("SETUP VERIFICATION")
    print("=" * 60)

    issues = []

    # Check config file
    import yaml

    if not os.path.exists("scripts/config.yaml"):
        print("✗ config.yaml not found")
        issues.append("Missing config.yaml")
    else:
        print("✓ config.yaml exists")
        with open("scripts/config.yaml") as f:
            config = yaml.safe_load(f)
            print("  - MongoDB URI:", config["mongodb"]["uri"])
            print("  - Database:", config["mongodb"]["database"])
            print("  - Collection:", config["mongodb"]["collection"])

    # Check dependencies
    print("\nDependencies:")
    try:
        import pymongo

        print("  ✓ pymongo", pymongo.version)
    except ImportError:
        print("  ✗ pymongo not installed")
        issues.append("pip install pymongo")

    try:
        import crawl4ai

        print("  ✓ crawl4ai")
    except ImportError:
        print("  ✗ crawl4ai not installed")
        issues.append("pip install crawl4ai")

    try:
        from serpapi import GoogleSearch

        print("  ✓ serpapi")
    except ImportError:
        print("  ✗ google-search-results not installed")
        issues.append("pip install google-search-results")

    try:
        import yaml

        print("  ✓ PyYAML")
    except ImportError:
        print("  ✗ PyYAML not installed")

    try:
        from tenacity import retry

        print("  ✓ tenacity")
    except ImportError:
        print("  ✗ tenacity not installed")
        issues.append("pip install tenacity")

    try:
        import tqdm

        print("  ✓ tqdm")
    except ImportError:
        print("  ! tqdm not installed (optional, progress bar disabled)")

    # Check environment
    print("\nEnvironment:")
    serpapi_key = os.environ.get("SERPAPI_KEY")
    if serpapi_key:
        print("  ✓ SERPAPI_KEY set")
    else:
        print("  ! SERPAPI_KEY not set (Google search will fail)")
        print("    Get key from: https://serpapi.com/")

    # Check MongoDB connection
    print("\nMongoDB Connection:")
    try:
        from pymongo import MongoClient

        client = MongoClient(config["mongodb"]["uri"], serverSelectionTimeoutMS=5000)
        client.server_info()
        print("  ✓ Connected to MongoDB")
        client.close()
    except Exception as e:
        print("  ✗ Cannot connect to MongoDB:", str(e))
        print("    Ensure MongoDB is running on", config["mongodb"]["uri"])
        issues.append("Start MongoDB: mongod")

    # Summary
    print("\n" + "=" * 60)
    if issues:
        print("ISSUES FOUND:")
        for issue in issues:
            print(f"  - {issue}")
        print("\nFix issues before running enrichment.")
        return 1
    else:
        print("✓ All checks passed! System ready.")
        print("\nTo run:")
        print("  python scripts/run_pilot.py  # Test with Class 10")
        print("  python scripts/run_full.py   # Run all classes")
        return 0


if __name__ == "__main__":
    sys.exit(verify_setup())
