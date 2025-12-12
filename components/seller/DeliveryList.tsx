'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getUserDeliveries } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Delivery } from '@/lib/types';
import { MapPin, Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  assigned: 'bg-blue-100 text-blue-800',
  picked_up: 'bg-purple-100 text-purple-800',
  in_transit: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800'
};

const statusIcons = {
  pending: Clock,
  assigned: Truck,
  picked_up: Package,
  in_transit: MapPin,
  delivered: CheckCircle
};

export function DeliveryList() {
  const { userData } = useAuth();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);

  useEffect(() => {
    if (!userData) return;
    
    const unsubscribe = getUserDeliveries(userData.uid, 'seller', setDeliveries);
    return unsubscribe;
  }, [userData]);

  const activeDeliveries = deliveries.filter(d => d.status !== 'delivered');
  const completedDeliveries = deliveries.filter(d => d.status === 'delivered');

  const DeliveryCard = ({ delivery }: { delivery: Delivery }) => {
    const StatusIcon = statusIcons[delivery.status];
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{delivery.itemDetails.name}</CardTitle>
            <Badge className={statusColors[delivery.status]}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {delivery.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-green-600" />
              <div>
                <div className="font-medium">Pickup</div>
                <div className="text-muted-foreground">{delivery.pickupAddress}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 mt-0.5 text-red-600" />
              <div>
                <div className="font-medium">Drop-off</div>
                <div className="text-muted-foreground">{delivery.dropoffAddress}</div>
              </div>
            </div>
          </div>

          {delivery.driverName && (
            <div className="flex items-center justify-between p-2 bg-muted rounded-lg">
              <div>
                <div className="font-medium">Driver: {delivery.driverName}</div>
                <div className="text-sm text-muted-foreground">{delivery.driverPhone}</div>
              </div>
              <Button variant="outline" size="sm">
                Call Driver
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(delivery.createdAt.toDate())} ago
            </div>
            <div className="font-bold">₦{delivery.fee}</div>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => window.open(`/track/${delivery.id}`, '_blank')}
          >
            View Tracking
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Deliveries</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active">
              Active ({activeDeliveries.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({completedDeliveries.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-4">
            {activeDeliveries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No active deliveries
              </div>
            ) : (
              <div className="space-y-4">
                {activeDeliveries.map(delivery => (
                  <DeliveryCard key={delivery.id} delivery={delivery} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            {completedDeliveries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No completed deliveries
              </div>
            ) : (
              <div className="space-y-4">
                {completedDeliveries.map(delivery => (
                  <DeliveryCard key={delivery.id} delivery={delivery} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}