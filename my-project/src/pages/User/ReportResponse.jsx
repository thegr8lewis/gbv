import React, { useEffect, useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, CircleMarker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-routing-machine';
import { Map, Loader, AlertTriangle, Navigation, LocateFixed, Shield, Hospital, Phone, ArrowRight, School, Store, Coffee } from 'lucide-react';
import {  API_BASE_URL } from './apiConfig';

// Cache for storing location data with a longer validity
const locationCache = {
  coords: null,
  timestamp: null,
  services: null,
  pois: null,
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
  .map-legend {
    position: absolute;
    bottom: 25px;
    right: 10px;
    z-index: 1000;
    background: white;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    max-width: 250px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    font-size: 12px;
  }
  .legend-color {
    width: 12px;
    height: 12px;
    margin-right: 5px;
    border-radius: 50%;
  }
  .leaflet-popup-content-wrapper {
    border-radius: 8px !important;
  }
  .leaflet-popup-content {
    margin: 10px 12px;
    line-height: 1.4;
  }
  .poi-filter-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
    justify-content: center;
  }
  .poi-filter-button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }
  .poi-filter-button.active {
    background-color: #3b82f6;
    color: white;
  }
  .poi-filter-button:not(.active) {
    background-color: #f3f4f6;
    color: #4b5563;
  }
  .poi-filter-button:hover:not(.active) {
    background-color: #e5e7eb;
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
  let svgContent = '';
  
  switch(type) {
    case 'police':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#1e40af" width="36" height="36">
          <circle cx="12" cy="12" r="12" fill="white"/>
          <circle cx="12" cy="12" r="10" fill="#3b82f6"/>
          <path d="M12 4l1.5 4.5h5l-4 3 1.5 4.5-4-3-4 3 1.5-4.5-4-3h5z" fill="white"/>
        </svg>
      `;
      break;
    case 'hospital':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#047857" width="36" height="36">
          <circle cx="12" cy="12" r="12" fill="white"/>
          <circle cx="12" cy="12" r="10" fill="#10b981"/>
          <rect x="7" y="10" width="10" height="4" fill="white"/>
          <rect x="10" y="7" width="4" height="10" fill="white"/>
        </svg>
      `;
      break;
    case 'school':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6366f1" width="30" height="30">
          <circle cx="12" cy="12" r="12" fill="white"/>
          <circle cx="12" cy="12" r="10" fill="#818cf8"/>
          <path d="M12 6l-7 4v2h2v4h10v-4h2v-2l-7-4z" fill="white"/>
          <rect x="10" y="13" width="4" height="3" fill="#818cf8"/>
        </svg>
      `;
      break;
    case 'shop':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#d97706" width="30" height="30">
          <circle cx="12" cy="12" r="12" fill="white"/>
          <circle cx="12" cy="12" r="10" fill="#f59e0b"/>
          <path d="M6 9h12v8H6z" fill="white"/>
          <path d="M7 7h10l1 2H6z" fill="white"/>
        </svg>
      `;
      break;
    case 'restaurant':
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#b91c1c" width="30" height="30">
          <circle cx="12" cy="12" r="12" fill="white"/>
          <circle cx="12" cy="12" r="10" fill="#ef4444"/>
          <path d="M9 6v9c0 0.552-0.448 1-1 1s-1-0.448-1-1V6h2zm5 0v9c0 0.552-0.448 1-1 1s-1-0.448-1-1V6h2zm3 1v4c0 2.209-1.791 4-4 4v3.5c0 0.552-0.448 1-1 1s-1-0.448-1-1V15c-2.209 0-4-1.791-4-4V7h10z" fill="white"/>
        </svg>
      `;
      break;
    default:
      svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6b7280" width="30" height="30">
          <circle cx="12" cy="12" r="12" fill="white"/>
          <circle cx="12" cy="12" r="10" fill="#9ca3af"/>
          <circle cx="12" cy="12" r="3" fill="white"/>
        </svg>
      `;
  }
  
  return L.divIcon({
    className: 'custom-div-icon',
    html: svgContent,
    iconSize: type === 'police' || type === 'hospital' ? [36, 36] : [30, 30],
    iconAnchor: type === 'police' || type === 'hospital' ? [18, 18] : [15, 15],
    popupAnchor: [0, -18]
  });
};

