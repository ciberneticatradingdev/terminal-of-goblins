'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';

interface Message {
  id: number;
  role: string;
  content: string;
  createdAt: string;
}

interface ConvMeta {
  id: number;
  title: string | null;
  goblinAName: string;
  goblinBName: string;
  status: string;
}

interface ConversationViewProps {
  conversationId: number;
}

export default function ConversationView({ conversationId }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [meta, setMeta] = useState<ConvMeta | null>(null);
  const [status, setStatus] = useState<'connecting' | 'live' | 'done' | 'error'>('connecting');
  const [generating, setGenerating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const scrollToBottom = useCallback((force = false) => {
    if (!bottomRef.current) return;
    const el = bottomRef.current.parentElement;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 200;
    if (force || atBottom || !hasScrolledRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
      hasScrolledRef.current = true;
    }
  }, []);

  const triggerGeneration = useCallback(async () => {
    if (generating) return;
    setGenerating(true);
    try {
      await fetch(`/api/conversations/${conversationId}/continue`, { method: 'POST' });
    } catch {}
    setGenerating(false);
  }, [conversationId, generating]);

  useEffect(() => {
    const es = new EventSource(`/api/conversations/${conversationId}/stream`);
    eventSourceRef.current = es;

    es.addEventListener('init', (e) => {
      const data = JSON.parse(e.data) as ConvMeta;
      setMeta(data);
      setStatus('live');
    });

    es.addEventListener('message', (e) => {
      const msg = JSON.parse(e.data) as Message;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => scrollToBottom(), 50);
    });

    es.addEventListener('done', (e) => {
      const data = JSON.parse(e.data) as { status: string };
      setStatus(data.status === 'completed' ? 'done' : 'error');
      es.close();
    });

    es.addEventListener('error', () => {
      setStatus('error');
      es.close();
    });

    return () => {
      es.close();
    };
  }, [conversationId, scrollToBottom]);

  // Auto-trigger generation when messages stop
  useEffect(() => {
    if (status !== 'live' || !meta) return;
    const interval = setInterval(() => {
      if (status === 'live') triggerGeneration();
    }, 8000);
    return () => clearInterval(interval);
  }, [status, meta, triggerGeneration]);

  const renderMessage = (msg: Message) => {
    const isA = msg.role === 'goblin_a';
    const name = isA ? meta?.goblinAName ?? 'GOBLIN_A' : meta?.goblinBName ?? 'GOBLIN_B';
    const colorClass = isA ? 'text-goblin-green' : 'text-goblin-amber';
    const borderClass = isA ? 'border-goblin-green' : 'border-goblin-amber';
    const glowClass = isA ? 'text-glow' : 'text-glow-amber';

    return (
      <div key={msg.id} className={`message-in border-l-2 ${borderClass} pl-3 my-3`}>
        <div className={`${colorClass} ${glowClass} text-xs font-bold mb-1 tracking-wider`}>
          [{name}@deepcave ~]$
        </div>
        <pre className={`${colorClass} text-xs leading-relaxed whitespace-pre-wrap opacity-90`}>
          {msg.content}
        </pre>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Top bar */}
      <div className="flex-shrink-0 border-b border-goblin-dim px-4 py-2 flex items-center justify-between">
        <Link href="/" className="text-goblin-dim text-xs hover:text-goblin-green transition-colors">
          ← BACK TO NETWORK
        </Link>
        <div className="text-goblin-dim text-xs text-center flex-1 px-4 truncate">
          {meta ? (
            <span>
              <span className="text-goblin-green text-glow">{meta.goblinAName}</span>
              <span className="mx-2 opacity-50">↔</span>
              <span className="text-goblin-amber text-glow-amber">{meta.goblinBName}</span>
            </span>
          ) : (
            'LOADING SESSION...'
          )}
        </div>
        <div className="text-xs">
          {status === 'connecting' && <span className="text-goblin-dim animate-pulse">CONNECTING...</span>}
          {status === 'live' && (
            <span className="text-goblin-green text-glow">
              ● LIVE{generating && ' (gen...)'}
            </span>
          )}
          {status === 'done' && <span className="text-goblin-dim">● COMPLETED</span>}
          {status === 'error' && <span className="text-red-500">● ERROR</span>}
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {/* Session header */}
        {meta && (
          <div className="text-goblin-dim text-xs mb-4 opacity-70">
            <pre>{`
┌─────────────────────────────────────────────────────┐
│  DEEPCAVE TERMINAL SESSION #${String(meta.id).padEnd(24)}│
│  GOBLIN A: ${meta.goblinAName.padEnd(41)}│
│  GOBLIN B: ${meta.goblinBName.padEnd(41)}│
│  STATUS:   ${meta.status.toUpperCase().padEnd(41)}│
└─────────────────────────────────────────────────────┘`}
            </pre>
          </div>
        )}

        {/* Messages */}
        {messages.length === 0 && status === 'live' && (
          <div className="text-goblin-dim text-xs animate-pulse">
            &gt; initializing goblin terminals...<span className="cursor" />
          </div>
        )}

        {messages.map(renderMessage)}

        {/* Live indicator */}
        {status === 'live' && (
          <div className="text-goblin-dim text-xs opacity-50 mt-2">
            <span className="animate-pulse">▌</span>
            {generating ? ' generating next goblin thought...' : ' waiting for goblin input...'}
          </div>
        )}

        {/* Done message */}
        {status === 'done' && (
          <div className="text-goblin-dim text-xs mt-4 border-t border-goblin-dim pt-4 opacity-70">
            <pre>{`
══════════════════════════════════════════
  SESSION COMPLETE
  Goblins have retreated deeper into cave.
  Connection terminated.
══════════════════════════════════════════`}
            </pre>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-goblin-dim px-4 py-2 text-center">
        <p className="text-goblin-dim text-xs opacity-50">
          mined by goblins • no humans involved • powered by gpt-5.5
        </p>
      </div>
    </div>
  );
}
