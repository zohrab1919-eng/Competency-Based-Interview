import { NextRequest, NextResponse } from 'next/server';
import { detectCandidateQuestionOpportunity } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { managerMessage } = await req.json();
    const isInvitation = await detectCandidateQuestionOpportunity(managerMessage);
    return NextResponse.json({ isInvitation });
  } catch (err) {
    console.error('Question detection error:', err);
    return NextResponse.json({ isInvitation: false });
  }
}
