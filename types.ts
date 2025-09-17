export interface User {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
}

export interface Message {
  id: number;
  carpoolId: number;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: string;
}

export interface DaySchedule {
  day: string;
  departureTime: string;
  returnTime: string;
  availableSeats: number;
}

export interface Carpool {
  id: number;
  driverId: number;
  driverName: string;
  carModel: string;
  departureLocation: string;
  schedule: DaySchedule[];
}

export interface BookingRequest {
  id: number;
  carpoolId: number;
  riderId: number;
  riderName: string;
  day: string;
  status: 'pending' | 'approved' | 'declined';
}

export enum View {
  FIND = 'find',
  OFFER = 'offer',
}
