'use client';

import { ChatInterface } from '@/components/chatbot/chat-interface';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <Header title="Intelligent Chat" />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto flex h-full max-w-4xl flex-col p-4 md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Legal Chatbot</h2>
            <Button asChild variant="outline">
              <Link href="/precedents">View Legal Precedents</Link>
            </Button>
          </div>
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
