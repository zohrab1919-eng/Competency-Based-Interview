import { NextRequest, NextResponse } from 'next/server';
import { getAllSessions, upsertSession, deleteSession, clearAllSessions } from '@/lib/server-store';
import { ParticipantSession } from '@/lib/types';

export async function GET() {
  return NextResponse.json(getAllSessions());
}

export async function POST(req: NextRequest) {
  const session = await req.json() as ParticipantSession;
  upsertSession(session);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest) {
  const session = await req.json() as ParticipantSession;
  upsertSession(session);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const all = searchParams.get('all');
  if (all === 'true') {
    clearAllSessions();
  } else if (id) {
    deleteSession(id);
  }
  return NextResponse.json({ ok: true });
}
