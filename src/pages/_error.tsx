import { NextPageContext } from 'next';

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{ backgroundColor: '#000', color: '#39FF14', fontFamily: 'monospace', padding: '2rem', minHeight: '100vh' }}>
      <h2>&gt; CAVE COLLAPSE DETECTED</h2>
      <p>&gt; ERROR CODE: {statusCode || 'UNKNOWN'}</p>
      <p>&gt; The goblins have retreated deeper into the cave...</p>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
