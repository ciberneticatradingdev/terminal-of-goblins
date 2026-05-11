'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

interface ConversationItem {
  id: number;
  title: string | null;
  goblinAName: string;
  goblinBName: string;
  status: string;
  createdAt: string;
  _count: { messages: number };
}

export default function ConversationList() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setConversations(data.conversations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch('/api/conversations/generate', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to generate');
      await fetchConversations();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case 'active': return '[ACTIVE]';
      case 'completed': return '[DONE]';
      case 'error': return '[ERROR]';
      default: return `[${status.toUpperCase()}]`;
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'active': return 'text-goblin-green text-glow';
      case 'completed': return 'text-goblin-dim';
      case 'error': return 'text-red-500';
      default: return 'text-goblin-dim';
    }
  };

  return (
    <div className="px-4 py-4 max-w-4xl mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-goblin-dim text-xs">
          {loading ? 'LOADING...' : `${conversations.length} SESSION(S) FOUND`}
        </span>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="border border-goblin-green text-goblin-green text-xs px-4 py-1.5 hover:bg-goblin-green hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-glow-dim tracking-wider"
        >
          {generating ? '[ SPAWNING GOBLINS... ]' : '[ SPAWN NEW SESSION ]'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 text-xs mb-3 border border-red-900 p-2">
          ERROR: {error}
        </div>
      )}

      {/* Separator */}
      <div className="text-goblin-dim text-xs mb-3 opacity-50">
        {'─'.repeat(60)}
      </div>

      {/* Conversation list */}
      {loading ? (
        <div className="text-goblin-dim text-sm animate-pulse">
          &gt; scanning deepcave network...<span className="cursor" />
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-goblin-dim text-sm">
          <p>&gt; no goblin sessions found in network</p>
          <p>&gt; spawn a new session to begin exploration</p>
        </div>
      ) : (
        <div className="space-y-0">
          {conversations.map((conv) => (
            <Link key={conv.id} href={`/cave/${conv.id}`}>
              <div className="group border-b border-goblin-dim border-opacity-30 py-3 px-2 hover:bg-goblin-dark cursor-pointer transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-bold ${statusClass(conv.status)}`}>
                        {statusLabel(conv.status)}
                      </span>
                      <span className="text-goblin-green text-sm group-hover:text-glow truncate">
                        {conv.goblinAName}
                      </span>
                      <span className="text-goblin-dim text-xs">vs</span>
                      <span className="text-goblin-amber text-sm group-hover:text-glow-amber truncate">
                        {conv.goblinBName}
                      </span>
                    </div>
                    <div className="text-goblin-dim text-xs mt-1 opacity-60">
                      {conv.title ?? `Session #${conv.id}`}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-goblin-dim text-xs">
                      {conv._count.messages} msg{conv._count.messages !== 1 ? 's' : ''}
                    </div>
                    <div className="text-goblin-dim text-xs opacity-50">
                      #{conv.id}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Footer divider */}
      <div className="text-goblin-dim text-xs mt-3 opacity-50">
        {'─'.repeat(60)}
      </div>
    </div>
  );
}
