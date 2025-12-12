'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAvailableDeliveries, assignDelivery } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Delivery } from '@/lib/types';
import { MapPin, Package, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

export function AvailableDeliveries() {
  const { userData } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [accepting, setAccepting] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    try {
      const unsubscribe = getAvailableDeliveries((newDeliveries) => {
        setDeliveries(newDeliveries);
        setError(''); // Clear any previous errors
      });
      return unsubscribe;
    } catch (err) {
      console.error('Error setting up available deliveries listener:', err);
      setError('Failed to load available deliveries. Please refresh the page.');
    }
  }, []);

  const handleAcceptDelivery = async (delivery: Delivery) => {
    if (!userData) return;

    setAccepting(delivery.id);
    try {
      await assignDelivery(delivery.id, userData.uid, userData.name, userData.phone);
      toast.success('Delivery accepted! Check your active deliveries.');
    } catch (error) {
      console.error('Error accepting delivery:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to accept delivery: ${errorMessage}`);
    } finally {
      setAccepting('');
    }
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Available Deliveries</CardTitle>
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
        <CardTitle>Available Deliveries</CardTitle>
      </CardHeader>
      <CardContent>
        {deliveries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No available deliveries at the moment
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map(delivery => (
              <Card key={delivery.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{delivery.itemDetails.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        From: {delivery.sellerName}
                      </p>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
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

                  <div className="flex items-center gap-2 mb-4 text-sm">
                    <Package className="h-4 w-4" />
                    <span>{delivery.itemDetails.size} • {delivery.itemDetails.weight}kg</span>
                    {delivery.itemDetails.fragile && (
                      <Badge variant="destructive" className="text-xs">Fragile</Badge>
                    )}
                    <Badge variant={delivery.paymentType === 'cod' ? 'default' : 'secondary'}>
                      {delivery.paymentType === 'cod' ? 'COD' : 'Prepaid'}
                    </Badge>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAcceptDelivery(delivery)}
                      disabled={accepting === delivery.id}
                      className="flex-1"
                    >
                      {accepting === delivery.id ? 'Accepting...' : 'Accept Delivery'}
                    </Button>
                    <Button variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}