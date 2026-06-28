import { NextRequest, NextResponse } from 'next/server';
import { generateDebrief } from '@/lib/ai';
import { ParticipantSession, JobDescription, CandidatePersona } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      session: ParticipantSession;
      jd: JobDescription;
      persona: CandidatePersona;
    };

    const report = await generateDebrief(body.session, body.jd, body.persona);
    return NextResponse.json(report);
  } catch (err) {
    console.error('Debrief API error:', err);
    return NextResponse.json({ error: 'Failed to generate debrief' }, { status: 500 });
  }
}
