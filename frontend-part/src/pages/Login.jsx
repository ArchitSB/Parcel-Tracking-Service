import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { Package, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, isAuthenticated, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isPartner, setIsPartner] = useState(searchParams.get('type') === 'partner');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const onSubmit = async (data) => {
    const result = await login(data, isPartner);
    if (result.success) {
      toast.success('Login successful!');
      navigate('/dashboard');
    }
  };

  const switchMode = () => {
    setIsPartner(!isPartner);
    reset();
    clearError();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <Package className="h-12 w-12 text-blue-600" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {/* Login Type Toggle */}
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
              Customer Login
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
              Partner Login
            </button>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {isPartner ? (
              <>
                {/* Partner API Key */}
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <input
                    {...register('apiKey', { required: 'API Key is required' })}
                    type="text"
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your API key"
                  />
                  {errors.apiKey && (
                    <p className="mt-1 text-sm text-red-600">{errors.apiKey.message}</p>
                  )}
                </div>

                {/* Partner API Secret */}
                <div>
                  <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700">
                    API Secret
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('apiSecret', { required: 'API Secret is required' })}
                      type={showPassword ? 'text' : 'password'}
                      className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="Enter your API secret"
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
                  {errors.apiSecret && (
                    <p className="mt-1 text-sm text-red-600">{errors.apiSecret.message}</p>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Customer Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
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
                    className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>

                {/* Customer Password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      {...register('password', { required: 'Password is required' })}
                      type={showPassword ? 'text' : 'password'}
                      className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
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
                  `Sign in${isPartner ? ' as Partner' : ''}`
                )}
              </button>
            </div>

            <div className="text-center">
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
