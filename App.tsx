import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc, query, where, serverTimestamp, orderBy } from 'firebase/firestore';
import { auth, db } from './firebase-config';

import Header from './components/Header';
import FindRide from './components/FindRide';
import OfferRide from './components/OfferRide';
import LoginPage from './components/LoginPage';
import ChatModal from './components/ChatModal';
import { UserProfile, Message, Carpool, BookingRequest, View } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.FIND);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [carpools, setCarpools] = useState<Carpool[]>([]);
  
  // State is now split for rider and driver bookings to avoid 'Filter.or'
  const [riderBookings, setRiderBookings] = useState<BookingRequest[]>([]);
  const [driverBookings, setDriverBookings] = useState<BookingRequest[]>([]);

  const [messages, setMessages] = useState<Message[]>([]);
  
  const [activeChat, setActiveChat] = useState<{ carpoolId: string, otherUserId: string } | null>(null);

  // Memoize the combined list of bookings
  const bookings = useMemo(() => {
    const allBookings = [...riderBookings, ...driverBookings];
    // Deduplicate based on ID in case a user is a rider on their own carpool (edge case)
    return Array.from(new Map(allBookings.map(item => [item.id, item])).values());
  }, [riderBookings, driverBookings]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        // Listen for this user's profile document in Firestore
        const userDocRef = doc(db, 'users', user.uid);
        onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            setCurrentUser({ id: doc.id, ...doc.data() } as UserProfile);
          }
        });
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Listen for all carpools
    const q = query(collection(db, 'carpools'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const carpoolsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Carpool));
      setCarpools(carpoolsData);
    });
    return () => unsubscribe();
  }, []);

  const myCarpool = useMemo(() => carpools.find(c => c.driverId === currentUser?.id), [carpools, currentUser]);

  // Listener for bookings where the current user is the RIDER
  useEffect(() => {
    if (!currentUser) {
        setRiderBookings([]);
        return;
    }
    const riderQuery = query(collection(db, 'bookings'), where('riderId', '==', currentUser.id));
    const unsubscribe = onSnapshot(riderQuery, (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookingRequest));
        setRiderBookings(bookingsData);
    }, (error) => {
        console.error("Firestore rider bookings subscription error: ", error);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // Listener for bookings related to the user's carpool (as DRIVER)
  useEffect(() => {
    if (!myCarpool) {
        setDriverBookings([]);
        return;
    }
    const driverQuery = query(collection(db, 'bookings'), where('carpoolId', '==', myCarpool.id));
    const unsubscribe = onSnapshot(driverQuery, (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookingRequest));
        setDriverBookings(bookingsData);
    }, (error) => {
        console.error("Firestore driver bookings subscription error: ", error);
    });
    return () => unsubscribe();
  }, [myCarpool]);


  useEffect(() => {
    if (!activeChat || !currentUser) {
        setMessages([]);
        return;
    };
    
    const messagesQuery = query(
        collection(db, 'messages'),
        where('carpoolId', '==', activeChat.carpoolId),
        orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const messagesData = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Message))
            .filter(m => (m.senderId === currentUser.id && m.receiverId === activeChat.otherUserId) || (m.senderId === activeChat.otherUserId && m.receiverId === currentUser.id));
        setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [activeChat, currentUser]);
  

  const handleLogout = useCallback(() => {
    auth.signOut();
    setView(View.FIND);
  }, []);

  const addCarpool = useCallback(async (newCarpool: Omit<Carpool, 'id'>) => {
    // Sanitize the object to ensure it's a plain JS object and prevent circular structure errors.
    const dataToAdd = {
      driverId: newCarpool.driverId,
      driverName: newCarpool.driverName,
      carModel: newCarpool.carModel,
      departureLocation: newCarpool.departureLocation,
      schedule: newCarpool.schedule.map(s => ({
          day: s.day,
          departureTime: s.departureTime,
          returnTime: s.returnTime,
          availableSeats: s.availableSeats
      }))
    };
    await addDoc(collection(db, 'carpools'), dataToAdd);
  }, []);

  const updateCarpool = useCallback(async (updatedCarpool: Carpool) => {
    const carpoolId = updatedCarpool.id;
    if (!carpoolId) {
        console.error("Cannot update carpool without an ID.");
        return;
    }
    
    // Explicitly create a new, clean data object to prevent circular structure errors.
    // This rebuilds the schedule array to ensure it only contains plain data.
    const dataToUpdate = {
        driverId: updatedCarpool.driverId,
        driverName: updatedCarpool.driverName,
        carModel: updatedCarpool.carModel,
        departureLocation: updatedCarpool.departureLocation,
        schedule: updatedCarpool.schedule.map(s => ({
            day: s.day,
            departureTime: s.departureTime,
            returnTime: s.returnTime,
            availableSeats: s.availableSeats
        }))
    };
    
    const carpoolDoc = doc(db, 'carpools', carpoolId);
    await updateDoc(carpoolDoc, dataToUpdate);
  }, []);

  const handleDeleteCarpool = useCallback(async (carpoolId: string) => {
    if (window.confirm('Are you sure you want to delete your carpool listing? This action cannot be undone.')) {
        await deleteDoc(doc(db, 'carpools', carpoolId));
        // You might also want to delete related bookings
    }
  }, []);

  const addBooking = useCallback(async (carpoolId: string, day: string) => {
    if (!currentUser) return;
    const driver = carpools.find(c => c.id === carpoolId)?.driverName;
    const newBooking = {
      carpoolId,
      riderId: currentUser.id,
      riderName: currentUser.name,
      day,
      status: 'pending',
    };
    await addDoc(collection(db, 'bookings'), newBooking);
  }, [currentUser, carpools]);

  const updateBookingStatus = useCallback(async (bookingId: string, status: 'approved' | 'declined') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    await updateDoc(doc(db, 'bookings', bookingId), { status });
    
    if (status === 'approved') {
        const carpool = carpools.find(c => c.id === booking.carpoolId);
        if (carpool) {
            // Rebuild the schedule with plain objects to prevent circular structure errors.
            const newSchedule = carpool.schedule.map(s => {
                const plainScheduleItem = {
                    day: s.day,
                    departureTime: s.departureTime,
                    returnTime: s.returnTime,
                    availableSeats: s.availableSeats
                };
                if (s.day === booking.day) {
                    plainScheduleItem.availableSeats = Math.max(0, s.availableSeats - 1);
                }
                return plainScheduleItem;
            });
            await updateDoc(doc(db, 'carpools', carpool.id), { schedule: newSchedule });
        }
    }
  }, [bookings, carpools]);

  const cancelBooking = useCallback(async (bookingId: string) => {
    const booking = riderBookings.find(b => b.id === bookingId);
    if (!booking) return;

    // If the booking was approved, free up the seat
    if (booking.status === 'approved') {
      const carpool = carpools.find(c => c.id === booking.carpoolId);
      if (carpool) {
        // Rebuild the schedule with plain objects to prevent circular structure errors,
        // which can happen if we pass objects from state directly back to Firestore.
        const newSchedule = carpool.schedule.map(daySchedule => {
          const plainSchedule = {
            day: daySchedule.day,
            departureTime: daySchedule.departureTime,
            returnTime: daySchedule.returnTime,
            availableSeats: daySchedule.availableSeats,
          };
          if (daySchedule.day === booking.day) {
            plainSchedule.availableSeats = daySchedule.availableSeats + 1;
          }
          return plainSchedule;
        });
        await updateDoc(doc(db, 'carpools', carpool.id), { schedule: newSchedule });
      }
    }

    // Delete the booking document
    await deleteDoc(doc(db, 'bookings', bookingId));
  }, [riderBookings, carpools]);

  const handleStartChat = useCallback((carpoolId: string, otherUserId: string) => {
    setActiveChat({ carpoolId, otherUserId });
  }, []);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!currentUser || !activeChat) return;
    const newMessage = {
        carpoolId: activeChat.carpoolId,
        senderId: currentUser.id,
        receiverId: activeChat.otherUserId,
        text,
        timestamp: serverTimestamp(),
    };
    await addDoc(collection(db, 'messages'), newMessage);
  }, [currentUser, activeChat]);

  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser || !firebaseUser) {
    return <LoginPage />;
  }
  
  const otherChatUser = activeChat ? users.find(u => u.id === activeChat.otherUserId) : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header currentView={view} onViewChange={setView} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8">
        {view === View.FIND && <FindRide carpools={carpools} onBook={addBooking} bookings={riderBookings} currentUser={currentUser} onStartChat={handleStartChat} onCancelBooking={cancelBooking} />}
        {view === View.OFFER && (
          <OfferRide 
            myCarpool={myCarpool} 
            currentUser={currentUser}
            onAddCarpool={addCarpool} 
            onUpdateCarpool={updateCarpool} 
            onDeleteCarpool={handleDeleteCarpool}
            bookingRequests={driverBookings}
            onUpdateBookingStatus={updateBookingStatus}
            onStartChat={handleStartChat}
          />
        )}
      </main>
      {activeChat && currentUser && (
          <ChatModal 
            currentUser={currentUser}
            otherUserId={activeChat.otherUserId}
            messages={messages}
            onSendMessage={handleSendMessage}
            onClose={() => setActiveChat(null)}
          />
      )}
    </div>
  );
};

export default App;