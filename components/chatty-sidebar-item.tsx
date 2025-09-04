import type { Chatty } from '@/lib/db/schema';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';
import { DeleteIcon, EditIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSidebar } from './ui/sidebar';

export const ChattySidebarItem = ({ chatty }: { chatty: Chatty }) => {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <div className="flex flex-row items-center gap-2">
      <div>{chatty.name}</div>
      <div className="text-xs text-gray-500 flex-1">{chatty.description}</div>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            className="p-2 h-fit"
            onClick={() => {
              setOpenMobile(false);
              fetch(`/api/chatty/${chatty.id}?id=${chatty.id}`, {
                method: 'DELETE',
              });
            }}
          >
            <DeleteIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent align="end">Delete Chatty</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            type="button"
            className="p-2 h-fit"
            onClick={() => {
              setOpenMobile(false);
              router.push(`/chatty/${chatty.id}`);
              router.refresh();
            }}
          >
            <EditIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent align="end">Edit Chatty</TooltipContent>
      </Tooltip>
    </div>
  );
};
