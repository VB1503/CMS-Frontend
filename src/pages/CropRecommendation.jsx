import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { FaSeedling, FaFlask, FaLeaf, FaMapMarkerAlt } from 'react-icons/fa';
import { GiPlantRoots, GiChemicalDrop } from 'react-icons/gi';

const CropRecommendationForm = () => {
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [ph, setPh] = useState("");
  const [response, setResponse] = useState(null);
  const [userLands, setUserLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState("");
  const [loading, setLoading] = useState(false);
  const isAuthenticated = localStorage.getItem('token');
  const navigate = useNavigate();
  
  useEffect(() => {
      if (!isAuthenticated) {
         navigate("/", {
            state: {
              shouldShowLoginModal: true,
            },
            replace: true,
          });
      }
    }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchUserLands = async () => {
      try {
        const userId = localStorage.getItem("userid");
        const response = await axios.get(`${import.meta.env.VITE_API_BASE}/landmarks/${userId}/`);
        if (response.data && response.data.length > 0) {
          setUserLands(response.data);
        } else {
          // No lands found, redirect to Manage Land
          navigate('/LSM', { state: { message: 'Please register a farm land first before making Crop Recommendation' } });
        }
      } catch (error) {
        console.error("Error fetching user lands:", error);
        navigate('/LSM', { state: { message: 'Please register a farm land first before making predictions' } });
      }
    };

    if (isAuthenticated) {
      fetchUserLands();
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      user: parseInt(localStorage.getItem("userid")),
      landId: parseInt(selectedLand),
      nitrogen: parseInt(nitrogen),
      phosphorus: parseInt(phosphorus),
      potassium: parseInt(potassium),
      ph: parseFloat(ph),
    };

    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE}/croprecommendation/`, data);
      setResponse(res.data);
      localStorage.setItem("userlands", selectedLand);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaSeedling className="text-5xl text-green-600" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Crop Recommendation
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Get AI-powered crop suggestions based on your soil's NPK levels and pH balance
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-green-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Land Selection - Full Width */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
              <label htmlFor="land" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                <FaMapMarkerAlt className="text-green-600" /> Select Your Land
              </label>
              <select
                id="land"
                value={selectedLand}
                onChange={(e) => setSelectedLand(e.target.value)}
                required
                className="w-full px-5 py-4 text-lg border-2 border-green-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white font-semibold"
              >
                <option value="">Choose your land plot</option>
                {userLands.map((land, index) => (
                  <option key={index} value={land.landId}>
                    🌾 Land Plot {index + 1}
                  </option>
                ))}
              </select>
            </div>

            {/* NPK Nutrients Grid */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <GiChemicalDrop className="text-blue-600" /> Soil Nutrients (NPK)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Nitrogen */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-200">
                  <label htmlFor="nitrogen" className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      N
                    </div>
                    Nitrogen
                  </label>
                  <input
                    type="number"
                    id="nitrogen"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(e.target.value)}
                    placeholder="mg/kg"
                    required
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-600 mt-2">Essential for leaf growth</p>
                </div>

                {/* Phosphorus */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                  <label htmlFor="phosphorus" className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      P
                    </div>
                    Phosphorus
                  </label>
                  <input
                    type="number"
                    id="phosphorus"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                    placeholder="mg/kg"
                    required
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-600 mt-2">Root development & flowering</p>
                </div>

                {/* Potassium */}
                <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200">
                  <label htmlFor="potassium" className="flex items-center gap-2 text-base font-bold text-gray-800 mb-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                      K
                    </div>
                    Potassium
                  </label>
                  <input
                    type="number"
                    id="potassium"
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                    placeholder="mg/kg"
                    required
                    className="w-full px-4 py-3 border-2 border-orange-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all text-lg font-semibold"
                  />
                  <p className="text-xs text-gray-600 mt-2">Overall plant health</p>
                </div>
              </div>
            </div>

            {/* pH Level */}
            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-2 border-teal-200">
              <label htmlFor="ph" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                <FaFlask className="text-teal-600" /> Soil pH Level
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  step="0.1"
                  id="ph"
                  value={ph}
                  onChange={(e) => setPh(e.target.value)}
                  placeholder="e.g., 6.5"
                  required
                  className="w-full px-4 py-3 border-2 border-teal-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all font-semibold"
                />
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                  <span className="px-3 py-1 bg-red-100 rounded-full">Acidic &lt;7</span>
                  <span className="px-3 py-1 bg-green-100 rounded-full">Neutral 7</span>
                  <span className="px-3 py-1 bg-blue-100 rounded-full">Alkaline &gt;7</span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <button
                type="submit"
                className="group relative px-12 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-lg font-bold rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                <span className="flex items-center gap-3">
                  <GiPlantRoots className="text-2xl group-hover:rotate-12 transition-transform" />
                  Analyze & Recommend Crops
                  <FaLeaf className="text-2xl group-hover:-rotate-12 transition-transform" />
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="fixed inset-0 bg-green-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white p-10 rounded-3xl shadow-2xl text-center">
              <div className="w-24 h-24 relative flex items-center justify-center mx-auto mb-5">
                <div className="absolute inset-0 border-4 border-green-200 rounded-full animate-ping" />
                <div className="w-16 h-16 border-4 border-t-transparent border-green-500 rounded-full animate-spin" />
                <div className="absolute w-4 h-4 bg-green-500 rounded-full animate-pulse" />
              </div>
              <p className="text-xl font-bold text-gray-800 mb-2">Analyzing Soil Data...</p>
              <p className="text-gray-600">Finding the best crop for your land</p>
            </div>
          </div>
        )}

        {/* Results Card */}
        {response && (
          <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-green-200">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4">
                <FaSeedling className="text-4xl text-white" />
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-green-700 mb-3">
                🌾 Recommendation Results
              </h3>
              <p className="text-gray-700 text-lg">{response.message}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recommended Crop */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-l-8 border-green-500 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FaSeedling className="text-2xl text-green-600" />
                  </div>
                  <p className="text-gray-600 font-semibold">Recommended Crop</p>
                </div>
                <p className="text-4xl md:text-5xl font-black text-green-700 capitalize">
                  {response.data.prediction}
                </p>
              </div>

              {/* Analysis Date */}
              <div className="bg-white rounded-2xl p-8 shadow-lg border-l-8 border-blue-500 transform hover:scale-105 transition-transform">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 font-semibold">Analysis Date</p>
                </div>
                <p className="text-2xl md:text-3xl font-bold text-blue-700">
                  {new Date(response.data.start_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-8 bg-white rounded-2xl p-6 border border-green-200">
              <h4 className="font-bold text-gray-800 mb-3 text-lg">📌 Important Notes:</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>This recommendation is based on your soil's current nutrient levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Consider local climate and weather patterns before planting</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Regular soil testing ensures optimal crop yields</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendationForm;
