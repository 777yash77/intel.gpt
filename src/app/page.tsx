'use client';

import { ChatInterface } from '@/components/chatbot/chat-interface';
import { Header } from '@/components/layout/header';

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <Header title="Intelligent Chat" />
      <main className="flex flex-1 flex-col overflow-auto p-4 md:p-6">
        <div className="container mx-auto flex h-full max-w-4xl flex-1 flex-col">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Legal Chatbot</h1>
          </div>
          <ChatInterface />
        </div>
      </main>
    </div>
  );
}
