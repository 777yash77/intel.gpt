import { Header } from '@/components/layout/header';
import { LawyerList } from '@/components/find-lawyer/lawyer-list';

export default function FindLawyerPage() {
  return (
    <div className="flex h-dvh flex-col">
      <Header title="Find a Lawyer" />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-4xl p-4 md:p-6">
          <LawyerList />
        </div>
      </main>
    </div>
  );
}
