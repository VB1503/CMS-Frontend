import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { seasonCropMap } from './SeasonCropMap';
import { FaChartLine, FaSeedling, FaCalendarAlt, FaCloudSun, FaMapMarkedAlt, FaRulerCombined } from 'react-icons/fa';
import { GiFarmTractor, GiWheat } from 'react-icons/gi';

function CropYieldPredictionForm() {
    const [userLands, setUserLands] = useState([]);
    const [selectedLand, setSelectedLand] = useState("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user: parseInt(localStorage.getItem("userid")),
        landId: '',
        year: '',
        season: '',
        crop: '',
        area: ''
    });
    const [responseInfo, setResponseInfo] = useState(null);
    const [error, setError] = useState(null);
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
                    navigate('/LSM', { state: { message: 'Please register a farm land first before making Yield prediction' } });
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

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            crop: ""
        }));
    }, [formData.season]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'landId') {
            setSelectedLand(value);
            setFormData({ ...formData, landId: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setResponseInfo(null);
        axios.post(`${import.meta.env.VITE_API_BASE}/cropyield/`, formData)
            .then(response => {
                setResponseInfo(response.data);
                setError(null);
            })
            .catch(error => {
                console.error("Error:", error);
                setError(error.message);
                setResponseInfo(null);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const filteredCrops = formData.season ? seasonCropMap[formData.season] || [] : [];

    const seasonOptions = [
        { value: "0", label: "Kharif", icon: "🌧️" },
        { value: "1", label: "Whole Year", icon: "☀️" },
        { value: "2", label: "Autumn", icon: "🍂" },
        { value: "3", label: "Rabi", icon: "❄️" },
        { value: "4", label: "Summer", icon: "🌞" },
        { value: "5", label: "Winter", icon: "⛄" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <FaChartLine className="text-5xl text-blue-600" />
                        <h1 className="text-2xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Crop Yield Prediction
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Predict your crop production and yield per hectare with AI-powered analytics
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 mb-8 border border-blue-100">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Land & Year Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Land Selection */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-2 border-blue-200">
                                <label htmlFor="land" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                                    <FaMapMarkedAlt className="text-blue-600" /> Select Land Plot
                                </label>
                                <select
                                    id="land"
                                    name='landId'
                                    value={selectedLand}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-5 py-4 text-lg border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all bg-white font-semibold"
                                >
                                    <option value="">Choose your land</option>
                                    {userLands.map((land, index) => (
                                        <option key={index} value={land.landId}>🌾 Land Plot {index + 1}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Year Input */}
                            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-2 border-purple-200">
                                <label htmlFor="year" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                                    <FaCalendarAlt className="text-purple-600" /> Cultivation Year
                                </label>
                                <input
                                    type="number"
                                    id="year"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 text-lg border-2 border-purple-300 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all font-semibold"
                                    placeholder='e.g., 2024'
                                    required
                                />
                            </div>
                        </div>

                        {/* Season & Crop Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Season Selection */}
                            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-2 border-teal-200">
                                <label htmlFor="season" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                                    <FaCloudSun className="text-teal-600" /> Growing Season
                                </label>
                                <select
                                    id="season"
                                    name="season"
                                    value={formData.season}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 text-lg border-2 border-teal-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all bg-white font-semibold"
                                    required
                                >
                                    <option value="">Select season</option>
                                    {seasonOptions.map(season => (
                                        <option key={season.value} value={season.value}>
                                            {season.icon} {season.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Crop Selection */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                                <label htmlFor="crop_type" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                                    <FaSeedling className="text-green-600" /> Crop Type
                                </label>
                                <select
                                    id="crop_type"
                                    name="crop"
                                    value={formData.crop}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 text-lg border-2 border-green-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    disabled={!formData.season}
                                    required
                                >
                                    <option value="">
                                        {formData.season ? "Select crop" : "Select season first"}
                                    </option>
                                    {filteredCrops.map((crop, index) => (
                                        <option key={index} value={crop}>
                                            {crop.charAt(0).toUpperCase() + crop.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Area Input - Full Width */}
                        <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl border-2 border-orange-200">
                            <label htmlFor="area" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                                <FaRulerCombined className="text-orange-600" /> Cultivation Area (hectares)
                            </label>
                            <div className="">
                                <input
                                    type="number"
                                    id="area"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 text-lg border-2 border-orange-300 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-semibold"
                                    placeholder='Enter area size'
                                    required
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center pt-4">
                            <button
                                type="submit"
                                className="px-4 md:px-12 py-4 md:py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-bold rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
                            >
                                <span className="flex items-center gap-3">
                                    <GiFarmTractor className="hidden md:block text-xl md:text-3xl group-hover:translate-x-1 transition-transform" />
                                    Predict Yield & Production
                                    <FaChartLine className="hidden md:block text-2xl group-hover:scale-110 transition-transform" />
                                </span>
                            </button>
                        </div>
                    </form>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="fixed inset-0 bg-blue-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center">
                            <div className="w-24 h-24 relative flex items-center justify-center mx-auto mb-5">
                                <div className="absolute inset-0 border-4 border-blue-200 rounded-full animate-ping" />
                                <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full animate-spin" />
                                <div className="absolute w-4 h-4 bg-blue-500 rounded-full animate-pulse" />
                            </div>
                            <p className="text-xl font-bold text-gray-800 mb-2">Calculating Yield...</p>
                            <p className="text-gray-600">Analyzing crop and land data</p>
                        </div>
                    </div>
                )}

                {/* Results Card */}
                {responseInfo && (
                    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl shadow-2xl p-8 md:p-12 border-2 border-blue-200">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
                                <GiWheat className="text-4xl text-white" />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-blue-700 mb-2">
                                🌾 Yield Prediction Results
                            </h3>
                            <p className="text-gray-600 text-lg">Based on your crop and land parameters</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Total Production */}
                            <div className="bg-white rounded-2xl p-8 shadow-xl border-l-8 border-blue-500 transform hover:scale-105 transition-transform">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                                        <GiFarmTractor className="text-3xl text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 font-semibold text-sm">Total Production</p>
                                        <p className="text-xs text-gray-500">Expected harvest</p>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl md:text-4xl font-black text-blue-600">
                                        {responseInfo.production || responseInfo?.data?.production || 'N/A'}
                                    </p>
                                    <span className="text-2xl text-gray-500 font-bold">kg</span>
                                </div>
                            </div>

                            {/* Yield Per Hectare */}
                            <div className="bg-white rounded-2xl p-8 shadow-xl border-l-8 border-green-500 transform hover:scale-105 transition-transform">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                                        <FaChartLine className="text-3xl text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-600 font-semibold text-sm">Yield Rate</p>
                                        <p className="text-xs text-gray-500">Per hectare</p>
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl md:text-4xl font-black text-green-600">
                                        {responseInfo.yield_per_hectare || responseInfo?.data?.yield_per_hectare || 'N/A'}
                                    </p>
                                    <span className="text-xl text-gray-500 font-bold">kg/ha</span>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="mt-8 bg-white rounded-2xl p-6 border border-blue-200">
                            <h4 className="font-bold text-gray-800 mb-3 text-lg">📊 Prediction Insights:</h4>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">✓</span>
                                    <span>Prediction based on historical data and crop patterns</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">✓</span>
                                    <span>Actual yield may vary based on weather and farming practices</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">✓</span>
                                    <span>Consider using recommended fertilizers for optimal results</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-6 text-red-700">
                        <p className="font-bold mb-1">⚠️ Error</p>
                        <p>{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CropYieldPredictionForm;
