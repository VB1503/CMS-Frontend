import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaFilePdf, FaFileCsv, FaFileCode, FaDownload } from 'react-icons/fa';

const formatDateTime = (isoString) => {
  try {
    return new Date(isoString).toLocaleString();
  } catch (e) {
    return isoString;
  }
};

const sameDay = (isoString, filterDate) => {
  if (!filterDate) return true;
  const d = new Date(isoString);
  const target = new Date(filterDate);
  return (
    d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth() &&
    d.getDate() === target.getDate()
  );
};

const PredictionHistory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { landId, landNumber, locationName } = location.state || {};

  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const exportToPDF = () => {
    const printContent = document.getElementById('history-content');
    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const exportToCSV = () => {
    let csvContent = 'Type,Date,Details\n';
    
    // Crop Recommendations
    filteredHistory?.crop_recommendations?.forEach(item => {
      csvContent += `"Crop Recommendation","${item.start_date}","${item.prediction} - N:${item.N} P:${item.P} K:${item.K} Temp:${item.temperature} Humidity:${item.humidity} pH:${item.ph}"\n`;
    });
    
    // Crop Yield
    filteredHistory?.crop_yield_predictions?.forEach(item => {
      csvContent += `"Crop Yield","${item.created_at}","${item.crop} - Season:${item.season} Year:${item.year} Area:${item.area} Production:${item.production} Yield/Ha:${item.yield_per_hectare}"\n`;
    });
    
    // Fertilizer
    filteredHistory?.fertilizer_recommendations?.forEach(item => {
      csvContent += `"Fertilizer","${item.created_at}","${item.fertilizer} - Crop:${item.crop_type} Soil:${item.soil_type} N:${item.nitrogen} P:${item.phosphorous} K:${item.potassium}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prediction-history-land-${landNumber}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  const exportToJSON = () => {
    const jsonContent = JSON.stringify(filteredHistory, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prediction-history-land-${landNumber}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  console.log(landId, landNumber, locationName);
  useEffect(() => {
        if (!landId) {
            navigate("/mylands");
        }
      }, [navigate]);
  useEffect(() => {
    const fetchUserPredictions = async () => {
      try {
        const userId = localStorage.getItem('userid');
        const response = await axios.get(`${import.meta.env.VITE_API_BASE}/history/${userId}/${landId}/`);
        setHistory(response.data?.data || null);
      } catch (err) {
        console.error('Error fetching user predictions:', err);
        setError('Failed to load prediction history.');
      } finally {
        setLoading(false);
      }
    };

    if (!landId) {
      setError('No land selected.');
      setLoading(false);
      return;
    }

    fetchUserPredictions();
  }, [landId]);

  const filteredHistory = useMemo(() => {
    if (!history) return null;

    const filterList = (list, dateKey) =>
      (list || []).filter((item) => sameDay(item[dateKey], filterDate));

    return {
      ...history,
      crop_recommendations: filterList(history.crop_recommendations, 'start_date'),
      crop_yield_predictions: filterList(history.crop_yield_predictions, 'created_at'),
      fertilizer_recommendations: filterList(history.fertilizer_recommendations, 'created_at'),
    };
  }, [history, filterDate]);

  const renderSection = (title, items, renderItem) => (
    <div className="bg-white rounded-2xl shadow-md p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-500">{items?.length || 0} record(s)</span>
      </div>
      {items && items.length > 0 ? (
        <div className="space-y-4">
          {items
            .slice()
            .sort((a, b) => new Date(b.created_at || b.start_date) - new Date(a.created_at || a.start_date))
            .map((item, idx) => (
              <div key={idx} className="rounded-xl border border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-white shadow-sm">
                {renderItem(item)}
              </div>
            ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No records found for this date.</p>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 rounded-full border-4 border-green-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading prediction history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-2xl shadow-md text-center">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6" id="history-content">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prediction History</h1>
            <p className="text-gray-600 mt-1">Land Number: {landNumber}</p>
            <p className="text-gray-600 mt-1">{locationName}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-cyan-700 transition-all shadow-lg"
              >
                <FaDownload /> Export
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                  <button
                    onClick={exportToPDF}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b"
                  >
                    <FaFilePdf className="text-red-600" /> Export as PDF
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors border-b"
                  >
                    <FaFileCsv className="text-green-600" /> Export as CSV
                  </button>
                  <button
                    onClick={exportToJSON}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors"
                  >
                    <FaFileCode className="text-blue-600" /> Export as JSON
                  </button>
                </div>
              )}
            </div>

            {/* Date Filter */}
            <label className="text-sm font-semibold text-gray-700">Filter by date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200"
            />
            {filterDate && (
              <button
                onClick={() => setFilterDate('')}
                className="text-sm text-green-700 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200">
            <p className="text-sm text-gray-700">Crop Recommendations</p>
            <p className="text-2xl font-bold text-green-700">{filteredHistory?.summary?.total_crop_recommendations ?? 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200">
            <p className="text-sm text-gray-700">Crop Yield Predictions</p>
            <p className="text-2xl font-bold text-blue-700">{filteredHistory?.summary?.total_crop_yields ?? 0}</p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-200">
            <p className="text-sm text-gray-700">Fertilizer Recommendations</p>
            <p className="text-2xl font-bold text-amber-700">{filteredHistory?.summary?.total_fertilizer_recommendations ?? 0}</p>
          </div>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {renderSection('Crop Recommendations', filteredHistory?.crop_recommendations, (item) => (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-green-700">{item.prediction}</p>
                <span className="text-sm text-gray-500">{formatDateTime(item.start_date)}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                <p><span className="font-semibold">N:</span> {item.N}</p>
                <p><span className="font-semibold">P:</span> {item.P}</p>
                <p><span className="font-semibold">K:</span> {item.K}</p>
                <p><span className="font-semibold">Temp:</span> {item.temperature}°C</p>
                <p><span className="font-semibold">Humidity:</span> {item.humidity}%</p>
                <p><span className="font-semibold">pH:</span> {item.ph}</p>
              </div>
            </div>
          ))}

          {renderSection('Crop Yield Predictions', filteredHistory?.crop_yield_predictions, (item) => (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-blue-700">{item.crop}</p>
                <span className="text-sm text-gray-500">{formatDateTime(item.created_at)}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                <p><span className="font-semibold">Season:</span> {item.season}</p>
                <p><span className="font-semibold">Year:</span> {item.year}</p>
                <p><span className="font-semibold">Month:</span> {item.month}</p>
                <p><span className="font-semibold">Area:</span> {item.area}</p>
                <p><span className="font-semibold">Production:</span> {item.production}</p>
                <p><span className="font-semibold">Yield/Ha:</span> {item.yield_per_hectare}</p>
              </div>
            </div>
          ))}

          {renderSection('Fertilizer Recommendations', filteredHistory?.fertilizer_recommendations, (item) => (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-lg font-bold text-amber-700">{item.fertilizer}</p>
                <span className="text-sm text-gray-500">{formatDateTime(item.created_at)}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
                <p><span className="font-semibold">Crop:</span> {item.crop_type}</p>
                <p><span className="font-semibold">Soil:</span> {item.soil_type}</p>
                <p><span className="font-semibold">N:</span> {item.nitrogen}</p>
                <p><span className="font-semibold">P:</span> {item.phosphorous}</p>
                <p><span className="font-semibold">K:</span> {item.potassium}</p>
                <p><span className="font-semibold">Moisture:</span> {item.moisture}</p>
                <p><span className="font-semibold">Temp:</span> {item.temperature}°C</p>
                <p><span className="font-semibold">Humidity:</span> {item.humidity}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PredictionHistory;