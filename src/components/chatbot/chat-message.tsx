
'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from './chat-interface';
import { Icons } from '@/components/icons';
import { memo } from 'react';
import { Remark } from 'react-remark';

function ChatMessageComponent({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  const isThinking = message.role === 'assistant' && !message.content;

  return (
    <div
      className={cn(
        'w-full px-6 py-4',
        isUser ? 'bg-transparent' : 'bg-secondary/20'
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-[75ch] items-start gap-4 text-[15px]'
        )}
      >
        <Avatar className="size-8 border">
          <AvatarFallback
            className={cn(
              isUser
                ? 'bg-transparent text-foreground'
                : 'bg-primary text-primary-foreground'
            )}
          >
            {isUser ? 'U' : <Icons.logo className="size-5" />}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-3 leading-relaxed pt-0.5">
          {isThinking ? (
            <p className="text-muted-foreground">Intel.gpt is thinking...</p>
          ) : (
            <div
              className={cn(
                'prose-sm dark:prose-invert max-w-none',
                // This ensures paragraphs inside remark have correct spacing
                '[&_p]:my-0 [&_p:not(:last-child)]:mb-3'
              )}
            >
              <Remark>{message.content}</Remark>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
