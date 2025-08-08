import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { shipmentsAPI, notificationsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Package,
  MapPin,
  Clock,
  Truck,
  CheckCircle,
  AlertTriangle,
  Bell,
  Search,
  Calendar,
  User,
  Phone,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import TrackingForm from '../components/TrackingForm';

const TrackingPage = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (trackingNumber) {
      fetchShipment();
    }
  }, [trackingNumber]);

  const fetchShipment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await shipmentsAPI.getByTracking(trackingNumber);
      setShipment(response.data.data?.shipment || response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Shipment not found');
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    if (!subscribeEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setSubscribing(true);
    
    try {
      await notificationsAPI.subscribe({
        trackingNumber,
        email: subscribeEmail,
        preferences: {
          emailNotifications: true,
          smsNotifications: false,
          pushNotifications: false
        }
      });
      
      setSubscribed(true);
      toast.success('Successfully subscribed to notifications!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe');
    } finally {
      setSubscribing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'in_transit':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'exception':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'exception':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEventIcon = (eventType) => {
    switch (eventType) {
      case 'shipment_created':
        return <Package className="h-4 w-4" />;
      case 'package_picked_up':
        return <Truck className="h-4 w-4" />;
      case 'in_transit':
        return <MapPin className="h-4 w-4" />;
      case 'out_for_delivery':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'delivery_attempted':
        return <AlertTriangle className="h-4 w-4" />;
      case 'exception':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (!trackingNumber) {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Track Your Package</h2>
          <p className="text-gray-600 mb-8">Enter your tracking number to get real-time updates</p>
          <TrackingForm className="max-w-md mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Package Tracking
          </h1>
        </div>
        
        {/* Search Again */}
        <div className="hidden md:block">
          <TrackingForm className="w-80" />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Package Not Found</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <TrackingForm className="max-w-md mx-auto" />
        </div>
      )}

      {shipment && (
        <div className="space-y-6">
          {/* Shipment Overview */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Tracking #{shipment.trackingNumber}
                </h2>
                <p className="text-gray-600">
                  Shipped by {shipment.partnerId.companyName}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(shipment.currentStatus)}`}>
                  {getStatusIcon(shipment.currentStatus)}
                  <span className="ml-2 capitalize">{shipment.currentStatus.replace('_', ' ')}</span>
                </span>
              </div>
            </div>

            {/* Shipment Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sender</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {shipment.sender.name}
                  </div>
                  {shipment.sender.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {shipment.sender.email}
                    </div>
                  )}
                  {shipment.sender.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {shipment.sender.phone}
                    </div>
                  )}
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      {shipment.sender.address.street}<br />
                      {shipment.sender.address.city}, {shipment.sender.address.state} {shipment.sender.address.zipCode}<br />
                      {shipment.sender.address.country}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Recipient</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {shipment.recipient.name}
                  </div>
                  {shipment.recipient.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {shipment.recipient.email}
                    </div>
                  )}
                  {shipment.recipient.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {shipment.recipient.phone}
                    </div>
                  )}
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                    <div>
                      {shipment.recipient.address.street}<br />
                      {shipment.recipient.address.city}, {shipment.recipient.address.state} {shipment.recipient.address.zipCode}<br />
                      {shipment.recipient.address.country}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="mt-6 pt-6 border-t">
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-900">Service Type:</span>
                  <span className="ml-2 capitalize">{shipment.serviceType.replace('_', ' ')}</span>
                </div>
                {shipment.estimatedDeliveryDate && (
                  <div>
                    <span className="font-medium text-gray-900">Estimated Delivery:</span>
                    <span className="ml-2">{format(new Date(shipment.estimatedDeliveryDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
                {shipment.actualDeliveryDate && (
                  <div>
                    <span className="font-medium text-gray-900">Delivered:</span>
                    <span className="ml-2">{format(new Date(shipment.actualDeliveryDate), 'MMM dd, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Tracking History</h3>
            
            <div className="flow-root">
              <ul className="-mb-8">
                {shipment.events.map((event, eventIdx) => (
                  <li key={event.eventId}>
                    <div className="relative pb-8">
                      {eventIdx !== shipment.events.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                            event.status === 'delivered' ? 'bg-green-500 text-white' :
                            event.status === 'exception' ? 'bg-red-500 text-white' :
                            event.status === 'in_transit' ? 'bg-blue-500 text-white' :
                            'bg-gray-500 text-white'
                          }`}>
                            {getEventIcon(event.eventType)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900 capitalize">
                              {event.eventType.replace(/_/g, ' ')}
                            </p>
                            <p className="text-sm text-gray-500">{event.description}</p>
                            {event.location && (event.location.city || event.location.address) && (
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="h-3 w-3 mr-1" />
                                {event.location.address && <span>{event.location.address}, </span>}
                                {event.location.city && <span>{event.location.city}</span>}
                                {event.location.state && <span>, {event.location.state}</span>}
                                {event.location.country && <span>, {event.location.country}</span>}
                              </div>
                            )}
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(event.timestamp), 'MMM dd, yyyy')}
                            </div>
                            <div className="flex items-center mt-1">
                              <Clock className="h-3 w-3 mr-1" />
                              {format(new Date(event.timestamp), 'hh:mm a')}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Notification Subscription */}
          {!user && !subscribed && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start">
                <Bell className="h-6 w-6 text-blue-600 mt-1" />
                <div className="ml-3 flex-1">
                  <h3 className="text-lg font-medium text-blue-900">
                    Get Updates via Email
                  </h3>
                  <p className="text-blue-700 mt-1 mb-4">
                    Subscribe to receive email notifications when your package status changes.
                  </p>
                  
                  <form onSubmit={handleSubscribe} className="flex max-w-md">
                    <input
                      type="email"
                      value={subscribeEmail}
                      onChange={(e) => setSubscribeEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="flex-1 px-3 py-2 border border-blue-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={subscribing}
                    />
                    <button
                      type="submit"
                      disabled={subscribing}
                      className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {subscribing ? 'Subscribing...' : 'Subscribe'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {subscribed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="ml-2 text-green-800">
                  You're subscribed to email notifications for this package.
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackingPage;
