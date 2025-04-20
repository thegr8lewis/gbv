import { useState, useEffect } from 'react';

export default function UpdatesScreen() {
  const [updates, setUpdates] = useState([]);
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('updates');
  const [calendarModal, setCalendarModal] = useState({ isOpen: false, event: null });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch updates from your backend API
        const updatesResponse = await fetch('http://localhost:8000/api/public/updates/');
        if (!updatesResponse.ok) {
          throw new Error('Failed to fetch updates');
        }
        const updatesData = await updatesResponse.json();
        setUpdates(updatesData);

        
        const eventsResponse = await fetch('http://localhost:8000/api/public/events/');
        if (!eventsResponse.ok) {
          throw new Error('Failed to fetch events');
        }
        const eventsData = await eventsResponse.json();
        setEvents(eventsData);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Function to open calendar modal
  const openCalendarModal = (event) => {
    setCalendarModal({ isOpen: true, event });
  };

  // Function to close calendar modal
  const closeCalendarModal = () => {
    setCalendarModal({ isOpen: false, event: null });
  };

  // Function to create calendar links
  const createCalendarLinks = (event) => {
    try {
      // Get current date information for fallbacks
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const currentDay = now.getDate();
      
      // Set default start and end time (fallback)
      let startDate = new Date(currentYear, currentMonth, currentDay, 9, 0, 0);
      let endDate = new Date(currentYear, currentMonth, currentDay, 10, 0, 0);
      
      // Try to parse the date from the event
      if (event.date) {
        // Handle various date formats
        const dateString = event.date.trim();
        
        // Extract month and day
        let month, day, year;
        
        // Pattern: "Apr 20" or "April 20" or "Apr 20, 2025"
        const monthDayPattern = /([A-Za-z]+)\s+(\d{1,2})(?:,\s*(\d{4}))?/;
        const monthDayMatch = dateString.match(monthDayPattern);
        
        if (monthDayMatch) {
          const monthName = monthDayMatch[1];
          day = parseInt(monthDayMatch[2], 10);
          year = monthDayMatch[3] ? parseInt(monthDayMatch[3], 10) : currentYear;
          
          // Convert month name to month number (0-11)
          const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];
          const monthAbbreviations = [
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
          ];
          
          month = monthNames.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
          if (month === -1) {
            month = monthAbbreviations.findIndex(m => m.toLowerCase() === monthName.toLowerCase());
          }
          
          if (month !== -1) {
            // Create a date object for the event date
            startDate = new Date(year, month, day, 9, 0, 0); // Default to 9 AM
            endDate = new Date(year, month, day, 10, 0, 0);  // Default to 10 AM (1 hour event)
          }
        }
      }
      
      // Try to parse the time
      if (event.time) {
        const timeString = event.time.trim();
        
        // Pattern for time ranges like "2:00 PM - 4:00 PM" or "14:00 - 16:00"
        const timeRangePattern = /(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)\s*-\s*(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm)?)/i;
        const timeRangeMatch = timeString.match(timeRangePattern);
        
        if (timeRangeMatch) {
          const startTimeStr = timeRangeMatch[1].trim();
          const endTimeStr = timeRangeMatch[2].trim();
          
          // Parse start time
          const startTimeParts = startTimeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/i);
          if (startTimeParts) {
            let hours = parseInt(startTimeParts[1], 10);
            const minutes = startTimeParts[2] ? parseInt(startTimeParts[2], 10) : 0;
            const period = startTimeParts[3] ? startTimeParts[3].toUpperCase() : null;
            
            // Handle 12-hour format
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            startDate.setHours(hours, minutes, 0);
          }
          
          // Parse end time
          const endTimeParts = endTimeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/i);
          if (endTimeParts) {
            let hours = parseInt(endTimeParts[1], 10);
            const minutes = endTimeParts[2] ? parseInt(endTimeParts[2], 10) : 0;
            const period = endTimeParts[3] ? endTimeParts[3].toUpperCase() : null;
            
            // Handle 12-hour format
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            endDate.setHours(hours, minutes, 0);
          }
        } else {
          // Single time format like "2:00 PM" or "14:00"
          const singleTimePattern = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM|am|pm)?/i;
          const singleTimeMatch = timeString.match(singleTimePattern);
          
          if (singleTimeMatch) {
            let hours = parseInt(singleTimeMatch[1], 10);
            const minutes = singleTimeMatch[2] ? parseInt(singleTimeMatch[2], 10) : 0;
            const period = singleTimeMatch[3] ? singleTimeMatch[3].toUpperCase() : null;
            
            // Handle 12-hour format
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            startDate.setHours(hours, minutes, 0);
            endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour event by default
          }
        }
      }
      
      // Ensure end date is after start date
      if (endDate <= startDate) {
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default to 1 hour if parsing failed
      }
      
      // Format dates for calendar URLs
      // For Google Calendar
      const formatForGoogle = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '');
      };
      
      // For other calendar services that need ISO strings
      const startISOString = startDate.toISOString();
      const endISOString = endDate.toISOString();
      
      // For Google Calendar specifically
      const startGoogleFormat = formatForGoogle(startDate);
      const endGoogleFormat = formatForGoogle(endDate);
      
      // Encode details for URLs
      const title = encodeURIComponent(event.title || 'Event');
      const location = encodeURIComponent(event.location || '');
      const details = encodeURIComponent(`Event details for ${event.title || 'Event'}`);
      
      // Create calendar URLs
      const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startGoogleFormat}/${endGoogleFormat}&details=${details}&location=${location}&sf=true&output=xml`;
      
      const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&startdt=${startISOString}&enddt=${endISOString}&location=${location}&body=${details}`;
      
      const yahooUrl = `https://calendar.yahoo.com/?title=${title}&st=${startGoogleFormat}&et=${endGoogleFormat}&desc=${details}&in_loc=${location}`;
      
      // Create an .ics file for Apple Calendar and others
      const formatICSDate = (date) => {
        return date.toISOString().replace(/-|:|\.\d+/g, '').substring(0, 15) + 'Z';
      };
      
      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'BEGIN:VEVENT',
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:${event.title || 'Event'}`,
        `DESCRIPTION:Event details for ${event.title || 'Event'}`,
        `LOCATION:${event.location || ''}`,
        'END:VEVENT',
        'END:VCALENDAR'
      ].join('\n');
      
      const icsFile = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const icsUrl = URL.createObjectURL(icsFile);
      
      return {
        google: googleUrl,
        outlook: outlookUrl,
        yahoo: yahooUrl,
        ics: icsUrl
      };
    } catch (error) {
      console.error('Error creating calendar links:', error);
      // Return fallback URLs that will work even if the date parsing failed
      return {
        google: `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title || 'Event')}`,
        outlook: `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(event.title || 'Event')}`,
        yahoo: `https://calendar.yahoo.com/?title=${encodeURIComponent(event.title || 'Event')}`,
        ics: '#'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-t-4 border-blue-600 border-opacity-90 animate-spin"></div>
          <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-b-4 border-blue-300 border-opacity-50 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-red-500">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">Error Loading Data</h3>
            <p className="text-red-700 mt-1">{error}</p>
            <p className="text-red-600 mt-2">Please try again later or contact support.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4">
      {/* Header with tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('updates')}
            className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200 ${
              activeTab === 'updates'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Latest Updates
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`py-4 px-1 border-b-2 font-medium text-lg transition-colors duration-200 ${
              activeTab === 'events'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming Events
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="transition-all duration-300">
        {activeTab === 'updates' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Latest Updates</h2>
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">
                {updates.length} {updates.length === 1 ? 'Update' : 'Updates'}
              </span>
            </div>
            
            <p className="text-gray-600">
              Stay informed about recent developments, upcoming events, and new resources.
            </p>
            
            <div className="space-y-6 mt-8">
              {updates.length > 0 ? (
                updates.map((update, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-xl text-gray-900">{update.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{update.date}</p>
                      </div>
                      <span className="bg-gray-100 h-8 w-8 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-gray-700 leading-relaxed">{update.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-500 mt-4 text-lg">No updates available at this time.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Events</h2>
              <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full">
                {events.length} {events.length === 1 ? 'Event' : 'Events'}
              </span>
            </div>
            
            <div className="grid gap-6 mt-8">
              {events.length > 0 ? (
                events.map((event, index) => (
                  <div 
                    key={index} 
                    className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="bg-indigo-600 text-white p-6 flex flex-col items-center justify-center md:w-40">
                        <span className="text-lg font-bold">{event.date?.split(',')[0] || 'TBA'}</span>
                        <span className="text-sm opacity-80">{event.time || 'Time TBA'}</span>
                      </div>
                      
                      <div className="p-6 flex-1">
                        <h3 className="font-semibold text-xl">{event.title || 'Untitled Event'}</h3>
                        <div className="flex items-start mt-2">
                          <svg className="h-5 w-5 text-gray-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-gray-600">{event.location || 'Location TBA'}</span>
                        </div>
                        
                        <div className="mt-4 flex justify-end">
                          <button 
                            onClick={() => openCalendarModal(event)}
                            className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
                          >
                            <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            Add to calendar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-gray-50 rounded-xl p-8 text-center">
                  <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 mt-4 text-lg">No upcoming events scheduled.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Modal */}
      {calendarModal.isOpen && calendarModal.event && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
            {/* Close button */}
            <button 
              onClick={closeCalendarModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold mb-4">Add to Your Calendar</h3>
            <p className="text-gray-600 mb-2">{calendarModal.event.title}</p>
            <p className="text-gray-500 text-sm mb-6">{calendarModal.event.date}, {calendarModal.event.time} • {calendarModal.event.location}</p>

            <div className="space-y-3">
              {/* Calendar service options */}
              {(() => {
                const links = createCalendarLinks(calendarModal.event);
                return (
                  <>
                    <a 
                      href={links.google}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full"
                    >
                      <div className="w-8 h-8 mr-3 flex items-center justify-center text-blue-500">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M21.5,10.5h-10v3h5.8c-0.7,2-2.1,3-4.8,3c-2.8,0-5-2.3-5-5s2.2-5,5-5c1.4,0,2.2,0.5,3,1.2l2.5-2.5C16.5,3.6,14.8,3,12.5,3c-4.4,0-8,3.6-8,8s3.6,8,8,8c6.5,0,8.5-5.5,8-9.5C20.5,9.3,21.5,10.5,21.5,10.5z"/>
                        </svg>
                      </div>
                      <span>Google Calendar</span>
                    </a>

                    <a 
                      href={links.outlook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full"
                    >
                      <div className="w-8 h-8 mr-3 flex items-center justify-center text-blue-700">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 11.5V14H17V11.5C17 9.98 13.5 9 12 9C10.5 9 7 9.98 7 11.5M12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5M20 2H4C2.9 2 2 2.9 2 4V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V4C22 2.9 21.1 2 20 2"/>
                        </svg>
                      </div>
                      <span>Outlook Calendar</span>
                    </a>

                    <a 
                      href={links.yahoo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full"
                    >
                      <div className="w-8 h-8 mr-3 flex items-center justify-center text-purple-700">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M13.5,12.7c-0.5,0.6-1,1.1-1.5,1.7c-0.6-0.6-1.1-1.2-1.6-1.7C8.3,10.3,6.2,7.9,4.1,5.4c0-0.1,0-0.1,0-0.2 c1.9,0,3.8,0,5.7,0c0.7,1,1.4,2,2.2,3c0.7-1,1.4-2,2.2-3c1.9,0,3.8,0,5.7,0c0,0.1,0,0.1,0,0.2c-2.1,2.4-4.2,4.8-6.3,7.2 C13.5,12.7,13.5,12.7,13.5,12.7z M12.8,16.9c0,0.7,0,1.3,0,2c-0.5,0-1,0-1.6,0c0-0.7,0-1.3,0-2c-2.5-3-5.1-5.9-7.6-8.9 c0-0.7,0-1.3,0-2c0.5,0,1,0,1.6,0c2,2.3,4,4.7,6,7c2-2.3,4-4.7,6-7c0.5,0,1,0,1.6,0c0,0.7,0,1.3,0,2c-2.5,3-5,5.9-7.6,8.9 C12.4,16.3,12.6,16.6,12.8,16.9z"/>
                        </svg>
                      </div>
                      <span>Yahoo Calendar</span>
                    </a>

                    <a 
                      href={links.ics}
                      download={`${calendarModal.event.title ? calendarModal.event.title.replace(/\s+/g, '-') : 'event'}.ics`}
                      className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full"
                    >
                      <div className="w-8 h-8 mr-3 flex items-center justify-center text-gray-700">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                      </div>
                      <span>Apple Calendar (.ics)</span>
                    </a>
                  </>
                );
              })()}
            </div>

            <div className="text-center mt-6">
              <button 
                onClick={closeCalendarModal}
                className="text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}