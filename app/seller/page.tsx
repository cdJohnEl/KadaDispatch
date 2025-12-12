'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { CreateDeliveryForm } from '@/components/seller/CreateDeliveryForm';
import { DeliveryList } from '@/components/seller/DeliveryList';
import { BulkUpload } from '@/components/seller/BulkUpload';
import { AnalyticsDashboard } from '@/components/seller/AnalyticsDashboard';
import { Button } from '@/components/ui/button';
import { Plus, List, LogOut, Upload, ChartBar as BarChart3 } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'create' | 'bulk' | 'analytics'>('deliveries');
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <AuthGuard requiredRole="seller">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">
                Seller Dashboard
              </h1>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/4">
              <nav className="space-y-2">
                <Button
                  variant={activeTab === 'deliveries' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('deliveries')}
                >
                  <List className="h-4 w-4 mr-2" />
                  My Deliveries
                </Button>
                <Button
                  variant={activeTab === 'create' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('create')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Delivery
                </Button>
                <Button
                  variant={activeTab === 'bulk' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('bulk')}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Bulk Upload
                </Button>
                <Button
                  variant={activeTab === 'analytics' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('analytics')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </nav>
            </div>

            <div className="lg:w-3/4">
              {activeTab === 'deliveries' && <DeliveryList />}
              {activeTab === 'create' && <CreateDeliveryForm />}
              {activeTab === 'bulk' && <BulkUpload />}
              {activeTab === 'analytics' && <AnalyticsDashboard />}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}