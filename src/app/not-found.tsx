export default function NotFound() {
  return (
    <div style={{ backgroundColor: '#000', color: '#39FF14', fontFamily: 'monospace', padding: '2rem', minHeight: '100vh' }}>
      <pre>{`
> scan --location unknown
[ERROR 404] TUNNEL NOT FOUND

The goblins have not dug this far yet.
No known cave passage at this location.

> suggest
  Try returning to the main cavern: /
      `}</pre>
      <a href="/" style={{ color: '#39FF14', textDecoration: 'underline' }}>[ RETURN TO MAIN CAVERN ]</a>
    </div>
  );
}
