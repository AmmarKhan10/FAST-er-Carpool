import { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string; // Corresponds to Firebase Auth UID
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Message {
  id: string;
  carpoolId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: Timestamp;
}

export interface DaySchedule {
  day: string;
  departureTime: string;
  returnTime: string;
  availableSeats: number;
}

export interface Carpool {
  id: string;
  driverId: string;
  driverName: string;
  carModel: string;
  departureLocation: string;
  schedule: DaySchedule[];
}

export interface BookingRequest {
  id: string;
  carpoolId: string;
  riderId: string;
  riderName: string;
  day: string;
  status: 'pending' | 'approved' | 'declined';
}

export enum View {
  FIND = 'find',
  OFFER = 'offer',
}