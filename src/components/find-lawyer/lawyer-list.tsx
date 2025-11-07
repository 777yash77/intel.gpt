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
import { Loader2, MapPin, Phone, LocateFixed } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface Lawyer {
  name: string;
  address: string;
  phone: string;
}

const mockLawyers: Omit<Lawyer, 'address'>[] = [
    {
        name: 'Smith & Associates',
        phone: '(555) 123-4567',
    },
    {
        name: 'Juris Consultants',
        phone: '(555) 987-6543',
    },
    {
        name: 'Justice Law Firm',
        phone: '(555) 555-5555',
    },
    {
        name: 'Legal Eagles LLP',
        phone: '(555) 111-2222',
    },
    {
        name: 'Alpha Legal Group',
        phone: '(555) 222-3333'
    },
    {
        name: 'Capital Defense',
        phone: '(555) 444-5555'
    }
];

// A mock function to simulate fetching lawyers based on a city.
const fetchLawyers = async (city: string): Promise<Lawyer[]> => {
    console.log('Fetching lawyers in:', city);
    // In a real app, you would make an API call here.
    return new Promise(resolve => {
        setTimeout(() => {
            const lawyersWithAddress = mockLawyers.map((lawyer, i) => ({
                ...lawyer,
                address: `${123 + i*10} Main St, ${city}, USA`
            }))
            resolve(lawyersWithAddress);
        }, 1500);
    });
};

// A mock function to simulate reverse geocoding (coordinates to city).
const getCityFromCoords = async (lat: number, lon: number): Promise<string> => {
    console.log(`Reverse geocoding for: ${lat}, ${lon}`);
    return new Promise(resolve => {
        setTimeout(() => {
            // In a real app, you would use a service like Google Maps Geocoding API.
            // For this demo, we'll return a sample city.
            resolve('Coimbatore');
        }, 500);
    });
};

export function LawyerList() {
  const [isLoading, setIsLoading] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFindLawyers = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      toast({ variant: 'destructive', title: 'Error', description: "Geolocation is not supported." });
      return;
    }

    setIsLoading(true);
    setError(null);
    setLawyers([]);
    setLocation(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const city = await getCityFromCoords(latitude, longitude);
          setLocation(city);
          const fetchedLawyers = await fetchLawyers(city);
          setLawyers(fetchedLawyers);

          if (fetchedLawyers.length === 0) {
            toast({
              title: 'No Lawyers Found',
              description: `No lawyers were found in ${city}.`,
            });
          } else {
            toast({
              title: 'Lawyers Found',
              description: `Displaying lawyers in ${city}.`,
            });
          }
        } catch (apiError) {
          const err = 'Failed to fetch lawyer data.';
          setError(err);
          toast({ variant: 'destructive', title: 'API Error', description: err });
        } finally {
          setIsLoading(false);
        }
      },
      (geoError) => {
        let errMessage = 'An unknown error occurred.';
        switch(geoError.code) {
            case geoError.PERMISSION_DENIED:
                errMessage = "You denied the request for Geolocation.";
                break;
            case geoError.POSITION_UNAVAILABLE:
                errMessage = "Location information is unavailable.";
                break;
            case geoError.TIMEOUT:
                errMessage = "The request to get user location timed out.";
                break;
        }
        setError(errMessage);
        toast({ variant: 'destructive', title: 'Geolocation Error', description: errMessage });
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Find Local Legal Professionals</CardTitle>
          <CardDescription>
            Use your current location to find legal professionals near you.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={handleFindLawyers} disabled={isLoading}>
                {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <LocateFixed className="mr-2 h-4 w-4" />
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

      {isLoading && lawyers.length === 0 && (
         <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <p>Detecting your location and fetching lawyers...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {location && !isLoading && lawyers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Lawyers in {location}</h2>
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
                <p>No lawyers found for {location}.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
