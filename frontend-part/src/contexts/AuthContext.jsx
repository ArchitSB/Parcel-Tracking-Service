import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: action.payload.user,
        userType: action.payload.type,
        token: action.payload.token,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        userType: null,
        token: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        userType: null,
        token: null,
        error: null,
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  user: null,
  userType: null, // 'user' or 'partner'
  token: null,
  loading: false,
  error: null,
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userType = localStorage.getItem('userType');

    if (token && user) {
      const userData = JSON.parse(user);
      
      // Ensure partner has a role field for consistency
      if (userType === 'partner' && !userData.role) {
        userData.role = 'partner';
      }
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: userData,
          type: userType,
          token,
        },
      });
    }
  }, []);

  const login = async (credentials, isPartner = false) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      const response = isPartner 
        ? await authAPI.partnerLogin(credentials)
        : await authAPI.login(credentials);

      const { user, partner, token } = response.data.data;
      const userData = user || partner;
      const type = user ? 'user' : 'partner';
      
      // Ensure partner has a role field for consistency
      if (partner && !partner.role) {
        userData.role = 'partner';
      }

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('userType', type);

      if (isPartner && credentials.apiKey) {
        localStorage.setItem('apiKey', credentials.apiKey);
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userData, type, token },
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData, isPartner = false) => {
    dispatch({ type: 'LOGIN_START' });
    
    try {
      // Remove confirmPassword field before sending to API
      const { confirmPassword, ...apiData } = userData;
      
      const response = isPartner 
        ? await authAPI.partnerRegister(apiData)
        : await authAPI.register(apiData);

      const { user, partner, token, credentials } = response.data.data;
      const userDataResponse = user || partner;
      const type = user ? 'user' : 'partner';
      
      // Ensure partner has a role field for consistency
      if (partner && !partner.role) {
        userDataResponse.role = 'partner';
      }

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userDataResponse));
      localStorage.setItem('userType', type);

      if (credentials) {
        localStorage.setItem('apiKey', credentials.apiKey);
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: userDataResponse, type, token },
      });

      return { success: true, credentials };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
    localStorage.removeItem('apiKey');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
