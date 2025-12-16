import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Github, Linkedin } from 'lucide-react';
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



  return (
    <div className="auth-page">
      <div className="main">
        {/* Sign Up Container */}
        <div className="container a-container" id="a-container">
          <form className="form" onSubmit={handleSignUp}>
            <h2 className="form_title title">Create Account</h2>
            
            
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
