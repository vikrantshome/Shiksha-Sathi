import fs from 'fs/promises';
import path from 'path';

const DB_FILE = path.join(process.cwd(), 'data', 'db.json');

export interface Class {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  createdAt: string;
}

interface DatabaseSchema {
  classes: Class[];
}

const defaultData: DatabaseSchema = { classes: [] };

export async function getDb(): Promise<DatabaseSchema> {
  try {
    const data = await fs.readFile(DB_FILE, 'utf-8');
    return JSON.parse(data) as DatabaseSchema;
  } catch (error) {
    // If file doesn't exist, return default data
    return defaultData;
  }
}

export async function saveDb(data: DatabaseSchema): Promise<void> {
  // Ensure data dir exists
  await fs.mkdir(path.dirname(DB_FILE), { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}
