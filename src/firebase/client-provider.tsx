'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    // Initialize Firebase on the client side, once per component mount.
    return initializeFirebase();
  }, []); // Empty dependency array ensures this runs only once on mount

  if (!firebaseServices) {
    // If initialization fails (e.g., missing config), render an error message.
    return (
       <div className="flex h-dvh items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            Could not initialize Firebase. Please ensure your Firebase environment variables (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`) are correctly set in your `.env` file.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}