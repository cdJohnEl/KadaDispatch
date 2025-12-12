'use client';

import { useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/lib/types';

export function useAuth() {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    let unsubscribeUserData: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!isMounted) return;

      setFirebaseUser(user);
      setError(null);

      // Cleanup previous user data listener
      if (unsubscribeUserData) {
        unsubscribeUserData();
        unsubscribeUserData = null;
      }

      if (user) {
        try {
          // Use real-time listener for user data
          unsubscribeUserData = onSnapshot(
            doc(db, 'users', user.uid),
            (userDoc) => {
              if (!isMounted) return;

              if (userDoc.exists()) {
                setUserData(userDoc.data() as User);
              } else {
                setUserData(null);
              }
              setLoading(false);
            },
            (error) => {
              console.error('Error fetching user data:', error);
              if (isMounted) {
                setError(error as Error);
                setUserData(null);
                setLoading(false);
              }
            }
          );
        } catch (error) {
          console.error('Error setting up user data listener:', error);
          if (isMounted) {
            setError(error as Error);
            setUserData(null);
            setLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setUserData(null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribeAuth();
      if (unsubscribeUserData) {
        unsubscribeUserData();
      }
    };
  }, []);

  return {
    user: firebaseUser,
    userData,
    loading,
    error
  };
}