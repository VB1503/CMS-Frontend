import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, FeatureGroup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { EditControl } from "react-leaflet-draw";
import L from "leaflet";
import { toast } from 'react-toastify';
import { IoSearch, IoLocationSharp, IoClose } from 'react-icons/io5';
import { MdMyLocation, MdLandscape } from 'react-icons/md';
import { FaDrawPolygon } from 'react-icons/fa';
import "leaflet-geometryutil";
import axios from "axios";

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapComponent = () => {
  const mapRef = useRef(null);
  const featureGroupRef = useRef(null);
  const draftLayerRef = useRef(null); // Track the draft layer separately
  const sideMarkersRef = useRef([]); // Track side label markers for cleanup
  const [userLocation, setUserLocation] = useState(null);
  const [userAddress, setUserAddress] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [drawnItems, setDrawnItems] = useState(null);
  const [perimeter, setPerimeter] = useState(null);
  const [area, setArea] = useState(null);
  const [polygonCoords, setPolygonCoords] = useState([]);
  const [userPolygons, setUserPolygons] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);
  const [isPolygonDrawn, setIsPolygonDrawn] = useState(false);
  const [sideMeasurements, setSideMeasurements] = useState([]);
  const [currentDrawing, setCurrentDrawing] = useState(null);
  const [autoLocate, setAutoLocate] = useState(false);
  const [skipAutoSearch, setSkipAutoSearch] = useState(false);
  const [locationDetails, setLocationDetails] = useState({}); // cache of landId -> address parts
  const latitude = 20.5937;
  const longitude = 78.9629;
  const [zoomLevel, setZoom] = useState(5);

  // Helper function for LocationIQ reverse geocoding API calls
  const fetchLocationFromAPI = async (lat, lon) => {
    try {
      const response = await axios.get(
        `https://us1.locationiq.com/v1/reverse?key=${import.meta.env.VITE_LOCATIONIQ_API_KEY}&lat=${lat}&lon=${lon}&format=json&addressdetails=1&statecode=1&normalizeaddress=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      
      const data = response.data;
      const addr = data.address || {};
      const bbox = data.boundingbox || [];
      
      return {
        area: addr.city || addr.town || addr.village || addr.hamlet || addr.suburb || addr.county || "Data not available",
        district: addr.county || addr.district || addr.state_district || "Data not available",
        state: addr.state || "Data not available",
        state_code: addr.state_code || "Data not available",
        country: addr.country || "Data not available",
        country_code: (addr.country_code || "").toUpperCase() || "Data not available",
        postcode: addr.postcode || "Data not available",
        road: addr.road || "Data not available",
        landmark: addr.attraction || addr.building || addr.leisure || addr.amenity || "Data not available",
        region: addr.region || "Data not available",
        neighbourhood: addr.neighbourhood || addr.suburb || "Data not available",
        place_type: addr.type || "Data not available",
        bbox: bbox.length === 4 ? {
          south: parseFloat(bbox[0]),
          north: parseFloat(bbox[1]),
          west: parseFloat(bbox[2]),
          east: parseFloat(bbox[3])
        } : null,
        coordinates: { lat: parseFloat(lat), lng: parseFloat(lon) },
      };
    } catch (error) {
      console.error("Error fetching location from LocationIQ API:", error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserPolygons = async () => {
      try {
        const userId = localStorage.getItem("userid");
        const response = await axios.get(`${import.meta.env.VITE_API_BASE}/landmarks/${userId}/`);
        setUserPolygons(response.data);
        localStorage.setItem("userlands", JSON.stringify(response.data));
        
        // Populate locationDetails cache from database location_details
        const newLocationDetails = {};
        response.data.forEach(polygon => {
          if (polygon.location_details && polygon.landId) {
            newLocationDetails[polygon.landId] = polygon.location_details;
          }
        });
        setLocationDetails(prev => ({ ...prev, ...newLocationDetails }));
      } catch (error) {
        console.error("Error fetching user polygons:", error);
      }
    };

    fetchUserPolygons();
    
    if (autoLocate) {
      locateUser();
    }
  }, [autoLocate]);

  // Ensure draft state clears when the draft layer is deleted from the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleLayerRemove = (e) => {
      if (draftLayerRef.current && e.layer === draftLayerRef.current) {
        sideMarkersRef.current.forEach((marker) => {
          map.removeLayer(marker);
        });
        sideMarkersRef.current = [];
        draftLayerRef.current = null;
        setCurrentDrawing(null);
        setPolygonCoords([]);
        setPerimeter(null);
        setArea(null);
        setSideMeasurements([]);
        setIsPolygonDrawn(false);
        setLocationDetails((prev) => {
          const { draft, ...rest } = prev;
          return rest;
        });
      }
    };

    map.on("layerremove", handleLayerRemove);
    return () => {
      map.off("layerremove", handleLayerRemove);
    };
  }, []);

  // Search suggestions with debouncing
  useEffect(() => {
    if (skipAutoSearch) {
      setSkipAutoSearch(false);
      return;
    }
    
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length > 2) {
        fetchSearchSuggestions();
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const fetchSearchSuggestions = async () => {
    if (!searchQuery || searchQuery.trim().length < 3) return;
    
    setIsSearching(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=8&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      setSearchSuggestions(response.data);
      setShowSuggestions(response.data.length > 0);
    } catch (error) {
      console.error("Error fetching search suggestions:", error);
    } finally {
      setIsSearching(false);
    }
  };

  // Function to handle locating user's position
  const locateUser = () => {
    mapRef.current.locate();
  };

  // Calculate perimeter (m) and area (ha) for given coordinates
  const calculateMetrics = (coords = []) => {
    if (!coords.length) return { perimeter: null, area: null };
    // Ensure Leaflet LatLng instances
    const latLngs = coords.map((c) => L.latLng(c.lat, c.lng));
    const perimeterVal = L.GeometryUtil.length(latLngs);
    const areaVal = L.GeometryUtil.geodesicArea(latLngs) / 10000; // hectares
    return { perimeter: perimeterVal, area: areaVal };
  };

  // Compute centroid of polygon for reverse geocoding
  const getCentroid = (coords = []) => {
    if (!coords.length) return null;
    const sum = coords.reduce((acc, c) => ({ lat: acc.lat + c.lat, lng: acc.lng + c.lng }), { lat: 0, lng: 0 });
    return { lat: sum.lat / coords.length, lng: sum.lng / coords.length };
  };

  // Fetch comprehensive location details using LocationIQ API with advanced parameters
  const fetchLocationDetails = async (landId, coords) => {
    if (!coords || !coords.length || locationDetails[landId]) return; // cached
    
    // Skip API call for saved landmarks (numeric landId) - they come from database
    if (typeof landId === 'number') {
      console.log("Skipping API call for saved landmark", landId, "- using database location_details");
      return;
    }
    
    // Only fetch for 'draft' and 'search' (new polygons/searches)
    const centroid = getCentroid(coords);
    if (!centroid) return;

    console.log("Fetching location details from API for", landId);
    const locationData = await fetchLocationFromAPI(centroid.lat, centroid.lng);
    
    if (locationData) {
      setLocationDetails((prev) => ({
        ...prev,
        [landId]: locationData,
      }));
    }
  };

  // Event handler for user's position found
  const handleLocationFound = async (e) => {
    setUserLocation(e.latlng);
    mapRef.current.setView(e.latlng, 15);
    
    // Reset selected land when GPS locates new position
    setSelectedLand(null);

    // Convert coordinates to comprehensive address using LocationIQ API
    const locationData = await fetchLocationFromAPI(e.latlng.lat, e.latlng.lng);
    
    if (locationData) {
      // Set display name from coordinates for marker popup
      const displayParts = [];
      if (locationData.area !== "Data not available") displayParts.push(locationData.area);
      if (locationData.district !== "Data not available") displayParts.push(locationData.district);
      if (locationData.state !== "Data not available") displayParts.push(locationData.state);
      setUserAddress(displayParts.join(", ") || "Your location");
      
      // Store location details for search display
      setLocationDetails((prev) => ({
        ...prev,
        search: locationData,
      }));
    }
  };

  // Function to handle searching for a place
  const searchPlace = async (suggestion = null) => {
    try {
      let lat, lon, display_name;
      
      if (suggestion) {
        lat = suggestion.lat;
        lon = suggestion.lon;
        display_name = suggestion.display_name;
      } else {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${searchQuery}&format=json&limit=1`);
        if (response.data.length > 0) {
          lat = response.data[0].lat;
          lon = response.data[0].lon;
          display_name = response.data[0].display_name;
        } else {
          toast.error("Place not found");
          return;
        }
      }
      
      const newPosition = [parseFloat(lat), parseFloat(lon)];
      setUserLocation(newPosition);
      setUserAddress(display_name);
      mapRef.current.setView(newPosition, 17, { animate: true, duration: 1 });
      
      // Reset selected land when searching new location
      setSelectedLand(null);
      
      // Fetch detailed location information via LocationIQ reverse geocoding
      const locationData = await fetchLocationFromAPI(parseFloat(lat), parseFloat(lon));
      
      if (locationData) {
        setLocationDetails((prev) => ({
          ...prev,
          search: locationData,
        }));
      }
      
      // Close suggestions and prevent auto-search
      setShowSuggestions(false);
      setSearchSuggestions([]);
      setSkipAutoSearch(true);
      setSearchQuery("");
    } catch (error) {
      console.error("Error searching for place:", error);
      toast.error("Error searching for place");
    }
  };

 

  // Function to display side labels (s1, s2, ...) on the map
  const displaySideLabels = (coordinates, map) => {
    const measurements = []; // Array to hold the side measurements
  
    coordinates.forEach((point, index) => {
      const nextPoint = coordinates[(index + 1) % coordinates.length]; // Get the next point, wrapping around
  
      // Calculate the distance between two points
      const distance = map.distance(point, nextPoint).toFixed(2); // Distance in meters
      measurements.push({ side: `S${index + 1}`, length: distance }); // Store the side name and length
  
      // Calculate the midpoint between the current and next point
      const midpoint = L.latLng(
        (point.lat + nextPoint.lat) / 2,
        (point.lng + nextPoint.lng) / 2
      );
  
      // Create a small divIcon to show the side label (s1, s2, ...)
      const sideLabel = L.divIcon({
        className: "side-label", // Custom class for styling
        html: `<div style="background-color: white; padding: 2px; border-radius: 3px; border: 1px solid black;">
                 s${index + 1}
               </div>`,
      });
  
      // Add the label to the map and track it for cleanup
      const marker = L.marker(midpoint, { icon: sideLabel }).addTo(map);
      sideMarkersRef.current.push(marker);
    });
  
    // Update state with the side measurements to display in the list
    setSideMeasurements(measurements);
  };
  
  
  // Function to handle selecting a land
  const handleSelectLand = (event) => {
    const selectedLandId = event.target.value;
    
    // Don't set if empty value selected
    if (!selectedLandId) {
      setSelectedLand(null);
      return;
    }
    
    const landId = parseInt(selectedLandId);
    setSelectedLand(landId);
    
    // Clear previous side markers
    sideMarkersRef.current.forEach((marker) => {
      mapRef.current.removeLayer(marker);
    });
    sideMarkersRef.current = [];
  
    // Find the selected land coordinates
    const selectedLandCoordinates = userPolygons.find(land => land.landId === landId)?.coordinates;
  
    // Zoom to the selected land area with better bounds
    if (selectedLandCoordinates) {
      const bounds = L.latLngBounds(selectedLandCoordinates);
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
  
      // Display side labels and measurements for the selected land
      displaySideLabels(selectedLandCoordinates, mapRef.current);

      // Fetch location details for this land
      fetchLocationDetails(landId, selectedLandCoordinates);

      // Compute and show measurements
      const { perimeter: p, area: a } = calculateMetrics(selectedLandCoordinates);
      setPerimeter(p);
      setArea(a);
      setIsPolygonDrawn(false); // ensure confirm button hidden when viewing saved land
    }
  };
  

  // Function to handle when a shape is drawn
  const onDraw = (e) => {
    // If a previous draft exists, remove it before setting new one
    if (currentDrawing && featureGroupRef.current) {
      featureGroupRef.current.removeLayer(currentDrawing);
    }
    
    // Clear previous side markers
    sideMarkersRef.current.forEach((marker) => {
      mapRef.current.removeLayer(marker);
    });
    sideMarkersRef.current = [];

    const layer = e.layer;
    const coordinates = layer.getLatLngs()[0];
  
    const latLngCoords = coordinates.map(coord => ({ lat: coord.lat, lng: coord.lng }));
    setPolygonCoords(latLngCoords);
    setCurrentDrawing(layer);
    draftLayerRef.current = layer; // Store reference to draft layer
  
    const perimeter = L.GeometryUtil.length(coordinates);
    const area = L.GeometryUtil.geodesicArea(coordinates) / 10000;
  
    setPerimeter(perimeter);
    setArea(area);
    setIsPolygonDrawn(true);
  
    displaySideLabels(coordinates, e.layer._map);

    // Fetch location details for newly drawn polygon (draft)
    fetchLocationDetails('draft', latLngCoords);
  };

  // Handle delete from EditControl - clear draft state when deleted
  const onEditDelete = (e) => {
    // When Leaflet deletes a layer, clear draft state
    if (isPolygonDrawn) {
      // Remove all side label markers from map
      sideMarkersRef.current.forEach((marker) => {
        mapRef.current.removeLayer(marker);
      });
      sideMarkersRef.current = [];
      
      // Just clear the state - Leaflet already removed the layer
      setCurrentDrawing(null);
      draftLayerRef.current = null;
      setPolygonCoords([]);
      setPerimeter(null);
      setArea(null);
      setSideMeasurements([]);
      setIsPolygonDrawn(false);
      setLocationDetails((prev) => {
        const { draft, ...rest } = prev;
        return rest;
      });
      toast.info("Draft polygon deleted");
    }
  };



  // Pick the most relevant location details to display without crashing
  const getActiveLocationDetails = () => {
    // Prioritize the current drawing so it updates even when a land is pre-selected
    if (isPolygonDrawn && locationDetails.draft) {
      const draftData = locationDetails.draft;
      // Check if we have any real data (not all "Data not available")
      const hasData = Object.values(draftData).some(val => val !== "Data not available");
      if (hasData) return { data: draftData, label: '(New)' };
    }
    if (selectedLand && locationDetails[selectedLand]) {
      const landData = locationDetails[selectedLand];
      const hasData = Object.values(landData).some(val => val !== "Data not available");
      if (hasData) return { data: landData, label: '' };
    }
    if (locationDetails.search) {
      const searchData = locationDetails.search;
      const hasData = Object.values(searchData).some(val => val !== "Data not available");
      if (hasData) return { data: searchData, label: '(Searched)' };
    }
    return null;
  };
  

  // Custom hook to listen for events on the map
  const EventListener = () => {
    useMapEvents({
      locationfound: handleLocationFound,
    });
    return null;
  };

  // Function to handle sending coordinates to the endpoint
  const sendCoordinates = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE}/landmark/`, {
        user: localStorage.getItem("userid"),
        coordinates: polygonCoords,
        location_details: locationDetails['draft'] || {},
      });
      localStorage.setItem("landid", response.data.landId);
      toast.success("Your Land configured successfully");
  
      setIsPolygonDrawn(false);
  
      if (currentDrawing && featureGroupRef.current) {
        featureGroupRef.current.removeLayer(currentDrawing);
      }
            // Clear side markers
      sideMarkersRef.current.forEach((marker) => {
        mapRef.current.removeLayer(marker);
      });
      sideMarkersRef.current = [];
            setPolygonCoords([]);
      setCurrentDrawing(null);
      
      // Remove draft from locationDetails, keep others
      setLocationDetails((prev) => {
        const { draft, ...rest } = prev;
        return rest;
      });
  
      const userId = localStorage.getItem("userid");
      const updatedPolygons = await axios.get(`${import.meta.env.VITE_API_BASE}/landmarks/${userId}/`);
      setUserPolygons(updatedPolygons.data);
      localStorage.setItem("userlands", JSON.stringify(updatedPolygons.data));
  
      // Auto-select the newly saved land (last one in array)
      if (updatedPolygons.data && updatedPolygons.data.length > 0) {
        const newLandId = updatedPolygons.data[updatedPolygons.data.length - 1].landId;
        setSelectedLand(newLandId);
        
        // Fetch and display data for the newly saved land
        const newLandCoords = updatedPolygons.data[updatedPolygons.data.length - 1].coordinates;
        if (newLandCoords) {
          const bounds = L.latLngBounds(newLandCoords);
          mapRef.current.fitBounds(bounds, { padding: [50, 50] });
          displaySideLabels(newLandCoords, mapRef.current);
          fetchLocationDetails(newLandId, newLandCoords);
          const { perimeter: p, area: a } = calculateMetrics(newLandCoords);
          setPerimeter(p);
          setArea(a);
        }
      }
  
    } catch (error) {
      console.error("Error sending coordinates:", error);
      toast.error("Error confirming coordinates");
    }
  };
  
  // Function to handle delete land request
  // Function to handle delete land request
// Function to handle delete land request
const handleDeleteLand = async () => {
  const userId = localStorage.getItem("userid");

  if (window.confirm("Are you sure you want to delete this land?")) {
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE}/landmark/delete/${userId}/${selectedLand}/`);

      // Remove the selected land from the userPolygons and update local storage
      const updatedPolygons = userPolygons.filter(polygon => polygon.landId !== selectedLand);
      setUserPolygons(updatedPolygons);  // Update the state to trigger re-render
      localStorage.setItem("userlands", JSON.stringify(updatedPolygons));

      // Clear the polygon coordinates from localStorage
      localStorage.removeItem("polygonCoords");

      // Clear the selected land and reset polygonCoords and drawnItems
      setSelectedLand(null);
      setPolygonCoords([]); // Clear the polygon coordinates from the map

      // Remove the polygon from the map
      if (drawnItems) {
        drawnItems.clearLayers(); // Clear all drawn layers
        setDrawnItems(null); // Reset the drawnItems state
      }      
      // Optionally refresh the map view
      mapRef.current.setView([latitude, longitude], zoomLevel); 
      window.location.reload(true);
    } catch (error) {
      console.error("Error deleting land:", error);
      toast.error("Error deleting land");
    }
  }
};

  const activeLocationDetails = getActiveLocationDetails();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 py-4 px-4">
      <div className="max-w-[80rem] mx-auto">
        {/* Header */}
        <div className="text-center mb-4 mt-4">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-green-700 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            Land Management System
          </h1>
          <p className="text-gray-600 text-sm">Draw, manage, and track your agricultural lands with precision</p>
        </div>

        {/* Search Bar */}
        <div className="mb-4 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <div className="relative w-full max-w-2xl">
            <div className="relative">
              <IoLocationSharp className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 text-lg z-10" />
              <input
                type="text"
                className="w-full pl-11 pr-24 py-3 rounded-xl border-2 border-green-300 focus:border-green-600 focus:ring-2 focus:ring-green-100 focus:outline-none shadow-lg bg-white transition-all text-gray-700 text-sm"
                placeholder="🔍 Search farmland (Village, District, State)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchPlace()}
                onFocus={() => searchQuery.length > 2 && setShowSuggestions(true)}
              />
              {isSearching && (
                <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                </div>
              )}
              {searchQuery && !isSearching && (
                <button
                  onClick={() => { setSearchQuery(""); setShowSuggestions(false); setSearchSuggestions([]); }}
                  className="absolute right-14 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <IoClose className="text-lg" />
                </button>
              )}
              <button
                onClick={() => searchPlace()}
                disabled={isSearching}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg p-2 transition-all shadow-lg disabled:opacity-50"
              >
                <IoSearch className="text-lg" />
              </button>
            </div>
            
            {/* Search Suggestions */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div className="absolute z-[9999] w-full mt-2 bg-white rounded-xl shadow-2xl border-2 border-green-200 max-h-64 overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-1.5 border-b border-green-200">
                  <p className="text-xs font-semibold text-green-700">📍 {searchSuggestions.length} locations found</p>
                </div>
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    onClick={() => searchPlace(suggestion)}
                    className="px-3 py-2 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all group"
                  >
                    <div className="flex items-start gap-2">
                      <div className="bg-green-100 group-hover:bg-green-200 p-1.5 rounded-lg transition-all">
                        <IoLocationSharp className="text-green-600 text-sm" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-800 group-hover:text-green-700">
                          {suggestion.display_name.split(',').slice(0, 2).join(',')}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {suggestion.display_name.split(',').slice(2).join(',')}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            {suggestion.type || 'Location'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setAutoLocate(!autoLocate)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold shadow-lg transition-all text-sm ${
              autoLocate 
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                : 'bg-white text-green-600 border-2 border-green-300'
            }`}
          >
            <MdMyLocation className="text-lg" />
            <span>{autoLocate ? '📡 GPS Active' : '📍 Use GPS'}</span>
          </button>
        </div>

        {/* Map and Controls */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-green-200 mx-0 md:mx-4">
              <div className="h-[460px] relative ">
                <MapContainer 
                  center={[latitude, longitude]} 
                  zoom={zoomLevel} 
                  ref={mapRef} 
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution='&copy; Google Maps'
                    url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                  />

                  <EventListener />

                  <div className="absolute bottom-4 left-4 z-[1000]">
                    <button 
                      onClick={locateUser}
                      className="bg-white hover:bg-green-50 p-3 rounded-xl shadow-xl border-2 border-green-300 transition-all hover:scale-110"
                      title="Find my location"
                    >
                      <MdMyLocation className="text-2xl text-green-600" />
                    </button>
                  </div>

                  {userLocation && (
                    <Marker position={userLocation}>
                      <Popup>
                        <div className="p-3">
                          <p className="font-bold text-green-700">Your Location</p>
                          <p className="text-sm text-gray-600 mt-1">{userAddress || "You are here"}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}

                  {userPolygons.map((polygon, index) => (
                    <Polygon 
                      key={index} 
                      positions={polygon.coordinates} 
                      pathOptions={{
                        color: selectedLand === polygon.landId ? '#dc2626' : '#059669',
                        fillColor: selectedLand === polygon.landId ? '#fca5a5' : '#6ee7b7',
                        fillOpacity: 0.5,
                        weight: 4
                      }}
                    >
                      <Popup>
                        <div className="p-3">
                          <p className="font-bold text-emerald-700">Land {index + 1}</p>
                          <p className="text-xs text-gray-500 mt-1">ID: {polygon.landId}</p>
                        </div>
                      </Popup>
                    </Polygon>
                  ))}

                  <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                      position="topright"
                      onCreated={onDraw}
                      onDeleted={onEditDelete}
                      draw={{
                        rectangle: false,
                        circle: false,
                        polyline: false,
                        marker: false,
                        circlemarker: false,
                        polygon: {
                          shapeOptions: {
                            color: '#10b981',
                            fillColor: '#6ee7b7',
                            fillOpacity: 0.4,
                            weight: 3
                          }
                        }
                      }}
                      edit={{ edit: false, remove: true }}
                    />
                  </FeatureGroup>
                </MapContainer>
              </div>
            </div>
             {/* Metrics Cards Row - Responsive Grid layout */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-4">
          {/* Measurements */}
          {(perimeter || area) && (
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-blue-200 h-full">
              <h3 className="text-base font-bold text-gray-800 mb-3">📏 Measurements</h3>
              <div className="space-y-2">
                {perimeter && (
                  <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                    <span className="font-semibold text-sm">Perimeter:</span>
                    <span className="text-green-700 font-bold text-sm">{perimeter.toFixed(2)} m</span>
                  </div>
                )}
                {area && (
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="font-semibold text-sm">Area:</span>
                    <span className="text-blue-700 font-bold text-sm">{area.toFixed(4)} ha</span>
                  </div>
                )}
                {area && (
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                    <span className="font-semibold text-sm">Area (Acres):</span>
                    <span className="text-purple-700 font-bold text-sm">{(area * 2.47105).toFixed(4)} ac</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Side Measurements */}
          {sideMeasurements.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-purple-200 h-full">
              <h3 className="text-base font-bold text-gray-800 mb-3">📐 Side Measurements</h3>
              <div className="max-h-48 overflow-y-auto">
                {sideMeasurements.map((side, index) => (
                  <div 
                    key={index} 
                    className="flex justify-between items-center p-2 hover:bg-purple-50 rounded-lg transition-all"
                  >
                    <span className="font-semibold text-sm">{side.side}:</span>
                    <span className="text-purple-700 font-bold text-sm">{side.length} m</span>
                  </div>
                ))}
              </div>
            </div>
          )}

         
        </div>
          </div>

          {/* Controls */}
          <div className="space-y-3">
            {/* Instructions */}
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl shadow-xl p-4 text-white">
              <h3 className="text-lg font-bold mb-3">💡 Quick Guide</h3>
              <ol className="space-y-2">
                <li className="flex gap-2 items-start">
                  <span className="bg-white text-purple-600 font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs">1</span>
                  <span className="text-xs">Search location or enable GPS</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="bg-white text-purple-600 font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs">2</span>
                  <span className="text-xs">Click polygon tool (top right)</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="bg-white text-purple-600 font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs">3</span>
                  <span className="text-xs">Draw boundaries, double-click to finish</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="bg-white text-purple-600 font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs">4</span>
                  <span className="text-xs">Review and confirm to save</span>
                </li>
                <li className="flex gap-2 items-start">
                  <span className="bg-white text-purple-600 font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs">5</span>
                  <span className="text-xs">Repeat for multiple lands</span>
                </li>
              </ol>
            </div>

            {/* Land Selection */}
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-emerald-200">
              <h3 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <MdLandscape className="text-emerald-600 text-xl" />
                <span>My Lands</span>
                <span className="ml-auto bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {userPolygons.length}
                </span>
              </h3>
              <select 
                value={selectedLand || ""} 
                onChange={handleSelectLand} 
                className="w-full px-3 py-2.5 rounded-lg border-2 border-emerald-300 focus:border-emerald-600 focus:outline-none bg-white cursor-pointer font-medium shadow-md text-sm"
              >
                <option value="">🏞️ Select a land</option>
                {userPolygons.map((polygon, index) => (
                  <option key={index} value={polygon.landId}>
                    🌾 Land {index + 1}
                  </option>
                ))}
              </select>
              
              {selectedLand && (
                <button 
                  onClick={handleDeleteLand} 
                  className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-lg shadow-lg transition-all text-sm"
                >
                  🗑️ Delete Selected Land
                </button>
              )}
            </div>
              {/* Drawing Confirmation */}
            {isPolygonDrawn && (
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-xl p-4 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <FaDrawPolygon className="text-xl" />
                  <h3 className="text-lg font-bold">New Land Drawn!</h3>
                </div>
                <p className="text-xs mb-3 opacity-95">
                  ✨ Review measurements and confirm to save. Use trash icon to delete.
                </p>
                <button 
                  onClick={sendCoordinates} 
                  className="w-full px-4 py-2.5 bg-white text-green-600 font-bold rounded-lg shadow-lg hover:shadow-xl transition-all hover:scale-90 text-sm"
                >
                  ✓ Confirm & Save Land
                </button>
              </div>
            )}

             {/* Location Details for selected land, new drawing, or searched place */}
          {activeLocationDetails && (
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-amber-200">
              <h3 className="text-base font-bold text-gray-800 mb-3">
                📍 Location Details {activeLocationDetails.label}
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                {/* Primary Location */}
                {activeLocationDetails.data.area !== "Data not available" && (
                  <div className="flex justify-between pb-2 border-b border-amber-100">
                    <span className="font-semibold text-amber-700">📌 Area/City:</span>
                    <span className="text-gray-900 font-medium">{activeLocationDetails.data.area}</span>
                  </div>
                )}
                
                {/* Landmark/Building */}
                {activeLocationDetails.data.landmark !== "Data not available" && (
                  <div className="flex justify-between pb-2 border-b border-amber-100">
                    <span className="font-semibold text-amber-700">🏢 Landmark:</span>
                    <span className="text-gray-900 font-medium">{activeLocationDetails.data.landmark}</span>
                  </div>
                )}
                
                {/* Road/Street */}
                {activeLocationDetails.data.road !== "Data not available" && (
                  <div className="flex justify-between pb-2 border-b border-amber-100">
                    <span className="font-semibold text-amber-700">🛣️ Road:</span>
                    <span className="text-gray-900 font-medium">{activeLocationDetails.data.road}</span>
                  </div>
                )}
                
                {/* Neighbourhood */}
                {activeLocationDetails.data.neighbourhood !== "Data not available" && (
                  <div className="flex justify-between pb-2 border-b border-amber-100">
                    <span className="font-semibold text-amber-700">🏘️ Neighbourhood:</span>
                    <span className="text-gray-900 font-medium">{activeLocationDetails.data.neighbourhood}</span>
                  </div>
                )}
                
                {/* Postcode */}
                {activeLocationDetails.data.postcode !== "Data not available" && (
                  <div className="flex justify-between pb-2 border-b border-amber-100">
                    <span className="font-semibold text-amber-700">📮 Postcode:</span>
                    <span className="text-gray-900 font-medium">{activeLocationDetails.data.postcode}</span>
                  </div>
                )}
                
                {/* District */}
                {activeLocationDetails.data.district !== "Data not available" && (
                  <div className="flex justify-between pb-2 border-b border-amber-100">
                    <span className="font-semibold text-amber-700">🗺️ District:</span>
                    <span className="text-gray-900 font-medium">{activeLocationDetails.data.district}</span>
                  </div>
                )}
                
                {/* State with Code */}
                {activeLocationDetails.data.state !== "Data not available" && (
                  <div className="flex justify-between pb-2 border-b border-amber-100">
                    <span className="font-semibold text-amber-700">🏛️ State:</span>
                    <span className="text-gray-900 font-medium">
                      {activeLocationDetails.data.state}
                      {activeLocationDetails.data.state_code !== "Data not available" && 
                        ` (${activeLocationDetails.data.state_code})`}
                    </span>
                  </div>
                )}
                
                {/* Country with Code */}
                {activeLocationDetails.data.country !== "Data not available" && (
                  <div className="flex justify-between pb-2 border-b border-amber-100">
                    <span className="font-semibold text-amber-700">🌍 Country:</span>
                    <span className="text-gray-900 font-medium">
                      {activeLocationDetails.data.country}
                      {activeLocationDetails.data.country_code !== "Data not available" && 
                        ` (${activeLocationDetails.data.country_code})`}
                    </span>
                  </div>
                )}
                
                {/* Region */}
                {activeLocationDetails.data.region !== "Data not available" && (
                  <div className="flex justify-between pb-2 border-b border-amber-100">
                    <span className="font-semibold text-amber-700">🌐 Region:</span>
                    <span className="text-gray-900 font-medium">{activeLocationDetails.data.region}</span>
                  </div>
                )}
                
                {/* Place Type */}
                {activeLocationDetails.data.place_type !== "Data not available" && (
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-amber-700">🏷️ Type:</span>
                    <span className="text-gray-900 font-medium capitalize">{activeLocationDetails.data.place_type}</span>
                  </div>
                )}
                
                {/* Coordinates Display */}
                {activeLocationDetails.data.coordinates && (
                  <div className="mt-3 pt-3 border-t border-amber-200 bg-amber-50 rounded-lg p-2">
                    <p className="text-xs font-semibold text-amber-800 mb-1">📡 Coordinates:</p>
                    <p className="text-xs text-gray-700">
                      <span className="font-mono">Lat: {activeLocationDetails.data.coordinates.lat.toFixed(6)}</span>
                    </p>
                    <p className="text-xs text-gray-700">
                      <span className="font-mono">Lon: {activeLocationDetails.data.coordinates.lng.toFixed(6)}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>

       
      </div>
    </div>
  );
};

export default MapComponent;



