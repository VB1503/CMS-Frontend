import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import axios from 'axios';
import './AuthModal.css';

const LoginModal = ({ onClose, onSwitchToRegister }) => {
  const REACT_APP_GOOGLE_CLIENT_ID = '937549199111-6qi6odvq95bjh6s2hvkvo3ivcs70n5rd.apps.googleusercontent.com';
  const REACT_APP_GOGGLE_REDIRECT_URL_ENDPOINT = 'https://vijayanand-cms.vercel.app';
  const [username] = useState(localStorage.getItem('first_name'));
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const isRegistered = localStorage.getItem('userid');
  const isAuthenticated = localStorage.getItem('token');
  const [loading, setLoading] = useState(false);
  const [logindata, setLogindata] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setLogindata({ ...logindata, [name]: value });

    if (name === 'email') {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setErrors({ ...errors, email: isValid ? '' : 'Invalid email format' });
    }
    if (name === 'password') {
      const isValid = value.length >= 6;
      setErrors({ ...errors, password: isValid ? '' : 'Password must be at least 6 characters long' });
    }
  };

  const openGoogleLoginPage = useCallback(() => {
    const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const scope = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
    ].join(' ');
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: REACT_APP_GOOGLE_CLIENT_ID,
      redirect_uri: `${REACT_APP_GOGGLE_REDIRECT_URL_ENDPOINT}/google`,
      prompt: 'select_account',
      access_type: 'online',
      scope,
    });
    const url = `${googleAuthUrl}?${params}`;
    window.location.href = url;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (Object.values(errors).every((error) => error === '')) {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE}/api/v1/auth/login/`, logindata);
        const response = res.data;
        if (res.status === 200) {
          localStorage.setItem('token', JSON.stringify(response.access_token));
          localStorage.setItem('refresh_token', JSON.stringify(response.refresh_token));
          localStorage.setItem('userid', res.data.id);
          localStorage.setItem('email', res.data.email);
          localStorage.setItem('phone_number', res.data.phone_number);
          localStorage.setItem('is_verified', res.data.is_verified);
          localStorage.setItem('first_name', res.data.first_name);
          localStorage.setItem('last_name', res.data.last_name);
          localStorage.setItem('profile_pic', res.data.profile_pic);
          toast.success('Login successful');
          onClose();
          window.location.reload();
        }
      } else {
        toast.error('Please fix the form errors before submitting');
      }
    } catch (error) {
      if (error) {
        setErrors({ email: 'incorrect please check', password: 'incorrect please check' });
      }
      console.error('An error occurred:', error);
      toast.error('Check the email and password you entered is correct');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card w-full max-w-sm md:max-w-lg px-6 md:px-10 py-8 md:py-10" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Brand */}
        <div className="mb-0 md:mb-2">
          <img src='https://t3.ftcdn.net/jpg/02/12/82/12/240_F_212821250_A7fY72OL8WB7SFJ2gWKhnY0qWCelslis.jpg' className='w-[40px] md:w-[50px] h-[40px] md:h-[50px] mx-auto'></img>
        </div>

        {/* Header */}
        <div className="text-center mb-6 md:mb-7">
          <h2 className="text-2xl md:text-3xl font-bold mb-1">Sign in</h2>
          <p className="text-gray-500 text-sm md:text-base">Access your dashboard to manage lands</p>
        </div>

        {errors.message && <span className="text-red-500 text-xs md:text-sm block mb-3">Your email or password was incorrect</span>}

        {/* Form */}
        <form className="space-y-4 md:space-y-5" onSubmit={handleSubmit}>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block font-semibold text-gray-900 text-sm md:text-base mb-2">
              Email
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                className={`w-full border rounded-lg px-3.5 md:px-4 py-2.5 md:py-3 text-sm md:text-base bg-slate-50 focus:outline-none transition ${
                  errors.email ? 'border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]' : 'border-slate-200 focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(14,165,233,0.15)]'
                }`}
                value={logindata.email}
                name="email"
                placeholder="you@example.com"
                onChange={handleOnchange}
                autoComplete="email"
              />
            </div>
            {errors.email && <span className="text-red-500 text-xs md:text-sm block mt-1">{errors.email}</span>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block font-semibold text-gray-900 text-sm md:text-base mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`w-full border rounded-lg px-3.5 md:px-4 py-2.5 md:py-3 pr-10 text-sm md:text-base bg-slate-50 focus:outline-none transition ${
                  errors.password ? 'border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]' : 'border-slate-200 focus:border-blue-500 focus:shadow-[0_0_0_2px_rgba(14,165,233,0.15)]'
                }`}
                value={logindata.password}
                name="password"
                placeholder="Enter your password"
                onChange={handleOnchange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {errors.password && <span className="text-red-500 text-xs md:text-sm block mt-1">{errors.password}</span>}
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-1">
            <button type="button" className="text-blue-500 hover:underline font-semibold text-xs md:text-sm" onClick={() =>{navigate('/forget_password');}}>
              Forgot password?
            </button>
          </div>

          {/* Login Button */}
          <button 
            type="submit" 
            className="auth-btn-primary py-2.5 md:py-3 text-sm md:text-base mt-4 md:mt-5"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Google Button */}
        {!isAuthenticated && (
        <div>
            {/* Divider */}
        <div className="auth-divider my-4 md:my-5 text-xs md:text-sm">
          <span>or continue with</span>
        </div>
          <button 
            type="button" 
            className="auth-btn-ghost auth-google-btn py-2.5 md:py-3 text-sm md:text-base"
            onClick={openGoogleLoginPage}
          >
            <div className="auth-google-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="20px" height="20px" className="md:w-6 md:h-6">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
            </div>
            <span>Sign in with Google</span>
          </button>
        </div>
        )}

        {/* Switch to Register */}
        {!isRegistered && (
        <div className="text-center mt-4 md:mt-5 text-xs md:text-sm text-gray-500">
          <span>Don't have an account? </span>
          <button 
            type="button" 
            onClick={onSwitchToRegister}
            className="font-bold text-gray-900 hover:text-blue-500"
          >
            Sign up
          </button>
        </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;
