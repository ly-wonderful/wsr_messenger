import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import db from '@/lib/db';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, address, topicId, message } = body;

    if (!firstName || !lastName || !email || !address || !topicId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Increment topic sent count
    const update = db.prepare('UPDATE topics SET sent_count = sent_count + 1 WHERE id = ?');
    update.run(topicId);

    // Get topic name for the email subject
    const topic = db.prepare('SELECT name FROM topics WHERE id = ?').get(topicId) as { name: string };
    const subject = `[WSR HOA] ${topic ? topic.name : 'Resident Message'} from ${firstName} ${lastName}`;

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
        from: 'WSR Messenger <onboarding@resend.dev>', // Should be updated when real domain is added
        to: process.env.BOARD_EMAILS ? process.env.BOARD_EMAILS.split(',') : ['delivered@resend.dev'],
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
