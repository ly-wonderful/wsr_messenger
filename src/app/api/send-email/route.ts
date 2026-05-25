import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import db, { ensureDbInitialized } from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, address, topicId, message } = body;

    if (!firstName || !lastName || !email || !address || !topicId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await ensureDbInitialized();

    // Increment topic sent count
    await db.execute({
      sql: 'UPDATE topics SET sent_count = sent_count + 1 WHERE id = ?',
      args: [topicId]
    });

    // Get topic name for the email subject
    const topicResult = await db.execute({
      sql: 'SELECT name FROM topics WHERE id = ?',
      args: [topicId]
    });
    const topic = topicResult.rows[0];
    const subject = `[WSR HOA] ${topic ? String(topic.name) : 'Resident Message'} from ${firstName} ${lastName}`;

    // Construct email html
    const html = `
      <h2>Message from Windsong Ranch Resident</h2>
      <p><strong>Name:</strong> ${firstName} ${lastName}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Address:</strong> ${address}</p>
      <hr />
      <h3>Message:</h3>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;

    // Try sending email
    if (process.env.RESEND_API_KEY) {
      const { data, error } = await resend.emails.send({
        from: 'WSR Messenger <meow@rdkitty.com>', // Updated to custom domain
        to: process.env.BOARD_EMAILS ? process.env.BOARD_EMAILS.split(',') : ['delivered@resend.dev'],
        cc: email,
        replyTo: email,
        subject: subject,
        html: html,
      });

      if (error) {
        console.error('Resend error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      console.warn('RESEND_API_KEY is not set. Simulating email send.', html);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error in send-email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
