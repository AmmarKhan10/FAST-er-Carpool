import React, { useState } from 'react';
import { Carpool, DaySchedule, UserProfile } from '../types';

interface ScheduleFormProps {
  carpool?: Carpool;
  currentUser: UserProfile;
  onSave: (carpool: any) => void;
  onCancel: () => void;
}

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const ScheduleForm: React.FC<ScheduleFormProps> = ({ carpool, currentUser, onSave, onCancel }) => {
  const initialSchedule = daysOfWeek.map(day => {
    const existing = carpool?.schedule.find(s => s.day === day);
    return existing || { day, departureTime: '08:00', returnTime: '16:00', availableSeats: 3 };
  });

  const [carModel, setCarModel] = useState(carpool?.carModel || '');
  const [departureLocation, setDepartureLocation] = useState(carpool?.departureLocation || '');
  const [schedule, setSchedule] = useState<DaySchedule[]>(initialSchedule);

  const handleScheduleChange = <T,>(index: number, field: keyof DaySchedule, value: T) => {
    const newSchedule = [...schedule];
    (newSchedule[index] as any)[field] = value;
    setSchedule(newSchedule);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const carpoolData = {
        ...(carpool || {}),
        driverId: currentUser.id,
        driverName: currentUser.name,
        carModel,
        departureLocation,
        schedule,
    };
    onSave(carpoolData);
    onCancel(); // Close form after save
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{carpool ? 'Edit Your Schedule' : 'Create Your Schedule'}</h2>
      <p className="text-gray-600 mb-6">You are creating this schedule as <span className="font-semibold">{currentUser.name}</span>.</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Car Model</label>
            <input type="text" value={carModel} onChange={e => setCarModel(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Honda Civic 2022" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Departure Location</label>
            <input type="text" value={departureLocation} onChange={e => setDepartureLocation(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm" placeholder="e.g., Bahria Town Phase 4" required />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700 border-b pb-2">Weekly Timings</h3>
          {schedule.map((s, index) => (
            <div key={s.day} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
              <label className="font-medium text-gray-800">{s.day}</label>
              <div>
                <label className="text-xs text-gray-500">Departure</label>
                <input type="time" value={s.departureTime} onChange={e => handleScheduleChange(index, 'departureTime', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Return</label>
                <input type="time" value={s.returnTime} onChange={e => handleScheduleChange(index, 'returnTime', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
               <div>
                <label className="text-xs text-gray-500">Seats</label>
                <input type="number" min="0" value={s.availableSeats} onChange={e => handleScheduleChange(index, 'availableSeats', parseInt(e.target.value, 10))} className="w-full p-2 border border-gray-300 rounded-md" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end space-x-4 pt-4">
          <button type="button" onClick={onCancel} className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300">Cancel</button>
          <button type="submit" className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Save Schedule</button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleForm;