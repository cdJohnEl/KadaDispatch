'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { createDelivery } from '@/lib/firestore';
import { calculateDeliveryFee } from '@/lib/wallet';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { MapPin, Package, CreditCard, Info } from 'lucide-react';

export function CreateDeliveryForm() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    itemName: '',
    itemSize: 'small',
    itemWeight: 1,
    fragile: false,
    paymentType: 'prepaid' as 'prepaid' | 'cod'
  });

  // Calculate estimated fee dynamically based on form data
  const estimatedFee = useMemo(() => {
    // Mock distance based on addresses (in a real app, you'd geocode the addresses)
    // For now, use a reasonable default distance
    const mockDistance = 10; // 10 km default

    return calculateDeliveryFee(
      mockDistance,
      formData.itemWeight,
      formData.fragile,
      formData.paymentType
    );
  }, [formData.itemWeight, formData.fragile, formData.paymentType]);

  // Calculate fee breakdown for display
  const feeBreakdown = useMemo(() => {
    const BASE_FEE = 1000;
    const mockDistance = 10;
    const distanceFee = mockDistance * 50;
    const weightFee = formData.itemWeight * 30;
    const fragileFee = formData.fragile ? 300 : 0;
    const codFee = formData.paymentType === 'cod' ? Math.round((BASE_FEE + distanceFee + weightFee + fragileFee) * 0.02) : 0;

    return {
      base: BASE_FEE,
      distance: distanceFee,
      weight: weightFee,
      fragile: fragileFee,
      cod: codFee
    };
  }, [formData.itemWeight, formData.fragile, formData.paymentType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userData) {
      toast.error('User data not available. Please try logging in again.');
      return;
    }

    // Validation
    if (!formData.pickupAddress.trim()) {
      toast.error('Please enter a pickup address');
      return;
    }
    if (!formData.dropoffAddress.trim()) {
      toast.error('Please enter a drop-off address');
      return;
    }
    if (!formData.itemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    setLoading(true);
    try {
      const deliveryData = {
        sellerId: userData.uid,
        sellerName: userData.name,
        pickupAddress: formData.pickupAddress,
        dropoffAddress: formData.dropoffAddress,
        itemDetails: {
          name: formData.itemName,
          size: formData.itemSize,
          weight: formData.itemWeight,
          fragile: formData.fragile
        },
        paymentType: formData.paymentType,
        fee: estimatedFee,
        status: 'pending' as const
      };

      const deliveryId = await createDelivery(deliveryData);

      toast.success('Delivery request created! Drivers will be notified.');
      setFormData({
        pickupAddress: '',
        dropoffAddress: '',
        itemName: '',
        itemSize: 'small',
        itemWeight: 1,
        fragile: false,
        paymentType: 'prepaid'
      });
    } catch (error) {
      console.error('Error creating delivery:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to create delivery request: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Create New Delivery
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <MapPin className="h-4 w-4" />
              Addresses
            </h3>

            <div className="space-y-2">
              <Label htmlFor="pickup">Pickup Address</Label>
              <Textarea
                id="pickup"
                value={formData.pickupAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, pickupAddress: e.target.value }))}
                placeholder="Enter pickup location"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dropoff">Drop-off Address</Label>
              <Textarea
                id="dropoff"
                value={formData.dropoffAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, dropoffAddress: e.target.value }))}
                placeholder="Enter delivery destination"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Package className="h-4 w-4" />
              Item Details
            </h3>

            <div className="space-y-2">
              <Label htmlFor="item-name">Item Name/Description</Label>
              <Input
                id="item-name"
                value={formData.itemName}
                onChange={(e) => setFormData(prev => ({ ...prev, itemName: e.target.value }))}
                placeholder="What are you sending?"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Size</Label>
                <RadioGroup
                  value={formData.itemSize}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, itemSize: value }))}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="small" />
                    <Label htmlFor="small">Small</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="large" />
                    <Label htmlFor="large">Large</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={formData.itemWeight}
                  onChange={(e) => setFormData(prev => ({ ...prev, itemWeight: parseFloat(e.target.value) }))}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="fragile"
                checked={formData.fragile}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, fragile: checked }))}
              />
              <Label htmlFor="fragile">Fragile Item</Label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <CreditCard className="h-4 w-4" />
              Payment
            </h3>

            <RadioGroup
              value={formData.paymentType}
              onValueChange={(value: 'prepaid' | 'cod') => setFormData(prev => ({ ...prev, paymentType: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="prepaid" id="prepaid" />
                <Label htmlFor="prepaid">Prepaid (Pay now)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod">Cash on Delivery</Label>
              </div>
            </RadioGroup>

            {/* Fee Breakdown */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg border border-green-200">
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold">Estimated Delivery Fee:</span>
                <span className="text-2xl font-bold text-green-600">₦{estimatedFee.toLocaleString()}</span>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-1 text-sm border-t border-green-200 pt-2">
                <div className="flex justify-between text-muted-foreground">
                  <span>Base Fee:</span>
                  <span>₦{feeBreakdown.base}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Distance (~10 km):</span>
                  <span>₦{feeBreakdown.distance}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Weight ({formData.itemWeight} kg):</span>
                  <span>₦{feeBreakdown.weight}</span>
                </div>
                {formData.fragile && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Fragile Handling:</span>
                    <span>₦{feeBreakdown.fragile}</span>
                  </div>
                )}
                {formData.paymentType === 'cod' && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>COD Fee (2%):</span>
                    <span>₦{feeBreakdown.cod}</span>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 mt-3 text-xs text-muted-foreground">
                <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                <span>Distance is estimated. Actual fee may vary based on driver's route.</span>
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? 'Creating Request...' : 'Create Delivery Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}