import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();

  // Read user details from localStorage once
  const firstName = useMemo(() => localStorage.getItem('first_name') || '', []);
  const lastName = useMemo(() => localStorage.getItem('last_name') || '', []);
  const email = useMemo(() => localStorage.getItem('email') || '', []);
  const phone = useMemo(() => localStorage.getItem('phone_number') || '', []);
  const profile = useMemo(() => localStorage.getItem('profile_pic') || 'https://cdn-icons-png.flaticon.com/128/149/149071.png', []);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!firstName) {
      navigate('/', { replace: true });
    }
  }, [firstName, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden border border-emerald-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-8 py-6 text-white">
          <p className="text-sm uppercase tracking-wide opacity-80">Quick Profile</p>
          <h1 className="text-3xl font-bold">Hello{firstName ? `, ${firstName}` : ''}</h1>
          <p className="text-white/80 mt-1">You reached this page via manual route entry.</p>
        </div>

        {/* Body */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          <div className="md:col-span-1 flex flex-col items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-200 blur-2xl opacity-70 rounded-full scale-110" aria-hidden></div>
              <img
                src={profile}
                alt="Profile"
                className="relative w-40 h-40 rounded-2xl object-cover shadow-2xl border-4 border-white"
              />
            </div>
            <button
              onClick={() => navigate('/')}
              className="mt-2 px-5 py-2 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg transition-all"
            >
              Go Home
            </button>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Full Name</p>
              <p className="text-2xl font-bold text-gray-800">{`${firstName} ${lastName}`.trim() || 'Not available'}</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Email</p>
              <p className="text-lg font-semibold text-gray-800">{email || 'Not provided'}</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">Phone</p>
              <p className="text-lg font-semibold text-gray-800">{phone || 'Not added yet'}</p>
            </div>

            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 shadow-sm text-gray-700">
              <p className="font-semibold mb-1">Tip</p>
              <p className="text-sm">For full account controls, use the Manage Account option in the profile menu.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
