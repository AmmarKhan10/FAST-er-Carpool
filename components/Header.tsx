import React from 'react';
import { View } from '../types';

interface HeaderProps {
  currentView: View;
  onViewChange: (view: View) => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, onViewChange, onLogout }) => {
  const activeClass = "bg-blue-600 text-white";
  const inactiveClass = "bg-white text-gray-700 hover:bg-gray-200";

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <svg className="h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">
            FAST Carpool Connect
          </h1>
        </div>
        <div className="flex items-center space-x-4">
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
            <button
                onClick={() => onViewChange(View.FIND)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${currentView === View.FIND ? activeClass : inactiveClass}`}
            >
                Find a Ride
            </button>
            <button
                onClick={() => onViewChange(View.OFFER)}
                className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 ${currentView === View.OFFER ? activeClass : inactiveClass}`}
            >
                Offer a Ride
            </button>
            </div>
             <button
                onClick={onLogout}
                className="px-4 py-2 text-sm font-semibold rounded-md transition-colors duration-200 bg-red-500 text-white hover:bg-red-600"
            >
                Logout
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
