import type { SummarizeLegalArticleOutput } from '@/ai/flows/summarize-legal-article';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface AnalysisResultProps {
  result: SummarizeLegalArticleOutput;
}

export function AnalysisResult({ result }: AnalysisResultProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Complete</CardTitle>
        <CardDescription>
          Here is the AI-generated summary and analysis of your document.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 text-lg font-semibold">Concise Summary</h3>
          <p className="text-muted-foreground">{result.summary}</p>
        </div>
        <Separator />
        <div>
          <h3 className="mb-2 text-lg font-semibold">
            Relevant History & Context
          </h3>
          <p className="text-muted-foreground">{result.history}</p>
        </div>
        <Separator />
        <div>
          <h3 className="mb-2 text-lg font-semibold">Related Resources</h3>
          <div
            className="prose prose-sm dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: result.relatedResources }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
