import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { login as loginApi, signup as signupApi, getMe } from '../api/authApi';
import { getCurrencySymbol, formatCurrency } from '../utils/formatCurrency';
import { onAuthStateChanged, signOut, getRedirectResult } from 'firebase/auth';
import { auth } from '../config/firebase';
import axiosInstance from '../api/axioInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isProcessingAuth = useRef(false);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          // User has just signed in via redirect.
          const idToken = await result.user.getIdToken();
          const res = await axiosInstance.post('/auth/firebase', {}, {
            headers: { Authorization: `Bearer ${idToken}` },
          });

          if (res.data?.token && res.data?.user) {
            localStorage.setItem('authToken', res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
          }
        } else {
          // This is a page refresh, not a redirect.
          // Check if user is already logged in.
          const token = localStorage.getItem('authToken');
          if (token) {
            const response = await getMe();
            if (response.success) {
              setUser(response.data.user);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error('Authentication error:', error);
        localStorage.removeItem('authToken');
        setUser(null);
        setIsAuthenticated(false);
        await signOut(auth).catch(() => {}); // Attempt to sign out from Firebase
      } finally {
        setLoading(false);
      }
    };

    handleAuth();

    // Set up a listener for subsequent auth state changes (e.g., manual sign-out)
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        localStorage.removeItem('authToken');
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await loginApi({ email, password });
      
      if (response.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.error || error.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await signupApi(userData);
      
      if (response.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        return { success: true, user: response.data.user };
      }
      
      return { success: false, error: 'Signup failed' };
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error.error || error.message || 'Signup failed' 
      };
    }
  };

  const logout = async () => {
    await signOut(auth);
    localStorage.removeItem('authToken');
    setUser(null);
    setIsAuthenticated(false);
  };

  // Currency helpers
  const currencyCode = user?.currency || 'USD';
  const currencySymbol = getCurrencySymbol(currencyCode);
  
  const formatAmount = (amount) => formatCurrency(amount, currencyCode);

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    login,
    signup,
    logout,
    currencyCode,
    currencySymbol,
    formatAmount
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

export default AuthContext;
