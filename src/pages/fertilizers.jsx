import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FertilizerRecommendationForm = () => {
    const [fertilizer,setFertilizer]=useState('')
    const [loading, setLoading] = useState(false);
    const [userLands, setUserLands] = useState([]);
    const [selectedLand, setSelectedLand] = useState("");
    const soilCropMap = {0: ['Cotton', 'Oil seeds', 'Sugarcane', 'Millets'],
                        1: ['Paddy', 'Pulses'],
                        2: ['Sugarcane', 'Wheat', 'Cotton'],
                        3: ['Tobacco', 'Cotton', 'Ground Nuts'],
                        4: ['Maize', 'Barley', 'Millets']};

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
 console.log(selectedLand)
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
            console.log(formData)
            const response = await axios.post(`${import.meta.env.VITE_API_BASE}/fertilizer/`, formData);
            console.log(response.data);
            setFertilizer(response.data.recommendation)
            // Handle response data as needed
        } catch (error) {
            console.error('Error:', error);
            // Handle error
        } finally {
            setLoading(false); // Hide preloader after response
          }
        
    };

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

    const filteredCrops = formData.soil_type
      ? soilCropMap[formData.soil_type] || []
      : [];

    return (
        <div className='flex flex-col-reverse gap-6 md:gap-8 md:flex-row w-full  md:items-stretch'>

        <div className="flex-1 min-w-0 w-full md:w-1/2 max-w-md md:max-w-none mx-auto md:mx-0 p-8 rounded-lg shadow-sm mt-0 md:mt-10">
            <h2 className="mb-10 text-center text-3xl font-bold text-green-700">
                Get informed advice on fertilizer based on soil
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                     <label htmlFor="land" className="text-lg font-bold">
                        Choose Land
                    </label>
                    <select
                        id="land"
                        name="landId"
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
                    <label htmlFor="temperature" className="text-lg font-bold">
                        Temperature (°C)
                    </label>
                    <input
                        type="number"
                        id="temperature"
                        name="temperature"
                        value={formData.temperature}
                        onChange={handleChange}
                        placeholder="Enter the value"
                        className="block w-full px-4 py-2 mt-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="humidity" className="text-lg font-bold">
                        Humidity (30 to 80)%
                    </label>
                    <input
                        type="number"
                        id="humidity"
                        name="humidity"
                        value={formData.humidity}
                        onChange={handleChange}
                        placeholder="Enter the value"
                        className="block w-full px-4 py-2 mt-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="moisture" className="text-lg font-bold">
                        Moisture (25 to 70)%
                    </label>
                    <input
                        type="number"
                        id="moisture"
                        name="moisture"
                        value={formData.moisture}
                        onChange={handleChange}
                        placeholder="Enter the value"
                        className="block w-full px-4 py-2 mt-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="soil_type" className="text-lg font-bold">
                        Soil Type
                    </label>
                    <select
                        id="soil_type"
                        name="soil_type"
                        value={formData.soil_type}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 mt-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                    >
                        <option value="">Select Soil Type</option>
                        <option value="0">Sandy</option>
                        <option value="1">Loamy</option>
                        <option value="2">Black</option>
                        <option value="3">Red</option>
                        <option value="4">Clayey</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="crop_type" className="text-lg font-bold">
                        Crop Type
                    </label>
                    <select
                        id="crop_type"
                        name="crop_type"
                        value={formData.crop_type}
                        onChange={handleChange}
                        className="block w-full px-4 py-2 mt-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        disabled={!formData.soil_type}
                        required
                    >
                        <option value="">
                        {formData.soil_type ? "Select Crop" : "Select Soil First"}
                        </option>

                        {filteredCrops.map((crop, index) => (
                        <option key={index} value={crop}>
                            {crop.charAt(0).toUpperCase() + crop.slice(1)}
                        </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="nitrogen" className="text-lg font-bold">
                        Nitrogen (mg/kg or ppm)
                    </label>
                    <input
                        type="number"
                        id="nitrogen"
                        name="nitrogen"
                        value={formData.nitrogen}
                        onChange={handleChange}
                        placeholder="Enter the value"
                        className="block w-full px-4 py-2 mt-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="phosphorous" className="text-lg font-bold">
                        Phosphorous (mg/kg or ppm)
                    </label>
                    <input
                        type="number"
                        id="phosphorous"
                        name="phosphorous"
                        value={formData.phosphorous}
                        onChange={handleChange}
                        placeholder="Enter the value"
                        className="block w-full px-4 py-2 mt-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="potassium" className="text-lg font-bold">
                        Potassium (mg/kg or ppm)
                    </label>
                    <input
                        type="number"
                        id="potassium"
                        name="potassium"
                        value={formData.potassium}
                        onChange={handleChange}
                        placeholder="Enter the value"
                        className="block w-full px-4 py-2 mt-2 text-lg border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        required
                    />
                </div>
                <div className="col-span-full flex justify-center">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 mt-4 text-lg font-bold rounded-lg focus:outline-none focus:shadow-outline"
                    >
                        Predict
                    </button>
                </div>
            </form>
            {/* Preloader overlay */}
      {loading && (
        <div className="fixed inset-0 bg-sky-500 bg-opacity-50 flex items-center justify-center z-50">
          <img src="/preloader.gif" alt="Loading..." className="w-[300px]" />
        </div>
      )}
        </div>
        {fertilizer &&
        <div className="flex-1 min-w-0 w-full md:w-1/2 mt-12 md:mt-0 bg-gradient-to-br md:pl-0 to-indigo-50 p-8 rounded-lg md:rounded-none  flex flex-col justify-start md:justify-center">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">💊 Recommended Fertilizer</h2>
            <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 overflow-hidden">
                <h3 className="text-xl font-bold text-blue-600 mb-3 break-words">{fertilizer.name}</h3>
                <p className="text-gray-700 leading-relaxed text-base break-words">{fertilizer.fertilizer}</p>
            </div>
        </div>
}
        </div>
    );
};

export default FertilizerRecommendationForm;
