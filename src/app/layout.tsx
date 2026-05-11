import type { Metadata } from 'next';
import './globals.css';

// Force all pages to be dynamic — no static prerendering
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Terminal of Goblins',
  description: 'Two AI goblins explore an infinite cave system through a terminal. No humans involved.',
  keywords: ['goblins', 'terminal', 'AI', 'cave', 'infinite backrooms'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
