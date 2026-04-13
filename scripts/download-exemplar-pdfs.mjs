import fs from 'fs';
import path from 'path';
import https from 'https';
import { URL } from 'url';

const REGISTRY_PATH = 'doc/Exemplar/exemplar_registry.json';
const EXEMPLAR_DIR = 'doc/Exemplar';

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

/* ──────────────────────────────────────────────────────────────────────
   Extract all chapter entries from the registry
   ────────────────────────────────────────────────────────────────────── */
function getAllChapters(registry) {
  const chapters = [];

  for (const [classNum, classData] of Object.entries(registry.classes || {})) {
    for (const [subject, subjectData] of Object.entries(classData.subjects || {})) {
      for (const chapter of subjectData.chapters || []) {
        chapters.push({
          class: classNum,
          subject,
          chapterNumber: chapter.number,
          chapterTitle: chapter.title,
          file: chapter.file,
          url: chapter.url,
        });
      }
    }
  }

  return chapters;
}

/* ──────────────────────────────────────────────────────────────────────
   Get answer PDF URLs for each class/subject combination
   Based on actual URLs from https://ncert.nic.in/exemplar-problems.php
   ────────────────────────────────────────────────────────────────────── */
function getAnswerPdfUrls(registry) {
  // Verified answer PDF URLs from NCERT exemplar page
  const answerPdfMap = {
    // Class 6
    '6-mathematics': 'feep1an.pdf',
    '6-science': 'feep2an.pdf',
    // Class 7
    '7-mathematics': 'gemp1a1.pdf',
    '7-science': 'geep1an.pdf',
    // Class 8
    '8-mathematics': 'heep2an.pdf',
    '8-science': 'heep1an.pdf',
    // Class 9
    '9-mathematics': 'ieep2an.pdf',
    '9-science': 'ieep1an.pdf',
    // Class 10
    '10-mathematics': 'jeep2an.pdf',
    '10-science': 'jeep1an.pdf',
    // Class 11
    '11-mathematics': 'keep217.pdf',
    '11-physics': 'keep316.pdf',
    '11-biology': 'keep423.pdf', // MCQ answers only
    // Class 12
    '12-mathematics': 'leep216.pdf',
    '12-physics': 'leep117.pdf',
    '12-biology': 'leep417.pdf', // MCQ answers only
  };

  // Base URLs by class
  const baseUrls = {
    '6': {
      mathematics: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classVI/Mathematics',
      science: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classVI/science',
    },
    '7': {
      mathematics: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classVII/Mathematics',
      science: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classVII/Science',
    },
    '8': {
      mathematics: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classVIII/mathematics',
      science: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classVIII/science',
    },
    '9': {
      mathematics: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classIX/mathematics',
      science: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classIX/science',
    },
    '10': {
      mathematics: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classX/mathematics',
      science: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classX/science',
    },
    '11': {
      mathematics: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classXI/mathematics',
      physics: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classXI/physics',
      biology: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classXI/biology',
    },
    '12': {
      mathematics: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classXII/mathematics',
      physics: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classXII/physics',
      biology: 'https://ncert.nic.in/pdf/publication/exemplarproblem/classXII/biology',
    },
  };

  const answerPdfs = [];

  for (const [key, answerFile] of Object.entries(answerPdfMap)) {
    const [classNum, subject] = key.split('-');
    const baseUrl = baseUrls[classNum]?.[subject];
    if (!baseUrl) continue;

    answerPdfs.push({
      class: classNum,
      subject,
      file: answerFile,
      url: `${baseUrl}/${answerFile}`,
    });
  }

  return answerPdfs;
}

/* ──────────────────────────────────────────────────────────────────────
   Download a single URL with retries
   ────────────────────────────────────────────────────────────────────── */
