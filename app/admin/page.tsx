'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, Delivery } from '@/lib/types';
import { Users, Package, Shield, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersSnapshot, deliveriesSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, 'deliveries'), orderBy('createdAt', 'desc')))
        ]);

        setUsers(usersSnapshot.docs.map(doc => ({ ...doc.data() } as User)));
        setDeliveries(deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Delivery)));
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleVerifyDriver = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { verified: true });
      setUsers(users.map(user => 
        user.uid === userId ? { ...user, verified: true } : user
      ));
      toast.success('Driver verified successfully');
    } catch (error) {
      toast.error('Failed to verify driver');
    }
  };

  const stats = {
    totalUsers: users.length,
    totalDrivers: users.filter(u => u.role === 'driver').length,
    totalSellers: users.filter(u => u.role === 'seller').length,
    totalDeliveries: deliveries.length,
    activeDeliveries: deliveries.filter(d => d.status !== 'delivered').length,
    completedDeliveries: deliveries.filter(d => d.status === 'delivered').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalSellers} sellers, {stats.totalDrivers} drivers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Deliveries</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDeliveries}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completedDeliveries} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Deliveries</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeDeliveries}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Drivers</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {users.filter(u => u.role === 'driver' && u.verified).length}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.uid} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={user.role === 'driver' ? 'default' : 'secondary'}>
                              {user.role}
                            </Badge>
                            {user.verified && (
                              <Badge variant="outline" className="text-green-600">
                                Verified
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.role === 'driver' && !user.verified && (
                            <Button
                              size="sm"
                              onClick={() => handleVerifyDriver(user.uid)}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deliveries">
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {deliveries.slice(0, 20).map((delivery) => (
                      <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{delivery.itemDetails.name}</div>
                          <div className="text-sm text-muted-foreground">
                            From: {delivery.sellerName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(delivery.createdAt.toDate())} ago
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            delivery.status === 'delivered' ? 'bg-green-100 text-green-800' :
                            delivery.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {delivery.status.replace('_', ' ')}
                          </Badge>
                          <div className="text-sm font-medium mt-1">₦{delivery.fee}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthGuard>
  );
}