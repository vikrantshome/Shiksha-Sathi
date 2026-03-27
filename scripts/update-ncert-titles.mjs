import fs from 'fs';

const registryPath = 'doc/NCERT/registry.json';
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

const titles = {
  "6": {
    "science": [
      "The Wonderful World of Science", "Diversity in the Living World", "Mindful Eating", "Exploring Magnetism",
      "Measurement of Nature", "Materials Around Us", "Temperature and its Measurement", "Water: A Precious Resource",
      "Methods of Separation", "Living in Harmony with Nature"
    ],
    "maths": [
      "Patterns in Mathematics", "Lines and Angles", "Number Play", "Data Handling and Presentation",
      "Prime Time", "Perimeter and Area", "Fractions", "Playing with Constructions", "Symmetry", "The Other Side of Zero"
    ],
    "english": [
      "A Tale of Two Birds", "The Friendly Mongoose", "The Shepherd's Treasure", "The Old-Clock Shop",
      "Tansen", "The Monkey and the Crocodile", "The Wonder Called Sleep", "A Pact with the Sun"
    ]
  },
  "10": {
    "science": [
      "Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds",
      "Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity",
      "Light – Reflection and Refraction", "The Human Eye and the Colourful World", "Electricity",
      "Magnetic Effects of Electric Current", "Our Environment"
    ],
    "maths": [
      "Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables", "Quadratic Equations",
      "Arithmetic Progressions", "Triangles", "Coordinate Geometry", "Introduction to Trigonometry",
      "Some Applications of Trigonometry", "Circles", "Areas Related to Circles", "Surface Areas and Volumes",
      "Statistics", "Probability"
    ]
  },
  "9": {
    "science": [
      "Matter in Our Surroundings", "Is Matter Around Us Pure", "Atoms and Molecules", "Structure of Atom",
      "Fundamental Unit of Life", "Tissues", "Motion", "Force and Laws of Motion",
      "Gravitation", "Work and Energy", "Sound", "Improvement in Food Resources"
    ]
  },
  "12": {
    "biology": [
      "Sexual Reproduction in Flowering Plants", "Human Reproduction", "Reproductive Health", "Principles of Inheritance and Variation",
      "Molecular Basis of Inheritance", "Evolution", "Human Health and Disease", "Microbes in Human Welfare",
      "Biotechnology: Principles and Processes", "Biotechnology and its Applications", "Organisms and Populations", "Ecosystem",
      "Biodiversity and Conservation"
    ],
    "physics 1": [
      "Electric Charges and Fields", "Electrostatic Potential and Capacitance", "Current Electricity", "Moving Charges and Magnetism",
      "Magnetism and Matter", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves"
    ]
  }
};

for (const classNum in titles) {
  for (const subject in titles[classNum]) {
    if (registry.classes[classNum] && registry.classes[classNum].subjects[subject]) {
      const chapters = registry.classes[classNum].subjects[subject].chapters;
      titles[classNum][subject].forEach((title, index) => {
        if (chapters[index]) {
          chapters[index].title = title;
        }
      });
    }
  }
}

fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
console.log('Registry updated with titles successfully.');
