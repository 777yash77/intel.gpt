'use client';

import { ChatInterface } from '@/components/chatbot/chat-interface';

export default function Home() {
  // The ChatInterface component now controls its own full-screen layout.
  // The parent page just needs to render it.
  return <ChatInterface />;
}
