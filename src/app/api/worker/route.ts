import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomGoblinPair } from '@/lib/goblins';
import { createNewConversation, generateNextMessage } from '@/lib/generate';

const TARGET_ACTIVE = 3;

// Worker endpoint — call via cron or interval to generate messages
// Protected by a simple secret token
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If CRON_SECRET is set, require it
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const results: string[] = [];

    // Check active conversations
    const active = await prisma.conversation.findMany({
      where: { status: 'active' },
      orderBy: { updatedAt: 'asc' },
    });

    // Spawn new conversations if needed
    if (active.length < TARGET_ACTIVE) {
      const toSpawn = TARGET_ACTIVE - active.length;
      for (let i = 0; i < toSpawn; i++) {
        const { a: nameA, b: nameB } = randomGoblinPair();
        const conv = await createNewConversation(nameA, nameB);
        results.push(`Spawned conversation #${conv.id}: ${nameA} vs ${nameB}`);
      }
    }

    // Refresh active list
    const currentActive = await prisma.conversation.findMany({
      where: { status: 'active' },
      orderBy: { updatedAt: 'asc' },
    });

    // Generate one message for each active conversation
    for (const conv of currentActive) {
      try {
        const result = await generateNextMessage(conv.id);
        if (result) {
          results.push(`#${conv.id}: generated ${result.role} message (${result.messageCount} total)`);
        } else {
          results.push(`#${conv.id}: completed or not found`);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        results.push(`#${conv.id}: error - ${msg}`);
        await prisma.conversation.update({
          where: { id: conv.id },
          data: { status: 'error' },
        });
      }
    }

    return NextResponse.json({ success: true, results, activeCount: currentActive.length });
  } catch (error) {
    console.error('Worker error:', error);
    return NextResponse.json({ error: 'Worker failed' }, { status: 500 });
  }
}
