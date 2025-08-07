import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Package, Eye, EyeOff, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const { register: registerUser, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isPartner, setIsPartner] = useState(searchParams.get('type') === 'partner');
  const [credentials, setCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm();

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated && !credentials) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate, credentials]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data) => {
    const result = await registerUser(data, isPartner);
    if (result.success) {
      if (isPartner && result.credentials) {
        setCredentials(result.credentials);
        toast.success('Partner registration successful! Please save your API credentials.');
      } else {
        toast.success('Registration successful!');
        navigate('/dashboard');
      }
    }
  };

  const switchMode = () => {
    setIsPartner(!isPartner);
    reset();
    clearError();
    setCredentials(null);
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const proceedToDashboard = () => {
    navigate('/dashboard');
  };

  if (credentials) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Package className="h-12 w-12 text-green-600 mx-auto" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Registration Successful!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Save these credentials securely. You'll need them to access the API.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important: Save Your Credentials
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>These credentials will not be shown again. Please save them securely.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={credentials.apiKey}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-md text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(credentials.apiKey, 'apiKey')}
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                >
                  {copiedField === 'apiKey' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Secret
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={credentials.apiSecret}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-l-md text-sm font-mono"
                />
                <button
                  onClick={() => copyToClipboard(credentials.apiSecret, 'apiSecret')}
                  className="px-3 py-2 bg-gray-100 border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-200"
                >
                  {copiedField === 'apiSecret' ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={proceedToDashboard}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Continue to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Package className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Registration Type Toggle */}
          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => !isPartner || switchMode()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !isPartner
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Customer Account
            </button>
            <button
              type="button"
              onClick={() => isPartner || switchMode()}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                isPartner
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Partner Account
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {isPartner ? (
              <>
                {/* Company Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    {...register('companyName', { required: 'Company name is required' })}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
                  )}
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    {...register('contactEmail', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter contact email"
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
                  )}
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact Phone
                  </label>
                  <input
                    {...register('contactPhone', { required: 'Phone number is required' })}
                    type="tel"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter contact phone"
                  />
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
                  )}
                </div>

                {/* Partner Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Partner Type
                  </label>
                  <select
                    {...register('partnerType', { required: 'Partner type is required' })}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select partner type</option>
                    <option value="shipping">Shipping Company</option>
                    <option value="logistics">Logistics Provider</option>
                    <option value="ecommerce">E-commerce Platform</option>
                    <option value="courier">Courier Service</option>
                  </select>
                  {errors.partnerType && (
                    <p className="mt-1 text-sm text-red-600">{errors.partnerType.message}</p>
                  )}
                </div>

                {/* Address Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Street
                    </label>
                    <input
                      {...register('address.street', { required: 'Street is required' })}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Street address"
                    />
                    {errors.address?.street && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.street.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      {...register('address.city', { required: 'City is required' })}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="City"
                    />
                    {errors.address?.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.city.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      {...register('address.state', { required: 'State is required' })}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="State"
                    />
                    {errors.address?.state && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.state.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      ZIP Code
                    </label>
                    <input
                      {...register('address.zipCode', { required: 'ZIP code is required' })}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ZIP Code"
                    />
                    {errors.address?.zipCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.address.zipCode.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Country
                  </label>
                  <input
                    {...register('address.country', { required: 'Country is required' })}
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Country"
                  />
                  {errors.address?.country && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.country.message}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Customer Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      {...register('firstName', { required: 'First name is required' })}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="First name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      {...register('lastName', { required: 'Last name is required' })}
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      },
                    })}
                    type="email"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone (Optional)
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('password', {
                        required: 'Password is required',
                        minLength: {
                          value: 6,
                          message: 'Password must be at least 6 characters',
                        },
                      })}
                      type={showPassword ? 'text' : 'password'}
                      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <input
                    {...register('confirmPassword', {
                      required: 'Please confirm your password',
                      validate: (value) =>
                        value === password || 'Passwords do not match',
                    })}
                    type="password"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your password"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  `Create ${isPartner ? 'Partner' : 'Customer'} Account`
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
