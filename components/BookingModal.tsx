
import React from 'react';

interface BookingModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full m-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Booking</h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to send a booking request for this ride? The driver will need to approve it.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Confirm Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
