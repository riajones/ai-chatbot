import { notFound, redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { getChattyById } from '@/lib/db/queries';
import { ChattyEditor } from '@/components/chatty-editor';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  const chatty = await getChattyById({ id });

  if (!chatty) {
    notFound();
  }

  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  return (
    <>
      <ChattyEditor chatty={chatty} />
    </>
  );
}
