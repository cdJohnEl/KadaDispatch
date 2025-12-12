'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProofOfDelivery } from './ProofOfDelivery';
import { getUserDeliveries, updateDeliveryStatus } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Delivery } from '@/lib/types';
import { MapPin, Package, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const nextStatusMap = {
  assigned: 'picked_up',
  picked_up: 'in_transit',
  in_transit: 'delivered'
};

const statusLabels = {
  assigned: 'Arrive at Pickup',
  picked_up: 'Start Journey',
  in_transit: 'Mark Delivered'
};

export function ActiveDeliveries() {
  const { userData } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [updating, setUpdating] = useState<string>('');
  const [showPOD, setShowPOD] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Use ref to store delivery IDs to avoid infinite loop
  const deliveryIdsRef = useRef<string[]>([]);

  // Update ref when deliveries change
  useEffect(() => {
    deliveryIdsRef.current = deliveries.map(d => d.id);
  }, [deliveries]);

  // Track if driver has any active deliveries
  const hasActiveDeliveries = deliveries.length > 0;

  // Location tracking callback - use ref to avoid dependency on deliveries
  const handleLocationUpdate = useCallback(async (position: { lat: number; lng: number }) => {
    if (!userData?.uid || deliveryIdsRef.current.length === 0) return;

    try {
      // Update location for all active deliveries using ref
      const updatePromises = deliveryIdsRef.current.map(deliveryId =>
        updateDoc(doc(db, 'deliveries', deliveryId), {
          currentLocation: position,
          lastLocationUpdate: new Date()
        })
      );

      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating location:', error);
    }
  }, [userData]); // Only depend on userData, not deliveries

  // Enable location tracking only when there are active deliveries
  const { location, error: locationError } = useGeolocation({
    enabled: hasActiveDeliveries,
    onLocationUpdate: handleLocationUpdate,
    updateInterval: 30000 // Update every 30 seconds
  });

  useEffect(() => {
    if (!userData?.uid) return;

    try {
      const unsubscribe = getUserDeliveries(userData.uid, 'driver', (allDeliveries) => {
        // Show all deliveries that have been assigned to this driver and are not yet delivered
        const activeDeliveries = allDeliveries.filter(d =>
          d.status !== 'delivered' && d.status !== 'pending'
        );
        setDeliveries(activeDeliveries);
        setError(''); // Clear any previous errors
      });
      return unsubscribe;
    } catch (err) {
      console.error('Error setting up deliveries listener:', err);
      setError('Failed to load deliveries. Please refresh the page.');
    }
  }, [userData?.uid]);

  const handleStatusUpdate = async (deliveryId: string, currentStatus: Delivery['status']) => {
    setUpdating(deliveryId);

    try {
      // Get current location (mock for now)
      const location = { lat: 6.5244, lng: 3.3792 }; // Lagos coordinates
      const nextStatus = nextStatusMap[currentStatus as keyof typeof nextStatusMap];

      if (nextStatus) {
        if (nextStatus === 'delivered') {
          setShowPOD(deliveryId);
          setUpdating('');
        } else {
          // Add timeout to prevent infinite loading
          const updatePromise = updateDeliveryStatus(deliveryId, nextStatus as Delivery['status'], location);
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Update timed out. Please try again.')), 10000)
          );

          await Promise.race([updatePromise, timeoutPromise]);
          toast.success('Status updated successfully!');
          setUpdating('');
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update status';
      toast.error(errorMessage);
      setUpdating('');
    }
  };

  const handlePODComplete = async (deliveryId: string) => {
    try {
      // First, get the delivery data to know the fee and payment type
      const { getDeliveryById } = await import('@/lib/firestore');
      const { addEarnings } = await import('@/lib/wallet');

      const delivery = await getDeliveryById(deliveryId);

      if (!delivery || !userData) {
        toast.error('Failed to complete delivery');
        return;
      }

      // Mark delivery as delivered
      await updateDeliveryStatus(deliveryId, 'delivered');

      // Add earnings to driver wallet
      await addEarnings(
        userData.uid,
        delivery.fee,
        deliveryId,
        delivery.paymentType === 'cod' ? 'cod_settlement' : 'earning'
      );

      setShowPOD('');
      toast.success(`Delivery completed! ₦${delivery.fee} added to your wallet.`);
    } catch (error) {
      console.error('Error completing delivery:', error);
      toast.error('Failed to complete delivery');
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Active Deliveries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Deliveries</CardTitle>
      </CardHeader>
      <CardContent>
        {deliveries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active deliveries
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map(delivery => (
              <div key={delivery.id}>
                {showPOD === delivery.id ? (
                  <ProofOfDelivery
                    deliveryId={delivery.id}
                    driverId={userData!.uid}
                    onComplete={() => handlePODComplete(delivery.id)}
                  />
                ) : (
                  <Card className="border-l-4 border-l-green-500">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{delivery.itemDetails.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            From: {delivery.sellerName}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          ₦{delivery.fee}
                        </Badge>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-green-600" />
                          <div>
                            <div className="font-medium">Pickup</div>
                            <div className="text-muted-foreground">{delivery.pickupAddress}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-red-600" />
                          <div>
                            <div className="font-medium">Drop-off</div>
                            <div className="text-muted-foreground">{delivery.dropoffAddress}</div>
                          </div>
                        </div>
                      </div>

                      {delivery.paymentType === 'cod' && (
                        <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                          <div className="flex items-center gap-2 text-yellow-800">
                            <Package className="h-4 w-4" />
                            <span className="font-medium">Collect ₦{delivery.fee} on delivery</span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleStatusUpdate(delivery.id, delivery.status)}
                          disabled={updating === delivery.id}
                          className="flex-1"
                        >
                          {updating === delivery.id ? 'Updating...' : statusLabels[delivery.status as keyof typeof statusLabels]}
                        </Button>
                        <Button variant="outline" size="icon">
                          <Navigation className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}