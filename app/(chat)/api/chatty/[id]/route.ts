import { auth } from '@/app/(auth)/auth';
import { deleteChattyById, getChattyById } from '@/lib/db/queries';
import { Chatty } from '@/lib/db/schema';
import { ChatSDKError } from '@/lib/errors';

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: chattyId } = await params;

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



export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: chattyId } = await params;

  console.log('chattyId', chattyId);

  if (!chattyId) {
    return new ChatSDKError('bad_request:api').toResponse();
  }

  const session = await auth();

  if (!session?.user) {
    return new ChatSDKError('unauthorized:chatty').toResponse();
  }

  const chat = await getChattyById({ id: chattyId });

  if (chat.userId !== session.user.id) {
    return new ChatSDKError('forbidden:chatty').toResponse();
  }

  const deletedChatty = await deleteChattyById({ id: chattyId });

  return Response.json(deletedChatty, { status: 200 });
}