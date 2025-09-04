import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { getChattyById, getMessagesByChatId } from '@/lib/db/queries';

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
      <h2>{chatty.name}</h2>
      <p>{chatty.description}</p>
    </>
  );
}
