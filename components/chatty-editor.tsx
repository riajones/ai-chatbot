'use client';

import { Chatty } from '@/lib/db/schema';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useContext, useState, type FormEvent, type MouseEvent } from 'react';
import { toast } from './toast';
import { useRouter } from 'next/navigation';
import { ChattyContext } from '@/app/(chat)/context/ChattyContext';

type ChattyEditorProps = {
  chatty: Chatty;
}

export const ChattyEditor = (props: ChattyEditorProps) => {
  const { saveChatty } = useContext(ChattyContext);
  const router = useRouter();
  const [name, setName] = useState(props.chatty.name);
  const [description, setDescription] = useState(props.chatty.description || '');
  const [context, setContext] = useState(props.chatty.context);

  async function onSave(event: FormEvent | MouseEvent) {
    event.preventDefault();

    const nextChatty = await saveChatty({
      ...props.chatty,
      name,
      description,
      context,
    });

    router.push(`/chatty/${nextChatty.id}`);
  }

  return (
    <form onSubmit={(event) => onSave(event)} className="flex flex-col gap-2 min-w-[300px] w-[80%] mx-auto">
      <Input name="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input name="description" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Textarea name="context" placeholder="Context" value={context} onChange={(e) => setContext(e.target.value)} />
      <Button type="submit" onClick={(event) => onSave(event)} className="w-fit self-end">Save</Button>
    </form>
  );
};