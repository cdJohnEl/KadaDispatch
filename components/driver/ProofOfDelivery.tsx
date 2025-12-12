'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { uploadProofOfDelivery } from '@/lib/firestore';
import { Camera, PenTool } from 'lucide-react';
import { toast } from 'sonner';
import SignatureCanvas from 'react-signature-canvas';

interface ProofOfDeliveryProps {
  deliveryId: string;
  driverId: string;
  onComplete: () => void;
}

export function ProofOfDelivery({ deliveryId, driverId, onComplete }: ProofOfDeliveryProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('signature');
  const signatureRef = useRef<SignatureCanvas>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSignatureSubmit = async () => {
    if (!signatureRef.current || signatureRef.current.isEmpty()) {
      toast.error('Please provide a signature');
      return;
    }

    setLoading(true);
    try {
      // Get signature as base64 data URL (no file upload needed)
      const dataUrl = signatureRef.current.toDataURL('image/png');
      await uploadProofOfDelivery(deliveryId, driverId, dataUrl, 'signature');
      toast.success('Signature saved successfully!');
      onComplete();
    } catch (error) {
      console.error('Error saving signature:', error);
      toast.error('Failed to save signature');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      // Convert photo to base64 data URL
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        await uploadProofOfDelivery(deliveryId, driverId, dataUrl, 'photo');
        toast.success('Photo saved successfully!');
        onComplete();
      };
      reader.onerror = () => {
        toast.error('Failed to read photo');
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error saving photo:', error);
      toast.error('Failed to save photo');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proof of Delivery</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signature">
              <PenTool className="h-4 w-4 mr-2" />
              Signature
            </TabsTrigger>
            <TabsTrigger value="photo">
              <Camera className="h-4 w-4 mr-2" />
              Photo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signature" className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <SignatureCanvas
                ref={signatureRef}
                canvasProps={{
                  width: 400,
                  height: 200,
                  className: 'signature-canvas bg-white rounded border'
                }}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => signatureRef.current?.clear()}
              >
                Clear
              </Button>
              <Button
                onClick={handleSignatureSubmit}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Uploading...' : 'Submit Signature'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="photo" className="space-y-4">
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <Camera className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Take a photo of the delivered package
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSubmit}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                {loading ? 'Uploading...' : 'Take Photo'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}