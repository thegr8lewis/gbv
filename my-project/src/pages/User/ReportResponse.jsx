import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Map, Loader, AlertTriangle, Navigation, LocateFixed, Shield, Hospital, Phone, ArrowRight } from 'lucide-react';

// Cache for storing location data
const locationCache = {
  coords: null,
  timestamp: null,
  services: null
};

// Routing Control Component
const RoutingMachine = ({ startPoint, endPoint, color }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!startPoint || !endPoint) return;

    // Create routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(startPoint.lat, startPoint.lng),
        L.latLng(endPoint.lat, endPoint.lng)
      ],
      lineOptions: {
        styles: [
          { color, weight: 4, opacity: 0.7 }
        ]
      },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null // Don't create default markers
    }).addTo(map);
    
    // Clean up on unmount
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, startPoint, endPoint, color]);
  
  return null;
};

const ReportResponse = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestServices, setNearestServices] = useState({ police: null, hospital: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [isFetchingServices, setIsFetchingServices] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null); // 'police', 'hospital', or null

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
    setLocationGranted(false);
    setActiveRoute(null); // Clear any active routes
    
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
          setLocationGranted(true);
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

  // Handle Go button click
  const handleGoClick = (serviceType) => {
    // Toggle route if clicking the same service again
    if (activeRoute === serviceType) {
      setActiveRoute(null);
    } else {
      setActiveRoute(serviceType);
    }
  };

  // Initial load
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const renderLocationError = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex flex-col items-center my-4 text-center">
      <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
      <p className="text-red-700 mb-4">{error}</p>
      <button 
        onClick={requestLocation}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
      >
        <LocateFixed className="w-5 h-5" />
        {error?.includes("denied") ? "Enable Location Access" : "Retry Location Detection"}
      </button>
    </div>
  );

  const renderLoadingState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-600">
      <Loader className="w-12 h-12 animate-spin mb-4 text-blue-600" />
      <p className="text-lg">Detecting your location...</p>
    </div>
  );

  const renderEmergencyServices = () => (
    <>
      {/* Map Display */}
      <div className="rounded-lg overflow-hidden shadow-lg mb-6">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={13}
          style={{ height: '60vh', minHeight: '300px', width: '100%' }}
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
          
          {/* Render routes when active */}
          {activeRoute === 'police' && userLocation && nearestServices.police && (
            <RoutingMachine 
              startPoint={userLocation} 
              endPoint={nearestServices.police} 
              color="#3b82f6" // blue-500
            />
          )}
          
          {activeRoute === 'hospital' && userLocation && nearestServices.hospital && (
            <RoutingMachine 
              startPoint={userLocation} 
              endPoint={nearestServices.hospital} 
              color="#10b981" // green-500
            />
          )}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
          <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
          <span>Your Location</span>
        </div>
        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span>Police Station</span>
        </div>
        <div className="flex items-center text-gray-500 text-xs sm:text-sm">
          <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
          <span>Hospital</span>
        </div>
        {activeRoute && (
          <div className="flex items-center text-gray-500 text-xs sm:text-sm">
            <div className="w-4 h-1 bg-blue-500 mr-2"></div>
            <span>Route to {activeRoute === 'police' ? 'Police' : 'Hospital'}</span>
          </div>
        )}
      </div>

      {/* Services Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-lg p-4 sm:p-5 ${nearestServices.police ? 'bg-blue-50 border border-blue-100' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg text-gray-800">Police</h3>
          </div>
          
          {nearestServices.police ? (
            <div className="space-y-2">
              <p className="text-gray-700 font-medium text-sm sm:text-base">{nearestServices.police.name}</p>
              <div className="flex items-center gap-2 text-blue-600 text-sm">
                <Navigation className="w-4 h-4" />
                <span>{formatDistance(nearestServices.police.distance)}</span>
              </div>
              {nearestServices.police.phone && (
                <div className="flex items-center gap-2 text-blue-700 mt-2 text-sm">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${nearestServices.police.phone}`} className="hover:underline">
                    {nearestServices.police.phone}
                  </a>
                </div>
              )}
              
              {/* Go Button */}
              <button 
                onClick={() => handleGoClick('police')}
                className={`mt-3 ${
                  activeRoute === 'police' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } text-white font-medium py-2 px-4 rounded flex items-center gap-2 w-full justify-center transition-colors text-sm sm:text-base`}
              >
                {activeRoute === 'police' ? (
                  <>Hide Directions</>
                ) : (
                  <>Go <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          ) : !isFetchingServices && (
            <p className="text-gray-500 italic text-sm sm:text-base">No police stations found nearby</p>
          )}
        </div>
        
        <div className={`rounded-lg p-4 sm:p-5 ${nearestServices.hospital ? 'bg-green-50 border border-green-100' : 'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Hospital className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-base sm:text-lg text-gray-800">Hospital</h3>
          </div>
          
          {nearestServices.hospital ? (
            <div className="space-y-2">
              <p className="text-gray-700 font-medium text-sm sm:text-base">{nearestServices.hospital.name}</p>
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <Navigation className="w-4 h-4" />
                <span>{formatDistance(nearestServices.hospital.distance)}</span>
              </div>
              {nearestServices.hospital.phone && (
                <div className="flex items-center gap-2 text-green-700 mt-2 text-sm">
                  <Phone className="w-4 h-4" />
                  <a href={`tel:${nearestServices.hospital.phone}`} className="hover:underline">
                    {nearestServices.hospital.phone}
                  </a>
                </div>
              )}
              
              {/* Go Button */}
              <button 
                onClick={() => handleGoClick('hospital')}
                className={`mt-3 ${
                  activeRoute === 'hospital' 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : 'bg-green-600 hover:bg-green-700'
                } text-white font-medium py-2 px-4 rounded flex items-center gap-2 w-full justify-center transition-colors text-sm sm:text-base`}
              >
                {activeRoute === 'hospital' ? (
                  <>Hide Directions</>
                ) : (
                  <>Go <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </div>
          ) : !isFetchingServices && (
            <p className="text-gray-500 italic text-sm sm:text-base">No hospitals found nearby</p>
          )}
        </div>
      </div>
      
      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button 
          onClick={requestLocation}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2 mx-auto text-sm sm:text-base"
        >
          <LocateFixed className="w-4 h-4 sm:w-5 sm:h-5" />
          Refresh Location
        </button>
      </div>
    </>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <Map className="w-5 h-5 sm:w-6 sm:h-6" />
            <h2 className="text-lg sm:text-xl font-semibold">Emergency Services Near You</h2>
          </div>
          <div className="text-white text-xs bg-blue-700 px-2 sm:px-3 py-1 rounded-full">
            Emergency
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          {/* Loading state */}
          {loading && renderLoadingState()}
          
          {/* Error state - only show when there's an error AND we don't have location data */}
          {error && !locationGranted && renderLocationError()}
          
          {/* Service Loading state - only shown when we have location but are fetching services */}
          {locationGranted && isFetchingServices && !loading && (
            <div className="flex items-center justify-center py-6 text-gray-600">
              <Loader className="w-6 h-6 animate-spin mr-3" />
              <p>Finding nearby services...</p>
            </div>
          )}
          
          {/* Map and Services - only show when we have location data */}
          {locationGranted && userLocation && renderEmergencyServices()}
        </div>
      </div>
    </div>
  );
};

export default ReportResponse;