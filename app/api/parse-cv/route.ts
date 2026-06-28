import { NextRequest, NextResponse } from 'next/server';
import { parseCvWithAI } from '@/lib/ai';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let text = '';

    if (file.name.endsWith('.pdf')) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      text = data.text;
    } else if (file.name.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json({ error: 'Unsupported file type. Please upload PDF or DOCX.' }, { status: 400 });
    }

    if (!text.trim()) {
      return NextResponse.json({ error: 'Could not extract text from file.' }, { status: 422 });
    }

    const parsed = await parseCvWithAI(text);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error('Parse CV error:', err);
    return NextResponse.json(
      { error: "We couldn't extract enough information from this file. Try the Quick Entry tab instead." },
      { status: 500 }
    );
  }
}
