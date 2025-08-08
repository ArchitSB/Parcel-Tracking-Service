import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { shipmentsAPI } from '../services/api';
import { Package, MapPin, User, Phone, Mail, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateShipment = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Sender Information
    senderName: '',
    senderPhone: '',
    senderEmail: '',
    senderAddress: '',
    
    // Receiver Information
    receiverName: '',
    receiverPhone: '',
    receiverEmail: '',
    receiverAddress: '',
    
    // Package Information
    packageDescription: '',
    weight: '',
    dimensions: {
      length: '',
      width: '',
      height: ''
    },
    value: '',
    
    // Shipping Information
    serviceType: 'standard',
    priority: 'normal',
    notes: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dimensions.')) {
      const dimensionKey = name.split('.')[1];
      setFormData({
        ...formData,
        dimensions: {
          ...formData.dimensions,
          [dimensionKey]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Transform form data to match backend schema
      const shipmentData = {
        sender: {
          name: formData.senderName,
          email: formData.senderEmail || undefined,
          phone: formData.senderPhone || undefined,
          address: {
            street: formData.senderAddress,
            city: 'Default City', // TODO: Add separate city field or parse from address
            state: 'Default State', // TODO: Add separate state field or parse from address  
            zipCode: '00000', // TODO: Add separate zipCode field or parse from address
            country: 'USA' // TODO: Add country selection
          }
        },
        recipient: {
          name: formData.receiverName,
          email: formData.receiverEmail || undefined,
          phone: formData.receiverPhone || undefined,
          address: {
            street: formData.receiverAddress,
            city: 'Default City', // TODO: Add separate city field or parse from address
            state: 'Default State', // TODO: Add separate state field or parse from address
            zipCode: '00000', // TODO: Add separate zipCode field or parse from address
            country: 'USA' // TODO: Add country selection
          }
        },
        package: {
          description: formData.packageDescription,
          weight: formData.weight ? {
            value: parseFloat(formData.weight),
            unit: 'kg'
          } : undefined,
          dimensions: (formData.dimensions.length && formData.dimensions.width && formData.dimensions.height) ? {
            length: parseFloat(formData.dimensions.length),
            width: parseFloat(formData.dimensions.width),
            height: parseFloat(formData.dimensions.height),
            unit: 'cm'
          } : undefined,
          value: formData.value ? {
            amount: parseFloat(formData.value),
            currency: 'USD'
          } : undefined,
          fragile: false
        },
        serviceType: formData.serviceType,
        metadata: {
          priority: formData.priority,
          notes: formData.notes
        }
      };

      const response = await shipmentsAPI.create(shipmentData);
      
      toast.success('Shipment created successfully!');
      
      // Reset form
      setFormData({
        senderName: '',
        senderPhone: '',
        senderEmail: '',
        senderAddress: '',
        receiverName: '',
        receiverPhone: '',
        receiverEmail: '',
        receiverAddress: '',
        packageDescription: '',
        weight: '',
        dimensions: { length: '', width: '', height: '' },
        value: '',
        serviceType: 'standard',
        priority: 'normal',
        notes: ''
      });
      
      // Show tracking number
      const trackingNumber = response.data.data?.shipment?.trackingNumber;
      if (trackingNumber) {
        toast.success(`Tracking Number: ${trackingNumber}`, { duration: 8000 });
      }
      
    } catch (error) {
      console.error('Shipment creation error:', error);
      toast.error(error.response?.data?.message || 'Failed to create shipment');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'partner' && user?.role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-600">
          Only partners and administrators can create shipments.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="bg-white rounded-full p-3">
              <Package className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Create New Shipment</h1>
              <p className="text-blue-100">Create a new package shipment for tracking</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Sender Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              Sender Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender Name *
                </label>
                <input
                  type="text"
                  name="senderName"
                  value={formData.senderName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="senderPhone"
                  value={formData.senderPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="senderEmail"
                  value={formData.senderEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  name="senderAddress"
                  value={formData.senderAddress}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Receiver Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Receiver Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receiver Name *
                </label>
                <input
                  type="text"
                  name="receiverName"
                  value={formData.receiverName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="receiverPhone"
                  value={formData.receiverPhone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="receiverEmail"
                  value={formData.receiverEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  name="receiverAddress"
                  value={formData.receiverAddress}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Package Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Package Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Package Description *
                </label>
                <textarea
                  name="packageDescription"
                  value={formData.packageDescription}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe the contents of the package"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  step="0.1"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Value ($)
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dimensions (cm)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    name="dimensions.length"
                    value={formData.dimensions.length}
                    onChange={handleInputChange}
                    placeholder="Length"
                    step="0.1"
                    min="0"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    name="dimensions.width"
                    value={formData.dimensions.width}
                    onChange={handleInputChange}
                    placeholder="Width"
                    step="0.1"
                    min="0"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="number"
                    name="dimensions.height"
                    value={formData.dimensions.height}
                    onChange={handleInputChange}
                    placeholder="Height"
                    step="0.1"
                    min="0"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              Shipping Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Type
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="standard">Standard Delivery</option>
                  <option value="express">Express Delivery</option>
                  <option value="overnight">Overnight Delivery</option>
                  <option value="same-day">Same Day Delivery</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Instructions
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Any special handling instructions or notes"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Package className="h-4 w-4" />
              )}
              <span>{loading ? 'Creating...' : 'Create Shipment'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateShipment;
