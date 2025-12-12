'use client';

import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserRole } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function SignupForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'seller' as UserRole,
    vehicleInfo: ''
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      
      await updateProfile(user, { displayName: formData.name });

      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role,
        ...(formData.role === 'driver' && { vehicleInfo: formData.vehicleInfo, online: false }),
        createdAt: new Date()
      });

      toast.success('Account created successfully!');
      router.push(formData.role === 'seller' ? '/seller' : '/driver');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Join our delivery network</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-3">
            <Label>I am a:</Label>
            <RadioGroup 
              value={formData.role} 
              onValueChange={(value: UserRole) => setFormData(prev => ({ ...prev, role: value }))}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="seller" id="seller" />
                <Label htmlFor="seller">Seller (I need deliveries)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="driver" id="driver" />
                <Label htmlFor="driver">Driver (I make deliveries)</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.role === 'driver' && (
            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle Information</Label>
              <Input
                id="vehicle"
                placeholder="e.g., Motorcycle, Car, Van"
                value={formData.vehicleInfo}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicleInfo: e.target.value }))}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}