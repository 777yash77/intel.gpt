'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Lawyer {
  name: string;
  address: string;
  phone: string;
}

const mockLawyers: Lawyer[] = [
  {
    name: 'Smith & Associates',
    address: '123 Main St, Anytown, USA',
    phone: '(555) 123-4567',
  },
  {
    name: 'Juris Consultants',
    address: '456 Oak Ave, Anytown, USA',
    phone: '(555) 987-6543',
  },
  {
    name: 'Justice Law Firm',
    address: '789 Pine Ln, Anytown, USA',
    phone: '(555) 555-5555',
  },
  {
    name: 'Legal Eagles LLP',
    address: '101 Maple Rd, Anytown, USA',
    phone: '(555) 111-2222',
  },
];

export function LawyerList() {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFindLawyers = () => {
    setIsLoading(true);
    setError(null);
    setLocation(null);

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
        setIsLoading(false);
        toast({
          title: 'Location Found',
          description: 'Displaying lawyers near you.',
        });
      },
      () => {
        setError(
          'Unable to retrieve your location. Please ensure location services are enabled.'
        );
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Local Legal Professionals</CardTitle>
          <CardDescription>
            Find legal professionals near your location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleFindLawyers} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="mr-2 h-4 w-4" />
            )}
            Find Lawyers Near Me
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {location && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Lawyers Near You</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {mockLawyers.map((lawyer, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{lawyer.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="mr-2 size-4" />
                    <span>{lawyer.address}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Phone className="mr-2 size-4" />
                    <span>{lawyer.phone}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
