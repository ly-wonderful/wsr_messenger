import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(path.join(dataDir, 'wsr_messenger.db'));

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    default_message TEXT NOT NULL,
    sent_count INTEGER DEFAULT 0
  );
`);

// Seed initial topics if empty
const count = db.prepare('SELECT COUNT(*) as count FROM topics').get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO topics (name, default_message) VALUES (?, ?)');
  insert.run(
    'Maintenance Request',
    'Dear HOA Board,\n\nI am writing to submit a maintenance request regarding...'
  );
  insert.run(
    'Community Suggestion',
    'Dear HOA Board,\n\nI have a suggestion for the Windsong Ranch community that I would like to share...'
  );
  insert.run(
    'Noise Complaint',
    'Dear HOA Board,\n\nI am writing to report a noise issue at...'
  );
}

export default db;
