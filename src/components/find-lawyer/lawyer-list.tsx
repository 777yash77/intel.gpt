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
import { Input } from '@/components/ui/input';

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
                address: `${123 + i*10} Main St, ${city}`
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
            // For this demo, we'll return a sample city based on coordinates.
            // These are roughly coordinates for Coimbatore.
            if (lat > 10 && lat < 12 && lon > 76 && lon < 78) {
                resolve('Coimbatore');
            } else {
                resolve('San Francisco'); // Default fallback
            }
        }, 500);
    });
};

export function LawyerList() {
  const [isLoading, setIsLoading] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [location, setLocation] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [manualCity, setManualCity] = useState('');
  const { toast } = useToast();

  const findAndSetLawyers = async (city: string) => {
    try {
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
  }

  const handleFindLawyersByGeo = () => {
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
        const city = await getCityFromCoords(latitude, longitude);
        await findAndSetLawyers(city);
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
  
  const handleFindLawyersByCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCity) return;
    setIsLoading(true);
    setError(null);
    setLawyers([]);
    await findAndSetLawyers(manualCity);
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Find Local Legal Professionals</CardTitle>
          <CardDescription>
            Use your current location or enter a city to find legal professionals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handleFindLawyersByGeo} disabled={isLoading} className="flex-shrink-0">
                  {isLoading && !manualCity ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                  <LocateFixed className="mr-2 h-4 w-4" />
                  )}
                  Find Near Me
              </Button>
            </div>
             <div className="flex items-center gap-2">
                <hr className="flex-grow" />
                <span className="text-muted-foreground">OR</span>
                <hr className="flex-grow" />
            </div>
            <form onSubmit={handleFindLawyersByCity} className="flex gap-2">
              <Input 
                placeholder="Enter a city name"
                value={manualCity}
                onChange={(e) => setManualCity(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !manualCity}>
                 {isLoading && manualCity ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Search
              </Button>
            </form>
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isLoading && (
         <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <p>Fetching lawyers...</p>
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
                <p>No lawyers found for {location}. Try a different city.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
