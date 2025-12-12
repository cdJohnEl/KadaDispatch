'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'seller' | 'driver';
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    if (!loading && !hasCheckedAuth) {
      setHasCheckedAuth(true);
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (requiredRole && userData && userData.role !== requiredRole) {
        router.push('/auth/login');
        return;
      }
    }
  }, [user, userData, loading, requiredRole, router, hasCheckedAuth]);

  // Show loading spinner while authentication is being determined
  if (loading || !hasCheckedAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Don't render anything if not authenticated or wrong role
  if (!user || (requiredRole && userData?.role !== requiredRole)) {
    return null;
  }

  return <>{children}</>;
}