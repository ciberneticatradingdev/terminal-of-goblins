import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const conversationId = parseInt(id);

  if (isNaN(conversationId)) {
    return new Response('Invalid conversation ID', { status: 400 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  request.signal.addEventListener('abort', () => {
    closed = true;
  });

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      try {
        // Send existing messages immediately
        const existingMessages = await prisma.message.findMany({
          where: { conversationId },
          orderBy: { createdAt: 'asc' },
        });

        // Send conversation metadata
        const conv = await prisma.conversation.findUnique({
          where: { id: conversationId },
        });

        if (!conv) {
          send('error', { message: 'Conversation not found' });
          controller.close();
          return;
        }

        send('init', {
          id: conv.id,
          title: conv.title,
          goblinAName: conv.goblinAName,
          goblinBName: conv.goblinBName,
          status: conv.status,
        });

        for (const msg of existingMessages) {
          send('message', msg);
        }

        let lastId = existingMessages[existingMessages.length - 1]?.id ?? 0;
        let heartbeatCount = 0;

        // Poll for new messages
        while (!closed) {
          await new Promise((resolve) => setTimeout(resolve, 2500));
          if (closed) break;

          const [newMessages, updatedConv] = await Promise.all([
            prisma.message.findMany({
              where: { conversationId, id: { gt: lastId } },
              orderBy: { createdAt: 'asc' },
            }),
            prisma.conversation.findUnique({
              where: { id: conversationId },
              select: { status: true },
            }),
          ]);

          for (const msg of newMessages) {
            send('message', msg);
            lastId = msg.id;
          }

          heartbeatCount++;
          if (heartbeatCount % 8 === 0) {
            send('heartbeat', { ts: Date.now() });
          }

          if (updatedConv?.status !== 'active') {
            send('done', { status: updatedConv?.status ?? 'completed' });
            break;
          }
        }
      } catch (err) {
        console.error('SSE stream error:', err);
        if (!closed) {
          try {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            controller.enqueue(
              encoder.encode(`event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`)
            );
          } catch {}
        }
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
