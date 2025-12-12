import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Package, MapPin, Shield, Clock, Star } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Truck className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-gray-900">KadaDispatch</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect Sellers with
              <span className="text-primary"> Reliable Drivers</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Fast, secure, and affordable delivery services. Whether you're sending packages
              across town or across states, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  <Package className="h-5 w-5 mr-2" />
                  I Need Deliveries
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  <Truck className="h-5 w-5 mr-2" />
                  I'm a Driver
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Why Choose KadaDispatch?
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center">
                <CardHeader>
                  <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
                  <CardTitle>Real-time Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Track your packages in real-time with live location updates
                    and delivery notifications.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
                  <CardTitle>Secure & Insured</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    All deliveries are insured and handled by verified drivers
                    for maximum security.
                  </CardDescription>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Clock className="h-12 w-12 mx-auto text-primary mb-4" />
                  <CardTitle>Fast Delivery</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    Quick turnaround times with same-day and express delivery
                    options available.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
              How It Works
            </h3>
            <div className="grid md:grid-cols-2 gap-16">
              {/* For Sellers */}
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-6">For Sellers</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h5 className="font-semibold">Create Delivery Request</h5>
                      <p className="text-gray-600">Enter pickup and drop-off details</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h5 className="font-semibold">Get Driver Match</h5>
                      <p className="text-gray-600">Nearby drivers receive your request</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h5 className="font-semibold">Track Delivery</h5>
                      <p className="text-gray-600">Monitor progress in real-time</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* For Drivers */}
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-6">For Drivers</h4>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <h5 className="font-semibold">Go Online</h5>
                      <p className="text-gray-600">Toggle availability to receive requests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <h5 className="font-semibold">Accept Deliveries</h5>
                      <p className="text-gray-600">Choose jobs that work for your schedule</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="bg-secondary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">3</div>
                    <div>
                      <h5 className="font-semibold">Earn Money</h5>
                      <p className="text-gray-600">Get paid instantly after delivery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h3 className="text-4xl font-bold mb-6">Ready to Get Started?</h3>
            <p className="text-xl mb-8">
              Join thousands of satisfied customers and drivers using KadaDispatch
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Sign Up Now
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Truck className="h-6 w-6" />
            <span className="text-xl font-bold">KadaDispatch</span>
          </div>
          <p className="text-gray-400">
            © 2025 KadaDispatch. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}