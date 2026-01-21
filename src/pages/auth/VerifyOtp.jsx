import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaPhone, FaCheckCircle, FaClock } from 'react-icons/fa';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isInvalid, setIsInvalid] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes timer
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('userid');
  const phone_number = localStorage.getItem('phone_number');
  const username = localStorage.getItem('first_name');
  const [phonenumber, setPhone] = useState(localStorage.getItem('phone_number'));
  const inputRefs = useRef([]);

  // Format phone number
  useEffect(() => {
    if (phonenumber && phonenumber.length >= 10) {
      const formattedPhoneNumber = phonenumber.slice(0, 2) + '****' + phonenumber.slice(-4);
      setPhone(formattedPhoneNumber);
    }
  }, [phonenumber]);

  // Timer for resend OTP
  useEffect(() => {
    if (timeLeft > 0 && !canResend) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setCanResend(true);
    }
  }, [timeLeft, canResend]);

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last digit
    setOtp(newOtp);
    setIsInvalid(false);
    setIsIncorrect(false);

    // Auto-focus to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (!/^\d*$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(otp.slice(pastedData.length));
    setOtp(newOtp);
    inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  // Resend OTP
  const handleOtpResend = async (e) => {
    e.preventDefault();
    if (!canResend) return;

    setResendLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/v1/auth/resendOtp/`,
        { 'user': parseInt(userId, 10), 'phone_number': phone_number }
      );
      if (res.status === 200) {
        toast.success('OTP sent successfully!');
        setOtp(['', '', '', '', '', '']);
        setTimeLeft(120);
        setCanResend(false);
      }
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Submit OTP
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');

    if (otpString.length === 6 && /^\d+$/.test(otpString)) {
      setIsLoading(true);
      const userInt = parseInt(userId, 10);
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE}/api/v1/auth/verify-phone/`,
          { 'user': userInt, 'otp': otpString }
        );
        const resp = res.data;
        if (res.status === 200) {
          localStorage.setItem('is_verified', 'true');
          toast.success('Phone verified successfully!');
          setTimeout(() => {
            navigate('/');
            window.location.reload();
          }, 1500);
        }
      } catch (error) {
        setIsIncorrect(true);
        console.error('Error verifying OTP:', error);
        toast.error('Invalid OTP. Please check and try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } finally {
        setIsLoading(false);
      }
    } else {
      setIsInvalid(true);
      toast.error('OTP must be 6 digits');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-3xl shadow-2xl p-8 space-y-6'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <div className='inline-block p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full'>
              <FaPhone className='text-3xl text-emerald-600' />
            </div>
            <h1 className='text-3xl font-bold text-gray-800'>Verify Phone Number</h1>
            <p className='text-gray-600'>Hi, <span className='font-semibold text-emerald-600'>{username}</span></p>
          </div>

          {/* Message */}
          <div className='bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200'>
            <p className='text-center text-gray-700'>
              We sent a verification code to <span className='font-bold text-emerald-600'>{phonenumber}</span>
            </p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleOtpSubmit} className='space-y-6'>
            {/* OTP Input Boxes */}
            <div className='space-y-2'>
              <label className='block text-sm font-semibold text-gray-700'>Enter Verification Code</label>
              <div className='flex gap-3 justify-center' onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type='text'
                    inputMode='numeric'
                    maxLength='1'
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all focus:outline-none ${
                      digit
                        ? 'border-emerald-400 bg-emerald-50'
                        : 'border-gray-300 bg-white'
                    } ${
                      isInvalid || isIncorrect
                        ? 'border-red-400 bg-red-50'
                        : ''
                    } focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200`}
                  />
                ))}
              </div>
              {isInvalid && (
                <p className='text-red-500 text-sm text-center'>
                  ✗ OTP must be 6 digits
                </p>
              )}
              {isIncorrect && (
                <p className='text-red-500 text-sm text-center'>
                  ✗ Invalid OTP. Please try again.
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button
              type='submit'
              disabled={isLoading || otp.join('').length !== 6}
              className='w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg disabled:cursor-not-allowed flex items-center justify-center gap-2'
            >
              {isLoading ? (
                <>
                  <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                  Verifying...
                </>
              ) : (
                <>
                  <FaCheckCircle /> Verify Code
                </>
              )}
            </button>
          </form>

          {/* Resend Section */}
          <div className='flex items-center gap-4'>
            <div className='flex-1 h-px bg-gray-200'></div>
            <span className='text-gray-600 text-sm'>or</span>
            <div className='flex-1 h-px bg-gray-200'></div>
          </div>

          {!canResend ? (
            <div className='flex items-center justify-center gap-2 text-center'>
              <FaClock className='text-amber-500' />
              <p className='text-gray-700'>
                Resend code in <span className='font-bold text-amber-600'>{formatTime(timeLeft)}</span>
              </p>
            </div>
          ) : (
            <button
              onClick={handleOtpResend}
              disabled={resendLoading}
              className='w-full text-center text-emerald-600 hover:text-emerald-700 font-semibold py-2 px-4 rounded-xl hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {resendLoading ? 'Sending...' : '📨 Resend Verification Code'}
            </button>
          )}

          {/* Footer */}
          <div className='text-center pt-4 border-t border-gray-200'>
            <p className='text-gray-600 text-sm'>
              Didn't receive the code?{' '}
              <a href='#' className='text-emerald-600 hover:text-emerald-700 font-semibold'>
                Contact support
              </a>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className='mt-6 text-center text-gray-600 text-sm'>
          <p>🔒 Your phone number is secure and encrypted</p>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
