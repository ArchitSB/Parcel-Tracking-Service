import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Search, 
  Truck, 
  Bell, 
  Shield, 
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';
import TrackingForm from '../components/TrackingForm';

const Home = () => {
  const { user, userType } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: Search,
      title: 'Real-time Tracking',
      description: 'Track your packages in real-time with detailed location updates and delivery status.',
    },
    {
      icon: Bell,
      title: 'Smart Notifications',
      description: 'Get instant notifications via email, SMS, or push notifications for every update.',
    },
    {
      icon: Shield,
      title: 'Secure & Reliable',
      description: 'Enterprise-grade security with 99.9% uptime and encrypted data transmission.',
    },
    {
      icon: Clock,
      title: 'Fast Delivery',
      description: 'Multiple delivery options including same-day, express, and standard shipping.',
    },
  ];

  const stats = [
    { label: 'Packages Delivered', value: '10M+' },
    { label: 'Happy Customers', value: '500K+' },
    { label: 'Partner Companies', value: '1,000+' },
    { label: 'Countries Served', value: '50+' },
  ];

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Your Packages
            <span className="text-blue-600"> Anywhere, Anytime</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The most reliable parcel tracking service with real-time updates, 
            smart notifications, and seamless integration for businesses.
          </p>

          {/* Quick Track */}
          <div className="max-w-md mx-auto mb-8">
            <TrackingForm />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Get Started Free
                </Link>
                <Link
                  to="/register?type=partner"
                  className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  Partner with Us
                </Link>
              </>
            ) : (
              <div className="flex gap-4">
                <Link
                  to="/dashboard"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
                {userType === 'partner' && (
                  <Link
                    to="/shipments/create"
                    className="border border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Create Shipment
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-blue-600">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index} className="text-white">
                <div className="text-3xl md:text-4xl font-bold">{stat.value}</div>
                <div className="text-blue-100 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ParcelTrack?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide the most comprehensive parcel tracking solution 
              with cutting-edge technology and reliable service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple, fast, and reliable parcel tracking in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Enter Tracking Number
              </h3>
              <p className="text-gray-600">
                Enter your tracking number in the search box to get started
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Get Real-time Updates
              </h3>
              <p className="text-gray-600">
                View detailed tracking information and real-time location updates
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Receive Your Package
              </h3>
              <p className="text-gray-600">
                Get notified when your package is delivered to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses and individuals who trust ParcelTrack 
            for their shipping needs.
          </p>
          
          {!user && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                Start Tracking Now
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/track"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Track a Package
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
