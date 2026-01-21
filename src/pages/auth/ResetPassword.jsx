import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { FaLock, FaMagic, FaRegLightbulb, FaSync, FaShieldAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

const MIN_LENGTH = 10;

const generatePassword = (baseParts) => {
  const symbols = ['!', '@', '#', '$', '%', '&', '*'];
  const nums = Math.floor(100 + Math.random() * 900); // three digits
  const sym = symbols[Math.floor(Math.random() * symbols.length)];
  const base = baseParts.filter(Boolean).join('');
  const scrambled = base
    .split('')
    .sort(() => 0.5 - Math.random())
    .slice(0, 10)
    .join('');
  const extra = symbols[Math.floor(Math.random() * symbols.length)];
  return `${scrambled}${sym}${nums}${extra}`;
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  // Get uid and token from either location state (logged in) or URL params (email link)
  const uid = location.state?.uid || params.uid;
  const token = location.state?.token || params.token;
  
  console.log('UID:', uid, 'Token:', token);
  const username = useMemo(() => localStorage.getItem('first_name') || '', []);
  const profile = useMemo(() => localStorage.getItem('profile_pic') || '', []);
  const email = useMemo(() => localStorage.getItem('email') || '', []);

  const [newpasswords, setNewPassword] = useState({
    password: '',
    confirm_password: '',
  });

  const [errors, setErrors] = useState({
    password: '',
    confirm_password: '',
  });

  const [suggestions, setSuggestions] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { password, confirm_password } = newpasswords;

  const handleLogout = () => {
    localStorage.clear();
  };

  const validatePassword = (pwd) => {
    const hasMin = pwd.length >= MIN_LENGTH;
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSymbol = /[!@#$%&*]/.test(pwd);
    return {
      valid: hasMin && hasUpper && hasLower && hasNumber && hasSymbol,
      message: !hasMin
        ? `Password must be at least ${MIN_LENGTH} characters`
        : !hasUpper
          ? 'Include at least one uppercase letter'
          : !hasLower
            ? 'Include at least one lowercase letter'
            : !hasNumber
              ? 'Include at least one number'
              : !hasSymbol
                ? 'Include at least one symbol (!@#$%&*)'
                : '',
    };
  };

  const regenerateSuggestions = () => {
    const baseUser = (username || 'AgroUser').replace(/\s+/g, '');
    const emailName = email ? email.split('@')[0] : 'FieldOwner';
    const baseParts = [baseUser.slice(0, 6), emailName.slice(0, 5), emailName.slice(-5)];
    const newSug = Array.from({ length: 5 }).map(() => generatePassword(baseParts));
    setSuggestions(newSug);
  };

  useEffect(() => {
    if (!uid || !token) {
      navigate('/');
    }
  }, [uid, token, navigate]);

  useEffect(() => {
    regenerateSuggestions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPassword({ ...newpasswords, [name]: value });

    if (name === 'password') {
      const check = validatePassword(value);
      setErrors((prev) => ({ ...prev, password: check.message }));
    }

    if (name === 'confirm_password') {
      const matches = value === newpasswords.password;
      setErrors((prev) => ({ ...prev, confirm_password: matches ? '' : 'Passwords do not match' }));
    }
  };

  const handleSuggestionClick = (value) => {
    setNewPassword({ password: value, confirm_password: value });
    const check = validatePassword(value);
    setErrors({ password: check.message, confirm_password: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const check = validatePassword(password);
    if (!check.valid) {
      setErrors((prev) => ({ ...prev, password: check.message }));
      return;
    }
    if (password !== confirm_password) {
      setErrors((prev) => ({ ...prev, confirm_password: 'Passwords do not match' }));
      return;
    }

    setIsSubmitting(true);
    const data = {
      password,
      confirm_password,
      uidb64: uid,
      token,
    };

    try {
      const res = await axios.patch(`${import.meta.env.VITE_API_BASE}/api/v1/auth/set-new-password/`, data);
      const response = res.data;

      if (res.status === 200) {
        alert(response.message);
        handleLogout();
        navigate("/", {
          state: {
            passwordChanged: true,
          },
          replace: true,
        });
      }
    } catch (error) {
      alert('Error resetting password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-cover bg-center bg-fixed"
      style={{
        backgroundImage:
          "linear-gradient(120deg, rgba(16, 185, 129, 0.80), rgba(45, 212, 191, 0.78)), url('https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80')",
      }}
    >
      <div className="min-h-screen flex items-center justify-center px-4 py-10 backdrop-blur-[1px]">
        <div className="w-full max-w-4xl bg-white/95 shadow-2xl rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
          {/* Left Panel */}
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 text-white p-8 lg:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-3 bg-white/15 px-4 py-2 rounded-full">
                <FaShieldAlt className="text-2xl" />
                <span className="font-semibold">Secure Reset</span>
              </div>
              <h1 className="text-3xl font-bold leading-tight">Reset your password</h1>
              <p className="text-white/90">Choose a strong password that includes letters, numbers, and symbols.</p>
              <ul className="space-y-2 text-sm text-white/90">
                <li>• Minimum {MIN_LENGTH} characters</li>
                <li>• At least one uppercase & lowercase letter</li>
                <li>• At least one number</li>
                <li>• At least one symbol (!@#$%&*)</li>
              </ul>
            </div>
            <div className="hidden lg:block">
              <div className="flex items-center gap-3 text-white/90">
                <FaLock />
                <p className="text-sm">Your credentials are encrypted and never shared.</p>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="p-8 lg:p-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                <FaMagic />
              </div>
              <div>
                <p className="text-sm text-gray-500">Welcome back</p>
                <h2 className="text-xl font-semibold text-gray-800">Hi {username || 'there'}!</h2>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border-2 transition-all focus:outline-none focus:border-emerald-500 ${
                      errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                    }`}
                    placeholder="Enter a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                <input
                  type="text"
                  name="confirm_password"
                  value={confirm_password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none focus:border-emerald-500 ${
                    errors.confirm_password ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
                  }`}
                  placeholder="Re-enter password"
                />
                {errors.confirm_password && <p className="text-red-500 text-sm">{errors.confirm_password}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-60"
              >
                {isSubmitting ? 'Updating...' : 'Update Password'}
              </button>
            </form>

            {/* Suggestions */}
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <FaRegLightbulb className="text-amber-500" />
                  <span>Try one of these strong passwords</span>
                </div>
                <button
                  onClick={regenerateSuggestions}
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-semibold flex items-center gap-2"
                  type="button"
                >
                  <FaSync className="animate-spin-slow" /> Regenerate
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSuggestionClick(sug)}
                    className="text-left w-full px-3 py-2 rounded-xl border border-emerald-100 bg-white hover:border-emerald-300 hover:shadow-sm transition-all text-gray-800 font-mono text-sm"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-gray-500">We never store raw passwords. Data is transmitted securely.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;