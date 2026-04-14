# scripts/monitor.py
import pandas as pd
import matplotlib.pyplot as plt
from datetime import datetime
import json
import os


def load_results(date: str = None) -> pd.DataFrame:
    """Load latest results."""
    if date is None:
        # Find latest detailed results file
        log_files = [f for f in os.listdir("logs") if f.startswith("detailed_results_")]
        if not log_files:
            print("No results files found")
            return pd.DataFrame()
        latest = max(log_files)
        date = latest.split("_")[1].split(".")[0]

    json_path = f"logs/detailed_results_{date}.json"
    try:
        with open(json_path) as f:
            data = json.load(f)
        return pd.DataFrame(data)
    except FileNotFoundError:
        print(f"Results file not found: {json_path}")
        return pd.DataFrame()


def generate_dashboard():
    """Generate monitoring dashboard."""
    df = load_results()

    if df.empty:
        print("No data available")
        return

    print("\n" + "=" * 60)
    print(" NCERT EXEMPLAR ENRICHMENT DASHBOARD")
    print("=" * 60)

    total = len(df)
    success_rate = (df["status"] == "success").mean() * 100

    print(f"\nTOTAL QUESTIONS: {total}")
    print(f"SUCCESS RATE: {success_rate:.1f}%")

    if "quality_score" in df.columns and "success" in df["status"].values:
        avg_quality = df[df["status"] == "success"]["quality_score"].mean()
        print(f"AVERAGE QUALITY: {avg_quality:.2f}/1.0")

    print("\nBY CLASS:")
    if "class_num" in df.columns:
        class_summary = (
            df.groupby("class_num")["status"].value_counts().unstack().fillna(0)
        )
        print(class_summary)

    print("\nBY SUBJECT:")
    if "subject" in df.columns:
        subject_summary = (
            df.groupby("subject")["status"].value_counts().unstack().fillna(0)
        )
        print(subject_summary)

    # Top failing reasons
    if "issues" in df.columns:
        all_issues = df[df["status"] == "failed"]["issues"].dropna()
        if len(all_issues) > 0:
            print("\nTOP FAILURE REASONS:")
            issue_counts = all_issues.value_counts()
            print(issue_counts.head(10))

    print("\n" + "=" * 60)


def main():
    generate_dashboard()


if __name__ == "__main__":
    main()
