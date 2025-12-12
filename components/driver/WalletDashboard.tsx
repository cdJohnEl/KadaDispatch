'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Wallet, WalletTransaction } from '@/lib/types';
import { Wallet as WalletIcon, ArrowDownLeft, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function WalletDashboard() {
  const { userData } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) return;

    // Real-time listener for wallet updates
    const unsubscribe = onSnapshot(
      doc(db, 'wallets', userData.uid),
      (doc) => {
        if (doc.exists()) {
          setWallet(doc.data() as Wallet);
        } else {
          // Wallet doesn't exist yet
          setWallet({ userId: userData.uid, balance: 0, transactions: [] });
        }
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to wallet:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate earnings stats
  const totalEarnings = wallet?.transactions?.reduce((sum, t) =>
    t.type !== 'withdrawal' ? sum + t.amount : sum, 0
  ) || 0;

  const codEarnings = wallet?.transactions?.filter(t => t.type === 'cod_settlement')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  const prepaidEarnings = wallet?.transactions?.filter(t => t.type === 'earning')
    .reduce((sum, t) => sum + t.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <WalletIcon className="h-5 w-5" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-bold mb-6 text-green-600">
            ₦{wallet?.balance?.toLocaleString() || '0'}
          </div>

          {/* Earnings Breakdown */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Total Earned</div>
              <div className="text-lg font-semibold">₦{totalEarnings.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">COD</div>
              <div className="text-lg font-semibold">₦{codEarnings.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Prepaid</div>
              <div className="text-lg font-semibold">₦{prepaidEarnings.toLocaleString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {!wallet?.transactions?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No transactions yet</p>
              <p className="text-sm">Complete deliveries to start earning!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {wallet.transactions
                .sort((a, b) => b.timestamp.seconds - a.timestamp.seconds)
                .slice(0, 15)
                .map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatDistanceToNow(transaction.timestamp.toDate(), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        +₦{transaction.amount.toLocaleString()}
                      </div>
                      <Badge variant="outline" className="text-xs mt-1">
                        {transaction.type === 'cod_settlement' ? 'COD' : 'Prepaid'}
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}