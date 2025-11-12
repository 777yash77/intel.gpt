'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { generateLegalPrecedents } from '@/ai/flows/generate-legal-precedents';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

interface Precedent {
  caseName: string;
  summary: string;
  impact: string;
}

const initialPrecedents: Precedent[] = [
  {
    caseName: 'Marbury v. Madison (1803)',
    summary:
      'Established the principle of judicial review in the United States, meaning that American courts have the power to strike down laws, statutes, and some government actions that contravene the U.S. Constitution.',
    impact:
      'This case is arguably the most important in U.S. Supreme Court history as it cemented the role of the judicial branch as an equal partner in government.',
  },
  {
    caseName: 'Brown v. Board of Education of Topeka (1954)',
    summary:
      'The Supreme Court ruled that separating children in public schools on the basis of race was unconstitutional. It signaled the end of legalized racial segregation in the schools of the United States.',
    impact:
      'Overturned the "separate but equal" doctrine established by Plessy v. Ferguson and was a major victory for the Civil Rights Movement.',
  },
  {
    caseName: 'Miranda v. Arizona (1966)',
    summary:
      "The Supreme Court ruled that a defendant's statements to authorities are inadmissible in court unless the defendant has been informed of their right to have an attorney present and an understanding that anything they say will be held against them.",
    impact:
      'Created the "Miranda Rights" that are now a standard part of police procedure during arrests.',
  },
  {
    caseName: 'Gideon v. Wainwright (1963)',
    summary:
      'The Supreme Court unanimously ruled that states are required under the Sixth Amendment to the U.S. Constitution to provide an attorney to defendants in criminal cases who are unable to afford their own attorneys.',
    impact:
      'Guaranteed the right to counsel for indigent defendants in felony cases, significantly impacting the American legal system and ensuring a fairer trial process.',
  },
];

const LoadingSkeleton = () => (
  <div className="w-full space-y-2">
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
    <Skeleton className="h-12 w-full" />
  </div>
);

export function PrecedentsList() {
  const [precedents, setPrecedents] = useState<Precedent[]>(initialPrecedents);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await generateLegalPrecedents();
      setPrecedents(result.precedents);
      toast({
        title: 'Precedents Updated',
        description: 'New legal precedents have been generated.',
      });
    } catch (error) {
      console.error('Failed to generate legal precedents:', error);
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not fetch new precedents. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Legal Precedents</CardTitle>
        <CardDescription>
          A collection of landmark cases that have shaped modern law.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <Accordion type="single" collapsible className="w-full">
            {precedents.map((precedent, index) => (
              <AccordionItem value={`item-${index}`} key={index}>
                <AccordionTrigger>{precedent.caseName}</AccordionTrigger>
                <AccordionContent className="space-y-2">
                  <p>
                    <strong>Summary:</strong> {precedent.summary}
                  </p>
                  <p>
                    <strong>Impact:</strong> {precedent.impact}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleRefresh} disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh Precedents
        </Button>
      </CardFooter>
    </Card>
  );
}
