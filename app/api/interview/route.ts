import { NextRequest, NextResponse } from 'next/server';
import { generatePersonaResponseStream } from '@/lib/ai';
import { ParticipantSession, JobDescription, CandidatePersona } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      session: ParticipantSession;
      jd: JobDescription;
      persona: CandidatePersona;
      newManagerMessage: string;
    };

    const { session, jd, persona, newManagerMessage } = body;

    const history = session.messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const stream = await generatePersonaResponseStream(persona, jd, history, newManagerMessage);

    return new Response(stream, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('Interview API error:', err);
    return NextResponse.json({ error: 'Failed to generate response' }, { status: 500 });
  }
}
