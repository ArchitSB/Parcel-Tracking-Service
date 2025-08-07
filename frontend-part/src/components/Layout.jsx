import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  User, 
  LogOut, 
  Home, 
  Search, 
  Bell, 
  Settings,
  Truck,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

const Layout = ({ children }) => {
  const { user, userType, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/', icon: Home, show: true },
    { name: 'Track Package', href: '/track', icon: Search, show: true },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3, show: !!user },
    { name: 'Shipments', href: '/shipments', icon: Package, show: userType === 'partner' },
    { name: 'Create Shipment', href: '/shipments/create', icon: Truck, show: userType === 'partner' },
    { name: 'Profile', href: '/profile', icon: User, show: !!user },
    { name: 'Notifications', href: '/notifications', icon: Bell, show: !!user },
  ];

  const visibleNavigation = navigation.filter(item => item.show);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Mobile Menu */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to="/" className="flex items-center ml-2 md:ml-0">
                <Package className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  ParcelTrack
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {visibleNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                    location.pathname === item.href
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <item.icon className="h-4 w-4 mr-1" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    {user.firstName || user.companyName}
                  </span>
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {userType === 'partner' ? 'Partner' : 'User'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {sidebarOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              {visibleNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === item.href
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
