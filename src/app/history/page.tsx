'use client';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { Message } from '@/components/chatbot/chat-interface';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Bot, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';

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

  const sortedMessages = messages ? [...messages].sort((a, b) => (b.timestamp as any) - (a.timestamp as any)) : [];

  return (
    <div className="flex h-dvh flex-col">
      <Header title="Chat History" />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-4xl space-y-6 p-4 md:p-6">
          {sortedMessages.length > 0 ? (
            sortedMessages.map((msg, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {msg.role === 'user' ? <UserIcon className="size-4" /> : <Bot className="size-4" />}
                    {msg.role === 'user' ? 'You' : 'Assistant'}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                     {msg.timestamp ? format((msg.timestamp as any).toDate(), 'PPpp') : ''}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{msg.content}</p>
                </CardContent>
              </Card>
            ))
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
