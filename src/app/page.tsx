'use client';

import { ChatInterface } from '@/components/chatbot/chat-interface';

export default function Home() {
  return (
    <div className='flex-1 flex flex-col h-dvh'>
      <ChatInterface />
    </div>
  );
}
