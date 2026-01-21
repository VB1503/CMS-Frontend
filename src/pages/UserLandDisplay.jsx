import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polygon, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LandCard = ({ land, index, onClick, locationName }) => {
  const coordinates = land.coordinates.map(coord => [coord.lat, coord.lng]);
  
  // Calculate center of polygon
  const centerLat = land.coordinates.reduce((sum, coord) => sum + coord.lat, 0) / land.coordinates.length;
  const centerLng = land.coordinates.reduce((sum, coord) => sum + coord.lng, 0) / land.coordinates.length;

  // Calculate bounds for auto-fitting the map
  const calculateBounds = () => {
    const lats = land.coordinates.map(c => c.lat);
    const lngs = land.coordinates.map(c => c.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    return [[minLat, minLng], [maxLat, maxLng]];
  };

  const bounds = calculateBounds();

  // Calculate area and side measurements with midpoints
  const calculateMeasurements = () => {
    const sideMeasurements = [];
    
    for (let i = 0; i < land.coordinates.length; i++) {
      const current = L.latLng(land.coordinates[i].lat, land.coordinates[i].lng);
      const next = L.latLng(
        land.coordinates[(i + 1) % land.coordinates.length].lat,
        land.coordinates[(i + 1) % land.coordinates.length].lng
      );
      const distance = current.distanceTo(next);
      
      // Calculate midpoint for label placement
      const midLat = (land.coordinates[i].lat + land.coordinates[(i + 1) % land.coordinates.length].lat) / 2;
      const midLng = (land.coordinates[i].lng + land.coordinates[(i + 1) % land.coordinates.length].lng) / 2;
      
      sideMeasurements.push({
        side: i + 1,
        length: distance.toFixed(2),
        midpoint: [midLat, midLng]
      });
    }
    
    // Calculate area using Shoelace formula for geographic coordinates
    let area = 0;
    const coords = land.coordinates.map(c => L.latLng(c.lat, c.lng));
    
    for (let i = 0; i < coords.length; i++) {
      const p1 = coords[i];
      const p2 = coords[(i + 1) % coords.length];
      
      // Convert to meters using distance calculations
      const latDist = p1.distanceTo(L.latLng(p2.lat, p1.lng));
      const lngDist = p1.distanceTo(L.latLng(p1.lat, p2.lng));
      
      // Shoelace formula component
      area += (lngDist * (p1.lat < p2.lat ? 1 : -1)) * (latDist * (coords[(i + 2) % coords.length].lng > p1.lng ? 1 : -1));
    }
    
    // Alternative simple area calculation using approximate Cartesian coordinates
    let simpleArea = 0;
    for (let i = 0; i < land.coordinates.length; i++) {
      const j = (i + 1) % land.coordinates.length;
      simpleArea += land.coordinates[i].lng * land.coordinates[j].lat;
      simpleArea -= land.coordinates[j].lng * land.coordinates[i].lat;
    }
    simpleArea = Math.abs(simpleArea / 2);
    
    // Convert to square meters (approximate for small areas)
    // 1 degree latitude ≈ 111,320 meters
    // 1 degree longitude ≈ 111,320 * cos(latitude) meters
    const avgLat = land.coordinates.reduce((sum, c) => sum + c.lat, 0) / land.coordinates.length;
    const latToMeters = 111320;
    const lngToMeters = 111320 * Math.cos(avgLat * Math.PI / 180);
    const areaInSquareMeters = simpleArea * latToMeters * lngToMeters;
    
    return { area: areaInSquareMeters.toFixed(2), sideMeasurements };
  };

  const { area, sideMeasurements } = calculateMeasurements();
  
  // Create custom icon for measurement labels
  const createMeasurementIcon = (text) => {
    return L.divIcon({
      className: 'measurement-label',
      html: `<div style="background: rgba(255,255,255,0.9); padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; color: #1e40af; border: 1px solid #3b82f6; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.3);">${text}</div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0]
    });
  };

  return (
    <div 
      onClick={onClick}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer bg-white rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border-2 border-gray-200 hover:border-blue-500"
    >
      {/* Map Image - Full Card Size */}
      <div className="w-full h-64 relative">
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [50, 50] }}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polygon
            positions={coordinates}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#60a5fa',
              fillOpacity: 0.4,
              weight: 3
            }}
          />
          {/* Add measurement labels on each side */}
          {sideMeasurements.map((measurement) => (
            <Marker
              key={measurement.side}
              position={measurement.midpoint}
              icon={createMeasurementIcon(`${measurement.length}m`)}
            />
          ))}
        </MapContainer>
        {/* Overlay with land number */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-4 py-2 rounded-lg shadow-md">
          <p className="text-lg font-bold text-gray-800">Land {index + 1}</p>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-center mb-3">
          <div className="flex-1">
            <p className="text-sm text-gray-600">Land {land.landId}</p>
            <p className="text-base font-semibold text-gray-800 break-words">
              {locationName || 'Loading location...'}
            </p>
          </div>
          <div className="text-right ml-4">
            <p className="text-xs text-gray-600">Area</p>
            <p className="text-sm font-bold text-blue-600">{area} m²</p>
          </div>
        </div>
        
        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
          View Details →
        </button>
      </div>
    </div>
  );
};

const UserLandsDisplay = () => {
  const [userLands, setUserLands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationNames, setLocationNames] = useState({});
  const navigate = useNavigate();

  // Derive a readable location name from stored location_details
const deriveLocationName = (details) => {
  if (!details) return 'Location unavailable';

  const isValid = (v) => v && v !== 'Data not available';

  const parts = [];

  // Area first
  if (isValid(details.area)) {
    parts.push(details.area);
  }

  // District or State with PIN
  if (isValid(details.district)) {
    const districtWithPin = isValid(details.postcode)
      ? `${details.district} - ${details.postcode}`
      : details.district;

    parts.push(districtWithPin);
  } else if (isValid(details.state)) {
    const stateWithPin = isValid(details.postcode)
      ? `${details.state} - ${details.postcode}`
      : details.state;

    parts.push(stateWithPin);
  }

  // If district was used above, still add state separately
  if (isValid(details.district) && isValid(details.state)) {
    parts.push(details.state);
  }

  // Country last
  if (isValid(details.country)) {
    parts.push(details.country);
  }

  return parts.length ? parts.join(', ') : 'Location unavailable';
};



  useEffect(() => {
    const fetchUserLands = async () => {
      try {
        const userId = localStorage.getItem("userid");
        const response = await axios.get(`${import.meta.env.VITE_API_BASE}/landmarks/${userId}/`);
        setUserLands(response.data);
        // Use stored location_details from the API response to derive names
        const names = {};
        response.data.forEach((land) => {
          names[land.landId] = deriveLocationName(land.location_details);
        });
        setLocationNames(names);
      } catch (error) {
        console.error("Error fetching user lands:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLands();
  }, []);

  const handleLandClick = (landId) => {
    navigate('/predictions', {
        state: { landId }
    });
    };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading your lands...</p>
        </div>
      </div>
    );
  }

  if (userLands.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <h3 className="mt-4 text-xl font-semibold text-gray-700">No lands found</h3>
          <p className="mt-2 text-gray-500">Start by adding your first land parcel</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Lands</h1>
          <p className="text-lg text-gray-600">
            You have {userLands.length} farm land{userLands.length !== 1 ? "'s" : ''}
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userLands.map((land, index) => (
            <LandCard
              key={land.landId}
              land={land}
              index={index}
              locationName={locationNames[land.landId]}
              onClick={() => handleLandClick(land.landId)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserLandsDisplay;