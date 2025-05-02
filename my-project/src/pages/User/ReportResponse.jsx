import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Map, Loader, AlertTriangle, Navigation, LocateFixed, Shield, Hospital, Phone, ArrowRight } from 'lucide-react';

// Cache for storing location data with a longer validity
const locationCache = {
  coords: null,
  timestamp: null,
  services: null,
  // Cache expiry in milliseconds (5 minutes)
  CACHE_EXPIRY: 5 * 60 * 1000
};

// Custom style to be included in the component
const styles = `
  .pulse-icon {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .pulse-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
    transform: scale(1);
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
    70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
  .modern-map {
    border-radius: 0.75rem;
  }
  .modern-popup {
    border-radius: 0.5rem;
    padding: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
  .modern-icon {
    filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
  }
`;

// Modern Routing Control Component with dynamic updates
const RoutingMachine = ({ startPoint, endPoint, color }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!startPoint || !endPoint) return;

    // Remove existing control if it exists
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create routing control with modern styling
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(startPoint.lat, startPoint.lng),
        L.latLng(endPoint.lat, endPoint.lng)
      ],
      lineOptions: {
        styles: [{
          color,
          weight: 5,
          opacity: 0.8,
          dashArray: '0',
          lineCap: 'round'
        }]
      },
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      showAlternatives: false,
      createMarker: () => null
    }).addTo(map);

    routingControlRef.current = routingControl;

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, color]);

  // Update route when points change
  useEffect(() => {
    if (routingControlRef.current && startPoint && endPoint) {
      routingControlRef.current.setWaypoints([
        L.latLng(startPoint.lat, startPoint.lng),
        L.latLng(endPoint.lat, endPoint.lng)
      ]);
    }
  }, [startPoint, endPoint]);

  return null;
};

// Custom icons with modern styling
const createPulseIcon = (color) => {
  return L.divIcon({
    className: 'pulse-icon',
    iconSize: [20, 20],
    html: `<div class="pulse-dot" style="background-color: ${color}"></div>`
  });
};

// SVG icons for better visuals
const createSvgIcon = (type) => {
  const policeIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1e40af" width="36" height="36">
      <circle cx="12" cy="12" r="12" fill="white"/>
      <circle cx="12" cy="12" r="10" fill="#3b82f6"/>
      <path d="M12 4l1.5 4.5h5l-4 3 1.5 4.5-4-3-4 3 1.5-4.5-4-3h5z" fill="white"/>
    </svg>
  `;
  
  const hospitalIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#047857" width="36" height="36">
      <circle cx="12" cy="12" r="12" fill="white"/>
      <circle cx="12" cy="12" r="10" fill="#10b981"/>
      <rect x="7" y="10" width="10" height="4" fill="white"/>
      <rect x="10" y="7" width="4" height="10" fill="white"/>
    </svg>
  `;
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: type === 'police' ? policeIcon : hospitalIcon,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
  });
};

