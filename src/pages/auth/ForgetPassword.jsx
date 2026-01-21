import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaLock, FaEnvelope, FaArrowLeft, FaCheckCircle } from "react-icons/fa";
import axios from 'axios';

function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (email) {
      const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if (!isValidEmail) {
        toast.error('Please enter a valid email address');
        return;
      }
      
      setIsSubmitting(true);
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_BASE}/api/v1/auth/password-reset/`, { email });
        if (res.status === 200) {
          setEmailSent(true);
          toast.success('A link to reset your password has been sent to your email');
          setTimeout(() => {
            navigate("/");
          }, 3000);
        }
      } catch (error) {
        console.error('An error occurred:', error);
        toast.error('This email is not registered. Please register your account first.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div 
      className="min-h-screen w-full bg-cover bg-center bg-fixed flex items-center justify-center p-4"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(16, 185, 129, 0.85), rgba(20, 184, 166, 0.85)), url('https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <div className="w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <FaLock className="text-4xl text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Forgot Password?</h1>
            <p className="text-white/90 text-sm">No worries, we'll send you reset instructions</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {!emailSent ? (
              <>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 transition-all"
                        name="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Enter the email address associated with your account
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaEnvelope /> Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                  >
                    <FaArrowLeft /> Back to Login
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center space-y-6 py-4">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                  <FaCheckCircle className="text-4xl text-green-600" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-800">Check Your Email</h2>
                  <p className="text-gray-600">
                    We've sent a password reset link to
                  </p>
                  <p className="font-semibold text-emerald-600">{email}</p>
                  <p className="text-sm text-gray-500 pt-4">
                    Click the link in the email to reset your password. If you don't see the email, check your spam folder.
                  </p>
                </div>
                <div className="pt-4">
                  <Link 
                    to="/login" 
                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
                  >
                    <FaArrowLeft /> Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-emerald-600 hover:text-emerald-700 font-semibold">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-white text-sm drop-shadow-lg">
            🔒 Your security is our priority
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;
