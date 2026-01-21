import React, { useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { FaEyeSlash, FaEye } from 'react-icons/fa';
import axios from 'axios';
import './AuthModal.css';

const RegisterModal = ({ onClose, onSwitchToLogin }) => {
  const REACT_APP_GOOGLE_CLIENT_ID = '937549199111-6qi6odvq95bjh6s2hvkvo3ivcs70n5rd.apps.googleusercontent.com';
  const REACT_APP_GOGGLE_REDIRECT_URL_ENDPOINT = import.meta.env.VITE_API_BASE;
  const [username] = useState(localStorage.getItem('first_name'));
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formdata, setFormdata] = useState({
    email: '',
    phone_number: '',
    first_name: '',
    last_name: '',
    password: '',
    password2: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    phone_number: '',
    password: '',
    password2: '',
  });

  const handleOnchange = (e) => {
    const { name, value } = e.target;
    setFormdata({ ...formdata, [name]: value });

    if (name === 'email') {
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      setErrors({ ...errors, email: isValid ? '' : 'Invalid email format' });
    }

    if (name === 'phone_number') {
      const isValid = /^\d{10}$/.test(value);
      setErrors({ ...errors, phone_number: isValid ? '' : 'Phone Number must be 10 digit' });
    }

    if (name === 'password') {
      const isValid = value.length >= 6;
      setErrors({ ...errors, password: isValid ? '' : 'Password must be at least 6 characters long' });
    }

    if (name === 'password2') {
      const isValid = value === formdata.password;
      setErrors({ ...errors, password2: isValid ? '' : 'Passwords do not match' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (Object.values(errors).every((error) => error === '')) {
        const response = await axios.post(`${import.meta.env.VITE_API_BASE}/api/v1/auth/register/`, formdata);
        const result = response.data;
        if (response.status === 201) {
          localStorage.setItem('userid', result.data.id);
          localStorage.setItem('phone_number', result.data.phone_number);
          localStorage.setItem('first_name', result.data.first_name);
          localStorage.setItem('last_name', result.data.last_name);
          onClose();
          await navigate('/otp/verify', { state: { requestFrom: 'registerform' } });
          toast.success(result.message);
        }
        if (result.message1 === 'Phone number already exists' && result.message2 === 'email already exists') {
          setErrors({
            phone_number: 'This Phone number already taken',
            email: 'This email already taken',
          });
        } else if (result.message1 === 'Phone number already exists') {
          setErrors({
            ...errors,
            phone_number: 'This Phone number already taken',
          });
        } else if (result.message2 === 'email already exists') {
          setErrors({
            ...errors,
            email: 'This email already taken',
          });
        }
      } else {
        toast.error('Please fix the form errors before submitting');
      }
    } catch (error) {
      if (error) {
        setErrors({ email: 'there is a problem try again later', phone_number: 'there is a problem try again later' });
      }
      console.error('An error occurred:', error);
      toast.error('An error occurred while submitting the form');
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

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card w-full max-w-2xl md:max-w-2xl px-8 py-7 md:py-9" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Brand */}
        <div className="mb-1 md:mb-4">
          <img src='https://t3.ftcdn.net/jpg/02/12/82/12/240_F_212821250_A7fY72OL8WB7SFJ2gWKhnY0qWCelslis.jpg' className='w-[40px] md:w-[50px] h-[40px] md:h-[50px] mx-auto'></img>
        </div>

        {/* Header */}
        <div className="text-center mb-5 md:mb-6">
          <h2 className="text-xl md:text-3xl font-bold mb-1">Create Account</h2>
          <p className="text-gray-500 text-xs md:text-sm hidden md:block">Start managing your lands and predictions</p>
        </div>

        {/* Form */}
        <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
          {/* Two Column Grid for Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-3">
            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block font-semibold text-gray-900 text-xs md:text-sm mb-1.5">
                First Name
              </label>
              <input
                id="first_name"
                type="text"
                className="w-full mb-3 md:mb-0 border border-slate-200 rounded-lg px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm bg-slate-50 focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_2px_rgba(14,165,233,0.15)] transition"
                name="first_name"
                value={formdata.first_name}
                placeholder="John"
                onChange={handleOnchange}
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block font-semibold text-gray-900 text-xs md:text-sm mb-1.5">
                Last Name
              </label>
              <input
                id="last_name"
                type="text"
                className="w-full border border-slate-200 rounded-lg px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm bg-slate-50 focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_2px_rgba(14,165,233,0.15)] transition"
                name="last_name"
                value={formdata.last_name}
                placeholder="Doe"
                onChange={handleOnchange}
                required
              />
            </div>
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-3">
            {/* Email */}
            <div>
              <label htmlFor="reg_email" className="block font-semibold text-gray-900 text-xs md:text-sm mb-1.5">
                Email
              </label>
              <input
                id="reg_email"
                type="email"
                className={`w-full mb-3 md:mb-0 border rounded-lg px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm bg-slate-50 focus:outline-none transition ${
                  errors.email ? 'border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]' : 'border-slate-200 focus:border-green-500 focus:shadow-[0_0_0_2px_rgba(14,165,233,0.15)]'
                }`}
                name="email"
                value={formdata.email}
                placeholder="you@example.com"
                onChange={handleOnchange}
                required
              />
              {errors.email && <span className="text-red-500 text-xs block mt-0.5">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phone_number" className="block font-semibold text-gray-900 text-xs md:text-sm mb-1.5">
                Phone Number
              </label>
              <input
                id="phone_number"
                type="text"
                className={`w-full border rounded-lg px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm bg-slate-50 focus:outline-none transition ${
                  errors.phone_number ? 'border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]' : 'border-slate-200 focus:border-green-500 focus:shadow-[0_0_0_2px_rgba(14,165,233,0.15)]'
                }`}
                name="phone_number"
                value={formdata.phone_number}
                placeholder="1234567890"
                onChange={handleOnchange}
                maxLength={10}
                required
              />
              {errors.phone_number && <span className="text-red-500 text-xs block mt-0.5">{errors.phone_number}</span>}
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-3">
            {/* Password */}
            <div>
              <label htmlFor="reg_password" className="block font-semibold text-gray-900 text-xs md:text-sm mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="reg_password"
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full mb-3 md:mb-0 border rounded-lg px-3 md:px-3.5 py-2 md:py-2.5 pr-8 text-xs md:text-sm bg-slate-50 focus:outline-none transition ${
                    errors.password ? 'border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]' : 'border-slate-200 focus:border-green-500 focus:shadow-[0_0_0_2px_rgba(14,165,233,0.15)]'
                  }`}
                  name="password"
                  value={formdata.password}
                  placeholder="At least 6 characters"
                  onChange={handleOnchange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-900"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs block mt-0.5">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="password2" className="block font-semibold text-gray-900 text-xs md:text-sm mb-1.5">
                Confirm Password
              </label>
              <input
                id="password2"
                type="password"
                className={`w-full border rounded-lg px-3 md:px-3.5 py-2 md:py-2.5 text-xs md:text-sm bg-slate-50 focus:outline-none transition ${
                  errors.password2 ? 'border-red-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.15)]' : 'border-slate-200 focus:border-green-500 focus:shadow-[0_0_0_2px_rgba(14,165,233,0.15)]'
                }`}
                name="password2"
                value={formdata.password2}
                placeholder="Re-enter password"
                onChange={handleOnchange}
                required
              />
              {errors.password2 && <span className="text-red-500 text-xs block mt-0.5">{errors.password2}</span>}
            </div>
          </div>

          {/* Register Button */}
          <button type="submit" className="auth-btn-primary py-2 md:py-2.5 text-sm md:text-base mt-3 md:mt-4 w-full">
            Register
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider my-3 md:my-4 text-xs md:text-sm">
          <span>or continue with</span>
        </div>

        {/* Google Button */}
        {!username && (
          <button 
            type="button" 
            className="auth-btn-ghost auth-google-btn py-2 md:py-2.5 text-xs md:text-sm"
            onClick={openGoogleLoginPage}
          >
            <div className="auth-google-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="18px" height="18px" className="md:w-5 md:h-5">
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
            <span>Sign up with Google</span>
          </button>
        )}

        {/* Switch to Login */}
        <div className="text-center mt-3 md:mt-4 text-xs md:text-sm text-gray-500">
          <span>Already have an account? </span>
          <button 
            type="button" 
            onClick={onSwitchToLogin}
            className="font-bold text-gray-900 hover:text-blue-500"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
