import React, { useState, useCallback, useEffect } from 'react';
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
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  
  const [activeChat, setActiveChat] = useState<{ carpoolId: string, otherUserId: string } | null>(null);

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

  useEffect(() => {
    if (!currentUser) {
      setBookings([]);
      return;
    }
    // Listen for bookings where current user is the rider OR the driver
    const myCarpool = carpools.find(c => c.driverId === currentUser.id);
    const bookingsQuery = myCarpool 
      ? query(collection(db, 'bookings'), where('riderId', '==', currentUser.id), where('carpoolId', '==', myCarpool.id))
      : query(collection(db, 'bookings'), where('riderId', '==', currentUser.id));

    // A more robust query would require composite indexes in Firestore
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
        const bookingsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BookingRequest));
        setBookings(bookingsData);
    });

    return () => unsubscribe();
  }, [currentUser, carpools]);

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
    await addDoc(collection(db, 'carpools'), newCarpool);
  }, []);

  const updateCarpool = useCallback(async (updatedCarpool: Carpool) => {
    const carpoolDoc = doc(db, 'carpools', updatedCarpool.id);
    await updateDoc(carpoolDoc, { ...updatedCarpool });
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
            const newSchedule = carpool.schedule.map(s => {
                if (s.day === booking.day) {
                    return { ...s, availableSeats: Math.max(0, s.availableSeats - 1) };
                }
                return s;
            });
            await updateDoc(doc(db, 'carpools', carpool.id), { schedule: newSchedule });
        }
    }
  }, [bookings, carpools]);

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
  
  const myCarpool = carpools.find(c => c.driverId === currentUser.id);
  const myBookingsAsRider = bookings.filter(b => b.riderId === currentUser.id);
  const myBookingsAsDriver = myCarpool ? bookings.filter(b => b.carpoolId === myCarpool.id) : [];

  const otherChatUser = activeChat ? users.find(u => u.id === activeChat.otherUserId) : null;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Header currentView={view} onViewChange={setView} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8">
        {view === View.FIND && <FindRide carpools={carpools} onBook={addBooking} bookings={myBookingsAsRider} currentUser={currentUser} onStartChat={handleStartChat} />}
        {view === View.OFFER && (
          <OfferRide 
            myCarpool={myCarpool} 
            currentUser={currentUser}
            onAddCarpool={addCarpool} 
            onUpdateCarpool={updateCarpool} 
            onDeleteCarpool={handleDeleteCarpool}
            bookingRequests={myBookingsAsDriver}
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