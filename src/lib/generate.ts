import { prisma } from './prisma';
import { openai, MODEL } from './openai';
import { goblinASystemPrompt, goblinBSystemPrompt } from './goblins';
import type { Message } from '@prisma/client';

const MIN_MESSAGES = 20;
const MAX_MESSAGES = 50;

function buildOpenAIMessages(messages: Message[]) {
  return messages.slice(-30).map((m) => ({
    role: m.role === 'goblin_a' ? ('user' as const) : ('assistant' as const),
    content: m.content,
  }));
}

export async function generateNextMessage(conversationId: number): Promise<{
  role: string;
  content: string;
  messageCount: number;
} | null> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conversation || conversation.status !== 'active') return null;

  const messageCount = conversation.messages.length;

  // Check if conversation should complete
  if (messageCount >= MAX_MESSAGES) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'completed' },
    });
    return null;
  }

  // Decide whose turn it is
  const lastMessage = conversation.messages[messageCount - 1];
  const nextRole =
    !lastMessage || lastMessage.role === 'goblin_b' ? 'goblin_a' : 'goblin_b';

  const systemPrompt =
    nextRole === 'goblin_a'
      ? goblinASystemPrompt(conversation.goblinAName, conversation.goblinBName)
      : goblinBSystemPrompt(conversation.goblinAName, conversation.goblinBName);

  const openAIMessages = buildOpenAIMessages(conversation.messages);

  // First message kickoff
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

  const message = await prisma.message.create({
    data: {
      conversationId,
      role: nextRole,
      content,
    },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  const newCount = messageCount + 1;

  // Mark complete if we've hit the minimum and random chance kicks in
  if (
    newCount >= MIN_MESSAGES &&
    Math.random() < (newCount - MIN_MESSAGES) / (MAX_MESSAGES - MIN_MESSAGES)
  ) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { status: 'completed' },
    });
  }

  return { role: message.role, content: message.content, messageCount: newCount };
}

export async function createNewConversation(nameA: string, nameB: string) {
  const conversation = await prisma.conversation.create({
    data: {
      goblinAName: nameA,
      goblinBName: nameB,
      title: `CAVE SESSION: ${nameA} + ${nameB}`,
      status: 'active',
    },
  });

  // Generate the first message
  await generateNextMessage(conversation.id);

  return conversation;
}
