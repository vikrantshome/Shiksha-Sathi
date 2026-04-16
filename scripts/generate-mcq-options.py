#!/usr/bin/env python3
"""
Generate MCQ options for questions with complex operators.
Uses subject matter expertise to generate plausible wrong answers.

This script converts SHORT_ANSWER questions to MCQ format by:
1. Using the correct answer as the correct option
2. Generating plausible wrong options based on common mistakes
3. Shuffling the options

Usage:
    python scripts/generate-mcq-options.py --dry-run
    python scripts/generate-mcq-options.py
"""

import os
import re
import random
import math
from pymongo import MongoClient
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(".env.local"))

MONGO_URI = os.getenv("MONGODB_URI")
DB_NAME = "shikshasathi"


def parse_numeric_answer(answer_str):
    """Try to extract a numeric value from answer."""
    answer_str = str(answer_str).strip()

    # Try to find a number
    numbers = re.findall(r"[-+]?\d*\.?\d+", answer_str)
    if numbers:
        try:
            return float(numbers[0])
        except:
            pass

    # Check for fractions like π/2
    if "π" in answer_str or "pi" in answer_str.lower():
        return "pi_expression"
    if "/" in answer_str:
        return "fraction"

    return None


def generate_wrong_options_numeric(correct_answer, num_options=3):
    """Generate wrong options for numeric answers with common mistake patterns."""
    options = []
    correct = parse_numeric_answer(correct_answer)

    if correct is None or correct == "pi_expression" or correct == "fraction":
        return generate_generic_wrong_options(correct_answer, num_options)

    try:
        correct_val = float(correct)

        # Common mistake patterns
        mistake_patterns = [
            correct_val + random.choice([1, 2, 5, 10, 0.5, -1, -2]),
            correct_val - random.choice([1, 2, 5, 10, 0.5, -1, -2]),
            correct_val * random.choice([2, 3, 0.5, -1]),
            correct_val
            + random.choice([random.randint(-10, 10), random.uniform(-5, 5)]),
            correct_val
            - random.choice([random.randint(-10, 10), random.uniform(-5, 5)]),
        ]

        # Filter out invalid options
        valid_patterns = []
        for p in mistake_patterns:
            if p != correct_val and p != 0:
                valid_patterns.append(p)

        # Add some rounded variants
        if abs(correct_val) > 10:
            valid_patterns.append(round(correct_val + random.choice([-1, 1])))
            valid_patterns.append(round(correct_val * 0.9, 1))
            valid_patterns.append(round(correct_val * 1.1, 1))

        # Deduplicate and limit
        seen = {correct_val}
        for p in valid_patterns:
            if len(options) >= num_options:
                break
            rounded = round(p, 2)
            if rounded not in seen:
                seen.add(rounded)
                options.append(rounded)

        return options[:num_options]

    except (ValueError, TypeError):
        return generate_generic_wrong_options(correct_answer, num_options)


def generate_wrong_options_formula(formula_answer):
    """Generate wrong options for formula/expression answers."""
    formula = str(formula_answer).strip()
    wrong_options = []

    # Common formula variations
    if "x²" in formula or "x^2" in formula:
        wrong_options = ["x", "x³", "2x", "x + 2", "x - 2"]
    elif "x³" in formula or "x^3" in formula:
        wrong_options = ["x²", "x", "2x³", "x³ + 1", "x³ - 1"]
    elif "√" in formula or "sqrt" in formula.lower():
        wrong_options = [
            formula.replace("√", "2√").replace("sqrt", "2*sqrt")
            if "2" not in formula
            else formula
        ]
        wrong_options.append(formula + "²" if "²" not in formula else formula)
        wrong_options.append("1/" + formula if "/" not in formula else formula)
    elif (
        "sin" in formula.lower() or "cos" in formula.lower() or "tan" in formula.lower()
    ):
        wrong_options = [
            formula.replace("sin", "cos") if "sin" in formula.lower() else formula,
            formula.replace("cos", "sin") if "cos" in formula.lower() else formula,
            "1/" + formula if "/" not in formula else formula,
        ]
    elif "dy/dx" in formula or "d/dx" in formula:
        wrong_options = [
            formula.replace("+", "-") if "+" in formula else formula,
            formula.replace("-", "+") if "-" in formula else formula,
            formula.replace("x²", "x")
            if "x²" in formula
            else formula.replace("x", "x²"),
        ]
    else:
        wrong_options = generate_generic_wrong_options(formula_answer, 3)

    # Clean up and return valid options
    valid = [opt for opt in wrong_options if opt and opt != formula_answer]
    return valid[:3]


