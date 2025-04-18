const API_BASE_URL = 'http://localhost:8000/api';  // Django development server

export const submitReport = async (reportData) => {
  const formData = new FormData();
  
  // Append all fields to formData
  Object.keys(reportData).forEach(key => {
    if (key === 'evidence' && reportData[key]) {
      formData.append(key, reportData[key]);
    } else if (reportData[key] !== null && reportData[key] !== undefined) {
      formData.append(key, reportData[key]);
    }
  });

  try {
    const response = await fetch(`${API_BASE_URL}/reports/`, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let the browser set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit report');
    }

    return await response.json();
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

export const fetchEmergencyContacts = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/emergency-contacts`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch emergency contacts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching emergency contacts:', error);
    throw error;
  }
};

export const fetchResources = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/resources`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch resources');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw error;
  }
};

export const fetchUpdates = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/updates`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch updates');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching updates:', error);
    throw error;
  }
};