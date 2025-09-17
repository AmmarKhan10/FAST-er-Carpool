import React from 'react';
import { Carpool, BookingRequest, UserProfile } from '../types';

interface CarpoolCardProps {
  carpool: Carpool;
  onBookClick: (carpoolId: string, day: string) => void;
  bookings: BookingRequest[];
  currentUser: UserProfile;
  onStartChat: (carpoolId: string, otherUserId: string) => void;
}

const CarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a4 4 0 100 8 4 4 0 000-8z" clipRule="evenodd" />
    </svg>
);
const LocationIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 20l-4.95-5.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
    </svg>
);


const CarpoolCard: React.FC<CarpoolCardProps> = ({ carpool, onBookClick, bookings, currentUser, onStartChat }) => {
    
    const getBookingStatusForDay = (day: string): 'pending' | 'approved' | null => {
        const booking = bookings.find(b => b.carpoolId === carpool.id && b.day === day && b.riderId === currentUser.id);
        if(!booking) return null;
        return booking.status === 'pending' ? 'pending' : (booking.status === 'approved' ? 'approved' : null);
    }
    
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-2xl font-bold text-gray-800">{carpool.driverName}</h3>
                <div className="flex items-center text-sm text-gray-600 mt-2">
                    <CarIcon />
                    <span>{carpool.carModel}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600 mt-1">
                    <LocationIcon />
                    <span>{carpool.departureLocation}</span>
                </div>
            </div>
        </div>
      </div>
      <div className="p-6">
        <h4 className="text-lg font-semibold text-gray-700 mb-4">Weekly Schedule</h4>
        <div className="space-y-3">
          {carpool.schedule.map(s => {
            const status = getBookingStatusForDay(s.day);
            const isDisabled = s.availableSeats === 0 || status !== null;
            return (
                <div key={s.day} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                    <span className="font-semibold text-gray-800 w-24">{s.day}</span>
                    <div className="text-sm text-gray-600">
                    <p>Departure: <span className="font-medium text-blue-600">{s.departureTime}</span></p>
                    <p>Return: <span className="font-medium text-purple-600">{s.returnTime}</span></p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <span className={`text-sm font-bold ${s.availableSeats > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {s.availableSeats} Seats Left
                    </span>
                    { status === 'approved' ? (
                        <button
                            onClick={() => onStartChat(carpool.id, carpool.driverId)}
                            className="px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                            Booked & Chat
                        </button>
                    ) : (
                        <button
                            onClick={() => onBookClick(carpool.id, s.day)}
                            disabled={isDisabled}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 
                            ${
                                isDisabled
                                ? status === 'pending' ? 'bg-yellow-400 text-white cursor-not-allowed' :
                                'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                            }`}
                        >
                            {status === 'pending' ? 'Pending' : s.availableSeats > 0 ? 'Book a Seat' : 'Full'}
                        </button>
                    )}
                </div>
                </div>
            );
        })}
        </div>
      </div>
    </div>
  );
};

export default CarpoolCard;