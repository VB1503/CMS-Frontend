import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-emerald-50 to-teal-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-emerald-100 p-10 text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl font-bold shadow-inner">
          404
        </div>
        <h1 className="text-3xl font-bold text-gray-800">Page not found</h1>
        <p className="text-gray-600">The page you are looking for doesn&apos;t exist or has been moved. Let&apos;s get you back home.</p>
        <button
          onClick={() => navigate('/')}
          className="w-full md:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg transition-all"
        >
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
