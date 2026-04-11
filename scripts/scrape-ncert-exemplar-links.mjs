
import fs from 'fs';
import path from 'path';

// URL for the NCERT Exemplar Problems page
const url = 'https://ncert.nic.in/exemplar-problems.php?ln=en';
const registryPath = path.resolve(process.cwd(), 'doc/NCERT/exemplar_registry.json');

const classMap = {
  'classvi': '6',
  'classvii': '7',
  'classviii': '8',
  'classix': '9',
  'classx': '10',
  'classxi': '11',
  'classxii': '12'
};

function determineSubjectAndChapter(linkText, href) {
  let subject = 'unknown';
  const hrefLower = href.toLowerCase();
  
  if (hrefLower.includes('/mathematics/') || hrefLower.includes('/maths/')) subject = 'mathematics';
  else if (hrefLower.includes('/science/')) subject = 'science';
  else if (hrefLower.includes('/physics/')) subject = 'physics';
  else if (hrefLower.includes('/chemistry/')) subject = 'chemistry';
  else if (hrefLower.includes('/biology/')) subject = 'biology';
  else if (hrefLower.includes('/biotech')) subject = 'biotechnology';
  
  // Skip Hindi mediums (heuristic: Devnagiri text or "hindi" in URL path)
  if (hrefLower.includes('hindi') || hrefLower.includes('/ganit') || /[\u0900-\u097F]/.test(linkText)) {
    return null;
  }

  // Extract chapter number from text like "Unit 1(Number Systems)" or "1.Food..."
  let chapterNumber = -1;
  const unitMatch = linkText.match(/(?:Unit|Chapter)?\s*(\d+)/i);
  if (unitMatch) {
    chapterNumber = parseInt(unitMatch[1]);
  }
  
  // Clean up title
  let title = linkText.replace(/(?:Unit|Chapter)\s*\d+[\s\(\)]*/i, '').trim();
  if (title.endsWith(')')) title = title.slice(0, -1);
  title = title || linkText;
  
  return { subject, chapterNumber, title: title.replace(/\s+/g, ' ').trim() };
}

async function scrape() {
  console.log(`Fetching HTML from ${url}...`);
  let html;
  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    html = await response.text();
  } catch (err) {
    console.log('Fetch failed, falling back to curl...');
    const { execSync } = await import('child_process');
    html = execSync(`curl -sLA "Mozilla/5.0" "${url}"`).toString();
  }
  
  const registry = { classes: {} };
  
  // All relevant files are PDF links
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href="([^"]*\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi;
  const links = [...html.matchAll(linkRegex)];

  console.log(`Found ${links.length} PDF links. Processing...`);
  
  let validExemplarsAdded = 0;

  for (const match of links) {
    let href = match[1];
    let text = match[2].replace(/<[^>]+>/g, '').trim();
    
    // Ignore meta-documents
    if (/answer/i.test(text) || /design/i.test(text) || /sample/i.test(text)) {
      continue;
    }
    
    // Determine class
    const classMatch = href.match(/\/class(vi{0,3}|ix|x|xi{0,2})\//i);
    if (!classMatch) continue;
    
    const romanClass = `class${classMatch[1].toLowerCase()}`;
    const classNum = classMap[romanClass];
    if (!classNum) continue;
    
    const info = determineSubjectAndChapter(text, href);
    if (!info) continue; // skipped (like hindi)
    if (info.subject === 'unknown') continue;
    
    if (!registry.classes[classNum]) {
      registry.classes[classNum] = { subjects: {} };
    }
    if (!registry.classes[classNum].subjects[info.subject]) {
      registry.classes[classNum].subjects[info.subject] = { chapters: [] };
    }
    
    const fileBase = href.split('/').pop();
    
    // Normalise URL to absolute
    if (href.startsWith('..')) {
      href = 'https://ncert.nic.in' + href.replace('..', '');
    } else if (href.startsWith('/')) {
      href = 'https://ncert.nic.in' + href;
    } else if (!href.startsWith('http')) {
      href = 'https://ncert.nic.in/' + href;
    }
    
    // Handle specific malformed URLs on NCERT site if they occur
    href = href.replace('https://ncert.nic.in/pdf/', 'https://ncert.nic.in/pdf/');

    // Optional: Avoid duplicates in case of repeated links
    const isDuplicate = registry.classes[classNum].subjects[info.subject].chapters.some(ch => ch.file === fileBase || ch.number === info.chapterNumber);
    if (isDuplicate) continue;

    registry.classes[classNum].subjects[info.subject].chapters.push({
      number: info.chapterNumber !== -1 ? info.chapterNumber : registry.classes[classNum].subjects[info.subject].chapters.length + 1,
      title: info.title,
      file: fileBase,
      url: href
    });
    
    validExemplarsAdded++;
  }
  
  // Sort chapters
  for (const cls in registry.classes) {
    for (const sub in registry.classes[cls].subjects) {
      registry.classes[cls].subjects[sub].chapters.sort((a, b) => a.number - b.number);
    }
  }

  console.log(`Writing ${validExemplarsAdded} processed chapters to registry -> ${registryPath}...`);
  fs.mkdirSync(path.dirname(registryPath), { recursive: true });
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  console.log('Successfully completed exemplar registry generation!');
}

scrape().catch(console.error);
