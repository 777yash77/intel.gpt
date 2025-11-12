'use client';
import { Header } from '@/components/layout/header';
import { PrecedentsList } from '@/components/precedents/precedents-list';

export default function PrecedentsPage() {
  return (
    <div className="flex h-dvh flex-col">
      <Header title="Legal Precedents" />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-4xl p-4 md:p-6">
          <PrecedentsList />
        </div>
      </main>
    </div>
  );
}
