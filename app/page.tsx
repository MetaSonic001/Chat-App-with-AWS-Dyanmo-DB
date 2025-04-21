// src/app/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Message } from '@/lib/types';
import { fetchMessages, sendMessage } from '@/lib/aws';
import ChatBox from '@/components/ChatBox';
import MessageInput from '@/components/MessageInput';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [isUsernameSet, setIsUsernameSet] = useState(false);

  // Polling for new messages
  useEffect(() => {
    if (!isUsernameSet) return;

    const loadMessages = async () => {
      const fetchedMessages = await fetchMessages();
      setMessages(fetchedMessages);
    };

    loadMessages();
    
    // Poll for new messages every 3 seconds
    const intervalId = setInterval(loadMessages, 3000);
    
    return () => clearInterval(intervalId);
  }, [isUsernameSet]);

  const handleSendMessage = async (messageText: string) => {
    setLoading(true);
    
    try {
      const newMessage = await sendMessage({
        message: messageText,
        sender: username
      });
      
      if (newMessage) {
        setMessages((prev) => [newMessage, ...prev]);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setIsUsernameSet(true);
    }
  };

  if (!isUsernameSet) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Join Chat</h1>
          <form onSubmit={handleUsernameSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-700 mb-2">
                Enter your username:
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Username"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <main className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold">Chat App</h1>
          <p className="text-sm">Logged in as: {username}</p>
        </div>
      </header>
      
      <div className="flex-1 container mx-auto my-4 bg-white rounded-lg shadow-md flex flex-col overflow-hidden">
        <ChatBox messages={messages} currentUser={username} />
        <MessageInput onSendMessage={handleSendMessage} isLoading={loading} />
      </div>
    </main>
  );
}