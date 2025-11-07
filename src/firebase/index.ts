'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore'

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase(): { firebaseApp: FirebaseApp; auth: Auth; firestore: Firestore } | null {
  // Check if all required Firebase config values are present.
  // This is a common source of errors.
  if (!firebaseConfig.apiKey) {
    console.error(
      'Firebase API key is missing. Please check your environment variables (NEXT_PUBLIC_FIREBASE_API_KEY).'
    );
    // Return null if configuration is incomplete to prevent crashes.
    return null;
  }

  if (getApps().length) {
    // If already initialized, return the SDKs with the already initialized App
    return getSdks(getApp());
  }

  let firebaseApp;
  try {
    // This is the standard initialization for a client-side app.
    firebaseApp = initializeApp(firebaseConfig);
  } catch (e) {
    console.error('Failed to initialize Firebase.', e);
    return null;
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp)
  };
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './errors';
export * from './error-emitter';