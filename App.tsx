import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import FindRide from './components/FindRide';
import OfferRide from './components/OfferRide';
import LoginPage from './components/LoginPage';
import ChatModal from './components/ChatModal';
import { User, Message, Carpool, BookingRequest, View } from './types';
import { initialCarpools, initialBookings, initialUsers, initialMessages } from './data';

const App: React.FC = () => {
  const [view, setView] = useState<View>(View.FIND);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [carpools, setCarpools] = useState<Carpool[]>(initialCarpools);
  const [bookings, setBookings] = useState<BookingRequest[]>(initialBookings);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [activeChat, setActiveChat] = useState<{ carpoolId: number, otherUserId: number } | null>(null);

  const handleLogin = useCallback((email: string, phone: string) => {
    let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
    } else {
      const name = email.split('@')[0].replace(/\./g, ' ').replace(/(?:^|\s)\S/g, (a) => a.toUpperCase());
      const newUser: User = { id: Date.now(), name, email, phoneNumber: phone };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    }
  }, [users]);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setView(View.FIND);
  }, []);

  const addCarpool = useCallback((newCarpool: Omit<Carpool, 'id'>) => {
    setCarpools(prev => [
      ...prev,
      {
        ...newCarpool,
        id: Date.now(),
      },
    ]);
  }, []);

  const updateCarpool = useCallback((updatedCarpool: Carpool) => {
    setCarpools(prev => prev.map(c => c.id === updatedCarpool.id ? updatedCarpool : c));
  }, []);

  const handleDeleteCarpool = useCallback((carpoolId: number) => {
    if (window.confirm('Are you sure you want to delete your carpool listing? This action cannot be undone.')) {
        setCarpools(prev => prev.filter(c => c.id !== carpoolId));
        setBookings(prev => prev.filter(b => b.carpoolId !== carpoolId));
    }
  }, []);

  const addBooking = useCallback((carpoolId: number, day: string) => {
    if (!currentUser) return;
    const newBooking: BookingRequest = {
      id: Date.now(),
      carpoolId,
      riderId: currentUser.id,
      riderName: currentUser.name,
      day,
      status: 'pending',
    };
    setBookings(prev => [...prev, newBooking]);
  }, [currentUser]);

  const updateBookingStatus = useCallback((bookingId: number, status: 'approved' | 'declined') => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
    
    if (status === 'approved') {
        setCarpools(prevCarpools => prevCarpools.map(carpool => {
            if (carpool.id === booking.carpoolId) {
                const newSchedule = carpool.schedule.map(s => {
                    if (s.day === booking.day) {
                        return { ...s, availableSeats: Math.max(0, s.availableSeats - 1) };
                    }
                    return s;
                });
                return { ...carpool, schedule: newSchedule };
            }
            return carpool;
        }));
    }
  }, [bookings]);

  const handleStartChat = useCallback((carpoolId: number, otherUserId: number) => {
    setActiveChat({ carpoolId, otherUserId });
  }, []);

  const handleSendMessage = useCallback((text: string) => {
    if (!currentUser || !activeChat) return;
    const newMessage: Message = {
        id: Date.now(),
        carpoolId: activeChat.carpoolId,
        senderId: currentUser.id,
        receiverId: activeChat.otherUserId,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMessage]);
  }, [currentUser, activeChat]);

  if (!currentUser) {
    return <LoginPage onLogin={handleLogin} />;
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
      {activeChat && otherChatUser && (
          <ChatModal 
            currentUser={currentUser}
            otherUser={otherChatUser}
            messages={messages.filter(m => m.carpoolId === activeChat.carpoolId && ((m.senderId === currentUser.id && m.receiverId === activeChat.otherUserId) || (m.senderId === activeChat.otherUserId && m.receiverId === currentUser.id)))}
            onSendMessage={handleSendMessage}
            onClose={() => setActiveChat(null)}
          />
      )}
    </div>
  );
};

export default App;
