import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from './chat-interface';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Icons } from '@/components/icons';
import { User } from 'lucide-react';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';
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
            : 'rounded-bl-none bg-card'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
      {isUser && (
        <Avatar className="size-10 border">
          {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User" />}
          <AvatarFallback>
            <User className="size-5" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
