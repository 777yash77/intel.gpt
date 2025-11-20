'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { streamLegalAIChatbot } from '@/ai/flows/legal-ai-chatbot';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  addDocumentNonBlocking,
  useCollection,
  useUser,
  useFirestore,
  useMemoFirebase,
} from '@/firebase';
import {
  collection,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Bot, Plus, LogIn, UserPlus } from 'lucide-react';
import { Header } from '../layout/header';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Timestamp | Date | FieldValue;
};

// Helper to get milliseconds from either a Firestore Timestamp or a JS Date
const getTimestampMillis = (timestamp: any): number => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toMillis();
  }
  if (timestamp instanceof Date) {
    return timestamp.getTime();
  }
  // Fallback for FieldValue or other types during optimistic updates.
  // It won't be perfectly sorted until the server value arrives, but it's better than crashing.
  if (timestamp && typeof timestamp.toMillis === 'function') {
    return timestamp.toMillis();
  }
  // For serverTimestamp(), return a recent time to keep it at the bottom.
  // This is an optimistic placement.
  return Date.now();
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

  const { data: firestoreMessages, isLoading: isLoadingHistory } =
    useCollection<Omit<Message, 'id'>>(messagesCollectionRef);

  const messages = useMemo(() => {
    // Prevent combining local and firestore messages if local messages are cleared
    if (localMessages.length === 0 && firestoreMessages && firestoreMessages.length > 0 && !isUserLoading) {
        const fsMessages = (firestoreMessages || []).map((m) => ({
            ...m,
            id: m.id,
        }));
        fsMessages.sort((a, b) => getTimestampMillis(a.timestamp) - getTimestampMillis(b.timestamp));
        return fsMessages;
    }

    const fsMessages = (firestoreMessages || []).map((m) => ({
      ...m,
      id: m.id,
      timestamp: m.timestamp,
    }));

    // Combine and filter duplicates.
    const combined = [...fsMessages, ...localMessages];
    const uniqueMessages = combined.reduce((acc, current) => {
      if (!acc.some((item) => item.id === current.id)) {
        acc.push(current);
      }
      return acc;
    }, [] as Message[]);

    // Sort all messages by timestamp
    uniqueMessages.sort(
      (a, b) => getTimestampMillis(a.timestamp) - getTimestampMillis(b.timestamp)
    );

    return uniqueMessages;
  }, [localMessages, firestoreMessages, isUserLoading]);
  
  const handleNewChat = () => {
    setLocalMessages([]);
    // This will clear the UI. If the user is logged in, a page refresh
    // would bring back the history from Firestore.
    // This provides a "soft reset" for the current session.
  }

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
    
    const currentMessages = messages.length > 0 ? messages : localMessages;

    // Optimistically add user message for non-logged-in users
    if (!user) {
      setLocalMessages((prev) => [...prev, userMessage]);
    } else if (messagesCollectionRef) {
      // For logged-in users, write to Firestore and let the listener handle the UI update.
      // We don't add to localMessages here to prevent duplication.
      addDocumentNonBlocking(messagesCollectionRef, {
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
     if (!user) {
        setLocalMessages((prev) => [...prev, assistantMessage]);
     } else {
        setLocalMessages([...currentMessages, userMessage, assistantMessage])
     }

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
        addDocumentNonBlocking(messagesCollectionRef, {
          role: 'assistant',
          content: fullResponse,
          timestamp: serverTimestamp(),
        });
        
         // After successful save, we can let Firestore's listener take over.
         // We filter out the temp messages (user and assistant) from local state
         // The user message has already been saved, the assistant message is now saved.
        setLocalMessages(prev => prev.filter(m => m.id !== tempUserMessageId && m.id !== assistantId));
      } else {
        // If not logged in, just update the final content of the assistant message.
        setLocalMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId
              ? { ...msg, content: fullResponse, timestamp: new Date() }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error interacting with chatbot:', error);
      const errorMsg =
        'The assistant failed to respond. This can happen due to high demand or API rate limits. Please wait a moment and try again.';
      setLocalMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId ? { ...msg, content: errorMsg } : msg
        )
      );
      toast({
        variant: 'destructive',
        title: 'Assistant Error',
        description: 'Failed to get a response from the assistant.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-dvh flex-col bg-background">
      <Header title="Intelligent Chat">
         <Button variant="outline" size="sm" onClick={handleNewChat}>
            <Plus className='mr-2' />
            New Chat
        </Button>
      </Header>
      <main className="flex flex-1 flex-col overflow-y-hidden">
        <ScrollArea className="flex-1" viewportRef={viewportRef}>
          <div className="h-full px-4 sm:px-6 lg:px-8">
            {!hasMessages && !isLoadingHistory ? (
              <div className="flex h-full flex-col items-center justify-center">
                  <div className="max-w-md text-center">
                    <Bot className="mx-auto mb-4 size-12 text-muted-foreground" />
                    <h2 className="mb-2 text-2xl font-semibold text-foreground">
                      Intel.gpt
                    </h2>
                    <p className="mb-6 text-muted-foreground">
                      Your AI-powered legal intelligence assistant.
                    </p>
                    {!isUserLoading && !user && (
                      <div className="text-card-foreground">
                        <p className="mb-3 text-base">
                          Log in to save your conversations.
                        </p>
                        <div className="flex justify-center gap-4">
                          <Button asChild>
                            <Link href="/login">
                              <LogIn className="mr-2" />
                              Log In
                            </Link>
                          </Button>
                          <Button asChild variant="secondary">
                            <Link href="/signup">
                              <UserPlus className="mr-2" />
                              Sign Up
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
              </div>
            ) : (
               <div className="mx-auto w-full max-w-4xl space-y-6 py-6">
                {isLoadingHistory && !hasMessages && (
                  <>
                    <div className="flex items-start justify-end gap-4">
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
                {isLoading &&
                  (!messages.length || messages[messages.length - 1]?.role !== 'assistant') && (
                    <ChatMessage
                      message={{ id: 'thinking', role: 'assistant', content: '' }}
                    />
                  )}
              </div>
            )}
          </div>
        </ScrollArea>
      </main>

      <div className="border-t bg-background px-4 py-3 md:px-6 md:py-4">
        <div className="mx-auto max-w-4xl">
          <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
