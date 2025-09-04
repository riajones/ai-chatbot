import { redirect } from 'next/navigation';
import { auth } from '@/app/(auth)/auth';
import { ChattyEditor } from '@/components/chatty-editor';

export default async function Page() {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
  }

  return (
    <>
      <ChattyEditor chatty={{
        name: '',
        description: '',
        context: '',
        userId: session.user.id,
        createdAt: new Date(),
        active: true,
        id: '',
      }} />
    </>
  );
}
