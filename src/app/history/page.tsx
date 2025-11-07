import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';

export default function HistoryPage() {
  return (
    <div className="flex h-dvh flex-col">
      <Header title="Chat History" />
      <main className="flex flex-1 items-center justify-center p-4 md:p-6">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <History className="size-6" />
              <span>Coming Soon</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Chat history for logged-in users is a planned feature. Stay
              tuned for updates!
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
