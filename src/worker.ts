/**
 * Background worker: autonomously generates goblin conversations.
 * Run with: npx tsx src/worker.ts
 * On Railway: add "worker: npm run worker" to Procfile
 */

import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import { goblinASystemPrompt, goblinBSystemPrompt, randomGoblinPair } from './lib/goblins';
import type { Message } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error'],
});

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL ?? 'gpt-5.5';

const TARGET_ACTIVE = 3;      // keep at least this many active conversations
const MIN_MESSAGES = 20;
const MAX_MESSAGES = 50;
const CYCLE_DELAY_MS = 5000;  // pause between worker cycles
const MSG_DELAY_MS = 2000;    // pause between message generations

function buildOpenAIMessages(messages: Message[]) {
  return messages.slice(-30).map((m) => ({
    role: m.role === 'goblin_a' ? ('user' as const) : ('assistant' as const),
    content: m.content,
  }));
}

async function generateMessage(conversationId: number): Promise<boolean> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { messages: { orderBy: { createdAt: 'asc' } } },
  });

  if (!conversation || conversation.status !== 'active') return false;

  const count = conversation.messages.length;
  const lastMessage = conversation.messages[count - 1];
  const nextRole =
    !lastMessage || lastMessage.role === 'goblin_b' ? 'goblin_a' : 'goblin_b';

  const systemPrompt =
    nextRole === 'goblin_a'
      ? goblinASystemPrompt(conversation.goblinAName, conversation.goblinBName)
      : goblinBSystemPrompt(conversation.goblinAName, conversation.goblinBName);

  const openAIMessages = buildOpenAIMessages(conversation.messages);
  if (openAIMessages.length === 0) {
    openAIMessages.push({
      role: 'user' as const,
      content:
        '[SYSTEM] Terminal connection established. Goblin session starting. Begin exploring the Deepcave Network.',
    });
  }

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages: [{ role: 'system', content: systemPrompt }, ...openAIMessages],
    max_tokens: 500,
    temperature: 0.92,
  });

  const content =
    completion.choices[0]?.message?.content ??
    '> sniff\n[ERROR: goblin too confused to continue]';

  await prisma.message.create({
    data: { conversationId, role: nextRole, content },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const newCount = count + 1;
  if (
    newCount >= MAX_MESSAGES ||
    (newCount >= MIN_MESSAGES &&
      Math.random() < (newCount - MIN_MESSAGES) / (MAX_MESSAGES - MIN_MESSAGES))
  ) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'completed' },
    });
    console.log(`[worker] Conversation #${conversationId} completed at ${newCount} messages`);
    return false;
  }

  return true;
}

async function spawnConversation() {
  const { a: nameA, b: nameB } = randomGoblinPair();
  const conv = await prisma.conversation.create({
    data: {
      goblinAName: nameA,
      goblinBName: nameB,
      title: `CAVE SESSION: ${nameA} + ${nameB}`,
      status: 'active',
    },
  });
  console.log(`[worker] Spawned new conversation #${conv.id}: ${nameA} vs ${nameB}`);
  return conv.id;
}

async function runCycle() {
  try {
    // Check active conversations
    const active = await prisma.conversation.findMany({
      where: { status: 'active' },
      orderBy: { updatedAt: 'asc' },
      include: { _count: { select: { messages: true } } },
    });

    // Spawn new ones if needed
    if (active.length < TARGET_ACTIVE) {
      const toSpawn = TARGET_ACTIVE - active.length;
      for (let i = 0; i < toSpawn; i++) {
        const id = await spawnConversation();
        active.push(
          await prisma.conversation.findUniqueOrThrow({
            where: { id },
            include: { _count: { select: { messages: true } } },
          })
        );
        await new Promise((r) => setTimeout(r, MSG_DELAY_MS));
      }
    }

    // Generate one message for each active conversation
    for (const conv of active) {
      console.log(
        `[worker] Generating message for #${conv.id} (${conv._count.messages} msgs)`
      );
      try {
        const continued = await generateMessage(conv.id);
        if (!continued) {
          console.log(`[worker] #${conv.id} is now complete`);
        }
      } catch (err) {
        console.error(`[worker] Error generating for #${conv.id}:`, err);
        await prisma.conversation.update({
          where: { id: conv.id },
          data: { status: 'error' },
        });
      }
      await new Promise((r) => setTimeout(r, MSG_DELAY_MS));
    }
  } catch (err) {
    console.error('[worker] Cycle error:', err);
  }
}

async function main() {
  console.log('[worker] Terminal of Goblins worker starting...');
  console.log(`[worker] Using model: ${MODEL}`);

  // Verify DB connection
  await prisma.$connect();
  console.log('[worker] Database connected');

  // Main loop
  while (true) {
    await runCycle();
    await new Promise((r) => setTimeout(r, CYCLE_DELAY_MS));
  }
}

main().catch((err) => {
  console.error('[worker] Fatal error:', err);
  process.exit(1);
});
