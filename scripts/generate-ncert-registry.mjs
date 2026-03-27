import fs from 'fs';
import path from 'path';

const ncertDir = 'doc/NCERT';
const registry = {
  board: 'NCERT',
  language: 'English',
  classes: {}
};

const directories = fs.readdirSync(ncertDir).filter(f => fs.statSync(path.join(ncertDir, f)).isDirectory());

directories.forEach(dir => {
  const [classStr, ...subjectParts] = dir.split('-');
  const className = classStr.replace('class', '');
  const subjectName = subjectParts.join(' ');

  if (!registry.classes[className]) {
    registry.classes[className] = {
      subjects: {}
    };
  }

  const files = fs.readdirSync(path.join(ncertDir, dir)).filter(f => f.endsWith('.pdf'));
  const chapters = files.map(f => {
    // Extract chapter number from filename like jeff101.pdf -> 1, jeff102.pdf -> 2
    // Some filenames like jeff1ps.pdf or jeff1an.pdf are not chapters
    const match = f.match(/\d{2,3}/);
    if (match) {
      const numStr = match[0];
      const chapterNum = parseInt(numStr.slice(-2)); // Assuming last two digits are chapter num
      return {
        number: chapterNum,
        file: f,
        title: `Chapter ${chapterNum}` // Placeholder title
      };
    }
    return null;
  }).filter(c => c !== null).sort((a, b) => a.number - b.number);

  registry.classes[className].subjects[subjectName] = {
    chapters: chapters
  };
});

fs.writeFileSync('doc/NCERT/registry.json', JSON.stringify(registry, null, 2));
console.log('Registry generated successfully at doc/NCERT/registry.json');
