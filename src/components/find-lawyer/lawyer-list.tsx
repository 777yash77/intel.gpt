'use client';

import { useState, useEffect, useCallback } from 'react';
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

// A mock function to simulate fetching lawyers based on location
const fetchLawyersNearLocation = async (coords: GeolocationCoordinates): Promise<Lawyer[]> => {
    console.log('Fetching lawyers near:', coords.latitude, coords.longitude);
    // In a real app, you would make an API call here.
    // For now, we'll just return the mock data after a short delay.
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(mockLawyers);
        }, 1500);
    });
};


export function LawyerList() {
  const [isLoading, setIsLoading] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFindLawyers = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setLawyers([]);

    if (!navigator.geolocation) {
      const err = 'Geolocation is not supported by your browser.';
      setError(err);
      toast({ variant: 'destructive', title: 'Error', description: err });
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords);
        toast({
          title: 'Location Found',
          description: 'Fetching lawyers near you...',
        });
        fetchLawyersNearLocation(position.coords).then(fetchedLawyers => {
            setLawyers(fetchedLawyers);
            setIsLoading(false);
        }).catch(apiError => {
            const err = 'Failed to fetch lawyer data.';
            setError(err);
            toast({ variant: 'destructive', title: 'API Error', description: err });
            setIsLoading(false);
        });
      },
      (geoError) => {
        let errMessage = 'Unable to retrieve your location. Please ensure location services are enabled.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
            errMessage = "Location access denied. Please enable location permissions in your browser settings to find lawyers near you."
        }
        setError(errMessage);
        toast({ variant: 'destructive', title: 'Location Error', description: errMessage });
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [toast]);
  
  useEffect(() => {
    handleFindLawyers();
  }, [handleFindLawyers]);

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Local Legal Professionals</CardTitle>
          <CardDescription>
            Find legal professionals near your current location.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleFindLawyers} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <MapPin className="mr-2 h-4 w-4" />
            )}
            {location ? 'Refresh Location' : 'Find Lawyers Near Me'}
          </Button>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isLoading && lawyers.length === 0 && (
         <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <p>Finding your location and fetching lawyers...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && lawyers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Lawyers Near You</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {lawyers.map((lawyer, index) => (
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
      
      {!isLoading && !error && lawyers.length === 0 && location && (
        <Card>
            <CardContent className="p-6">
                <p>No lawyers found near your location. You can try refreshing.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
