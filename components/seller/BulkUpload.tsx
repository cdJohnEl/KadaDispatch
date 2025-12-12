'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { createBulkDeliveries } from '@/lib/firestore';
import { useAuth } from '@/hooks/useAuth';
import { BulkDelivery } from '@/lib/types';
import { Upload, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import Papa from 'papaparse';

export function BulkUpload() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<BulkDelivery[]>([]);

  const downloadTemplate = () => {
    const template = [
      {
        pickupAddress: '123 Main St, Lagos',
        dropoffAddress: '456 Oak Ave, Abuja',
        itemName: 'Electronics Package',
        itemSize: 'medium',
        itemWeight: 2.5,
        fragile: true,
        paymentType: 'prepaid'
      }
    ];

    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bulk_delivery_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const deliveries = results.data
          .filter((row: any) => row.pickupAddress && row.dropoffAddress)
          .map((row: any) => ({
            pickupAddress: row.pickupAddress,
            dropoffAddress: row.dropoffAddress,
            itemName: row.itemName,
            itemSize: row.itemSize || 'medium',
            itemWeight: parseFloat(row.itemWeight) || 1,
            fragile: row.fragile === 'true' || row.fragile === true,
            paymentType: row.paymentType === 'cod' ? 'cod' : 'prepaid'
          })) as BulkDelivery[];
        
        setPreview(deliveries);
      },
      error: (error) => {
        toast.error('Error parsing file: ' + error.message);
      }
    });
  };

  const handleUpload = async () => {
    if (!userData || !preview.length) return;

    setLoading(true);
    try {
      const deliveryIds = await createBulkDeliveries(userData.uid, userData.name, preview);
      toast.success(`Successfully created ${deliveryIds.length} delivery requests!`);
      setFile(null);
      setPreview([]);
    } catch (error) {
      toast.error('Failed to create bulk deliveries');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Bulk Upload Deliveries
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Upload a CSV file with multiple delivery requests. Download the template to see the required format.
          </AlertDescription>
        </Alert>

        <div className="flex gap-4">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="csv-file">Upload CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
          />
        </div>

        {preview.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Preview ({preview.length} deliveries)</h3>
            <div className="max-h-60 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-left">From</th>
                    <th className="p-2 text-left">To</th>
                    <th className="p-2 text-left">Size</th>
                    <th className="p-2 text-left">Weight</th>
                    <th className="p-2 text-left">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((delivery, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">{delivery.itemName}</td>
                      <td className="p-2 truncate max-w-32">{delivery.pickupAddress}</td>
                      <td className="p-2 truncate max-w-32">{delivery.dropoffAddress}</td>
                      <td className="p-2">{delivery.itemSize}</td>
                      <td className="p-2">{delivery.itemWeight}kg</td>
                      <td className="p-2">{delivery.paymentType}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {preview.length > 10 && (
                <div className="p-2 text-center text-muted-foreground">
                  ... and {preview.length - 10} more
                </div>
              )}
            </div>

            <Button onClick={handleUpload} disabled={loading} className="w-full">
              {loading ? 'Creating Deliveries...' : `Create ${preview.length} Deliveries`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}