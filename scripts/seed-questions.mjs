import { MongoClient } from 'mongodb';
import { resolveQuestionPoints } from './lib/question-points.mjs';

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("Please provide MONGODB_URI in environment variables");
  process.exit(1);
}

const client = new MongoClient(uri);

const questions = [
  // Science - Grade 10 - Life Processes
  {
    id: "q-sci-1", subject: "Science", grade: "Grade 10", chapter: "Life Processes", topic: "Nutrition",
    type: "MCQ", text: "Which of the following is responsible for the transport of water and minerals from roots to other parts of the plant?",
    options: ["Xylem", "Phloem", "Stomata", "Chloroplast"], correctAnswer: "Xylem", marks: 1,
  },
  {
    id: "q-sci-2", subject: "Science", grade: "Grade 10", chapter: "Life Processes", topic: "Respiration",
    type: "TRUE_FALSE", text: "Anaerobic respiration produces more energy than aerobic respiration.",
    options: ["True", "False"], correctAnswer: "False", marks: 1,
  },
  {
    id: "q-sci-3", subject: "Science", grade: "Grade 10", chapter: "Life Processes", topic: "Transportation",
    type: "FILL_IN_BLANKS", text: "The artificial kidney is a device to remove nitrogenous waste products from the blood through ________.",
    correctAnswer: "dialysis", marks: 1,
  },
  {
    id: "q-sci-4", subject: "Science", grade: "Grade 10", chapter: "Life Processes", topic: "Excretion",
    type: "MCQ", text: "The filtration units of kidneys are called:",
    options: ["Ureter", "Urethra", "Neurons", "Nephrons"], correctAnswer: "Nephrons", marks: 1,
  },
  {
    id: "q-sci-5", subject: "Science", grade: "Grade 10", chapter: "Control and Coordination", topic: "Nervous System",
    type: "MCQ", text: "Which part of the brain is responsible for precision of voluntary actions and maintaining posture?",
    options: ["Cerebrum", "Cerebellum", "Medulla", "Pons"], correctAnswer: "Cerebellum", marks: 1,
  },
  {
    id: "q-sci-6", subject: "Science", grade: "Grade 10", chapter: "Control and Coordination", topic: "Hormones",
    type: "TRUE_FALSE", text: "Insulin helps in regulating blood sugar levels.",
    options: ["True", "False"], correctAnswer: "True", marks: 1,
  },
  
  // Mathematics - Grade 10 - Polynomials
  {
    id: "q-math-1", subject: "Mathematics", grade: "Grade 10", chapter: "Polynomials", topic: "Zeroes of a Polynomial",
    type: "MCQ", text: "The number of zeroes that a quadratic polynomial can have is at most:",
    options: ["0", "1", "2", "3"], correctAnswer: "2", marks: 1,
  },
  {
    id: "q-math-2", subject: "Mathematics", grade: "Grade 10", chapter: "Polynomials", topic: "Geometrical Meaning",
    type: "TRUE_FALSE", text: "The graph of a linear polynomial is a straight line.",
    options: ["True", "False"], correctAnswer: "True", marks: 1,
  },
  {
    id: "q-math-3", subject: "Mathematics", grade: "Grade 10", chapter: "Polynomials", topic: "Division Algorithm",
    type: "FILL_IN_BLANKS", text: "If p(x) and g(x) are any two polynomials with g(x) ≠ 0, then we can find polynomials q(x) and r(x) such that p(x) = g(x) × q(x) + ________.",
    correctAnswer: "r(x)", marks: 1,
  },
  {
    id: "q-math-4", subject: "Mathematics", grade: "Grade 10", chapter: "Quadratic Equations", topic: "Roots",
    type: "MCQ", text: "The discriminant of the quadratic equation ax^2 + bx + c = 0 is:",
    options: ["b^2 - 4ac", "b^2 + 4ac", "a^2 - 4bc", "4ac - b^2"], correctAnswer: "b^2 - 4ac", marks: 1,
  },
  {
    id: "q-math-5", subject: "Mathematics", grade: "Grade 10", chapter: "Quadratic Equations", topic: "Nature of Roots",
    type: "TRUE_FALSE", text: "If the discriminant is greater than zero, the equation has two distinct real roots.",
    options: ["True", "False"], correctAnswer: "True", marks: 1,
  },

  // English - Grade 10 - Grammar
  {
    id: "q-eng-1", subject: "English", grade: "Grade 10", chapter: "Grammar", topic: "Tenses",
    type: "MCQ", text: "She ________ to the market every Saturday.",
    options: ["go", "goes", "going", "gone"], correctAnswer: "goes", marks: 1,
  },
  {
    id: "q-eng-2", subject: "English", grade: "Grade 10", chapter: "Grammar", topic: "Subject-Verb Agreement",
    type: "TRUE_FALSE", text: "The flock of birds were flying south.",
    options: ["True", "False"], correctAnswer: "False", marks: 1,
  },
  {
    id: "q-eng-3", subject: "English", grade: "Grade 10", chapter: "Grammar", topic: "Prepositions",
    type: "FILL_IN_BLANKS", text: "We arrived ________ the station just in time.",
    correctAnswer: "at", marks: 1,
  },

  // Social Science - Grade 10 - History
  {
    id: "q-sst-1", subject: "Social Science", grade: "Grade 10", chapter: "Nationalism in India", topic: "Non-Cooperation Movement",
    type: "MCQ", text: "When was the Non-Cooperation Movement launched?",
    options: ["1919", "1920", "1921", "1922"], correctAnswer: "1920", marks: 1,
  },
  {
    id: "q-sst-2", subject: "Social Science", grade: "Grade 10", chapter: "Nationalism in India", topic: "Civil Disobedience",
    type: "TRUE_FALSE", text: "The Salt March was led by Jawaharlal Nehru.",
    options: ["True", "False"], correctAnswer: "False", marks: 1,
  },
  {
    id: "q-sst-3", subject: "Social Science", grade: "Grade 10", chapter: "Nationalism in India", topic: "Satyagraha",
    type: "FILL_IN_BLANKS", text: "The first Satyagraha movement led by Gandhi in India was at ________.",
    correctAnswer: "Champaran", marks: 1,
  }
];

async function run() {
  try {
    await client.connect();
    const db = client.db("shikshasathi");
    const collection = db.collection("questions");
    const normalizedQuestions = questions.map((question) => ({
      ...question,
      points: resolveQuestionPoints(question),
    }));

    // Clear existing to avoid duplicates in this seed run
    await collection.deleteMany({});
    
    const result = await collection.insertMany(normalizedQuestions);
    console.log(`Successfully inserted ${result.insertedCount} questions into the database.`);
  } catch (error) {
    console.error("Error seeding details:", error);
  } finally {
    await client.close();
  }
}

run();
