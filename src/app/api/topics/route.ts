import { NextResponse } from 'next/server';
import db, { ensureDbInitialized } from '@/lib/db';

export async function GET() {
  try {
    await ensureDbInitialized();
    const result = await db.execute('SELECT * FROM topics ORDER BY id ASC');
    return NextResponse.json({ topics: result.rows });
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, default_message } = body;

    if (!name || !default_message) {
      return NextResponse.json({ error: 'Name and default message are required' }, { status: 400 });
    }

    await ensureDbInitialized();
    const result = await db.execute({
      sql: 'INSERT INTO topics (name, default_message) VALUES (?, ?)',
      args: [name, default_message]
    });

    const lastId = result.lastInsertRowid ? Number(result.lastInsertRowid) : null;

    const newTopicResult = await db.execute({
      sql: 'SELECT * FROM topics WHERE id = ?',
      args: [lastId]
    });
    const newTopic = newTopicResult.rows[0];

    return NextResponse.json({ topic: newTopic }, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
