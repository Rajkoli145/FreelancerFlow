import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Github, Linkedin } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '../../config/firebase';
import axiosInstance from '../../api/axioInstance';
import './auth.css';

const AuthPage = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Sign In Form
  const [signInData, setSignInData] = useState({
    email: '',
    password: ''
  });
  
  // Sign Up Form
  const [signUpData, setSignUpData] = useState({
    fullName: '',
    email: '',
    password: '',
    hourlyRate: ''
  });

  const switchForm = () => {
    const switchCtn = document.querySelector("#switch-cnt");
    const switchC1 = document.querySelector("#switch-c1");
    const switchC2 = document.querySelector("#switch-c2");
    const switchCircles = document.querySelectorAll(".switch__circle");
    const aContainer = document.querySelector("#a-container");
    const bContainer = document.querySelector("#b-container");

    switchCtn.classList.add("is-gx");
    setTimeout(() => {
      switchCtn.classList.remove("is-gx");
    }, 1500);

    switchCtn.classList.toggle("is-txr");
    switchCircles[0].classList.toggle("is-txr");
    switchCircles[1].classList.toggle("is-txr");

    switchC1.classList.toggle("is-hidden");
    switchC2.classList.toggle("is-hidden");
    aContainer.classList.toggle("is-txl");
    bContainer.classList.toggle("is-txl");
    bContainer.classList.toggle("is-z200");
    
    setIsSignIn(!isSignIn);
    setErrors({});
  };

  const handleSignInChange = (e) => {
    setSignInData({
      ...signInData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSignUpChange = (e) => {
    setSignUpData({
      ...signUpData,
      [e.target.name]: e.target.value
    });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const result = await login(signInData.email, signInData.password);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error || 'Invalid credentials' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Login failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    const newErrors = {};
    if (!signUpData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }
    if (!signUpData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(signUpData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!signUpData.password) {
      newErrors.password = 'Password is required';
    } else if (signUpData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const userData = {
        fullName: signUpData.fullName,
        email: signUpData.email,
        password: signUpData.password,
        defaultHourlyRate: signUpData.hourlyRate ? parseFloat(signUpData.hourlyRate) : 0
      };

      const result = await signup(userData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setErrors({ general: result.error || 'Registration failed' });
      }
    } catch (error) {
      setErrors({ general: error.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setErrors({});
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // Authenticate with your backend
      await axiosInstance.post('/auth/firebase', {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      // The onAuthStateChanged listener in AuthContext will handle the navigation
    } catch (error) {
      console.error('Google auth error:', error);
      setErrors({ general: error.message || 'Google authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    setLoading(true);
    setErrors({});
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const idToken = await result.user.getIdToken();

      // Authenticate with your backend
      await axiosInstance.post('/auth/firebase', {}, {
        headers: { Authorization: `Bearer ${idToken}` },
      });

      // The onAuthStateChanged listener in AuthContext will handle the navigation
    } catch (error) {
      console.error('GitHub auth error:', error);
      setErrors({ general: error.message || 'GitHub authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="main">
        {/* Sign Up Container */}
        <div className="container a-container" id="a-container">
          <form className="form" onSubmit={handleSignUp}>
            <h2 className="form_title title">Create Account</h2>
            
            <div className="form__icons">
              <button 
                type="button" 
                className="form__icon-btn" 
                aria-label="Sign up with Google"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <svg className="form__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button type="button" className="form__icon-btn" aria-label="Sign up with LinkedIn" disabled>
                <Linkedin className="form__icon" strokeWidth={1.5} />
              </button>
              <button 
                type="button" 
                className="form__icon-btn" 
                aria-label="Sign up with GitHub"
                onClick={handleGithubAuth}
                disabled={loading}
              >
                <Github className="form__icon" strokeWidth={1.5} />
              </button>
            </div>
            
            <span className="form__span">or use email for registration</span>
            
            <input
              className="form__input"
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={signUpData.fullName}
              onChange={handleSignUpChange}
              disabled={loading}
            />
            {errors.fullName && <span className="form__error">{errors.fullName}</span>}
            
            <input
              className="form__input"
              type="email"
              name="email"
              placeholder="Email"
              value={signUpData.email}
              onChange={handleSignUpChange}
              disabled={loading}
            />
            {errors.email && <span className="form__error">{errors.email}</span>}
            
            <input
              className="form__input"
              type="password"
              name="password"
              placeholder="Password"
              value={signUpData.password}
              onChange={handleSignUpChange}
              disabled={loading}
            />
            {errors.password && <span className="form__error">{errors.password}</span>}
            
            <input
              className="form__input"
              type="number"
              name="hourlyRate"
              placeholder="Hourly Rate (optional)"
              value={signUpData.hourlyRate}
              onChange={handleSignUpChange}
              disabled={loading}
            />
            
            {errors.general && <span className="form__error form__error--general">{errors.general}</span>}
            
            <button className="form__button button" type="submit" disabled={loading}>
              {loading ? 'CREATING...' : 'SIGN UP'}
            </button>
          </form>
        </div>

        {/* Sign In Container */}
        <div className="container b-container" id="b-container">
          <form className="form" onSubmit={handleSignIn}>
            <h2 className="form_title title">Sign in to FreelancerFlow</h2>
            
            <div className="form__icons">
              <button 
                type="button" 
                className="form__icon-btn" 
                aria-label="Sign in with Google"
                onClick={handleGoogleAuth}
                disabled={loading}
              >
                <svg className="form__icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button type="button" className="form__icon-btn" aria-label="Sign in with LinkedIn" disabled>
                <Linkedin className="form__icon" strokeWidth={1.5} />
              </button>
              <button 
                type="button" 
                className="form__icon-btn" 
                aria-label="Sign in with GitHub"
                onClick={handleGithubAuth}
                disabled={loading}
              >
                <Github className="form__icon" strokeWidth={1.5} />
              </button>
            </div>
            
            <span className="form__span">or use your email account</span>
            
            <input
              className="form__input"
              type="email"
              name="email"
              placeholder="Email"
              value={signInData.email}
              onChange={handleSignInChange}
              disabled={loading}
            />
            {errors.email && <span className="form__error">{errors.email}</span>}
            
            <input
              className="form__input"
              type="password"
              name="password"
              placeholder="Password"
              value={signInData.password}
              onChange={handleSignInChange}
              disabled={loading}
            />
            {errors.password && <span className="form__error">{errors.password}</span>}
            
            {errors.general && <span className="form__error form__error--general">{errors.general}</span>}
            
            <button className="form__button button" type="submit" disabled={loading}>
              {loading ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </form>
        </div>

        {/* Switch Panel */}
        <div className="switch" id="switch-cnt">
          <div className="switch__circle"></div>
          <div className="switch__circle switch__circle--t"></div>
          
          <div className="switch__container" id="switch-c1">
            <h2 className="switch__title title">Welcome Back!</h2>
            <p className="switch__description description">
              To keep connected with us please login with your personal info
            </p>
            <button className="switch__button button switch-btn" type="button" onClick={switchForm}>
              SIGN IN
            </button>
          </div>
          
          <div className="switch__container is-hidden" id="switch-c2">
            <h2 className="switch__title title">Hello Friend!</h2>
            <p className="switch__description description">
              Enter your personal details and start your journey with us
            </p>
            <button className="switch__button button switch-btn" type="button" onClick={switchForm}>
              SIGN UP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
