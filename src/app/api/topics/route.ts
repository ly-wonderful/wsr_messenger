import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const topics = db.prepare('SELECT * FROM topics ORDER BY id ASC').all();
    return NextResponse.json({ topics });
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

    const insert = db.prepare('INSERT INTO topics (name, default_message) VALUES (?, ?)');
    const result = insert.run(name, default_message);

    const newTopic = db.prepare('SELECT * FROM topics WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ topic: newTopic }, { status: 201 });
  } catch (error) {
    console.error('Error creating topic:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