// Map view controller component
const MapViewController = ({ userLocation, hasRouteActive }) => {
  const map = useMap();
  
  useEffect(() => {
    if (userLocation) {
      if (!hasRouteActive) {
        map.setView([userLocation.lat, userLocation.lng], 16, { animate: true });
      }
    }
  }, [map, userLocation, hasRouteActive]);
  
  return null;
};

// Points of Interest finder component
const POIFinder = ({ userLocation, poiCategory, setFoundPOIs }) => {
  const map = useMap();
  
  // Find POIs using Overpass API
  useEffect(() => {
    if (!userLocation || !poiCategory) return;
    
    const fetchPOIs = async () => {
      try {
        // Check cache first
        const cacheKey = `${poiCategory}-${userLocation.lat.toFixed(4)}-${userLocation.lng.toFixed(4)}`;
        if (locationCache.pois && locationCache.pois[cacheKey] && isCacheValid()) {
          setFoundPOIs(locationCache.pois[cacheKey]);
          return;
        }
        
        let query = '';
        const radius = 1000; // 1km radius
        
        switch(poiCategory) {
          case 'schools':
            query = `
              [out:json];
              (
                node["amenity"="school"](around:${radius},${userLocation.lat},${userLocation.lng});
                way["amenity"="school"](around:${radius},${userLocation.lat},${userLocation.lng});
                relation["amenity"="school"](around:${radius},${userLocation.lat},${userLocation.lng});
              );
              out center;
            `;
            break;
          case 'shops':
            query = `
              [out:json];
              (
                node["shop"](around:${radius},${userLocation.lat},${userLocation.lng});
                way["shop"](around:${radius},${userLocation.lat},${userLocation.lng});
              );
              out center;
            `;
            break;
          case 'restaurants':
            query = `
              [out:json];
              (
                node["amenity"="restaurant"](around:${radius},${userLocation.lat},${userLocation.lng});
                node["amenity"="cafe"](around:${radius},${userLocation.lat},${userLocation.lng});
                node["amenity"="fast_food"](around:${radius},${userLocation.lat},${userLocation.lng});
                way["amenity"="restaurant"](around:${radius},${userLocation.lat},${userLocation.lng});
                way["amenity"="cafe"](around:${radius},${userLocation.lat},${userLocation.lng});
                way["amenity"="fast_food"](around:${radius},${userLocation.lat},${userLocation.lng});
              );
              out center;
            `;
            break;
          default:
            return;
        }
        
        const response = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: query
        });
        
        const data = await response.json();
        
        // Process the response
        const pois = data.elements.map(element => {
          let lat, lng;
          
          if (element.type === 'node') {
            lat = element.lat;
            lng = element.lon;
          } else if (element.center) {
            lat = element.center.lat;
            lng = element.center.lon;
          } else {
            return null; // Skip if no valid coordinates
          }
          
          const distance = L.latLng(userLocation.lat, userLocation.lng)
            .distanceTo(L.latLng(lat, lng));
            
          return {
            id: element.id,
            name: element.tags?.name || 
                 (poiCategory === 'schools' ? 'School' : 
                  poiCategory === 'shops' ? 'Shop' : 'Restaurant'),
            lat,
            lng,
            type: poiCategory === 'schools' ? 'school' : 
                  poiCategory === 'shops' ? 'shop' : 'restaurant',
            distance,
            address: element.tags?.["addr:street"] ? 
                    `${element.tags?.["addr:housenumber"] || ''} ${element.tags?.["addr:street"] || ''}`.trim() : 
                    null,
            tags: element.tags
          };
        }).filter(poi => poi !== null);
        
        // Sort by distance
        pois.sort((a, b) => a.distance - b.distance);
        
        // Store in cache
        if (!locationCache.pois) {
          locationCache.pois = {};
        }
        locationCache.pois[cacheKey] = pois;
        locationCache.timestamp = Date.now();
        
        setFoundPOIs(pois);
      } catch (error) {
        console.error("Error fetching POIs:", error);
        setFoundPOIs([]);
      }
    };
    
    fetchPOIs();
  }, [userLocation, poiCategory, setFoundPOIs]);
  
  return null;
};

