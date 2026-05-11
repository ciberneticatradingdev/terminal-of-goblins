import { NextResponse } from 'next/server';
import { randomGoblinPair } from '@/lib/goblins';
import { createNewConversation } from '@/lib/generate';

export async function POST() {
  try {
    const { a: nameA, b: nameB } = randomGoblinPair();
    const conversation = await createNewConversation(nameA, nameB);

    return NextResponse.json({
      success: true,
      conversation: {
        id: conversation.id,
        title: conversation.title,
        goblinAName: conversation.goblinAName,
        goblinBName: conversation.goblinBName,
        status: conversation.status,
      },
    });
  } catch (error) {
    console.error('Error generating conversation:', error);
    return NextResponse.json({ error: 'Failed to generate conversation' }, { status: 500 });
  }
}
