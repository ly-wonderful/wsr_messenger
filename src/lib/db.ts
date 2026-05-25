import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL || 'file:data/wsr_messenger.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

let initPromise: Promise<void> | null = null;

export async function ensureDbInitialized() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    // 1. Create table if not exists
    await db.execute(`
      CREATE TABLE IF NOT EXISTS topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        default_message TEXT NOT NULL,
        sent_count INTEGER DEFAULT 0
      );
    `);

    // 2. Seed initial topics if empty
    const countResult = await db.execute('SELECT COUNT(*) as count FROM topics');
    const count = Number(countResult.rows[0]?.count || 0);

    if (count === 0) {
      const queries = [
        {
          sql: 'INSERT INTO topics (name, default_message) VALUES (?, ?)',
          args: [
            'Maintenance Request',
            'Dear HOA Board,\n\nI am writing to submit a maintenance request regarding...'
          ]
        },
        {
          sql: 'INSERT INTO topics (name, default_message) VALUES (?, ?)',
          args: [
            'Community Suggestion',
            'Dear HOA Board,\n\nI have a suggestion for the Windsong Ranch community that I would like to share...'
          ]
        },
        {
          sql: 'INSERT INTO topics (name, default_message) VALUES (?, ?)',
          args: [
            'Noise Complaint',
            'Dear HOA Board,\n\nI am writing to report a noise issue at...'
          ]
        }
      ];

      // Execute in a batch transaction
      await db.batch(queries);
    }
  })();

  return initPromise;
}

export default db;
