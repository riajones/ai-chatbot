'use client';

import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import type { Chat, Chatty } from '@/lib/db/schema';
import { fetcher } from '@/lib/utils';
import useSWRInfinite from 'swr/infinite';
import { LoaderIcon, PlusIcon } from './icons';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';

type GroupedChats = {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
};

export interface ChattiesList {
  chatties: Array<Chatty>;
  hasMore: boolean;
}

const PAGE_SIZE = 20;

const groupChatsByDate = (chats: Chat[]): GroupedChats => {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  return chats.reduce(
    (groups, chat) => {
      const chatDate = new Date(chat.createdAt);

      if (isToday(chatDate)) {
        groups.today.push(chat);
      } else if (isYesterday(chatDate)) {
        groups.yesterday.push(chat);
      } else if (chatDate > oneWeekAgo) {
        groups.lastWeek.push(chat);
      } else if (chatDate > oneMonthAgo) {
        groups.lastMonth.push(chat);
      } else {
        groups.older.push(chat);
      }

      return groups;
    },
    {
      today: [],
      yesterday: [],
      lastWeek: [],
      lastMonth: [],
      older: [],
    } as GroupedChats,
  );
};

export function getChattiesPaginationKey(
  pageIndex: number,
  previousChattiesData: ChattiesList,
) {
  if (previousChattiesData && previousChattiesData.hasMore === false) {
    return null;
  }

  if (pageIndex === 0) return `/api/chatties?limit=${PAGE_SIZE}`;

  const firstChatFromPage = previousChattiesData.chatties.at(-1);

  if (!firstChatFromPage) return null;

  return `/api/chatties?ending_before=${firstChatFromPage.id}&limit=${PAGE_SIZE}`;
}

function ChattiesHeader() {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();
  return (
    <div className="flex flex-row gap-2 justify-between items-center">
      <h3>Chatties</h3>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            className="p-2 h-fit"
            onClick={() => {
              setOpenMobile(false);
              router.push('/chatty/new');
              router.refresh();
            }}
          >
            <PlusIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent align="end">New Chatty</TooltipContent>
      </Tooltip>
    </div>
  );
}

export function SidebarChatties({ user }: { user: User | undefined }) {
  const { setOpenMobile } = useSidebar();
  const { id } = useParams();

  const {
    data: paginatedChatties,
    setSize,
    isValidating,
    isLoading,
    mutate,
  } = useSWRInfinite<ChattiesList>(getChattiesPaginationKey, fetcher, {
    fallbackData: [],
  });

  const router = useRouter();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const hasReachedEnd = paginatedChatties
    ? paginatedChatties.some((page) => page.hasMore === false)
    : false;

  const hasEmptyChatHistory = paginatedChatties
    ? paginatedChatties.every((page) => !page.chatties.length)
    : false;

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chatty?id=${deleteId}`, {
      method: 'DELETE',
    });

    toast.promise(deletePromise, {
      loading: 'Deleting chatty...',
      success: () => {
        mutate((chatHistories) => {
          if (chatHistories) {
            return chatHistories.map((chatHistory) => ({
              ...chatHistory,
              chats: chatHistory.chatties.filter((chatty) => chatty.id !== deleteId),
            }));
          }
        });

        return 'Chatty deleted successfully';
      },
      error: 'Failed to delete chatty',
    });

    setShowDeleteDialog(false);

    if (deleteId === id) {
      router.push('/');
    }
  };

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="flex flex-row gap-2 justify-center items-center px-2 w-full text-sm text-zinc-500">
            Login to create and manage your Chatties!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (isLoading) {
    return (
      <SidebarGroup>
        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
          Today
        </div>
        <SidebarGroupContent>
          <div className="flex flex-col">
            {[44, 32, 28, 64, 52].map((item) => (
              <div
                key={item}
                className="flex gap-2 items-center px-2 h-8 rounded-md"
              >
                <div
                  className="h-4 rounded-md flex-1 max-w-[--skeleton-width] bg-sidebar-accent-foreground/10"
                  style={
                    {
                      '--skeleton-width': `${item}%`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (hasEmptyChatHistory) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <ChattiesHeader />
          <div className="flex flex-row gap-2 justify-center items-center px-2 w-full text-sm text-zinc-500">
            Your Chatties will appear here once you create them!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <ChattiesHeader />
          <SidebarMenu>
            {paginatedChatties &&
              (() => {
                const chattiesFromHistory = paginatedChatties.flatMap(
                  (paginatedChatties) => paginatedChatties.chatties,
                );

                return (
                  <div className="flex flex-col gap-6">
                    {(
                      <div>
                        <div className="px-2 py-1 text-xs text-sidebar-foreground/50">
                          Today
                        </div>
                        {chattiesFromHistory.map((chatty) => (
                          <div>{chatty.name}</div>
                          // <ChatItem
                          //   key={chat.id}
                          //   chat={chat}
                          //   isActive={chat.id === id}
                          //   onDelete={(chatId) => {
                          //     setDeleteId(chatId);
                          //     setShowDeleteDialog(true);
                          //   }}
                          //   setOpenMobile={setOpenMobile}
                          // />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
          </SidebarMenu>

          <motion.div
            onViewportEnter={() => {
              if (!isValidating && !hasReachedEnd) {
                setSize((size) => size + 1);
              }
            }}
          />

          {hasReachedEnd ? (
            <div className="flex flex-row gap-2 justify-center items-center px-2 mt-8 w-full text-sm text-zinc-500">
              This is ALL of your Chatties!
            </div>
          ) : (
            <div className="flex flex-row gap-2 items-center p-2 mt-8 text-zinc-500 dark:text-zinc-400">
              <div className="animate-spin">
                <LoaderIcon />
              </div>
              <div>Loading Chatties...</div>
            </div>
          )}
        </SidebarGroupContent>
      </SidebarGroup>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              Chatty and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
