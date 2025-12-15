import React, { createContext, useState, useEffect, useContext } from 'react';
import { login as loginApi, signup as signupApi, getMe } from '../api/authApi';
import { getCurrencySymbol, formatCurrency } from '../utils/formatCurrency';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import axiosInstance from '../api/axioInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isProcessingAuth, setIsProcessingAuth] = useState(false);

  // Global Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (isProcessingAuth) return;
      setIsProcessingAuth(true);
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const idToken = await firebaseUser.getIdToken();
          // Exchange for app JWT
          const res = await axiosInstance.post('/auth/firebase', {}, {
            headers: { Authorization: `Bearer ${idToken}` }
          });
          if (res.data && res.data.token && res.data.user) {
            localStorage.setItem('authToken', res.data.token);
            setUser(res.data.user);
            setIsAuthenticated(true);
          } else {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('authToken');
          }
        } catch (err) {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem('authToken');
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
      }
      setLoading(false);
      setIsProcessingAuth(false);
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
