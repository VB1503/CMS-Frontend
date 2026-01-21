import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import queryString from "query-string";
import axios from "axios";
import { toast } from 'react-toastify';
import "./index.css";

const BACKEND_API_URL = import.meta.env.VITE_API_BASE;

const SocialAuth = () => {
  let location = useLocation();
  console.log("location", location);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const values = queryString.parse(location.search);
    const code = values.code ? values.code : null;

    if (code) {
      onGogglelogin();
    }
  }, []);

  const googleLoginHandler = (code) => {
    return axios
      .get(`${BACKEND_API_URL}/api/auth/google/${code}`)
      .then((res) => {
        console.log("res", res)
        localStorage.setItem('token', JSON.stringify(res.data.access_token));
        localStorage.setItem('refresh_token', JSON.stringify(res.data.refresh_token));
        localStorage.setItem("first_name", res.data.user.first_name);
        localStorage.setItem("last_name", res.data.user.last_name);
        localStorage.setItem("userid", res.data.user.id);
        localStorage.setItem("phone_number", res.data.user.phone_number);
        localStorage.setItem('is_verified',res.data.user.is_verified);
        localStorage.setItem("email", res.data.user.email);
        localStorage.setItem("profile_pic", res.data.user.profile_pic);
        navigate('/')
        window.location.href = '/';
        window.location.reload(true);
        return res.data;
      })
      .catch((err) => {
        console.log("error", err)
        setError(err.message || "Something went wrong!");
        toast.error(err.message || "Something went wrong!");
        navigate('/login')
        return err;
      });
  };

  const onGogglelogin = async () => {
    const response = await googleLoginHandler(location.search);
    console.log(response);
  }

  return (
    <div className="auth-loading-container">
      <div className="auth-loading-content">
        {/* Header */}
        <div className="auth-loading-header">
          <h1 className="auth-loading-title">Authenticating</h1>
          <p className="auth-loading-subtitle">Please wait while we securely sign you in</p>
        </div>

        {/* Animation Section */}
        <div className="auth-flow-animation">
          {/* Google Icon */}
          <div className="auth-icon google-icon">
            <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
              <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
              <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
              <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
            </svg>
          </div>

          {/* Animated Connection Line */}
          <div className="auth-connection">
            <div className="auth-connection-line"></div>
            <div className="auth-connection-dots">
              <span className="dot dot-1"></span>
              <span className="dot dot-2"></span>
              <span className="dot dot-3"></span>
            </div>
          </div>

          {/* Server Icon */}
          <div className="auth-icon server-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="3" width="20" height="6" rx="2" stroke="currentColor" strokeWidth="2"/>
              <rect x="2" y="15" width="20" height="6" rx="2" stroke="currentColor" strokeWidth="2"/>
              <circle cx="6" cy="6" r="1" fill="currentColor"/>
              <circle cx="9" cy="6" r="1" fill="currentColor"/>
              <circle cx="6" cy="18" r="1" fill="currentColor"/>
              <circle cx="9" cy="18" r="1" fill="currentColor"/>
              <path d="M16 6h2M16 18h2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
        </div>

        {/* Status Messages */}
        <div className="auth-status-messages">
          <div className="status-message active">
            <div className="status-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Google authentication received</span>
          </div>
          <div className="status-message loading">
            <div className="status-icon">
              <div className="spinner"></div>
            </div>
            <span>Verifying credentials with server...</span>
          </div>
          <div className="status-message pending">
            <div className="status-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </div>
            <span>Setting up your session</span>
          </div>
        </div>

        {/* Security Note */}
        <div className="auth-security-note">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
            <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>Secure authentication in progress</span>
        </div>
      </div>
    </div>
  );
};


export default SocialAuth;
