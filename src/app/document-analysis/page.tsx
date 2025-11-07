import { Header } from '@/components/layout/header';
import { AnalysisForm } from '@/components/document-analysis/analysis-form';

export default function DocumentAnalysisPage() {
  return (
    <div className="flex h-dvh flex-col">
      <Header title="Document Analysis" />
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto max-w-4xl p-4 md:p-6">
          <AnalysisForm />
        </div>
      </main>
    </div>
  );
}
