'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const precedents = [
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
      'The Supreme Court ruled that a defendant\'s statements to authorities are inadmissible in court unless the defendant has been informed of their right to have an attorney present and an understanding that anything they say will be held against them.',
    impact: 'Created the "Miranda Rights" that are now a standard part of police procedure during arrests.',
  },
  {
    caseName: 'Gideon v. Wainwright (1963)',
    summary:
      'The Supreme Court unanimously ruled that states are required under the Sixth Amendment to the U.S. Constitution to provide an attorney to defendants in criminal cases who are unable to afford their own attorneys.',
    impact:
      'Guaranteed the right to counsel for indigent defendants in felony cases, significantly impacting the American legal system and ensuring a fairer trial process.',
  },
];

export function PrecedentsList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Legal Precedents</CardTitle>
        <CardDescription>
          A collection of landmark cases that have shaped modern law.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