function downloadFile(url, outputPath, retries = 3, delayMs = 2000) {
  return new Promise((resolve, reject) => {
    const attempt = (attemptNum) => {
      const ua = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

      const req = https.get(
        url,
        {
          headers: {
            'User-Agent': ua,
            'Referer': 'https://ncert.nic.in/',
            'Accept': 'application/pdf,*/*',
          },
          timeout: 30000,
        },
        (res) => {
          if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) {
            // Follow redirect
            downloadFile(res.headers.location, outputPath, retries, delayMs)
              .then(resolve)
              .catch(reject);
            return;
          }

          if (res.statusCode !== 200) {
            const err = new Error(`HTTP ${res.statusCode} for ${url}`);
            if (attemptNum < retries) {
              setTimeout(() => attempt(attemptNum + 1), delayMs * attemptNum);
            } else {
              reject(err);
            }
            return;
          }

          const fileStream = fs.createWriteStream(outputPath);
          let downloaded = 0;

          res.on('data', (chunk) => {
            downloaded += chunk.length;
          });

          res.pipe(fileStream);

          fileStream.on('finish', () => {
            fileStream.close();
            resolve(downloaded);
          });

          fileStream.on('error', (err) => {
            fs.unlink(outputPath, () => {});
            if (attemptNum < retries) {
              setTimeout(() => attempt(attemptNum + 1), delayMs * attemptNum);
            } else {
              reject(err);
            }
          });
        }
      );

      req.on('error', (err) => {
        if (attemptNum < retries) {
          setTimeout(() => attempt(attemptNum + 1), delayMs * attemptNum);
        } else {
          reject(err);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        if (attemptNum < retries) {
          setTimeout(() => attempt(attemptNum + 1), delayMs * attemptNum);
        } else {
          reject(new Error(`Timeout downloading ${url}`));
        }
      });
    };

    attempt(1);
  });
}

/* ──────────────────────────────────────────────────────────────────────
   Main
   ────────────────────────────────────────────────────────────────────── */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const onlyAnswers = args.includes('--only-answers');
  const classFilter = args.find(a => a.startsWith('--class='))?.split('=')[1];
  const subjectFilter = args.find(a => a.startsWith('--subject='))?.split('=')[1];

  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf8'));

  // Download answer PDFs first
  const answerPdfs = getAnswerPdfUrls(registry);
  console.log(`Found ${answerPdfs.length} answer PDFs to download.\n`);

  let answerDownloaded = 0;
  let answerSkipped = 0;
  let answerFailed = 0;

  for (const pdf of answerPdfs) {
    if (classFilter && pdf.class !== classFilter) continue;
    if (subjectFilter && pdf.subject !== subjectFilter) continue;

    const outputPath = path.join(EXEMPLAR_DIR, pdf.file);

    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size > 10000) {
        console.log(`⏭  ${pdf.file} already exists (${(stats.size / 1024).toFixed(0)}KB)`);
        answerSkipped++;
        continue;
      }
    }

    if (dryRun) {
      console.log(`[DRY RUN] Would download answer: ${pdf.file}`);
      continue;
    }

    try {
      const bytes = await downloadFile(pdf.url, outputPath);
      console.log(`✅ ${pdf.file} (${(bytes / 1024).toFixed(0)}KB)`);
      answerDownloaded++;
    } catch (err) {
      console.error(`❌ ${pdf.file}: ${err.message}`);
      answerFailed++;
    }

    if (!dryRun) {
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
    }
  }

  // If only answers, exit early
  if (onlyAnswers) {
    console.log(`\n${'═'.repeat(60)}`);
    console.log(`Answer PDFs: Downloaded ${answerDownloaded} | Skipped ${answerSkipped} | Failed ${answerFailed}`);
    console.log(`${'═'.repeat(60)}`);
    return;
  }

  // Download chapter PDFs
  const chapters = getAllChapters(registry);
  console.log(`\nFound ${chapters.length} chapters in registry.\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const ch of chapters) {
    if (classFilter && ch.class !== classFilter) continue;
    if (subjectFilter && ch.subject !== subjectFilter) continue;

    const outputPath = path.join(EXEMPLAR_DIR, ch.file);

    if (fs.existsSync(outputPath)) {
      const stats = fs.statSync(outputPath);
      if (stats.size > 10000) {
        console.log(`⏭  ${ch.file} already exists (${(stats.size / 1024).toFixed(0)}KB)`);
        skipped++;
        continue;
      }
    }

    if (dryRun) {
      console.log(`[DRY RUN] Would download: ${ch.file}`);
      continue;
    }

    try {
      const bytes = await downloadFile(ch.url, outputPath);
      console.log(`✅ ${ch.file} (${(bytes / 1024).toFixed(0)}KB)`);
      downloaded++;
    } catch (err) {
      console.error(`❌ ${ch.file}: ${err.message}`);
      failed++;
    }

    if (!dryRun) {
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000));
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`Answer PDFs: Downloaded ${answerDownloaded} | Skipped ${answerSkipped} | Failed ${answerFailed}`);
  console.log(`Chapter PDFs: Downloaded ${downloaded} | Skipped ${skipped} | Failed ${failed}`);
  console.log(`${'═'.repeat(60)}`);
}

main().catch((err) => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
