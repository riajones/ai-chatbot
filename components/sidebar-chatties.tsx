'use client';

import { useRouter } from 'next/navigation';
import type { User } from 'next-auth';
import { useContext, useState } from 'react';
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
import { LoaderIcon, PlusIcon } from './icons';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { ChattySidebarItem } from './chatty-sidebar-item';
import { ChattyContext } from '@/app/(chat)/context/ChattyContext';

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
  const { chatties, hasMore, setSize, isValidating, isLoading } = useContext(ChattyContext);

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

  if (!chatties.length) {
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
            <div className="flex flex-col gap-6">
              <div>
                {chatties.map((chatty) => (
                  <ChattySidebarItem key={chatty.id} chatty={chatty} />
                ))}
              </div>
            </div>
          </SidebarMenu>

          <motion.div
            onViewportEnter={() => {
              if (!isValidating && !hasMore) {
                setSize((size) => size + 1);
              }
            }}
          />

          {hasMore ? (
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
    </>
  );
}
