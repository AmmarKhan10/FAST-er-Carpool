import React, { useState } from 'react';
import { Carpool, BookingRequest, UserProfile } from '../types';
import CarpoolCard from './CarpoolCard';
import BookingModal from './BookingModal';

interface FindRideProps {
  carpools: Carpool[];
  bookings: BookingRequest[];
  onBook: (carpoolId: string, day: string) => void;
  currentUser: UserProfile;
  onStartChat: (carpoolId: string, otherUserId: string) => void;
}

const FindRide: React.FC<FindRideProps> = ({ carpools, onBook, bookings, currentUser, onStartChat }) => {
  const [selectedCarpool, setSelectedCarpool] = useState<{ carpoolId: string; day: string } | null>(null);

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
  const availableCarpools = carpools.filter(c => c.driverId !== currentUser.id);

  return (
    <div>
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Available Carpools</h2>
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
              bookings={bookings}
              currentUser={currentUser}
              onStartChat={onStartChat}
            />
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <h3 className="text-xl font-semibold text-gray-700">No carpools available right now.</h3>
            <p className="text-gray-500 mt-2">Check back later or ask a friend to offer a ride!</p>
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