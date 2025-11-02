import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { adminAPI } from '../services/api';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_INITIALIZING':
      return { ...state, initializing: action.payload };
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        initializing: false,
        isAuthenticated: true, 
        admin: action.payload.admin,
        token: action.payload.token 
      };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, initializing: false, error: action.payload };
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        admin: null, 
        token: null,
        initializing: false 
      };
    case 'TOKEN_VERIFIED':
      return {
        ...state,
        isAuthenticated: true,
        admin: action.payload.admin,
        token: action.payload.token,
        initializing: false,
        loading: false
      };
    case 'TOKEN_INVALID':
      return {
        ...state,
        isAuthenticated: false,
        admin: null,
        token: null,
        initializing: false,
        loading: false
      };
    default:
      return state;
  }
};

const initialState = {
  isAuthenticated: false,
  admin: null,
  token: localStorage.getItem('admin_token'),
  loading: false,
  error: null,
  initializing: true // Add this to track initial loading
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('admin_token');
      
      if (token) {
        try {
          const response = await adminAPI.getProfile();
          dispatch({
            type: 'TOKEN_VERIFIED',
            payload: {
              admin: response.data.data,
              token
            }
          });
        } catch (error) {
          console.log('Token invalid or expired, removing...');
          localStorage.removeItem('admin_token');
          dispatch({ type: 'TOKEN_INVALID' });
        }
      } else {
        dispatch({ type: 'TOKEN_INVALID' });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      // First check if we need to setup admin
      const setupResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/admin/setup-status`);
      const setupData = await setupResponse.json();
      
      let response;
      if (setupData.data.setupRequired) {
        response = await adminAPI.setupAdmin(credentials);
      } else {
        response = await adminAPI.login(credentials);
      }
      
      const { admin, token } = response.data.data;
      
      localStorage.setItem('admin_token', token);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { admin, token }
      });
      
      return response.data;
    } catch (error) {
      dispatch({
        type: 'LOGIN_ERROR',
        payload: error.response?.data?.message || 'Login failed'
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      logout,
    }}>
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
