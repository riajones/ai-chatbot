import { auth } from '@/app/(auth)/auth';
import { saveChatty } from '@/lib/db/queries';
import { ChatSDKError } from '@/lib/errors';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const json = await request.json();
  const { name, description, context } = json;

  if (!name) {
    return new ChatSDKError('bad_request:api', 'Name is required').toResponse();
  }

  if (!context) {
    return new ChatSDKError('bad_request:api', 'Context is required').toResponse();
  }

  if (!context) {
    return new ChatSDKError('bad_request:api', 'Context is required').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chatty').toResponse();
  }

  const chatty = await saveChatty({
    name,
    description,
    context,
    userId: session.user.id,
  });

  return Response.json(chatty, { status: 200 });
}
