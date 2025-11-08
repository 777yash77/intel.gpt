'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { streamLegalAIChatbot } from '@/ai/flows/legal-ai-chatbot';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { addDocumentNonBlocking, useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

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
    const combined = [
      ...(firestoreMessages || []).map(m => ({ ...m, id: m.id, timestamp: (m.timestamp as any)?.toDate() })),
      ...localMessages.filter(lm => !(firestoreMessages || []).some(fm => fm.id === lm.id))
    ];
    combined.sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
    return combined;
  }, [localMessages, firestoreMessages]);

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
  
    setIsLoading(true);
  
    const userMessageTimestamp = new Date();
  
    // Add user message optimistically
    const userMessage: Message = {
      id: `local-user-${userMessageTimestamp.getTime()}`,
      role: 'user',
      content: input,
      timestamp: userMessageTimestamp,
    };
    setLocalMessages((prev) => [...prev, userMessage]);
  
    // Save to Firestore if logged in
    if (user && messagesCollectionRef) {
      addDocumentNonBlocking(messagesCollectionRef, {
        role: 'user',
        content: input,
        timestamp: userMessageTimestamp,
      });
    }
  
    // Prepare for assistant's response
    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '', // Start with empty content
      timestamp: new Date(userMessageTimestamp.getTime() + 1),
    };
    // Add assistant's placeholder message
    setLocalMessages((prev) => [...prev, assistantMessage]);
  
    try {
      const stream = await streamLegalAIChatbot({ query: input });
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        // Update the content of the assistant's message in the local state as it streams in
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: fullResponse } : msg
          )
        );
      }
  
      // Once streaming is complete, save the full response to Firestore
      if (user && messagesCollectionRef) {
        addDocumentNonBlocking(messagesCollectionRef, {
          role: 'assistant',
          content: fullResponse,
          timestamp: assistantMessage.timestamp,
        });
      }
  
      // Clean up local optimistic messages now that they are in firestore
      if (user) {
        setLocalMessages(prev => prev.filter(m => m.id !== userMessage.id && m.id !== assistantId));
      }
  
    } catch (error) {
      console.error('Error interacting with chatbot:', error);
      const errorMsg = 'Failed to get a response from the assistant. Please try again.';
      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content: errorMsg } : msg
        )
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-card">
      <ScrollArea className="flex-1" viewportRef={viewportRef}>
        <div className="container mx-auto p-4 md:p-6">
          <div className="space-y-6">
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
            {isLoading && localMessages.find(m => m.role === 'assistant')?.content === '' && (
              <ChatMessage 
                message={{ id: 'thinking', role: 'assistant', content: 'Thinking...' }} 
              />
            )}
            {!isUserLoading && !user && messages.length === 0 && !isLoading && (
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
        <div className="container mx-auto">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
