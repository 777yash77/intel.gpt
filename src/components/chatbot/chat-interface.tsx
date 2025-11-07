'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { interactWithLegalAIChatbot } from '@/ai/flows/legal-ai-chatbot';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { addDocumentNonBlocking, useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
};

export function ChatInterface() {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const viewportRef = useRef<HTMLDivElement>(null);
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const messagesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'chat_messages');
  }, [firestore, user]);

  const { data: firestoreMessages, isLoading: isLoadingHistory } = useCollection<Omit<Message, 'id'>>(messagesCollectionRef);

  const messages = useMemo(() => {
    if (!user) {
      return localMessages;
    }
    const combined = [
      ...(firestoreMessages || []).map(m => ({ ...m, timestamp: (m.timestamp as any)?.toDate() })),
      ...localMessages.filter(lm => !(firestoreMessages || []).some(fm => fm.id === lm.id))
    ];
    combined.sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
    return combined;
  }, [localMessages, firestoreMessages, user]);


  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    if (user && messagesCollectionRef) {
        addDocumentNonBlocking(messagesCollectionRef, {
            role: 'user',
            content: input,
            timestamp: new Date(),
        });
    } else {
        setLocalMessages((prev) => [...prev, userMessage]);
    }

    setIsLoading(true);

    try {
      const result = await interactWithLegalAIChatbot({ query: input });
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.legalInsight,
        timestamp: new Date(),
      };
      
      if (user && messagesCollectionRef) {
        addDocumentNonBlocking(messagesCollectionRef, {
            role: 'assistant',
            content: result.legalInsight,
            timestamp: new Date(),
        });
      } else {
        setLocalMessages((prev) => [...prev, assistantMessage]);
      }

    } catch (error) {
      console.error('Error interacting with chatbot:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          'Failed to get a response from the assistant. Please try again.',
      });
      // Note: We don't remove the user message on error anymore to preserve chat flow
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-card">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold">Legal Chatbot</h1>
      </div>
      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="p-4 md:p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            {(isLoadingHistory && !messages.length) && (
              <>
                <div className="flex items-start gap-4 justify-end">
                    <div className="flex-1 space-y-2 max-w-[75%]">
                      <Skeleton className="h-12 w-full" />
                    </div>
                    <Skeleton className="size-10 rounded-full" />
                </div>
                <div className="flex items-start gap-4">
                  <Skeleton className="size-10 rounded-full" />
                  <div className="flex-1 space-y-2 max-w-[75%]">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                </div>
              </>
            )}
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-start gap-4">
                <Skeleton className="size-10 rounded-full" />
                <div className="flex-1 space-y-2 max-w-[75%]">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            )}
            {!isUserLoading && !user && messages.length === 0 && (
                <div className="text-center text-muted-foreground p-8">
                    <p>
                        <Link href="/login" className="underline text-primary">Log in</Link> or{' '}
                        <Link href="/signup" className="underline text-primary">sign up</Link>
                        {' '}to save your chat history.
                    </p>
                </div>
            )}
          </div>
        </div>
      </ScrollArea>
      <div className="border-t bg-background/50 p-4 backdrop-blur-sm md:p-6">
        <div className="mx-auto max-w-4xl">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