// Helper to check if cache is valid
const isCacheValid = () => {
  if (!locationCache.timestamp) return false;
  const now = Date.now();
  return (now - locationCache.timestamp) < locationCache.CACHE_EXPIRY;
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

const ReportResponse = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [nearestServices, setNearestServices] = useState({ police: null, hospital: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [isFetchingServices, setIsFetchingServices] = useState(false);
  const [activeRoute, setActiveRoute] = useState(null);
  const [activePOIFilter, setActivePOIFilter] = useState(null);
  const [foundPOIs, setFoundPOIs] = useState([]);
  const watchIdRef = useRef(null);
  const permissionDenied = useRef(false);

  // Icons using custom SVGs for better visualization
  const icons = {
    police: createSvgIcon('police'),
    hospital: createSvgIcon('hospital'),
    school: createSvgIcon('school'),
    shop: createSvgIcon('shop'),
    restaurant: createSvgIcon('restaurant')
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
        `${API_BASE_URL}/nearest-services?lat=${lat}&lng=${lng}`
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
    setActivePOIFilter(null);
    setFoundPOIs([]);
    
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
                // Clear POI cache when moved significantly
                if (activePOIFilter) {
                  setFoundPOIs([]);
                  setActivePOIFilter(prevFilter => {
                    const currentFilter = prevFilter;
                    // Force refresh POIs by toggling the filter off and on
                    setActivePOIFilter(null);
                    setTimeout(() => setActivePOIFilter(currentFilter), 100);
                    return currentFilter;
                  });
                }
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
    if (activePOIFilter && activeRoute !== serviceType) {
      setActivePOIFilter(null);
    }
  };

  // Handle POI filter click
  const handlePOIFilterClick = (filterType) => {
    if (activePOIFilter === filterType) {
      setActivePOIFilter(null);
      setFoundPOIs([]);
    } else {
      setActivePOIFilter(filterType);
      setFoundPOIs([]);
    }
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

  const renderPOIFilters = () => (
    <div className="poi-filter-container">
      <button 
        className={`poi-filter-button ${activePOIFilter === 'schools' ? 'active' : ''}`}
        onClick={() => handlePOIFilterClick('schools')}
      >
        <School className="w-4 h-4" />
        Schools
      </button>
      <button 
        className={`poi-filter-button ${activePOIFilter === 'shops' ? 'active' : ''}`}
        onClick={() => handlePOIFilterClick('shops')}
      >
        <Store className="w-4 h-4" />
        Shops
      </button>
      <button 
        className={`poi-filter-button ${activePOIFilter === 'restaurants' ? 'active' : ''}`}
        onClick={() => handlePOIFilterClick('restaurants')}
      >
        <Coffee className="w-4 h-4" />
        Restaurants
      </button>
    </div>
  );

  const renderPOIPoints = () => {
    if (!foundPOIs || foundPOIs.length === 0) return null;
    
    return foundPOIs.map(poi => (
      <Marker 
        key={`${poi.type}-${poi.id}`}
        position={[poi.lat, poi.lng]} 
        icon={icons[poi.type]}
      >
        <Popup className="modern-popup">
          <div className="text-sm space-y-1">
            <strong className="text-base block" style={{ 
              color: poi.type === 'school' ? '#6366f1' : 
                     poi.type === 'shop' ? '#d97706' : '#b91c1c' 
            }}>
              {poi.name}
            </strong>
            {poi.address && <p>{poi.address}</p>}
            <div className="flex items-center gap-2 text-gray-600">
              <Navigation className="w-4 h-4" />
              <span>{formatDistance(poi.distance)} away</span>
            </div>
          </div>
          </Popup>
      </Marker>
    ));
  };

  const renderServiceCards = () => {
    if (!nearestServices || (!nearestServices.police && !nearestServices.hospital)) {
      return (
        <div className="text-center py-4 text-gray-600">
          {isFetchingServices ? (
            <div className="flex flex-col items-center">
              <Loader className="w-6 h-6 animate-spin mb-2" />
              <p>Finding nearest emergency services...</p>
            </div>
          ) : (
            <p>No emergency services found in your area.</p>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {nearestServices.police && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-blue-100">
            <div className="bg-blue-50 p-4 flex items-center gap-3">
              <Shield className="text-blue-600 w-6 h-6" />
              <h3 className="text-lg font-medium text-blue-800">Police Station</h3>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-1">{nearestServices.police.name}</h4>
              {nearestServices.police.address && (
                <p className="text-gray-600 text-sm mb-3">{nearestServices.police.address}</p>
              )}
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Navigation className="w-4 h-4" />
                  <span>{formatDistance(nearestServices.police.distance)} away</span>
                </div>
                {nearestServices.police.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a 
                      href={`tel:${formatPhone(nearestServices.police.phone)}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {formatPhone(nearestServices.police.phone)}
                    </a>
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleGoClick('police')}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                    ${activeRoute === 'police' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-blue-700 hover:bg-gray-200'}
                    transition-colors
                  `}
                >
                  {activeRoute === 'police' ? 'Hide Route' : 'Show Route'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {nearestServices.hospital && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-green-100">
            <div className="bg-green-50 p-4 flex items-center gap-3">
              <Hospital className="text-green-600 w-6 h-6" />
              <h3 className="text-lg font-medium text-green-800">Hospital / Medical</h3>
            </div>
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-1">{nearestServices.hospital.name}</h4>
              {nearestServices.hospital.address && (
                <p className="text-gray-600 text-sm mb-3">{nearestServices.hospital.address}</p>
              )}
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <Navigation className="w-4 h-4" />
                  <span>{formatDistance(nearestServices.hospital.distance)} away</span>
                </div>
                {nearestServices.hospital.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a 
                      href={`tel:${formatPhone(nearestServices.hospital.phone)}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {formatPhone(nearestServices.hospital.phone)}
                    </a>
                  </div>
                )}
                {nearestServices.hospital.emergency && (
                  <div className="text-red-600 font-medium mt-1">
                    24/7 Emergency Room
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => handleGoClick('hospital')}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium
                    ${activeRoute === 'hospital' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-green-700 hover:bg-gray-200'}
                    transition-colors
                  `}
                >
                  {activeRoute === 'hospital' ? 'Hide Route' : 'Show Route'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <style>{styles}</style>
      
      <div className="flex items-center gap-3 mb-6">
        <Map className="w-7 h-7 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-800">Safety Locator</h1>
      </div>

      {!locationGranted && renderLocationError()}
      
      {loading ? renderLoadingState() : (
        <div>
          {error ? renderLocationError() : (
            <>  <div className="map-container relative rounded-xl overflow-hidden " style={{ zIndex: 1 }}>

            
              {/* Map container */}
              <div className="h-96 relative rounded-xl overflow-hidden border border-gray-300 shadow-md mb-6">
                {userLocation && (
                  <MapContainer 
                    center={[userLocation.lat, userLocation.lng]} 
                    zoom={15} 
                    className="h-full w-full modern-map"
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* User location with pulsing effect */}
                    <Marker 
                      position={[userLocation.lat, userLocation.lng]} 
                      icon={createPulseIcon('#3b82f6')}
                    >
                      <Popup className="modern-popup">
                        <div className="text-sm">
                          <strong className="text-blue-600 block mb-1">Your Location</strong>
                          <p className="text-gray-600">
                            {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                    
                    {/* User location accuracy circle */}
                    <Circle 
                      center={[userLocation.lat, userLocation.lng]}
                      radius={100}
                      pathOptions={{
                        color: '#3b82f6',
                        fillColor: '#3b82f6',
                        fillOpacity: 0.1,
                        weight: 1
                      }}
                    />
                    
                    {/* Police marker */}
                    {nearestServices?.police && (
                      <Marker 
                        position={[nearestServices.police.lat, nearestServices.police.lng]} 
                        icon={icons.police}
                      >
                        <Popup className="modern-popup">
                          <div className="text-sm space-y-1">
                            <strong className="text-blue-600 block">{nearestServices.police.name}</strong>
                            {nearestServices.police.address && <p>{nearestServices.police.address}</p>}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Navigation className="w-4 h-4" />
                              <span>{formatDistance(nearestServices.police.distance)} away</span>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Hospital marker */}
                    {nearestServices?.hospital && (
                      <Marker 
                        position={[nearestServices.hospital.lat, nearestServices.hospital.lng]} 
                        icon={icons.hospital}
                      >
                        <Popup className="modern-popup">
                          <div className="text-sm space-y-1">
                            <strong className="text-green-600 block">{nearestServices.hospital.name}</strong>
                            {nearestServices.hospital.address && <p>{nearestServices.hospital.address}</p>}
                            <div className="flex items-center gap-2 text-gray-600">
                              <Navigation className="w-4 h-4" />
                              <span>{formatDistance(nearestServices.hospital.distance)} away</span>
                            </div>
                            {nearestServices.hospital.emergency && (
                              <div className="text-red-600 font-medium">24/7 Emergency Room</div>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    )}
                    
                    {/* Render POI points if filter is active */}
                    {renderPOIPoints()}
                    
                    {/* Routing machine for directions */}
                    {activeRoute === 'police' && nearestServices?.police && (
                      <RoutingMachine 
                        startPoint={userLocation} 
                        endPoint={{
                          lat: nearestServices.police.lat,
                          lng: nearestServices.police.lng
                        }}
                        color="#3b82f6"
                      />
                    )}
                    
                    {activeRoute === 'hospital' && nearestServices?.hospital && (
                      <RoutingMachine 
                        startPoint={userLocation} 
                        endPoint={{
                          lat: nearestServices.hospital.lat,
                          lng: nearestServices.hospital.lng
                        }}
                        color="#10b981"
                      />
                    )}
                    
                    {/* Map controller for view management */}
                    <MapViewController 
                      userLocation={userLocation} 
                      hasRouteActive={!!activeRoute}
                    />
                    
                    {/* POI finder component */}
                    {activePOIFilter && (
                      <POIFinder
                        userLocation={userLocation}
                        poiCategory={activePOIFilter}
                        setFoundPOIs={setFoundPOIs}
                      />
                    )}
                    
                    {/* Map legend */}
                    <div className="map-legend">
                      <div className="legend-item">
                        <div className="legend-color" style={{ backgroundColor: '#3b82f6' }}></div>
                        <span>Your Location</span>
                      </div>
                      {nearestServices?.police && (
                        <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: '#1e40af' }}></div>
                          <span>Police</span>
                        </div>
                      )}
                      {nearestServices?.hospital && (
                        <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
                          <span>Hospital</span>
                        </div>
                      )}
                      {activePOIFilter === 'schools' && foundPOIs.length > 0 && (
                        <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: '#818cf8' }}></div>
                          <span>Schools</span>
                        </div>
                      )}
                      {activePOIFilter === 'shops' && foundPOIs.length > 0 && (
                        <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
                          <span>Shops</span>
                        </div>
                      )}
                      {activePOIFilter === 'restaurants' && foundPOIs.length > 0 && (
                        <div className="legend-item">
                          <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
                          <span>Restaurants</span>
                        </div>
                      )}
                    </div>
                  </MapContainer>
                )}
              </div>
              
              {/* POI filter buttons */}
              {userLocation && renderPOIFilters()}
              
              {/* Services cards */}
              <h2 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Nearest Emergency Services
              </h2>
              {renderServiceCards()}
              </div>
              
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportResponse;