import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { seasonCropMap } from './SeasonCropMap';
function CropYieldPredictionForm() {
    const [userLands, setUserLands] = useState([]);
    const [selectedLand, setSelectedLand] = useState("");
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        user: parseInt(localStorage.getItem("userid")),
        landId: '', // Initialize landId as empty string
        year: '',
        season: '',
        crop: '',
        area: ''
    });
    console.log(selectedLand)
    const [responseInfo, setResponseInfo] = useState(null);
    const [error, setError] = useState(null);

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
            crop: ""
        }));
    }, [formData.season]);


    const handleChange = (e) => {
        const { name, value } = e.target;

        // Special handling for landId
        if (name === 'landId') {
            setSelectedLand(value); // Update selectedLand separately
            setFormData({ ...formData, landId: value }); // Update formData
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setResponseInfo(null);
        console.log(formData);
        axios.post(`${import.meta.env.VITE_API_BASE}/cropyield/`, formData)
            .then(response => {
                console.log("Full Response:", response);
                console.log("Response Data:", response.data);
                console.log("Response Data Type:", typeof response.data);
                console.log("Response Data Keys:", Object.keys(response.data));
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

    const filteredCrops = formData.season
  ? seasonCropMap[formData.season] || []
  : [];



    return (
        <div className="max-w-md md:max-w-3xl lg:max-w-5xl mx-auto p-8 mt-10">
            <h2 className="mb-6 text-center font-bold text-3xl text-green-700">Crop Yield Prediction</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                <div >
                    <label htmlFor="land" className="label text-[18px] font-bold">
                        Choose Land
                    </label>
                    <select
                        id="land"
                        name='landId'
                        value={selectedLand}
                        onChange={handleChange}
                        required
                        className="input"
                    >
                        <option value="">Select Land</option>
                        {userLands.map((land, index) => (
                            <option key={index} value={land.landId}>{`Land ${index + 1}`}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="year" className="block text-[18px] font-bold">Year:</label>
                    <input type="number" id="year" name="year" value={formData.year} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500" placeholder='Enter the Year' required />
                </div>
                <div>
                    <label htmlFor="season" className="block text-[18px] font-bold">
                        Season
                    </label>
                    <select
                        id="season"
                        name="season"
                        value={formData.season}
                        onChange={handleChange}
                        className="block w-full px-2 py-2 mt-2 text-md border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                    >
                        <option value="">Select Season</option>
                        <option value="0">Kharif</option>
                        <option value="1">Whole Year</option>
                        <option value="2">Autumn</option>
                        <option value="3">Rabi</option>
                        <option value="4">Summer</option>
                        <option value="5">Winter</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="crop_type" className="block text-[18px] font-bold">
                        Crop:
                    </label>

                    <select
                        id="crop_type"
                        name="crop"
                        value={formData.crop}
                        onChange={handleChange}
                        className="block w-full px-2 py-2 mt-2 text-md border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        disabled={!formData.season}
                        required
                    >
                        <option value="">
                        {formData.season ? "Select Crop" : "Select Season First"}
                        </option>

                        {filteredCrops.map((crop, index) => (
                        <option key={index} value={crop}>
                            {crop.charAt(0).toUpperCase() + crop.slice(1)}
                        </option>
                        ))}
                    </select>
                    </div>

                <div>
                    <label htmlFor="area" className="block text-[18px] font-bold">Area in hectare:</label>
                    <input type="number" id="area" name="area" value={formData.area} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500" placeholder='Enter the Area size in Hectare'required />
                </div>
                <div className="col-span-full flex justify-center">
                    <button type="submit" className="bg-green-500 text-white px-6 py-2 mt-2 rounded-lg">Submit</button>
                </div>
            </form>
            {/* Preloader overlay */}
      {loading && (
        <div className="fixed inset-0 bg-sky-500 bg-opacity-50 flex items-center justify-center z-50">
          <img src="/preloader.gif" alt="Loading..." className="w-[300px]" />
        </div>
      )}
            {responseInfo && (
                <div className="mt-12 bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-lg shadow-lg border-2 border-green-200">
                    <h3 className="text-2xl font-bold text-green-700 mb-6 text-center">🌾 Yield Prediction & Production Rate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                            <p className="text-gray-600 text-sm font-semibold mb-2">📦 Production</p>
                            <p className="text-3xl font-bold text-blue-600">{responseInfo.production || responseInfo?.data?.production || 'N/A'} <span className="text-lg text-gray-500">kg</span></p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
                            <p className="text-gray-600 text-sm font-semibold mb-2">📊 Yield</p>
                            <p className="text-3xl font-bold text-green-600">{responseInfo.yield_per_hectare || responseInfo?.data?.yield_per_hectare || 'N/A'} <span className="text-lg text-gray-500">kg/ha</span></p>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="mt-8 text-red-500">
                    <p>Error: {error}</p>
                </div>
            )}
        </div>
    );
}

export default CropYieldPredictionForm;
