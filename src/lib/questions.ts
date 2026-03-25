export type QuestionType = "MCQ" | "TRUE_FALSE" | "FILL_IN_BLANKS";

export interface Question {
  id: string;
  subject: string;
  grade: string;
  chapter: string;
  topic: string;
  type: QuestionType;
  text: string;
  options?: string[]; // Used for MCQ and TRUE_FALSE
  correctAnswer: string | string[];
  marks: number;
}

export interface GradedAnswer {
  questionId: string;
  questionText: string;
  studentAnswer: string;
  correctAnswer: string | string[];
  isCorrect: boolean;
  marksAwarded: number;
}

export const questionBank: Question[] = [
  // Science - Chapter: Life Processes
  {
    id: "q-sci-1",
    subject: "Science",
    grade: "Grade 10",
    chapter: "Life Processes",
    topic: "Nutrition",
    type: "MCQ",
    text: "Which of the following is responsible for the transport of water and minerals from roots to other parts of the plant?",
    options: ["Xylem", "Phloem", "Stomata", "Chloroplast"],
    correctAnswer: "Xylem",
    marks: 1,
  },
  {
    id: "q-sci-2",
    subject: "Science",
    grade: "Grade 10",
    chapter: "Life Processes",
    topic: "Respiration",
    type: "TRUE_FALSE",
    text: "Anaerobic respiration produces more energy than aerobic respiration.",
    options: ["True", "False"],
    correctAnswer: "False",
    marks: 1,
  },
  {
    id: "q-sci-3",
    subject: "Science",
    grade: "Grade 10",
    chapter: "Life Processes",
    topic: "Transportation",
    type: "FILL_IN_BLANKS",
    text: "The artificial kidney is a device to remove nitrogenous waste products from the blood through ________.",
    correctAnswer: "dialysis",
    marks: 1,
  },
  
  // Mathematics - Chapter: Polynomials
  {
    id: "q-math-1",
    subject: "Mathematics",
    grade: "Grade 10",
    chapter: "Polynomials",
    topic: "Zeroes of a Polynomial",
    type: "MCQ",
    text: "The number of zeroes that a quadratic polynomial can have is at most:",
    options: ["0", "1", "2", "3"],
    correctAnswer: "2",
    marks: 1,
  },
  {
    id: "q-math-2",
    subject: "Mathematics",
    grade: "Grade 10",
    chapter: "Polynomials",
    topic: "Geometrical Meaning",
    type: "TRUE_FALSE",
    text: "The graph of a linear polynomial is a straight line.",
    options: ["True", "False"],
    correctAnswer: "True",
    marks: 1,
  },
  {
    id: "q-math-3",
    subject: "Mathematics",
    grade: "Grade 10",
    chapter: "Polynomials",
    topic: "Division Algorithm",
    type: "FILL_IN_BLANKS",
    text: "If p(x) and g(x) are any two polynomials with g(x) ≠ 0, then we can find polynomials q(x) and r(x) such that p(x) = g(x) × q(x) + ________.",
    correctAnswer: "r(x)",
    marks: 1,
  }
];
