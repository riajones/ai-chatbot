import { auth } from '@/app/(auth)/auth';
import { deleteChattyById, getChattyById, saveChatty } from '@/lib/db/queries';
import { Chatty } from '@/lib/db/schema';
import { ChatSDKError } from '@/lib/errors';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const chattyId = searchParams.get('id');

  if (!chattyId) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chatty').toResponse();
  }

  let chatty: Chatty;

  try {
    chatty = await getChattyById({ id: chattyId });
  } catch {
    return new ChatSDKError('not_found:chatty').toResponse();
  }

  if (!chatty) {
    return new ChatSDKError('not_found:chatty').toResponse();
  }

  if (chatty.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chatty').toResponse();
  }

  return Response.json(chatty, { status: 200 });
}

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

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chatty').toResponse();
  }

  const chat = await getChattyById({ id });

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chatty').toResponse();
  }

  const deletedChatty = await deleteChattyById({ id });

  return Response.json(deletedChatty, { status: 200 });
}