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
import { Loader2, MapPin, Phone, Search } from 'lucide-react';
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

// A mock function to simulate fetching lawyers
const fetchLawyers = async (city: string): Promise<Lawyer[]> => {
    console.log('Fetching lawyers in:', city);
    // In a real app, you would make an API call here.
    // For now, we'll just return the mock data with the city in the address.
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


export function LawyerList() {
  const [isLoading, setIsLoading] = useState(false);
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [location, setLocation] = useState<string>('Coimbatore');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFindLawyers = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
        setError("Please enter a location.");
        toast({ variant: 'destructive', title: 'Error', description: "Please enter a location." });
        return;
    }
    
    setIsLoading(true);
    setError(null);
    setLawyers([]);

    try {
        const fetchedLawyers = await fetchLawyers(location);
        setLawyers(fetchedLawyers);
        if(fetchedLawyers.length === 0) {
            toast({
                title: 'No Lawyers Found',
                description: `No lawyers were found in ${location}.`,
            });
        } else {
            toast({
                title: 'Lawyers Found',
                description: `Displaying lawyers in ${location}.`,
            });
        }
    } catch (apiError) {
        const err = 'Failed to fetch lawyer data.';
        setError(err);
        toast({ variant: 'destructive', title: 'API Error', description: err });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Local Legal Professionals</CardTitle>
          <CardDescription>
            Find legal professionals by entering a city name.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleFindLawyers} className="flex items-center gap-2">
                <Input 
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city name (e.g., Coimbatore)"
                    className="flex-1"
                    disabled={isLoading}
                />
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                    <Search className="mr-2 h-4 w-4" />
                    )}
                    Find Lawyers
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

      {isLoading && lawyers.length === 0 && (
         <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              <p>Fetching lawyers in {location}...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && lawyers.length > 0 && (
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
                <p>No lawyers found. Try searching for a different location.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
