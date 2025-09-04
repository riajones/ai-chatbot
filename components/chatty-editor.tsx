'use client';

import { Chatty } from '@/lib/db/schema';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useState } from 'react';
import { toast } from './toast';

type ChattyEditorProps = {
  chatty: Chatty;
}

export const ChattyEditor = (props: ChattyEditorProps) => {
  const [name, setName] = useState(props.chatty.name);
  const [description, setDescription] = useState(props.chatty.description || '');
  const [context, setContext] = useState(props.chatty.context);

  async function onSave() {
    const nextChatty = {
      ...props.chatty,
      name,
      description,
      context,
    };

    const response = await fetch(`/api/chatty`, {
      method: 'POST',
      body: JSON.stringify(nextChatty),
    });
    if (response.ok) {
      toast({ type: 'success', description: 'Chatty saved successfully' });
    } else {
      toast({ type: 'error', description: 'Failed to save Chatty' });
    }
  }

  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <Input name="name" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input name="description" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <Textarea name="context" placeholder="Context" value={context} onChange={(e) => setContext(e.target.value)} />
      <Button type="submit" onClick={() => onSave()}>Save</Button>
    </form>
  );
};