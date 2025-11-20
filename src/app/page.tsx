'use client';

import { ChatInterface } from '@/components/chatbot/chat-interface';

export default function Home() {
  // The ChatInterface now manages the entire right-hand panel,
  // stretching to fill the container provided by AppShell.
  return <ChatInterface />;
}
