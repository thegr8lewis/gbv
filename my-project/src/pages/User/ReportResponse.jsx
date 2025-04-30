import { MapPin, Phone, AlertCircle, Heart, Navigation, Stethoscope, Shield, Map } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ReportResponse({ reportData }) {
  const [emergencyResources, setEmergencyResources] = useState({
    nearestHospital: null,
    nearestPolice: null,
    safeSpaceNumber: "0800-SAFE-SPACE (0800-7233-7722)",
    emergencyNumber: "911"
  });
  
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [locationStatus, setLocationStatus] = useState("idle");
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [apiError, setApiError] = useState(null);

  // Replace with your actual Google API key
  const GOOGLE_API_KEY = "YOUR_GOOGLE_API_KEY";
  
  // CORS proxy URL - you can use your own or a public one
  const CORS_PROXY = "https://cors-anywhere.herokuapp.com/";

  // Get the user's location with proper error handling
  useEffect(() => {
    const getUserLocation = () => {
      setLocationStatus("loading");
      setLocationError(null);
      
      if (!navigator.geolocation) {
        setLocationStatus("error");
        setLocationError("Geolocation is not supported by your browser");
        setLoading(false);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          setLocationStatus("success");
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationStatus("error");
          
          let errorMessage = "An unknown error occurred getting your location.";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location permission denied. Using default location.";
              // Set default location (Nairobi coordinates as fallback)
              setUserLocation({ latitude: -1.286389, longitude: 36.817223 });
              setLocationStatus("success");
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Using default location.";
              setUserLocation({ latitude: -1.286389, longitude: 36.817223 });
              setLocationStatus("success");
              break;
            case error.TIMEOUT:
              errorMessage = "The request to get location timed out. Using default location.";
              setUserLocation({ latitude: -1.286389, longitude: 36.817223 });
              setLocationStatus("success");
              break;
          }
          
          setLocationError(errorMessage);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
      );
    };
    
    getUserLocation();
  }, []);

  // Fetch nearby resources when user location is available
  useEffect(() => {
    if (userLocation && locationStatus === "success") {
      fetchNearbyResources(userLocation);
    }
  }, [userLocation, locationStatus]);

  const fetchPlaceDetails = async (placeId) => {
    try {
      const response = await fetch(
        `${CORS_PROXY}https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,geometry&key=${GOOGLE_API_KEY}`,
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== "OK") {
        throw new Error(data.error_message || "Failed to fetch place details");
      }
      
      return data.result;
    } catch (error) {
      console.error("Error fetching place details:", error);
      return null;
    }
  };

  const fetchNearbyPlaces = async (location, type) => {
    try {
      const { latitude, longitude } = location;
      const response = await fetch(
        `${CORS_PROXY}https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=${type}&key=${GOOGLE_API_KEY}`,
        {
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status !== "OK") {
        throw new Error(data.error_message || `Failed to fetch ${type} places`);
      }
      
      if (data.results.length === 0) {
        return null;
      }
      
      // Get the nearest place (first result)
      const nearestPlace = data.results[0];
      
      // Fetch additional details
      const details = await fetchPlaceDetails(nearestPlace.place_id);
      
      if (!details) {
        return {
          name: nearestPlace.name || `Unknown ${type}`,
          address: nearestPlace.vicinity || "Address not available",
          phone: "Not available",
          distance: calculateDistance(latitude, longitude, nearestPlace.geometry.location.lat, nearestPlace.geometry.location.lng) + " miles",
          directions: `https://www.google.com/maps/dir/?api=1&destination=${nearestPlace.geometry.location.lat},${nearestPlace.geometry.location.lng}`
        };
      }
      
      return {
        name: details.name,
        address: details.formatted_address,
        phone: details.formatted_phone_number || "Not available",
        distance: calculateDistance(latitude, longitude, details.geometry.location.lat, details.geometry.location.lng) + " miles",
        directions: `https://www.google.com/maps/dir/?api=1&destination=${details.geometry.location.lat},${details.geometry.location.lng}`
      };
    } catch (error) {
      console.error(`Error fetching ${type} places:`, error);
      setApiError(`Failed to fetch ${type} data. ${error.message}`);
      return null;
    }
  };

  // Helper function to calculate distance between two coordinates
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c * 0.621371; // Convert km to miles
    return distance.toFixed(1);
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI/180);
  };

  const fetchNearbyResources = async (location) => {
    setLoading(true);
    setApiError(null);
    
    try {
      const [hospital, police] = await Promise.all([
        fetchNearbyPlaces(location, 'hospital'),
        fetchNearbyPlaces(location, 'police')
      ]);
      
      // Fallback data if API fails
      const defaultHospital = {
        name: "Nairobi Hospital",
        address: "Argwings Kodhek Rd, Nairobi, Kenya",
        phone: "+254 20 284 6000",
        distance: "3.2 miles",
        directions: "https://www.google.com/maps/dir/?api=1&destination=-1.286389,36.817223"
      };
      
      const defaultPolice = {
        name: "Central Police Station",
        address: "Nairobi Central, Kenya",
        phone: "+254 20 222 222",
        distance: "2.5 miles",
        directions: "https://www.google.com/maps/dir/?api=1&destination=-1.28333,36.81667"
      };
      
      setEmergencyResources(prev => ({
        ...prev,
        nearestHospital: hospital || defaultHospital,
        nearestPolice: police || defaultPolice
      }));
      
      generateRecommendations(reportData?.category);
    } catch (error) {
      console.error("Error fetching nearby resources:", error);
      setApiError("Failed to find nearby emergency resources. Using default locations.");
      
      // Set default data if all fails
      setEmergencyResources(prev => ({
        ...prev,
        nearestHospital: {
          name: "Nairobi Hospital",
          address: "Argwings Kodhek Rd, Nairobi, Kenya",
          phone: "+254 20 284 6000",
          distance: "3.2 miles",
          directions: "https://www.google.com/maps/dir/?api=1&destination=-1.286389,36.817223"
        },
        nearestPolice: {
          name: "Central Police Station",
          address: "Nairobi Central, Kenya",
          phone: "+254 20 222 222",
          distance: "2.5 miles",
          directions: "https://www.google.com/maps/dir/?api=1&destination=-1.28333,36.81667"
        }
      }));
    } finally {
      setLoading(false);
    }
  };
  
  const generateRecommendations = (category) => {
    // ... (keep your existing generateRecommendations implementation)
    // (omitted for brevity - same as in your original code)
  };
  
  const getFirstAidInstructions = () => {
    // ... (keep your existing getFirstAidInstructions implementation)
    // (omitted for brevity - same as in your original code)
  };

  const renderLocationStatus = () => {
    if (apiError) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {apiError}
              </p>
            </div>
          </div>
        </div>
      );
    }

    switch(locationStatus) {
      case "loading":
        return (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Getting your location to find nearby resources...
                </p>
              </div>
            </div>
          </div>
        );
      case "error":
        return (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {locationError}
                </p>
                <div className="mt-2 space-x-2">
                  <button 
                    onClick={() => window.location.reload()}
                    className="text-xs font-medium text-red-700 hover:text-red-600"
                  >
                    Try again
                  </button>
                  <button
                    onClick={() => {
                      setLocationStatus("success");
                      setUserLocation({ latitude: 0, longitude: 0 }); // Default location
                    }}
                    className="text-xs font-medium text-blue-700 hover:text-blue-600"
                  >
                    Continue without location
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case "success":
        return (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <MapPin className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  {userLocation.latitude !== 0 && userLocation.longitude !== 0 
                    ? "Using your current location to find nearby resources."
                    : "Using default location since your location was not available."}
                </p>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading && locationStatus !== "error") {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading support resources based on your location...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-xl space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Support & Resources</h2>
        <p className="text-gray-600">
          Based on the details you provided, we've compiled some resources to help you through this situation.
        </p>
      </div>

      {/* Location Status Message */}
      {renderLocationStatus()}

      {/* Immediate Recommendations Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <AlertCircle className="mr-2 text-blue-600" size={20} />
          Recommended Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm mr-3">
                  {rec.icon}
                </div>
                <h4 className="font-medium text-gray-800">{rec.title}</h4>
              </div>
              <p className="text-gray-600 text-sm">{rec.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* First Aid Instructions if applicable */}
      {getFirstAidInstructions() && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
            <Stethoscope className="mr-2" size={20} />
            First Aid Instructions
          </h3>
          {getFirstAidInstructions()}
          <p className="text-sm text-blue-700 mt-3 font-medium">
            These are basic first aid guidelines. Always seek professional medical help for injuries.
          </p>
        </div>
      )}

      {/* Emergency Resources Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Shield className="mr-2 text-blue-600" size={20} />
          Emergency Resources Near You
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hospital Card */}
          {emergencyResources.nearestHospital ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-blue-800 flex items-center">
                  <Stethoscope className="mr-2" size={16} />
                  Nearest Hospital
                </h4>
              </div>
              <div className="p-4">
                <h5 className="font-medium text-gray-800 mb-2">{emergencyResources.nearestHospital.name}</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <MapPin className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-gray-600">{emergencyResources.nearestHospital.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="text-gray-500 mr-2 flex-shrink-0" size={16} />
                    <a href={`tel:${emergencyResources.nearestHospital.phone}`} className="text-blue-600 hover:underline">
                      {emergencyResources.nearestHospital.phone}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Navigation className="text-gray-500 mr-2 flex-shrink-0" size={16} />
                    <span className="text-gray-600">{emergencyResources.nearestHospital.distance} away</span>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href={emergencyResources.nearestHospital.directions} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                  >
                    <Navigation className="mr-2" size={16} />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-blue-800 flex items-center">
                  <Stethoscope className="mr-2" size={16} />
                  Nearest Hospital
                </h4>
              </div>
              <div className="p-4 text-center text-gray-500">
                <p>No hospitals found nearby</p>
              </div>
            </div>
          )}
          
          {/* Police Station Card */}
          {emergencyResources.nearestPolice ? (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-indigo-800 flex items-center">
                  <Shield className="mr-2" size={16} />
                  Nearest Police Station
                </h4>
              </div>
              <div className="p-4">
                <h5 className="font-medium text-gray-800 mb-2">{emergencyResources.nearestPolice.name}</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <MapPin className="text-gray-500 mr-2 flex-shrink-0 mt-0.5" size={16} />
                    <span className="text-gray-600">{emergencyResources.nearestPolice.address}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="text-gray-500 mr-2 flex-shrink-0" size={16} />
                    <a href={`tel:${emergencyResources.nearestPolice.phone}`} className="text-blue-600 hover:underline">
                      {emergencyResources.nearestPolice.phone}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Navigation className="text-gray-500 mr-2 flex-shrink-0" size={16} />
                    <span className="text-gray-600">{emergencyResources.nearestPolice.distance} away</span>
                  </div>
                </div>
                <div className="mt-4">
                  <a 
                    href={emergencyResources.nearestPolice.directions} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200"
                  >
                    <Navigation className="mr-2" size={16} />
                    Get Directions
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-gray-200">
                <h4 className="font-semibold text-indigo-800 flex items-center">
                  <Shield className="mr-2" size={16} />
                  Nearest Police Station
                </h4>
              </div>
              <div className="p-4 text-center text-gray-500">
                <p>No police stations found nearby</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Map Preview */}
      {userLocation && locationStatus === "success" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Map className="mr-2 text-blue-600" size={20} />
            Nearby Emergency Locations
          </h3>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-700 mb-2">
              Map showing your location and nearby emergency resources
            </p>
            <a
              href={`https://maps.google.com/?q=${userLocation.latitude},${userLocation.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Map className="mr-2" size={16} />
              Open Full Map View
            </a>
          </div>
        </div>
      )}
      
      {/* Emergency Contact Numbers */}
      <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-5 border border-red-100">
        <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
          <Phone className="mr-2" size={20} />
          Emergency Contacts
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white bg-opacity-70 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Emergency Services</h4>
              <p className="text-sm text-gray-600">Police, Ambulance, Fire</p>
            </div>
            <a 
              href={`tel:${emergencyResources.emergencyNumber}`} 
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center"
            >
              <Phone className="mr-2" size={16} />
              {emergencyResources.emergencyNumber}
            </a>
          </div>
          <div className="bg-white bg-opacity-70 rounded-lg p-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-800">Safe Space Helpline</h4>
              <p className="text-sm text-gray-600">24/7 Crisis Support</p>
            </div>
            <a 
              href={`tel:${emergencyResources.safeSpaceNumber.replace(/[^0-9]/g, '')}`} 
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors duration-200 flex items-center"
            >
              <Phone className="mr-2" size={16} />
              Call Now
            </a>
          </div>
        </div>
      </div>
      
      {/* Safety Tips */}
      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <Shield className="mr-2 text-blue-600" size={20} />
          Safety Tips
        </h3>
        <div className="bg-gray-50 rounded-xl p-4">
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Stay in public areas where there are other people around</span>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Share your location with a trusted friend or family member</span>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Keep your phone charged and accessible at all times</span>
            </li>
            <li className="flex items-start">
              <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-700" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-700">Trust your instincts - if a situation feels unsafe, leave immediately</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="text-center text-gray-500 text-sm mt-6">
        All information is handled with strict confidentiality. Your safety is our priority.
      </div>
    </div>
  );
}