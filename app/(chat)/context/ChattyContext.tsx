"use client";

import { toast } from '@/components/toast';
import type { Chatty } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import { createContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRInfinite, { type SWRInfiniteKeyedMutator } from 'swr/infinite';

type ChattyContextValue = {
  chatties: Chatty[];
  hasMore: boolean;
  isValidating: boolean;
  isLoading: boolean;
  setSize: (size: number | ((_size: number) => number)) => Promise<ChattiesData[] | undefined>;
  deleteChatty: (id: string) => void;
  saveChatty: (chatty: Chatty) => Promise<Chatty>;
};

const defaultChattyContextValue: ChattyContextValue = {
  chatties: [],
  hasMore: true,
  isValidating: false,
  isLoading: false,
  setSize: async () => undefined,
  deleteChatty: async (id: string) => { },
  saveChatty: async (chatty: Chatty) => Promise.resolve(chatty),
};

export const ChattyContext = createContext<ChattyContextValue>(defaultChattyContextValue);

export interface ChattiesData {
  chatties: Array<Chatty>;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

export function getChattiesPaginationKey(
  pageIndex: number,
  previousChattiesData: ChattiesData,
) {
  if (previousChattiesData && previousChattiesData.hasMore === false) {
    return null;
  }

  if (pageIndex === 0) return `/api/chatties?limit=${PAGE_SIZE}`;

  const firstChatFromPage = previousChattiesData.chatties.at(-1);

  if (!firstChatFromPage) return null;

  return `/api/chatties?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}

export const ChattyProvider = ({ children }: { children: React.ReactNode }) => {
  const {
    data: paginatedChatties,
    setSize,
    isValidating,
    isLoading,
  } = useSWRInfinite<ChattiesData>(getChattiesPaginationKey, fetcher, {
    fallbackData: [],
  });
  const [chatties, setChatties] = useState<Chatty[]>([]);

  const hasMore = paginatedChatties
    ? paginatedChatties.some((page) => page.hasMore === false)
    : false;

  useEffect(() => {
    if (paginatedChatties) {
      setChatties([...chatties, ...paginatedChatties.flatMap((page) => page.chatties)]);
    }
  }, [JSON.stringify(paginatedChatties)]);

  async function deleteChatty(id: string) {
    const response = await fetch(`/api/chatty/${id}?id=${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      toast({ type: 'success', description: 'Chatty deleted successfully' });
    } else {
      toast({ type: 'error', description: 'Failed to delete Chatty' });
    }
    setChatties(chatties.filter((chatty) => chatty.id !== id));
  }

  async function saveChatty(chatty: Chatty) {
    const response = await fetch(`/api/chatty`, {
      method: 'POST',
      body: JSON.stringify(chatty),
    });
    if (response.ok) {
      toast({ type: 'success', description: 'Chatty saved successfully' });
    } else {
      toast({ type: 'error', description: 'Failed to save Chatty' });
    }

    const newChatty = await response.json();
    const previous = chatties.filter((existing) => existing.id !== chatty.id);
    setChatties([...previous, newChatty]);
    return newChatty;
  }

  const currentContext = {
    paginatedChatties,
    hasMore,
    setSize,
    isValidating,
    isLoading,
    chatties,
    deleteChatty,
    saveChatty,
  }

  return <ChattyContext.Provider value={currentContext}>{children}</ChattyContext.Provider>;
};
