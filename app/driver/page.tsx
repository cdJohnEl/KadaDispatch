'use client';

import { useState } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AvailableDeliveries } from '@/components/driver/AvailableDeliveries';
import { ActiveDeliveries } from '@/components/driver/ActiveDeliveries';
import { EarningsDashboard } from '@/components/driver/EarningsDashboard';
import { WalletDashboard } from '@/components/driver/WalletDashboard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Truck, Package, LogOut, DollarSign, Wallet } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useDriverOnlineStatus } from '@/hooks/useDriverOnlineStatus';

export default function DriverDashboard() {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'earnings' | 'wallet'>('available');
  const { user, userData } = useAuth();
  const { isOnline, isLoading, toggleOnlineStatus, setOffline } = useDriverOnlineStatus({
    userId: user?.uid,
    initialOnlineStatus: userData?.online
  });
  const router = useRouter();

  const handleSignOut = async () => {
    // Set offline status before signing out
    if (user) {
      await setOffline();
    }
    await signOut(auth);
    router.push('/');
  };

  return (
    <AuthGuard requiredRole="driver">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">
                Driver Dashboard
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                  <Switch 
                    checked={isOnline}
                    onCheckedChange={toggleOnlineStatus}
                    disabled={isLoading}
                  />
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/4">
              <nav className="space-y-2">
                <Button
                  variant={activeTab === 'available' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('available')}
                >
                  <Truck className="h-4 w-4 mr-2" />
                  Available
                </Button>
                <Button
                  variant={activeTab === 'active' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('active')}
                >
                  <Package className="h-4 w-4 mr-2" />
                  My Deliveries
                </Button>
                <Button
                  variant={activeTab === 'earnings' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('earnings')}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Earnings
                </Button>
                <Button
                  variant={activeTab === 'wallet' ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setActiveTab('wallet')}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet
                </Button>
              </nav>
            </div>

            <div className="lg:w-3/4">
              {!isOnline && activeTab === 'available' && (
                <div className="text-center py-8 text-muted-foreground bg-white rounded-lg border">
                  <Truck className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p>Go online to see available deliveries</p>
                </div>
              )}
              
              {isOnline && activeTab === 'available' && <AvailableDeliveries />}
              {activeTab === 'active' && <ActiveDeliveries />}
              {activeTab === 'earnings' && <EarningsDashboard />}
              {activeTab === 'wallet' && <WalletDashboard />}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}