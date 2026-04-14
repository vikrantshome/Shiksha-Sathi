# scripts/generate_report.py
import pandas as pd
from datetime import datetime
import os
import json


def generate_summary_report():
    """Generate comprehensive summary report."""
    # Find latest detailed results
    log_files = [f for f in os.listdir("logs") if f.startswith("detailed_results_")]

    if not log_files:
        print("No results found")
        return

    latest = max(log_files)
    date_str = latest.split("_")[1].split(".")[0]

    with open(f"logs/{latest}") as f:
        data = json.load(f)

    df = pd.DataFrame(data)

    report = f"""
    ========================================
    NCERT EXEMPLAR ENRICHMENT REPORT
    Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}
    Data source: {latest}
    ========================================
    
    EXECUTIVE SUMMARY
    ------------------
    Total questions processed: {len(df)}
    Successfully enriched: {len(df[df["status"] == "success"])}
    Failed: {len(df[df["status"] == "failed"])}
    Skipped: {len(df[df["status"] == "skipped"])}
    
    Success rate: {(len(df[df["status"] == "success"]) / len(df) * 100):.1f}%
    """

    if "quality_score" in df.columns and len(df[df["status"] == "success"]) > 0:
        report += f"Average quality score: {df[df['status'] == 'success']['quality_score'].mean():.2f}/1.0\n"

    report += "\nDETAILED BREAKDOWN\n------------------\n"

    # Class-wise
    if "class_num" in df.columns:
        report += "\nClass-wise Performance:\n"
        class_stats = (
            df.groupby("class_num")["status"].value_counts().unstack().fillna(0)
        )
        report += class_stats.to_string() + "\n"

    # Subject-wise
    if "subject" in df.columns:
        report += "\nSubject-wise Performance:\n"
        subject_stats = (
            df.groupby("subject")["status"].value_counts().unstack().fillna(0)
        )
        report += subject_stats.to_string() + "\n"

    # Failures analysis
    failed = df[df["status"] == "failed"]
    if len(failed) > 0:
        report += "\nFAILURE ANALYSIS:\n"
        report += f"Total failures: {len(failed)}\n"
        if "issues" in failed.columns:
            issue_counts = failed["issues"].value_counts()
            report += "\nTop failure reasons:\n"
            for issue, count in issue_counts.head(10).items():
                report += f"  {count}x: {issue}\n"

    # Save report
    report_path = f"logs/report_{date_str}.txt"
    with open(report_path, "w") as f:
        f.write(report)

    print(report)
    print(f"\nFull report saved to: {report_path}")

    return report_path


if __name__ == "__main__":
    generate_summary_report()
