// pages/admin/events-workshops.jsx
import { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import AdminLayout from '/src/pages/Admin/AdminLayout';

export default function EventsWorkshops() {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Self-Defense Workshop',
      description: 'Learn basic self-defense techniques from our expert instructors',
      date: '2023-06-15',
      time: '14:00',
      location: 'Main Campus Gym',
      attendees: 24,
      capacity: 30
    },
    {
      id: 2,
      title: 'Mental Health Awareness Seminar',
      description: 'Discussion on mental health resources and coping strategies',
      date: '2023-06-22',
      time: '10:00',
      location: 'Auditorium B',
      attendees: 15,
      capacity: 50
    },
    {
      id: 3,
      title: 'Gender Equality Forum',
      description: 'Panel discussion on promoting gender equality on campus',
      date: '2023-07-05',
      time: '16:00',
      location: 'Student Center',
      attendees: 8,
      capacity: 40
    }
  ]);

  const formatDate = (dateString) => {
    const options = { weekday: 'short', day: 'numeric', month: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <AdminLayout activeNavItem="Events & Workshops">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Events & Workshops</h2>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Add New Event
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.length === 0 ? (
            <div className="col-span-3 p-8 text-center text-gray-500">
              No upcoming events found
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b">
                  <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                </div>
                <div className="p-4">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(event.date)} at {event.time}
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Location: {event.location}
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-sm text-gray-700 mb-1">
                      <span>Attendees</span>
                      <span>{event.attendees}/{event.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button className="flex-1 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100">
                      Edit
                    </button>
                    <button className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                      View Attendees
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}