const ReportResponse = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestServices, setNearestServices] = useState({ police: null, hospital: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [isFetchingServices, setIsFetchingServices] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const watchIdRef = useRef(null);
  const permissionDenied = useRef(false);

  // Icons using custom SVGs for better visualization
  const icons = {
    police: createSvgIcon('police'),
    hospital: createSvgIcon('hospital')
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

  // Check if cache is valid
  const isCacheValid = () => {
    if (!locationCache.timestamp) return false;
    const now = Date.now();
    return (now - locationCache.timestamp) < locationCache.CACHE_EXPIRY;
  };

  // Fetch nearest services with caching
  const fetchNearestServices = useCallback(async (lat, lng) => {
    setIsFetchingServices(true);
    
    // Check cache first - more robust cache validation
    if (locationCache.services && 
        locationCache.coords?.lat === lat && 
        locationCache.coords?.lng === lng &&
        isCacheValid()) {
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
      
      // If cache is available but expired, still use it as fallback
      if (locationCache.services) {
        setNearestServices(locationCache.services);
      }
    } finally {
      setIsFetchingServices(false);
    }
  }, []);

  // Function to stop watching position
  const stopWatchingPosition = useCallback(() => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Get user location with better error handling
  const requestLocation = useCallback(() => {
    setLoading(true);
    setError(null);
    
    // Don't reset locationGranted if it was already true
    if (!locationGranted) {
      setLocationGranted(false);
    }
    
    setActiveRoute(null);
    
    // If permission was previously denied, show error immediately
    if (permissionDenied.current) {
      setError("Location access denied. Please enable permissions in your browser settings.");
      setLoading(false);
      return;
    }
    
    if (!navigator.geolocation) {
      setError("Your browser doesn't support geolocation");
      setLoading(false);
      return;
    }

    // Clean up previous watcher
    stopWatchingPosition();

    // Check if we have a recent cached location first
    if (locationCache.coords && isCacheValid()) {
      setUserLocation(locationCache.coords);
      if (locationCache.services) {
        setNearestServices(locationCache.services);
      } else {
        fetchNearestServices(locationCache.coords.lat, locationCache.coords.lng);
      }
      setLocationGranted(true);
      setLoading(false);
      
      // Still try to update in the background
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearestServices(latitude, longitude);
          setupPositionWatcher(latitude, longitude);
        },
        (err) => handleLocationError(err, true), // Silent error handling
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
      
      return;
    }

    // Get current position
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationGranted(true);
        await fetchNearestServices(latitude, longitude);
        setLoading(false);

        setupPositionWatcher(latitude, longitude);
      },
      (err) => handleLocationError(err),
      { 
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout
        maximumAge: 60000
      }
    );
  }, [fetchNearestServices, locationGranted, stopWatchingPosition]);

  // Handle location errors properly
  const handleLocationError = useCallback((err, silent = false) => {
    console.error("Location error:", err);
    
    if (!silent) {
      if (err.code === 1) {
        // Permission denied - remember this to avoid repeated prompts
        permissionDenied.current = true;
        setError("Location access denied. Please enable permissions in your browser settings.");
      } else if (err.code === 2) {
        setError("Your location couldn't be determined. Please check your device's location settings.");
      } else if (err.code === 3) {
        setError("Location request timed out. Please try again.");
      } else {
        setError("Couldn't determine your location");
      }
      setLoading(false);
    }
  }, []);

  // Setup position watcher with better error handling
  const setupPositionWatcher = useCallback((initialLat, initialLng) => {
    // Only set up watcher if we haven't already been denied permission
    if (permissionDenied.current) return;
    
    // Store initial position in case watcher fails
    if (!locationCache.coords) {
      locationCache.coords = { lat: initialLat, lng: initialLng };
      locationCache.timestamp = Date.now();
    }
    
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const newLocation = { lat: latitude, lng: longitude };
          
          // Update cache with latest position
          locationCache.coords = newLocation;
          locationCache.timestamp = Date.now();
          
          // Only update if position changed significantly (more than 50 meters)
          if (userLocation) {
            const distance = L.latLng(userLocation.lat, userLocation.lng)
              .distanceTo(L.latLng(latitude, longitude));
            
            if (distance > 50) {
              setUserLocation(newLocation);
              
              // Optionally update services if moved significantly (more than 500m)
              if (distance > 500) {
                fetchNearestServices(latitude, longitude);
              }
            }
          } else {
            setUserLocation(newLocation);
          }
        },
        (err) => {
          console.error("Watch position error:", err);
          // Don't show errors for watch position, just log them
          // Only clear watcher on permission denied
          if (err.code === 1) {
            permissionDenied.current = true;
            stopWatchingPosition();
          }
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 30000, // Increased for better performance
          timeout: 27000 // Increased timeout to prevent frequent timeouts
        }
      );
    } catch (e) {
      console.error("Error setting up position watcher:", e);
      // Fallback to the position we already have
    }
  }, [fetchNearestServices, userLocation, stopWatchingPosition]);

  // Handle Go button click
  const handleGoClick = (serviceType) => {
    setActiveRoute(activeRoute === serviceType ? null : serviceType);
  };

  // Clean up watcher on unmount
  useEffect(() => {
    return () => {
      stopWatchingPosition();
    };
  }, [stopWatchingPosition]);

  // Initial load
  useEffect(() => {
    requestLocation();
    
    // Set up permission change listener
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then(permissionStatus => {
        // Listen for permission changes
        permissionStatus.onchange = () => {
          if (permissionStatus.state === 'granted') {
            permissionDenied.current = false;
            requestLocation();
          } else if (permissionStatus.state === 'denied') {
            permissionDenied.current = true;
            setError("Location access denied. Please enable permissions in your browser settings.");
          }
        };
      }).catch(e => {
        console.error("Permission query error:", e);
      });
    }
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
      
      {error?.includes("denied") && (
        <div className="mt-4 text-sm text-gray-600 max-w-md">
          <p>To enable location:</p>
          <ul className="list-disc pl-5 mt-2 text-left">
            <li>Click the lock/info icon in your browser's address bar</li>
            <li>Find "Location" permissions and set to "Allow"</li>
            <li>Refresh this page after changing settings</li>
          </ul>
        </div>
      )}
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
      {/* Modern Map Display */}
      <div className="rounded-lg overflow-hidden shadow-lg mb-6 border border-gray-200">
        <MapContainer
          center={[userLocation.lat, userLocation.lng]}
          zoom={15}
          style={{ height: '60vh', minHeight: '300px', width: '100%' }}
          className="z-0 modern-map"
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>'
          />
          
          {/* User location with pulse effect */}
          <Marker 
            position={[userLocation.lat, userLocation.lng]} 
            icon={createPulseIcon('#3b82f6')}
          >
            <Popup className="modern-popup">Your Location</Popup>
          </Marker>
          
          {nearestServices.police && (
            <Marker position={[nearestServices.police.lat, nearestServices.police.lng]} icon={icons.police}>
              <Popup className="modern-popup">
                <div className="text-sm space-y-1">
                  <strong className="text-base block text-blue-600">Police Station</strong>
                  <p>{nearestServices.police.name || 'Police Station'}</p>
                  <div className="flex items-center gap-2 text-blue-500">
                    <Navigation className="w-4 h-4" />
                    <span>{formatDistance(nearestServices.police.distance)} away</span>
                  </div>
                  {nearestServices.police.phone && (
                    <div className="mt-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <a href={`tel:${nearestServices.police.phone}`} className="text-blue-600 hover:underline">
                        {formatPhone(nearestServices.police.phone)}
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          )}
          
          {nearestServices.hospital && (
            <Marker position={[nearestServices.hospital.lat, nearestServices.hospital.lng]} icon={icons.hospital}>
              <Popup className="modern-popup">
                <div className="text-sm space-y-1">
                  <strong className="text-base block text-green-600">Hospital</strong>
                  <p>{nearestServices.hospital.name || 'Hospital'}</p>
                  <div className="flex items-center gap-2 text-green-500">
                    <Navigation className="w-4 h-4" />
                    <span>{formatDistance(nearestServices.hospital.distance)} away</span>
                  </div>
                  {nearestServices.hospital.phone && (
                    <div className="mt-2 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-green-500" />
                      <a href={`tel:${nearestServices.hospital.phone}`} className="text-green-600 hover:underline">
                        {formatPhone(nearestServices.hospital.phone)}
                      </a>
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

      {/* Modern Map Legend */}
      <div className="flex flex-wrap gap-3 justify-center mb-6">
        <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-xs border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-blue-600 mr-2 pulse-dot"></div>
          <span className="text-xs font-medium text-gray-700">Your Location</span>
        </div>
        <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-xs border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
          <span className="text-xs font-medium text-gray-700">Police Station</span>
        </div>
        <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-xs border border-gray-100">
          <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
          <span className="text-xs font-medium text-gray-700">Hospital</span>
        </div>
        {activeRoute && (
          <div className="flex items-center bg-white px-3 py-1.5 rounded-full shadow-xs border border-gray-100">
            <div className="w-4 h-1.5 rounded-full bg-blue-500 mr-2"></div>
            <span className="text-xs font-medium text-gray-700">Route to {activeRoute === 'police' ? 'Police' : 'Hospital'}</span>
          </div>
        )}
      </div>

      {/* Modern Services Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-xl p-5 transition-all ${nearestServices.police ? 
          'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm' : 
          'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-2.5 rounded-xl">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Nearest Police</h3>
          </div>
          
          {nearestServices.police ? (
            <div className="space-y-3">
              <p className="text-gray-800 font-medium">{nearestServices.police.name}</p>
              <div className="flex items-center gap-2 text-blue-600">
                <Navigation className="w-5 h-5" />
                <span className="font-medium">{formatDistance(nearestServices.police.distance)}</span>
              </div>
              {nearestServices.police.phone && (
                <div className="flex items-center gap-2 text-blue-700 mt-3">
                  <Phone className="w-5 h-5" />
                  <a href={`tel:${nearestServices.police.phone}`} className="hover:underline font-medium">
                    {formatPhone(nearestServices.police.phone)}
                  </a>
                </div>
              )}
              
              <button 
                onClick={() => handleGoClick('police')}
                className={`mt-4 ${
                  activeRoute === 'police' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-100' 
                    : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-100'
                } text-white font-medium py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 w-full justify-center shadow-sm`}
              >
                {activeRoute === 'police' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Hide Route
                  </>
                ) : (
                  <>
                    Get Directions
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : !isFetchingServices && (
            <p className="text-gray-500 italic">No police stations found nearby</p>
          )}
        </div>
        
        <div className={`rounded-xl p-5 transition-all ${nearestServices.hospital ? 
          'bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-sm' : 
          'bg-gray-50 border border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-2.5 rounded-xl">
              <Hospital className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg text-gray-800">Nearest Hospital</h3>
          </div>
          
          {nearestServices.hospital ? (
            <div className="space-y-3">
              <p className="text-gray-800 font-medium">{nearestServices.hospital.name}</p>
              <div className="flex items-center gap-2 text-green-600">
                <Navigation className="w-5 h-5" />
                <span className="font-medium">{formatDistance(nearestServices.hospital.distance)}</span>
              </div>
              {nearestServices.hospital.phone && (
                <div className="flex items-center gap-2 text-green-700 mt-3">
                  <Phone className="w-5 h-5" />
                  <a href={`tel:${nearestServices.hospital.phone}`} className="hover:underline font-medium">
                    {formatPhone(nearestServices.hospital.phone)}
                  </a>
                </div>
              )}
              
              <button 
                onClick={() => handleGoClick('hospital')}
                className={`mt-4 ${
                  activeRoute === 'hospital' 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-red-100' 
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-green-100'
                } text-white font-medium py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 w-full justify-center shadow-sm`}
              >
                {activeRoute === 'hospital' ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Hide Route
                  </>
                ) : (
                  <>
                    Get Directions
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          ) : !isFetchingServices && (
            <p className="text-gray-500 italic">No hospitals found nearby</p>
          )}
        </div>
      </div>
      
      {/* Modern Refresh Button */}
      <div className="mt-8 text-center">
        <button 
          onClick={requestLocation}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 px-8 rounded-xl transition-all flex items-center gap-2 mx-auto shadow-sm"
        >
          <LocateFixed className="w-5 h-5" />
          Refresh My Location
        </button>
      </div>
    </>
  );

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6">
      {/* Insert style tag properly */}
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Modern Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Map className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Emergency Services Near You</h2>
          </div>
        </div>
        
        <div className="p-5 sm:p-6">
          {loading && renderLoadingState()}
          {error && !locationGranted && renderLocationError()}
          {locationGranted && isFetchingServices && !loading && (
            <div className="flex items-center justify-center py-6 text-gray-600">
              <Loader className="w-6 h-6 animate-spin mr-3 text-blue-600" />
              <p className="font-medium">Finding nearby services...</p>
            </div>
          )}
          {locationGranted && userLocation && renderEmergencyServices()}
        </div>
      </div>

      {/* Add CSS for pulse animation */}
      <style jsx global>{`
        .pulse-icon {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .pulse-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          transform: scale(1);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
        }
        .modern-map {
          border-radius: 0.75rem;
        }
        .modern-popup {
          border-radius: 0.5rem;
          padding: 0.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .modern-icon {
          filter: drop-shadow(0 2px 2px rgba(0,0,0,0.1));
        }
      `}</style>
    </div>
  );
};

export default ReportResponse;