def generate_generic_wrong_options(answer, num_options=3):
    """Generate generic wrong options for text/concept answers."""
    # For now, return some placeholder patterns
    # In a real implementation, you'd want to use AI or domain knowledge

    answer_lower = str(answer).lower()

    # Pattern-based generation for common concepts
    if "refraction" in answer_lower:
        return [
            "Reflection of light",
            "Diffraction of light",
            "Dispersion of light",
        ]
    elif "rational" in answer_lower and "number" in answer_lower:
        return [
            "Irrational number",
            "Integer",
            "Natural number",
        ]
    elif "distance" in answer_lower:
        return [
            str(answer) + "²"
            if answer and answer[0].isdigit()
            else "A different formula",
            "x + y",
            "x × y",
        ]

    # Default: just return some variations
    return [
        "Not applicable",
        "Cannot be determined",
        "Insufficient information",
    ][:num_options]


def convert_question_to_mcq(question):
    """Convert a single SHORT_ANSWER question to MCQ."""
    text = question.get("text", "")
    correct_answer = question.get("correctAnswer") or question.get("correct_answer", "")

    if not correct_answer:
        return None

    # Generate wrong options based on answer type
    correct_numeric = parse_numeric_answer(correct_answer)

    if correct_numeric == "pi_expression" or correct_numeric == "fraction":
        wrong_options = generate_wrong_options_formula(correct_answer)
    elif correct_numeric is not None:
        wrong_options = generate_wrong_options_numeric(correct_answer, 3)
    else:
        wrong_options = generate_wrong_options_formula(correct_answer)

    # Build MCQ options
    options = []

    # Add correct answer first
    options.append({"text": str(correct_answer).strip(), "isCorrect": True})

    # Add wrong options
    for opt in wrong_options[:3]:
        if opt and str(opt).strip():
            options.append({"text": str(opt).strip(), "isCorrect": False})

    # Shuffle options
    random.shuffle(options)

    return {
        "_id": question["_id"],
        "text": text,
        "type": "MCQ",
        "options": options,
        "correctAnswer": str(correct_answer).strip(),
        "explanation": question.get("explanation", ""),
        "points": question.get("points", 1),
        "subject_id": question.get("subject_id", ""),
        "chapter": question.get("chapter", ""),
        "originalType": "SHORT_ANSWER",
        "convertedAt": "2026-04-16",
    }


def convert_all_questions(dry_run=True):
    """Convert all SHORT_ANSWER questions with complex operators to MCQ."""
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]

    print(f"Connected to MongoDB: {DB_NAME}")
    print(f"Dry run mode: {dry_run}")

    # Get questions to convert
    questions = list(db.questions.find({"needsReview": True, "type": "SHORT_ANSWER"}))

    print(f"Found {len(questions)} questions to convert")

    converted = 0
    failed = 0

    for question in questions:
        try:
            mcq_data = convert_question_to_mcq(question)

            if mcq_data and len(mcq_data["options"]) >= 4:
                if dry_run:
                    print(f"\nWould convert: {question['_id']}")
                    print(f"  Q: {mcq_data['text'][:60]}...")
                    print(f"  Correct: {mcq_data['correctAnswer']}")
                    print(f"  Options: {[o['text'] for o in mcq_data['options']]}")
                else:
                    # Update the question in MongoDB
                    db.questions.update_one(
                        {"_id": question["_id"]},
                        {
                            "$set": {
                                "type": "MCQ",
                                "options": mcq_data["options"],
                                "correctAnswer": mcq_data["correctAnswer"],
                                "correct_answer": mcq_data["correctAnswer"],
                                "explanation": mcq_data["explanation"],
                                "originalType": "SHORT_ANSWER",
                                "convertedAt": "2026-04-16",
                                "needsReview": False,
                            }
                        },
                    )
                converted += 1
            else:
                failed += 1
                if dry_run:
                    print(f"\nSkipped (not enough options): {question['_id']}")
                    print(f"  Q: {question.get('text', '')[:60]}...")
                    print(
                        f"  Answer: {question.get('correctAnswer') or question.get('correct_answer', 'N/A')}"
                    )

        except Exception as e:
            failed += 1
            if dry_run:
                print(f"Error converting {question['_id']}: {e}")

    print(f"\n{'Would convert' if dry_run else 'Converted'}: {converted} questions")
    print(f"Failed: {failed} questions")

    client.close()
    return converted, failed


if __name__ == "__main__":
    import sys

    dry_run = "--dry-run" in sys.argv
    convert_all_questions(dry_run=dry_run)
