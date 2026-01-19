import React, { useState, useEffect } from "react";
import axios from "axios";

const CropRecommendationForm = () => {
  const [nitrogen, setNitrogen] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [potassium, setPotassium] = useState("");
  const [ph, setPh] = useState("");
  const [response, setResponse] = useState(null);
  const [userLands, setUserLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState("");
  const [loading, setLoading] = useState(false); // Added state for loading

  useEffect(() => {
    const fetchUserLands = async () => {
      try {
        const userId = localStorage.getItem("userid");
        const response = await axios.get(`${import.meta.env.VITE_API_BASE}/landmarks/${userId}/`);
        setUserLands(response.data);
      } catch (error) {
        console.error("Error fetching user lands:", error);
      }
    };

    fetchUserLands();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Show preloader when the form is submitted

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
      setLoading(false); // Hide preloader after response
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto">
        <div className="rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-green-700 mb-2">Crop Recommendation System</h2>
            <p className="text-gray-600">Get personalized crop suggestions based on your soil conditions</p>
          </div>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label htmlFor="land" className="block text-sm font-semibold text-gray-700 mb-2">
                Choose Land
              </label>
              <select
                id="land"
                value={selectedLand}
                onChange={(e) => setSelectedLand(e.target.value)}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              >
                <option value="">Select Land</option>
                {userLands.map((land, index) => (
                  <option key={index} value={land.landId}>{`Land ${index + 1}`}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="nitrogen" className="block text-sm font-semibold text-gray-700 mb-2">
                Nitrogen (N)
              </label>
              <input
                type="number"
                id="nitrogen"
                value={nitrogen}
                onChange={(e) => setNitrogen(e.target.value)}
                placeholder="Enter nitrogen value"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
            </div>

            <div>
              <label htmlFor="phosphorus" className="block text-sm font-semibold text-gray-700 mb-2">
                Phosphorus (P)
              </label>
              <input
                type="number"
                id="phosphorus"
                value={phosphorus}
                onChange={(e) => setPhosphorus(e.target.value)}
                placeholder="Enter phosphorus value"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
            </div>

            <div>
              <label htmlFor="potassium" className="block text-sm font-semibold text-gray-700 mb-2">
                Potassium (K)
              </label>
              <input
                type="number"
                id="potassium"
                value={potassium}
                onChange={(e) => setPotassium(e.target.value)}
                placeholder="Enter potassium value"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
            </div>

            <div>
              <label htmlFor="ph" className="block text-sm font-semibold text-gray-700 mb-2">
                pH Level
              </label>
              <input
                type="number"
                step="0.1"
                id="ph"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                placeholder="Enter pH value"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
              />
            </div>

            <div className="col-span-full flex justify-center mt-4">
              <button 
                type="submit" 
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-8 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
              >
                Get Crop Recommendation
              </button>
            </div>
          </form>
        </div>

        {/* Preloader overlay */}
        {loading && (
          <div className="fixed inset-0 bg-green-500 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="p-8 rounded-2xl">
              <img src="/preloader.gif" alt="Loading..." className="w-[200px]" />
              <p className="text-center mt-4 text-gray-700 font-semibold">Analyzing soil conditions...</p>
            </div>
          </div>
        )}

        {response && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8 border-2 border-green-200">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-green-700 mb-2">🌾 Recommendation Results</h3>
              <p className="text-gray-600">{response.message}</p>
            </div>
            
            <div className="rounded-lg p-6  border-l-4 border-green-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Recommended Crop</p>
                  <p className="text-2xl font-bold text-green-700">{response.data.prediction}</p>
                </div>
                <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Analysis Date</p>
                  <p className="text-lg font-semibold text-blue-700">
                    {new Date(response.data.start_date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CropRecommendationForm;
