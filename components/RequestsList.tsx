import React from 'react';
import { BookingRequest } from '../types';

interface RequestsListProps {
  requests: BookingRequest[];
  onUpdateStatus: (bookingId: string, status: 'approved' | 'declined') => void;
  onStartChat: (riderId: string) => void;
}

const StatusBadge: React.FC<{ status: 'pending' | 'approved' | 'declined' }> = ({ status }) => {
  const baseClasses = 'px-3 py-1 text-xs font-bold text-white rounded-full';
  if (status === 'approved') return <span className={`${baseClasses} bg-green-500`}>Approved</span>;
  if (status === 'declined') return <span className={`${baseClasses} bg-red-500`}>Declined</span>;
  return <span className={`${baseClasses} bg-yellow-500`}>Pending</span>;
};

const RequestsList: React.FC<RequestsListProps> = ({ requests, onUpdateStatus, onStartChat }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-4">Booking Requests</h3>
      <div className="space-y-4">
        {requests.length > 0 ? (
          requests.map(req => (
            <div key={req.id} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-gray-800">{req.riderName}</p>
                  <p className="text-sm text-gray-500">Day: {req.day}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
              {req.status === 'pending' && (
                <div className="mt-4 flex justify-end space-x-2">
                  <button 
                    onClick={() => onUpdateStatus(req.id, 'declined')}
                    className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-md hover:bg-red-200"
                  >
                    Decline
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(req.id, 'approved')}
                    className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                  >
                    Approve
                  </button>
                </div>
              )}
              {req.status === 'approved' && (
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={() => onStartChat(req.riderId)}
                        className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-md hover:bg-purple-200"
                    >
                        Message Rider
                    </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">No booking requests at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default RequestsList;