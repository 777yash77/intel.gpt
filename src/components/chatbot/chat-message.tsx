import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import type { Message } from './chat-interface';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Icons } from '@/components/icons';
import { User } from 'lucide-react';

const userAvatar = PlaceHolderImages.find((img) => img.id === 'user-avatar');

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  // A simple markdown-to-html converter
  const renderContent = (content: string) => {
    // Basic bold, italic, and list support
    content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
    content = content.replace(/- (.*?)(?=\n- |\n\n|$)/g, '<li>$1</li>');
    content = content.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    content = content.replace(/\n/g, '<br />');
    return { __html: content };
  };

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
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div
            className="prose prose-sm dark:prose-invert"
            dangerouslySetInnerHTML={renderContent(message.content)}
          />
        )}
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
