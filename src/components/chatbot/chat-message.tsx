import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from './chat-interface';
import { Icons } from '@/components/icons';
import { memo } from 'react';
import { Remark } from 'react-remark';

function ChatMessageComponent({ message }: { message: Message }) {
  const isUser = message.role === 'user';
  
  const isThinking = message.id === 'thinking';

  return (
    <div
      className={cn(
        'flex items-start gap-4',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <Avatar className="size-10 border">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <Icons.logo className="size-5" />
          </AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          'max-w-[75%] rounded-lg p-3 text-sm shadow-sm',
          isUser
            ? 'rounded-br-none bg-primary text-primary-foreground'
            : 'rounded-bl-none bg-card',
          isThinking ? 'animate-pulse' : ''
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
          >
            <Remark>{message.content}</Remark>
          </div>
        )}
      </div>
    </div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
