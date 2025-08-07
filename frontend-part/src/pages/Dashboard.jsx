import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { shipmentsAPI, partnersAPI } from '../services/api';
import {
  Package,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Search,
  Calendar,
  BarChart3,
  Truck,
  Users
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, userType } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [userType]);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    try {
      if (userType === 'partner') {
        const [statsResponse, shipmentsResponse] = await Promise.all([
          partnersAPI.getStats(),
          shipmentsAPI.getPartnerShipments({ limit: 5 })
        ]);
        
        setStats(statsResponse.data.data);
        setRecentShipments(shipmentsResponse.data.data.docs || []);
      } else {
        // For regular users, we can show shipments by email if available
        if (user.email) {
          const shipmentsResponse = await shipmentsAPI.searchByEmail(user.email);
          setRecentShipments(shipmentsResponse.data.data.shipments.slice(0, 5) || []);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_transit':
        return <Truck className="h-4 w-4 text-blue-500" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'exception':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.firstName || user.companyName}!
            </h1>
            <p className="text-gray-600 mt-1">
              {userType === 'partner' 
                ? 'Here\'s an overview of your shipment operations' 
                : 'Track and manage your packages'
              }
            </p>
          </div>
          
          {userType === 'partner' && (
            <div className="flex space-x-3">
              <Link
                to="/shipments/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Shipment
              </Link>
              <Link
                to="/shipments"
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center"
              >
                <Package className="h-4 w-4 mr-2" />
                View All
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards (Partner Only) */}
      {userType === 'partner' && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShipments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statusBreakdown.delivered || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Truck className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">{stats.statusBreakdown.in_transit || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveryRate}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/track"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center">
              <Search className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <h3 className="font-medium text-gray-900">Track Package</h3>
                <p className="text-sm text-gray-600">Track any package with tracking number</p>
              </div>
            </div>
          </Link>

          {userType === 'partner' ? (
            <>
              <Link
                to="/shipments/create"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center">
                  <Plus className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Create Shipment</h3>
                    <p className="text-sm text-gray-600">Create a new shipment entry</p>
                  </div>
                </div>
              </Link>

              <Link
                to="/shipments"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">View Reports</h3>
                    <p className="text-sm text-gray-600">Analyze shipment performance</p>
                  </div>
                </div>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center">
                  <Users className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-900">Manage Profile</h3>
                    <p className="text-sm text-gray-600">Update your account settings</p>
                  </div>
                </div>
              </Link>

              <div className="p-4 border border-gray-200 rounded-lg opacity-50">
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-400">Analytics</h3>
                    <p className="text-sm text-gray-400">Coming soon for customers</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Recent Shipments */}
      {recentShipments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {userType === 'partner' ? 'Recent Shipments' : 'Your Packages'}
            </h2>
            {userType === 'partner' && (
              <Link
                to="/shipments"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View all →
              </Link>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {userType === 'partner' ? 'Recipient' : 'Sender'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentShipments.map((shipment) => (
                  <tr key={shipment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {shipment.trackingNumber}
                      </div>
                      {shipment.partnerTrackingNumber && (
                        <div className="text-xs text-gray-500">
                          Partner: {shipment.partnerTrackingNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {userType === 'partner' ? shipment.recipient.name : shipment.sender.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {userType === 'partner' 
                          ? `${shipment.recipient.address.city}, ${shipment.recipient.address.state}`
                          : `${shipment.sender.address.city}, ${shipment.sender.address.state}`
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.currentStatus)}`}>
                        {getStatusIcon(shipment.currentStatus)}
                        <span className="ml-1 capitalize">{shipment.currentStatus.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {format(new Date(shipment.createdAt), 'MMM dd, yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/track/${shipment.trackingNumber}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {recentShipments.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {userType === 'partner' ? 'No shipments yet' : 'No packages found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {userType === 'partner' 
              ? 'Create your first shipment to get started with tracking.'
              : 'Start tracking your packages by entering a tracking number.'
            }
          </p>
          {userType === 'partner' ? (
            <Link
              to="/shipments/create"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create First Shipment
            </Link>
          ) : (
            <Link
              to="/track"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <Search className="h-4 w-4 mr-2" />
              Track a Package
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
