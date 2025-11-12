'use client';

import { ChatInterface } from '@/components/chatbot/chat-interface';
import { Header } from '@/components/layout/header';

export default function Home() {
  return (
    <div className="flex h-dvh flex-col">
      <Header title="Intelligent Chat" />
      <main className="flex-1 overflow-hidden">
        <ChatInterface />
      </main>
    </div>
  );
}
