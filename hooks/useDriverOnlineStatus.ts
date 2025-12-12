'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

interface UseDriverOnlineStatusProps {
  userId?: string;
  initialOnlineStatus?: boolean;
}

export function useDriverOnlineStatus({ userId, initialOnlineStatus = false }: UseDriverOnlineStatusProps) {
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Listen to online status from Firestore in real-time
  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    // Set up real-time listener for online status
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const dbOnlineStatus = data.online || false;
          setIsOnline(dbOnlineStatus);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error listening to online status:', error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Handle online status change
  const toggleOnlineStatus = useCallback(async (newStatus: boolean) => {
    if (!userId) return;

    try {
      // Optimistically update UI
      setIsOnline(newStatus);

      // Update database
      await updateDoc(doc(db, 'users', userId), {
        online: newStatus
      });

      toast.success(newStatus ? 'You are now online' : 'You are now offline');
    } catch (error) {
      console.error('Error updating online status:', error);
      toast.error('Failed to update status');
      // Revert the state if database update fails
      setIsOnline(!newStatus);
    }
  }, [userId]);

  // Set offline status
  const setOffline = useCallback(async () => {
    if (!userId) return;

    try {
      await updateDoc(doc(db, 'users', userId), {
        online: false
      });
      setIsOnline(false);
    } catch (error) {
      console.error('Error setting offline status:', error);
    }
  }, [userId]);

  // Only set offline on actual page unload (not tab changes)
  useEffect(() => {
    if (!userId) return;

    const handleBeforeUnload = () => {
      if (isOnline) {
        // Use navigator.sendBeacon for reliable status update on page close
        const data = new Blob(
          [JSON.stringify({ online: false })],
          { type: 'application/json' }
        );

        // Attempt to update via beacon (best effort)
        try {
          navigator.sendBeacon(`/api/driver-offline/${userId}`, data);
        } catch (e) {
          console.error('Failed to send offline beacon:', e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [userId, isOnline]);

  return {
    isOnline,
    isLoading,
    toggleOnlineStatus,
    setOffline
  };
}
