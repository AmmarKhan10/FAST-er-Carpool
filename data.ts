import { Carpool, BookingRequest, User, Message } from './types';

export const initialUsers: User[] = [
  { id: 1, name: 'Ali Khan', email: 'ali@fast.com', phoneNumber: '123-456-7890' },
  { id: 2, name: 'Zainab', email: 'zainab@fast.com', phoneNumber: '098-765-4321' },
  { id: 3, name: 'Fatima Ahmed', email: 'fatima@fast.com', phoneNumber: '555-555-5555' },
  { id: 4, name: 'Usman', email: 'usman@fast.com', phoneNumber: '111-222-3333' },
];

export const initialCarpools: Carpool[] = [
  {
    id: 1,
    driverId: 1,
    driverName: 'Ali Khan',
    carModel: 'Honda Civic 2022',
    departureLocation: 'Bahria Town Phase 4, Rawalpindi',
    schedule: [
      { day: 'Monday', departureTime: '08:00 AM', returnTime: '04:00 PM', availableSeats: 3 },
      { day: 'Tuesday', departureTime: '08:00 AM', returnTime: '04:00 PM', availableSeats: 3 },
      { day: 'Wednesday', departureTime: '08:00 AM', returnTime: '05:00 PM', availableSeats: 2 },
      { day: 'Thursday', departureTime: '09:00 AM', returnTime: '04:00 PM', availableSeats: 3 },
      { day: 'Friday', departureTime: '09:00 AM', returnTime: '01:00 PM', availableSeats: 1 },
    ],
  },
  {
    id: 2,
    driverId: 3,
    driverName: 'Fatima Ahmed',
    carModel: 'Toyota Corolla 2021',
    departureLocation: 'G-11 Markaz, Islamabad',
    schedule: [
      { day: 'Monday', departureTime: '07:30 AM', returnTime: '05:00 PM', availableSeats: 2 },
      { day: 'Tuesday', departureTime: '07:30 AM', returnTime: '05:00 PM', availableSeats: 2 },
      { day: 'Wednesday', departureTime: '07:30 AM', returnTime: '05:00 PM', availableSeats: 1 },
      { day: 'Thursday', departureTime: '08:30 AM', returnTime: '03:00 PM', availableSeats: 2 },
      { day: 'Friday', departureTime: '08:30 AM', returnTime: '12:30 PM', availableSeats: 2 },
    ],
  },
];

export const initialBookings: BookingRequest[] = [
  { id: 101, carpoolId: 1, riderId: 2, riderName: 'Zainab', day: 'Monday', status: 'pending' },
  { id: 102, carpoolId: 1, riderId: 4, riderName: 'Usman', day: 'Wednesday', status: 'approved' },
];

export const initialMessages: Message[] = [
  { id: 1, carpoolId: 1, senderId: 4, receiverId: 1, text: "Hey! Just confirming our ride for Wednesday. Where should I meet you?", timestamp: "10:30 AM" },
  { id: 2, carpoolId: 1, senderId: 1, receiverId: 4, text: "Hi Usman, sounds good. I'll be at the main gate. See you then!", timestamp: "10:32 AM" },
];
