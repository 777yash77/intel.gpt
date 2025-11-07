'use client';

import { useState, useEffect } from 'react';
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
    {
        name: 'Alpha Legal Group',
        address: '212 Birch Blvd, Anytown, USA',
        phone: '(555) 222-3333'
    },
    {
        name: 'Capital Defense',
        address: '333 Cedar Ct, Anytown, USA',
        phone: '(555) 444-5555'
    }
];

export function LawyerList() {
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFindLawyers = () => {
    setIsLoading(true);
    setError(null);

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
      (geoError) => {
        setError(
          `Unable to retrieve your location: ${geoError.message}. Please ensure location services are enabled.`
        );
        setIsLoading(false);
      }
    );
  };
  
  useEffect(() => {
    // For demonstration, we'll immediately try to get the location.
    // In a real app, you might want this to be user-initiated.
    handleFindLawyers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
            Refresh Location
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

      {isLoading && !location && (
         <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <p>Finding your location...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
