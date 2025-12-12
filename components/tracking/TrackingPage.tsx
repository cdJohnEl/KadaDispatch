'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FeedbackForm } from './FeedbackForm';
import { listenToDelivery } from '@/lib/firestore';
import { Delivery } from '@/lib/types';
import { MapPin, Package, Clock, CircleCheck as CheckCircle, Phone } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const statusSteps = [
  { key: 'pending', label: 'Order Placed', icon: Package },
  { key: 'assigned', label: 'Driver Assigned', icon: MapPin },
  { key: 'picked_up', label: 'Package Picked Up', icon: Package },
  { key: 'in_transit', label: 'In Transit', icon: MapPin },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle }
];

const statusColors = {
  pending: 'bg-gray-200',
  assigned: 'bg-blue-200',
  picked_up: 'bg-purple-200',
  in_transit: 'bg-orange-200',
  delivered: 'bg-green-200'
};

interface TrackingPageProps {
  deliveryId: string;
}

export function TrackingPage({ deliveryId }: TrackingPageProps) {
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    const unsubscribe = listenToDelivery(deliveryId, (deliveryData) => {
      setDelivery(deliveryData);
      if (deliveryData?.status === 'delivered' && !deliveryData.feedback) {
        setShowFeedback(true);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [deliveryId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Delivery Not Found</h1>
            <p className="text-muted-foreground">
              The tracking ID you entered doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStepIndex = statusSteps.findIndex(step => step.key === delivery.status);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Track Your Delivery</span>
            <Badge className="text-lg px-3 py-1">
              #{delivery.id.slice(0, 8)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-2">{delivery.itemDetails.name}</h2>
            <p className="text-muted-foreground">
              Ordered {formatDistanceToNow(delivery.createdAt.toDate())} ago
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-1 text-green-600" />
              <div>
                <p className="font-medium">From</p>
                <p className="text-muted-foreground">{delivery.pickupAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-1 text-red-600" />
              <div>
                <p className="font-medium">To</p>
                <p className="text-muted-foreground">{delivery.dropoffAddress}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const StepIcon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-muted bg-background'
                    }`}
                  >
                    <StepIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium ${isCurrent ? 'text-primary' : ''}`}>
                      {step.label}
                    </p>
                    {delivery.trackingHistory
                      .filter(track => track.status === step.key)
                      .map((track, idx) => (
                        <p key={idx} className="text-sm text-muted-foreground">
                          {formatDistanceToNow(track.timestamp.toDate())} ago
                        </p>
                      ))}
                  </div>
                  {isCurrent && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {delivery.driverName && delivery.status !== 'delivered' && (
        <Card>
          <CardHeader>
            <CardTitle>Driver Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{delivery.driverName}</p>
                <p className="text-sm text-muted-foreground">{delivery.driverPhone}</p>
              </div>
              <Button variant="outline" size="sm">
                <Phone className="h-4 w-4 mr-2" />
                Call Driver
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {delivery.paymentType === 'cod' && delivery.status !== 'delivered' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-5 w-5" />
              <div>
                <p className="font-medium">Cash on Delivery</p>
                <p className="text-sm">Please prepare ₦{delivery.fee} for payment</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showFeedback && delivery?.status === 'delivered' && !delivery.feedback && (
        <FeedbackForm 
          deliveryId={deliveryId} 
          onSubmit={() => setShowFeedback(false)}
        />
      )}
    </div>
  );
}