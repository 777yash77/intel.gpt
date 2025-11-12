'use client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, Timestamp, FieldValue } from 'firebase/firestore';
import { Message } from '@/components/chatbot/chat-interface';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

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

const getSafeDate = (timestamp: any): Date | null => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  return null;
}


export default function HistoryPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const messagesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'chat_messages');
  }, [firestore, user]);

  const { data: messages, isLoading: isLoadingHistory, error } = useCollection<Omit<Message, 'id'>>(messagesCollectionRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || isLoadingHistory) {
    return (
        <div className="flex h-dvh flex-col">
            <Header title="Chat History" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                <div className="container mx-auto max-w-4xl space-y-4">
                    <Skeleton className="h-8 w-1/4" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            </main>
        </div>
    );
  }

  if (error) {
    return (
        <div className="flex h-dvh flex-col">
            <Header title="Chat History" />
            <main className="flex-1 overflow-auto p-4 md:p-6">
                 <div className="container mx-auto max-w-4xl">
                    <Alert variant="destructive">
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            Failed to load chat history. Please try again later.
                        </AlertDescription>
                    </Alert>
                </div>
            </main>
        </div>
    )
  }

  const sortedMessages = messages ? [...messages].sort((a, b) => getTimestampMillis(a.timestamp) - getTimestampMillis(b.timestamp)) : [];

  return (
    <div className="flex h-dvh flex-col">
      <Header title="Chat History" />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
          {sortedMessages.length > 0 ? (
            sortedMessages.map((msg, index) => {
              const displayDate = getSafeDate(msg.timestamp);
              return (
                <Card key={msg.id || index}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      {msg.role === 'user' ? <UserIcon className="size-4" /> : <Bot className="size-4" />}
                      {msg.role === 'user' ? 'You' : 'Assistant'}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {displayDate ? format(displayDate, 'PPpp') : 'Sending...'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{msg.content}</p>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                <p>You have no chat history yet.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
