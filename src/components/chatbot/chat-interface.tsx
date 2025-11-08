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
import { collection, serverTimestamp, Timestamp } from 'firebase/firestore';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: any;
};

// Helper to get milliseconds from either a Firestore Timestamp or a JS Date
const getTimestampMillis = (timestamp: any): number => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toMillis();
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  return 0; // Fallback for null/undefined or other types
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
    const fsMessages = (firestoreMessages || []).map(m => ({
      ...m,
      id: m.id,
      timestamp: m.timestamp
    }));
  
    // Combine and filter duplicates.
    const combined = [...fsMessages, ...localMessages];
    const uniqueMessages = combined.reduce((acc, current) => {
      if (!acc.some(item => item.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, [] as Message[]);
    
    // Sort all messages by timestamp
    uniqueMessages.sort((a, b) => getTimestampMillis(a.timestamp) - getTimestampMillis(b.timestamp));
    
    return uniqueMessages;
  }, [localMessages, firestoreMessages]);


  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (input: string) => {
    if (!input.trim() || isLoading) return;
  
    setIsLoading(true);
    
    const userMessageTimestamp = serverTimestamp();
    const tempUserMessageId = `local-user-${Date.now()}`;

    const userMessage: Message = {
        id: tempUserMessageId,
        role: 'user',
        content: input,
        timestamp: new Date(), // Temporary timestamp for sorting
    };

    // Optimistically add user message for non-logged-in users
    if (!user) {
        setLocalMessages((prev) => [...prev, userMessage]);
    } else if (messagesCollectionRef) {
      // For logged-in users, write to Firestore and let the listener handle the UI update.
      // We don't add to localMessages here to prevent duplication.
      await addDocumentNonBlocking(messagesCollectionRef, {
        role: 'user',
        content: input,
        timestamp: userMessageTimestamp,
      });
    }
  
    const assistantId = `assistant-${Date.now()}`;
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(Date.now() + 1), // ensure it's after user message
    };
    
    // Optimistically add the empty assistant message to show the "thinking" state
    setLocalMessages((prev) => [...prev, assistantMessage]);
  
    try {
      const stream = await streamLegalAIChatbot({ query: input });
      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: fullResponse } : msg
          )
        );
      }
  
      if (user && messagesCollectionRef) {
        // Save the full response to Firestore.
        await addDocumentNonBlocking(messagesCollectionRef, {
          role: 'assistant',
          content: fullResponse,
          timestamp: serverTimestamp(),
        });
      }
  
      // Now that streaming is complete and data is saved (if logged in),
      // we can remove the temporary local messages (user and assistant)
      // as they will be replaced by the single source of truth from Firestore.
      if(user) {
        setLocalMessages(prev => prev.filter(m => m.id !== tempUserMessageId && m.id !== assistantId));
      } else {
        // If not logged in, just update the final content of the assistant message.
        // The user message is already there.
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: fullResponse, timestamp: new Date() } : msg
          )
        );
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
            {isLoading && messages[messages.length - 1]?.role !== 'assistant' && (
                 <ChatMessage 
                    message={{ id: 'thinking', role: 'assistant', content: '' }} 
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
