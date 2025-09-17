import React, { useState, useMemo } from 'react';
import { Carpool, BookingRequest, UserProfile } from '../types';
import CarpoolCard from './CarpoolCard';
import BookingModal from './BookingModal';

interface FindRideProps {
  carpools: Carpool[];
  bookings: BookingRequest[];
  onBook: (carpoolId: string, day: string) => void;
  onCancelBooking: (bookingId: string) => void;
  currentUser: UserProfile;
  onStartChat: (carpoolId: string, otherUserId: string) => void;
}

const FindRide: React.FC<FindRideProps> = ({ carpools, onBook, onCancelBooking, bookings, currentUser, onStartChat }) => {
  const [selectedCarpool, setSelectedCarpool] = useState<{ carpoolId: string; day: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleBookClick = (carpoolId: string, day: string) => {
    setSelectedCarpool({ carpoolId, day });
  };

  const handleConfirmBooking = () => {
    if (selectedCarpool) {
      onBook(selectedCarpool.carpoolId, selectedCarpool.day);
      setSelectedCarpool(null);
    }
  };
  
  const userHasCarpool = carpools.some(c => c.driverId === currentUser.id);
  
  const availableCarpools = useMemo(() => {
    return carpools
      .filter(c => c.driverId !== currentUser.id)
      .filter(c => 
          c.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.departureLocation.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [carpools, currentUser, searchTerm]);


  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Available Carpools</h2>
        <div className="relative w-full sm:w-auto">
          <input 
            type="text"
            placeholder="Search by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-72 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      {userHasCarpool && (
          <div className="mb-6 p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-md">
              <p>You are viewing carpools offered by other users. To manage your own carpool, switch to the "Offer a Ride" view.</p>
          </div>
      )}
      <div className="space-y-6">
        {availableCarpools.length > 0 ? (
          availableCarpools.map(carpool => (
            <CarpoolCard 
              key={carpool.id} 
              carpool={carpool} 
              onBookClick={handleBookClick} 
              onCancelBooking={onCancelBooking}
              bookings={bookings}
              currentUser={currentUser}
              onStartChat={onStartChat}
            />
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-700">No carpools found.</h3>
            <p className="text-gray-500 mt-2">{searchTerm ? 'Try adjusting your search term.' : 'Check back later or ask a friend to offer a ride!'}</p>
          </div>
        )}
      </div>
      {selectedCarpool && (
        <BookingModal
          onClose={() => setSelectedCarpool(null)}
          onConfirm={handleConfirmBooking}
        />
      )}
    </div>
  );
};

export default FindRide;