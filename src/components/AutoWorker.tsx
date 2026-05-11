'use client';

import { useEffect } from 'react';

// Auto-triggers the worker endpoint every 10 seconds to generate goblin messages
// This runs client-side from whoever has the page open
export default function AutoWorker() {
  useEffect(() => {
    let running = false;

    const tick = async () => {
      if (running) return;
      running = true;
      try {
        await fetch('/api/worker', { method: 'POST' });
      } catch {
        // ignore errors
      }
      running = false;
    };

    // Initial trigger after 3 seconds
    const timeout = setTimeout(tick, 3000);
    // Then every 10 seconds
    const interval = setInterval(tick, 10000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  return null;
}
