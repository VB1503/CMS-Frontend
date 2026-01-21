import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaFlask, FaTemperatureHigh, FaTint, FaLeaf, FaSeedling, FaMapMarkerAlt } from 'react-icons/fa';
import { GiChemicalDrop, GiPlantRoots, GiFertilizerBag } from 'react-icons/gi';
import { WiHumidity } from 'react-icons/wi';

const FertilizerRecommendationForm = () => {
    const [fertilizer, setFertilizer] = useState('');
    const [loading, setLoading] = useState(false);
    const [userLands, setUserLands] = useState([]);
    const [selectedLand, setSelectedLand] = useState("");
    
    const soilCropMap = {
        0: ['Cotton', 'Oil seeds', 'Sugarcane', 'Millets'],
        1: ['Paddy', 'Pulses'],
        2: ['Sugarcane', 'Wheat', 'Cotton'],
        3: ['Tobacco', 'Cotton', 'Ground Nuts'],
        4: ['Maize', 'Barley', 'Millets']
    };

    const [formData, setFormData] = useState({
        user: parseInt(localStorage.getItem("userid")),
        landId: '',
        temperature: '',
        humidity: '',
        moisture: '',
        soil_type: 0,
        crop_type: 0,
        nitrogen: '',
        phosphorous: '',
        potassium: ''
    });
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
                setUserLands(response.data);
            } catch (error) {
                console.error("Error fetching user lands:", error);
            }
        };

        fetchUserLands();
    }, []);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            crop_type: ""
        }));
    }, [formData.soil_type]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_BASE}/fertilizer/`, formData);
            setFertilizer(response.data.recommendation);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'landId') {
            setSelectedLand(value);
            setFormData({ ...formData, landId: value });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const filteredCrops = formData.soil_type ? soilCropMap[formData.soil_type] || [] : [];

    const soilTypes = [
        { value: "0", label: "Sandy", color: "from-yellow-50 to-amber-50", border: "border-yellow-300" },
        { value: "1", label: "Loamy", color: "from-orange-50 to-red-50", border: "border-orange-300" },
        { value: "2", label: "Black", color: "from-gray-50 to-slate-50", border: "border-gray-400" },
        { value: "3", label: "Red", color: "from-red-50 to-rose-50", border: "border-red-300" },
        { value: "4", label: "Clayey", color: "from-brown-50 to-amber-50", border: "border-amber-400" }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <GiFertilizerBag className="text-5xl text-teal-600" />
                        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                            Fertilizer Recommendation
                        </h1>
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Get expert fertilizer advice based on soil type, crop selection, and environmental conditions
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-teal-100">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Land Selection */}
                                <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-2xl border-2 border-teal-200">
                                    <label htmlFor="land" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                                        <FaMapMarkerAlt className="text-teal-600" /> Select Your Land
                                    </label>
                                    <select
                                        id="land"
                                        name="landId"
                                        value={selectedLand}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-5 py-4 text-lg border-2 border-teal-300 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100 transition-all bg-white font-semibold"
                                    >
                                        <option value="">Choose your land plot</option>
                                        {userLands.map((land, index) => (
                                            <option key={index} value={land.landId}>🌾 Land Plot {index + 1}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Environmental Conditions */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        🌡️ Environmental Conditions
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Temperature */}
                                        <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border-2 border-orange-200">
                                            <label htmlFor="temperature" className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                                                <FaTemperatureHigh className="text-orange-600" /> Temperature
                                            </label>
                                            <input
                                                type="number"
                                                id="temperature"
                                                name="temperature"
                                                value={formData.temperature}
                                                onChange={handleChange}
                                                placeholder="°C"
                                                className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all font-semibold"
                                                required
                                            />
                                        </div>

                                        {/* Humidity */}
                                        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-5 rounded-xl border-2 border-blue-200">
                                            <label htmlFor="humidity" className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                                                <WiHumidity className="text-2xl text-blue-600" /> Humidity
                                            </label>
                                            <input
                                                type="number"
                                                id="humidity"
                                                name="humidity"
                                                value={formData.humidity}
                                                onChange={handleChange}
                                                placeholder="30-80%"
                                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-semibold"
                                                required
                                            />
                                        </div>

                                        {/* Moisture */}
                                        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 p-5 rounded-xl border-2 border-teal-200">
                                            <label htmlFor="moisture" className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                                                <FaTint className="text-teal-600" /> Moisture
                                            </label>
                                            <input
                                                type="number"
                                                id="moisture"
                                                name="moisture"
                                                value={formData.moisture}
                                                onChange={handleChange}
                                                placeholder="25-70%"
                                                className="w-full px-4 py-3 border-2 border-teal-300 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100 transition-all font-semibold"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Soil & Crop Selection */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Soil Type */}
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200">
                                        <label htmlFor="soil_type" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                                            <GiPlantRoots className="text-amber-700" /> Soil Type
                                        </label>
                                        <select
                                            id="soil_type"
                                            name="soil_type"
                                            value={formData.soil_type}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 text-lg border-2 border-amber-300 rounded-xl focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all bg-white font-semibold"
                                            required
                                        >
                                            <option value="">Select soil type</option>
                                            {soilTypes.map(soil => (
                                                <option key={soil.value} value={soil.value}>{soil.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Crop Type */}
                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                                        <label htmlFor="crop_type" className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                                            <FaSeedling className="text-green-600" /> Crop Type
                                        </label>
                                        <select
                                            id="crop_type"
                                            name="crop_type"
                                            value={formData.crop_type}
                                            onChange={handleChange}
                                            className="w-full px-5 py-4 text-lg border-2 border-green-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all bg-white font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed"
                                            disabled={!formData.soil_type}
                                            required
                                        >
                                            <option value="">
                                                {formData.soil_type ? "Select crop" : "Select soil first"}
                                            </option>
                                            {filteredCrops.map((crop, index) => (
                                                <option key={index} value={crop}>
                                                    {crop.charAt(0).toUpperCase() + crop.slice(1)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* NPK Values */}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <GiChemicalDrop className="text-purple-600" /> Soil Nutrient Levels (NPK)
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {/* Nitrogen */}
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border-2 border-blue-200">
                                            <label htmlFor="nitrogen" className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">N</div>
                                                Nitrogen
                                            </label>
                                            <input
                                                type="number"
                                                id="nitrogen"
                                                name="nitrogen"
                                                value={formData.nitrogen}
                                                onChange={handleChange}
                                                placeholder="mg/kg"
                                                className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-semibold"
                                                required
                                            />
                                        </div>

                                        {/* Phosphorous */}
                                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border-2 border-purple-200">
                                            <label htmlFor="phosphorous" className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                                                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>
                                                Phosphorous
                                            </label>
                                            <input
                                                type="number"
                                                id="phosphorous"
                                                name="phosphorous"
                                                value={formData.phosphorous}
                                                onChange={handleChange}
                                                placeholder="mg/kg"
                                                className="w-full px-4 py-3 border-2 border-purple-300 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all font-semibold"
                                                required
                                            />
                                        </div>

                                        {/* Potassium */}
                                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-xl border-2 border-orange-200">
                                            <label htmlFor="potassium" className="flex items-center gap-2 text-sm font-bold text-gray-800 mb-2">
                                                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">K</div>
                                                Potassium
                                            </label>
                                            <input
                                                type="number"
                                                id="potassium"
                                                name="potassium"
                                                value={formData.potassium}
                                                onChange={handleChange}
                                                placeholder="mg/kg"
                                                className="w-full px-4 py-3 border-2 border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all font-semibold"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-center pt-4">
                                    <button
                                        type="submit"
                                        className="group px-12 py-5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white text-lg font-bold rounded-2xl shadow-2xl transform transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-teal-300"
                                    >
                                        <span className="flex items-center gap-3">
                                            <FaFlask className="text-2xl group-hover:rotate-12 transition-transform" />
                                            Get Fertilizer Recommendation
                                            <GiFertilizerBag className="text-2xl group-hover:-rotate-12 transition-transform" />
                                        </span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-1">
                        {fertilizer ? (
                            <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 rounded-3xl shadow-2xl p-8 border-2 border-teal-200 sticky top-8">
                                <div className="text-center mb-6">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full mb-4">
                                        <GiFertilizerBag className="text-3xl text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-teal-700 mb-2">
                                        💊 Recommended Fertilizer
                                    </h3>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-lg border-l-8 border-teal-500 mb-6">
                                    <h4 className="text-xl font-black text-teal-700 mb-4 break-words">
                                        {fertilizer.name}
                                    </h4>
                                    <div className="space-y-3">
                                        <p className="text-gray-700 leading-relaxed break-words">
                                            {fertilizer.fertilizer}
                                        </p>
                                    </div>
                                </div>

                                {/* Additional Tips */}
                                <div className="bg-white rounded-2xl p-5 border border-teal-200">
                                    <h5 className="font-bold text-gray-800 mb-3 text-sm flex items-center gap-2">
                                        <FaLeaf className="text-teal-600" /> Application Tips
                                    </h5>
                                    <ul className="space-y-2 text-xs text-gray-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-teal-600 mt-0.5">✓</span>
                                            <span>Apply during early growth stages</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-teal-600 mt-0.5">✓</span>
                                            <span>Follow recommended dosage</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-teal-600 mt-0.5">✓</span>
                                            <span>Water adequately after application</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-3xl shadow-lg p-8 border-2 border-gray-200 text-center sticky top-8">
                                <div className="opacity-50 mb-4">
                                    <GiFertilizerBag className="text-6xl text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600 font-semibold">Fill the form to get fertilizer recommendations</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="fixed inset-0 bg-teal-900 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center">
                            <div className="w-24 h-24 relative flex items-center justify-center mx-auto mb-5">
                                <div className="absolute inset-0 border-4 border-teal-200 rounded-full animate-ping" />
                                <div className="w-16 h-16 border-4 border-t-transparent border-teal-500 rounded-full animate-spin" />
                                <div className="absolute w-4 h-4 bg-teal-500 rounded-full animate-pulse" />
                            </div>
                            <p className="text-xl font-bold text-gray-800 mb-2">Analyzing Data...</p>
                            <p className="text-gray-600">Finding best fertilizer for your crop</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FertilizerRecommendationForm;
                 

