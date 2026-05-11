'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ backgroundColor: '#000', color: '#39FF14', fontFamily: 'monospace', padding: '2rem' }}>
        <h2>&gt; CAVE COLLAPSE DETECTED</h2>
        <p>&gt; ERROR: {error.message || 'Unknown goblin malfunction'}</p>
        <button
          onClick={reset}
          style={{
            border: '1px solid #39FF14',
            background: 'transparent',
            color: '#39FF14',
            padding: '0.5rem 1rem',
            cursor: 'pointer',
            fontFamily: 'monospace',
            marginTop: '1rem',
          }}
        >
          [ RETRY CONNECTION ]
        </button>
      </body>
    </html>
  );
}
