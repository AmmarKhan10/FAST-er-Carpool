import React, { useState, useRef, useEffect } from 'react';
import { Message, User } from '../types';

interface ChatModalProps {
  currentUser: User;
  otherUser: User;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ currentUser, otherUser, messages, onSendMessage, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg h-[70vh] flex flex-col m-4">
        <header className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Chat with {otherUser.name}</h2>
          <button onClick={onClose} className="text-gray-500 text-2xl font-bold hover:text-gray-800">&times;</button>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex items-end ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${msg.senderId === currentUser.id ? 'bg-blue-500 text-white' : 'bg-white text-gray-800'}`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 text-right ${msg.senderId === currentUser.id ? 'text-blue-200' : 'text-gray-400'}`}>{msg.timestamp}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </main>

        <footer className="p-4 border-t bg-white">
          <div className="flex space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={1}
            />
            <button onClick={handleSend} className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Send
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatModal;
