import { NextRequest, NextResponse } from 'next/server';
import { analyseStarCoverage } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const { managerQuestion, candidateResponse, competency } = await req.json();
    const coverage = await analyseStarCoverage(managerQuestion, candidateResponse, competency);
    return NextResponse.json(coverage);
  } catch (err) {
    console.error('STAR analysis error:', err);
    return NextResponse.json({ situation: 0, task: 0, action: 0, result: 0 });
  }
}
