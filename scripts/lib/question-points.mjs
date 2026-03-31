const DEFAULT_POINTS_BY_TYPE = {
  MCQ: 1,
  MULTIPLE_CHOICE: 1,
  TRUE_FALSE: 1,
  FILL_IN_BLANKS: 1,
  SHORT_ANSWER: 2,
  LONG_ANSWER: 5,
  ESSAY: 5,
};

function normalizeNumericValue(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return null;
  }

  return Math.round(numeric);
}

export function getDefaultPointsForType(type) {
  return DEFAULT_POINTS_BY_TYPE[type] ?? 1;
}

export function resolveQuestionPoints(question = {}) {
  const explicitPoints = normalizeNumericValue(question.points);
  if (explicitPoints !== null) {
    return explicitPoints;
  }

  const legacyMarks = normalizeNumericValue(question.marks);
  if (legacyMarks !== null) {
    return legacyMarks;
  }

  return getDefaultPointsForType(question.type);
}
