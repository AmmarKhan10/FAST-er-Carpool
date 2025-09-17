import React, { useState } from 'react';
import { Carpool, BookingRequest, User } from '../types';
import ScheduleForm from './ScheduleForm';
import RequestsList from './RequestsList';

interface OfferRideProps {
  myCarpool: Carpool | undefined;
  currentUser: User;
  onAddCarpool: (carpool: Omit<Carpool, 'id'>) => void;
  onUpdateCarpool: (carpool: Carpool) => void;
  onDeleteCarpool: (carpoolId: number) => void;
  bookingRequests: BookingRequest[];
  onUpdateBookingStatus: (bookingId: number, status: 'approved' | 'declined') => void;
  onStartChat: (carpoolId: number, otherUserId: number) => void;
}

const OfferRide: React.FC<OfferRideProps> = ({ myCarpool, currentUser, onAddCarpool, onUpdateCarpool, onDeleteCarpool, bookingRequests, onUpdateBookingStatus, onStartChat }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (!myCarpool && !isEditing) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800">You haven't offered a ride yet.</h2>
        <p className="text-gray-600 mt-2 mb-6">Create your weekly carpool schedule to help fellow students.</p>
        <button
          onClick={() => setIsEditing(true)}
          className="bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 transition-colors"
        >
          Create Your Carpool Schedule
        </button>
      </div>
    );
  }

  if (isEditing || !myCarpool) {
    return <ScheduleForm carpool={myCarpool} currentUser={currentUser} onSave={myCarpool ? onUpdateCarpool : onAddCarpool} onCancel={() => setIsEditing(false)} />;
  }

  const handleSeatsChange = (day: string, newSeats: number) => {
    const updatedSchedule = myCarpool.schedule.map(s => s.day === day ? { ...s, availableSeats: newSeats } : s);
    onUpdateCarpool({ ...myCarpool, schedule: updatedSchedule });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Your Dashboard</h2>
           <div>
            <button onClick={() => setIsEditing(true)} className="text-blue-600 hover:text-blue-800 font-semibold mr-4">Edit Schedule</button>
            <button onClick={() => onDeleteCarpool(myCarpool.id)} className="text-red-600 hover:text-red-800 font-semibold">Delete Carpool</button>
          </div>
        </div>
        <div className="space-y-4">
          {myCarpool.schedule.map(s => (
            <div key={s.day} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-bold text-lg text-gray-800">{s.day}</p>
                <p className="text-sm text-gray-600">Departure: {s.departureTime} | Return: {s.returnTime}</p>
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Available Seats:</label>
                <input 
                  type="number" 
                  min="0"
                  value={s.availableSeats}
                  onChange={(e) => handleSeatsChange(s.day, parseInt(e.target.value, 10))}
                  className="w-16 p-2 border border-gray-300 rounded-md text-center"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1">
        <RequestsList 
            requests={bookingRequests} 
            onUpdateStatus={onUpdateBookingStatus}
            onStartChat={(riderId) => onStartChat(myCarpool.id, riderId)}
        />
      </div>
    </div>
  );
};

export default OfferRide;
