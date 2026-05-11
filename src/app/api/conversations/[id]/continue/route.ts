import { NextRequest, NextResponse } from 'next/server';
import { generateNextMessage } from '@/lib/generate';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const conversationId = parseInt(id);

  if (isNaN(conversationId)) {
    return NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
  }

  try {
    const result = await generateNextMessage(conversationId);

    if (!result) {
      return NextResponse.json({ done: true, message: 'Conversation completed or not found' });
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error('Error continuing conversation:', error);
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
  }
}
