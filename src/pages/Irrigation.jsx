import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaWater, FaCloudRain, FaThermometerHalf, FaWind, FaTint, FaClock, FaChartLine } from 'react-icons/fa';
import { FaDroplet } from "react-icons/fa6";
const Timer = ({ duration, onTimerComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (timeLeft <= 0) {
      onTimerComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onTimerComplete]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="text-center py-4 px-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-200">
      <p className="text-sm text-gray-600 mb-2 font-semibold">Irrigation Active</p>
      <p className="text-4xl font-bold text-blue-600">
        {minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
      </p>
    </div>
  );
};

const IrrigationSystem = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [error, setError] = useState(null);
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [irrigationDuration, setIrrigationDuration] = useState(30);
  const [selectedDuration, setSelectedDuration] = useState(30);
  const [soilMoisture, setSoilMoisture] = useState(65);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchWeatherData = async (latitude, longitude) => {
      try {
        const currentWeatherResponse = await axios.get(
          `https://api.weatherapi.com/v1/current.json?key=31a8d1a6588a42a78ff115005242702&q=${latitude},${longitude}`
        );
        setWeatherData(currentWeatherResponse.data);

        const forecastResponse = await axios.get(
          `https://api.weatherapi.com/v1/forecast.json?key=31a8d1a6588a42a78ff115005242702&q=${latitude},${longitude}&days=5`
        );
        setForecastData(forecastResponse.data);

        setError(null);
      } catch (err) {
        setError('Failed to fetch weather data');
        setWeatherData(null);
        setForecastData(null);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeatherData(latitude, longitude);
        },
        () => setError('Failed to fetch location')
      );
    } else {
      setError('Geolocation not supported');
    }
  }, []);

  const handleIrrigationStart = () => {
    setIsIrrigating(true);
    setIrrigationDuration(selectedDuration);
    const now = new Date().toLocaleTimeString();
    setHistory(prev => [...prev, { time: now, duration: selectedDuration, status: 'Completed' }]);
  };

  const handleIrrigationStop = () => {
    setIsIrrigating(false);
  };

  const handleTimerComplete = () => {
    setIsIrrigating(false);
    // Simulate soil moisture increase
    setSoilMoisture(Math.min(100, soilMoisture + 15));
  };

  const irrigationNeeded = soilMoisture < 50;
  const recommendations = [];
  
  if (irrigationNeeded) {
    recommendations.push('Soil moisture is low. Start irrigation immediately.');
  }
  if (weatherData?.current?.precip_mm > 0) {
    recommendations.push('Rain detected. Consider skipping irrigation today.');
  }
  if (weatherData?.current?.temp_c > 30) {
    recommendations.push('High temperature detected. Increase irrigation frequency.');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 px-4 md:px-8 py-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex items-center gap-3 mb-2">
          <FaWater className="text-3xl text-blue-600" />
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Irrigation Management
          </h1>
        </div>
        <p className="text-gray-600 text-lg">Smart watering system powered by weather data and soil monitoring</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="max-w-7xl mx-auto mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Control Panel - Larger on left */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100 ">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FaWater className="text-blue-600" /> Control Panel
            </h2>

            {/* Irrigation Status */}
            <div className="mb-6">
              <div className={`px-4 py-3 rounded-xl text-center font-semibold text-white ${isIrrigating ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-400'}`}>
                {isIrrigating ? '🟢 Irrigating' : '🔴 Standby'}
              </div>
            </div>

            {/* Timer Display */}
            {isIrrigating && <Timer duration={irrigationDuration} onTimerComplete={handleTimerComplete} />}

            {/* Duration Selection */}
            {!isIrrigating && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <FaClock className="inline mr-2 text-blue-600" /> Duration (minutes)
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none text-gray-900 font-semibold"
                >
                  {[15, 30, 45, 60, 90, 120].map(duration => (
                    <option key={duration} value={duration}>{duration} min</option>
                  ))}
                </select>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleIrrigationStart}
                disabled={isIrrigating}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 disabled:scale-100"
              >
                ▶ START
              </button>
              <button
                onClick={handleIrrigationStop}
                disabled={!isIrrigating}
                className="flex-1 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 disabled:scale-100"
              >
                ⏹ STOP
              </button>
            </div>

            {/* Soil Moisture */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaTint className="text-blue-600" /> Soil Moisture
                </p>
                <p className="text-2xl font-bold text-blue-600">{soilMoisture}%</p>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${soilMoisture}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {soilMoisture < 30 ? '🔴 Critically Low' : soilMoisture < 50 ? '🟡 Low' : soilMoisture < 70 ? '🟢 Optimal' : '🟠 High'}
              </p>
            </div>
          </div>
        </div>

        {/* Weather & Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Weather */}
          {weatherData && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FaCloudRain className="text-blue-600" /> Current Weather
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                  <p className="text-gray-600 text-sm font-semibold mb-2">Location</p>
                  <p className="text-lg font-bold text-gray-900">{weatherData.location.name}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 text-center border border-orange-200">
                  <FaThermometerHalf className="text-2xl text-orange-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm font-semibold mb-1">Temperature</p>
                  <p className="text-lg font-bold text-gray-900">{weatherData.current.temp_c}°C</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center border border-purple-200">
                  <FaWind className="text-2xl text-purple-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm font-semibold mb-1">Wind Speed</p>
                  <p className="text-lg font-bold text-gray-900">{weatherData.current.wind_kph} km/h</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-4 text-center border border-cyan-200">
                  <FaDroplet className="text-2xl text-cyan-600 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm font-semibold mb-1">Humidity</p>
                  <p className="text-lg font-bold text-gray-900">{weatherData.current.humidity}%</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <img src={weatherData.current.condition.icon} alt="Weather" className="w-12 h-12" />
                <div>
                  <p className="font-semibold text-gray-900">{weatherData.current.condition.text}</p>
                  <p className="text-sm text-gray-600">Rainfall: {weatherData.current.precip_mm} mm</p>
                </div>
              </div>
            </div>
          )}
            {/* Forecast */}
      {forecastData && (
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-100 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaChartLine className="text-blue-600" /> 3-Day Forecast
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {forecastData.forecast.forecastday.map((day, idx) => (
              <div key={idx} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200 text-center hover:shadow-lg transition">
                <p className="font-bold text-gray-900 mb-3">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <img src={day.day.condition.icon} alt="Weather" className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm text-gray-700 font-semibold mb-3">{day.day.condition.text}</p>
                <div className="space-y-1 text-sm">
                  <p><span className="font-semibold text-red-600">{day.day.maxtemp_c}°</span> / <span className="text-blue-600">{day.day.mintemp_c}°</span></p>
                  <p className="text-gray-600">💧 {day.day.totalprecip_mm} mm</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
          {/* Smart Recommendations */}
          {recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                💡 Smart Recommendations
              </h3>
              <ul className="space-y-3">
                {recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <span className="text-orange-600 font-bold text-lg mt-0.5">✓</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      

      {/* History */}
      {history.length > 0 && (
        <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FaClock className="text-blue-600" /> Recent Activity
          </h3>
          <div className="space-y-3">
            {history.slice(-5).reverse().map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                <div>
                  <p className="font-semibold text-gray-900">{item.time}</p>
                  <p className="text-sm text-gray-600">Duration: {item.duration} minutes</p>
                </div>
                <span className="px-3 py-1 bg-green-200 text-green-800 rounded-full text-sm font-semibold">{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Guidelines */}
      <div className="max-w-7xl mx-auto mt-8 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          📋 Irrigation Guidelines
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-gray-700">
          <ul className="space-y-2">
            <li className="flex items-center gap-2">✓ Keep soil moisture between 50-70%</li>
            <li className="flex items-center gap-2">✓ Water early morning or late evening</li>
            <li className="flex items-center gap-2">✓ Avoid irrigation during rainfall</li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">✓ Monitor weather forecasts daily</li>
            <li className="flex items-center gap-2">✓ Adjust for seasonal changes</li>
            <li className="flex items-center gap-2">✓ Check soil type and drainage</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IrrigationSystem;
