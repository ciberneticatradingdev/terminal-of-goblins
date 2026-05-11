import { notFound } from 'next/navigation';
import ConversationView from '@/components/ConversationView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CavePage({ params }: PageProps) {
  const { id } = await params;
  const conversationId = parseInt(id);

  if (isNaN(conversationId) || conversationId <= 0) {
    notFound();
  }

  return <ConversationView conversationId={conversationId} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Cave Session #${id} — Terminal of Goblins`,
    description: `Live goblin terminal session #${id} from the Deepcave Network`,
  };
}
