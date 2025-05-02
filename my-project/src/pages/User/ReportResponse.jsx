import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Map, Loader, AlertTriangle, Navigation, LocateFixed, Shield, Hospital, Phone } from 'lucide-react';

// Cache for storing location data
const locationCache = {
  coords: null,
  timestamp: null,
  services: null
};

const ReportResponse = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestServices, setNearestServices] = useState({ police: null, hospital: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [isFetchingServices, setIsFetchingServices] = useState(false);

  // Custom icons
  const icons = {
    user: new L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
      iconSize: [32, 32],
    }),
    police: new L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2830/2830312.png',
      iconSize: [32, 32],
    }),
    hospital: new L.Icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2961/2961937.png',
      iconSize: [32, 32],
    })
  };

  // Format distance in kilometers
  const formatDistance = (meters) => {
    if (!meters) return 'N/A';
    return meters < 1000 
      ? `${Math.round(meters)} meters` 
      : `${(meters/1000).toFixed(1)} km`;
  };
  
  // Format phone number
  const formatPhone = (phone) => {
    if (!phone) return null;
    return phone;
  };

  // Fetch nearest services with caching
  const fetchNearestServices = useCallback(async (lat, lng) => {
    setIsFetchingServices(true);
    
    // Check cache first
    if (locationCache.services && 
        locationCache.coords?.lat === lat && 
        locationCache.coords?.lng === lng) {
      setNearestServices(locationCache.services);
      setIsFetchingServices(false);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/nearest-services?lat=${lat}&lng=${lng}`
      );
      
      const data = await response.json();
      
      // Update cache
      locationCache.coords = { lat, lng };
      locationCache.services = data;
      locationCache.timestamp = Date.now();
      
      setNearestServices(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load service data");
    } finally {
      setIsFetchingServices(false);
    }
  }, []);

  // Get user location with caching
  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    
    if (!navigator.geolocation) {
      setError("Your browser doesn't support geolocation");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Check cache
        if (locationCache.coords?.lat === latitude && 
            locationCache.coords?.lng === longitude) {
          setUserLocation(locationCache.coords);
          setNearestServices(locationCache.services);
          setLoading(false);
          return;
        }

        setUserLocation({ lat: latitude, lng: longitude });
        setLocationGranted(true);
        await fetchNearestServices(latitude, longitude);
        setLoading(false);
      },
      (err) => {
        console.error("Location error:", err);
        if (err.code === 1) {
          setError("Location access denied. Please enable permissions.");
        } else {
          setError("Couldn't determine your location");
        }
        setLoading(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // Accept cached location up to 1 minute old
      }
    );
  }, [fetchNearestServices]);

  // Initial load
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Emergency Services Near You</h2>
          </div>
          <div className="text-white text-xs bg-blue-700 px-3 py-1 rounded-full">
            Emergency
          </div>
        </div>
        
        <div className="p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-600">
              <Loader className="w-12 h-12 animate-spin mb-4 text-blue-600" />
              <p className="text-lg">Detecting your location...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex flex-col items-center my-4 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={requestLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
              >
                <LocateFixed className="w-5 h-5" />
                {error.includes("denied") ? "Enable Location Access" : "Retry Location Detection"}
              </button>
            </div>
          )}

          {/* Services Loading State */}
          {locationGranted && isFetchingServices && (
            <div className="flex items-center justify-center py-6 text-gray-600">
              <Loader className="w-6 h-6 animate-spin mr-3" />
              <p>Finding nearby services...</p>
            </div>
          )}

          {/* Map Display */}
          {userLocation && (
            <div className="rounded-lg overflow-hidden shadow-lg mb-6">
              <MapContainer
                center={[userLocation.lat, userLocation.lng]}
                zoom={13}
                style={{ height: '400px', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[userLocation.lat, userLocation.lng]} icon={icons.user}>
                  <Popup>Your Location</Popup>
                </Marker>
                
                {nearestServices.police && (
                  <Marker position={[nearestServices.police.lat, nearestServices.police.lng]} icon={icons.police}>
                    <Popup>
                      <div className="text-sm">
                        <strong className="text-base">Police Station</strong><br/>
                        {nearestServices.police.name || 'Police Station'}<br/>
                        {formatDistance(nearestServices.police.distance)} away
                        {nearestServices.police.phone && (
                          <div className="mt-2">
                            <strong>Phone:</strong> {nearestServices.police.phone}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )}
                
                {nearestServices.hospital && (
                  <Marker position={[nearestServices.hospital.lat, nearestServices.hospital.lng]} icon={icons.hospital}>
                    <Popup>
                      <div className="text-sm">
                        <strong className="text-base">Hospital</strong><br/>
                        {nearestServices.hospital.name || 'Hospital'}<br/>
                        {formatDistance(nearestServices.hospital.distance)} away
                        {nearestServices.hospital.phone && (
                          <div className="mt-2">
                            <strong>Phone:</strong> {nearestServices.hospital.phone}
                          </div>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </div>
          )}

          {/* Services Information */}
          {userLocation && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="col-span-2 flex flex-wrap gap-6 justify-center mb-1">
                <div className="flex items-center text-gray-500 text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
                  <span>Your Location</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Police Station</span>
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                  <span>Hospital</span>
                </div>
              </div>
              <div className={`rounded-lg p-5 ${nearestServices.police ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800">Police</h3>
                </div>
                
                {nearestServices.police ? (
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">{nearestServices.police.name}</p>
                    <div className="flex items-center gap-2 text-blue-600">
                      <Navigation className="w-4 h-4" />
                      <span>{formatDistance(nearestServices.police.distance)}</span>
                    </div>
                    {nearestServices.police.phone && (
                      <div className="flex items-center gap-2 text-blue-700 mt-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${nearestServices.police.phone}`} className="hover:underline">
                          {nearestServices.police.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ) : !isFetchingServices && (
                  <p className="text-gray-500 italic">No police stations found nearby</p>
                )}
              </div>
              
              <div className={`rounded-lg p-5 ${nearestServices.hospital ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-200'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Hospital className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg text-gray-800">Hospital</h3>
                </div>
                
                {nearestServices.hospital ? (
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">{nearestServices.hospital.name}</p>
                    <div className="flex items-center gap-2 text-green-600">
                      <Navigation className="w-4 h-4" />
                      <span>{formatDistance(nearestServices.hospital.distance)}</span>
                    </div>
                    {nearestServices.hospital.phone && (
                      <div className="flex items-center gap-2 text-green-700 mt-2">
                        <Phone className="w-4 h-4" />
                        <a href={`tel:${nearestServices.hospital.phone}`} className="hover:underline">
                          {nearestServices.hospital.phone}
                        </a>
                      </div>
                    )}
                  </div>
                ) : !isFetchingServices && (
                  <p className="text-gray-500 italic">No hospitals found nearby</p>
                )}
              </div>
            </div>
          )}
          
          {userLocation && (
            <div className="mt-6 text-center">
              <button 
                onClick={requestLocation}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 mx-auto"
              >
                <LocateFixed className="w-5 h-5" />
                Refresh Location
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportResponse;