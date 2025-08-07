import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const TrackingForm = ({ className = '' }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      toast.error('Please enter a tracking number');
      return;
    }

    setLoading(true);
    navigate(`/track/${trackingNumber.trim().toUpperCase()}`);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className={`${className}`}>
      <div className="flex">
        <div className="flex-1">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number (e.g., PT123456789)"
            className="w-full px-4 py-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <Search className="h-5 w-5 mr-2" />
              Track
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default TrackingForm;
