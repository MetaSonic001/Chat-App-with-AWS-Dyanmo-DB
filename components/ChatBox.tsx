// src/components/ChatBox.tsx
import React, { useEffect, useRef } from 'react';
import { Message as MessageType } from '@/lib/types';
import Message from './Message';

interface ChatBoxProps {
  messages: MessageType[];
  currentUser: string;
}

const ChatBox: React.FC<ChatBoxProps> = ({ messages, currentUser }) => {
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 p-4 overflow-y-auto">
      {messages.length === 0 ? (
        <div className="flex justify-center items-center h-full">
          <p className="text-gray-500">No messages yet. Start the conversation!</p>
        </div>
      ) : (
        messages.map((message) => (
          <Message
            key={message.messageId}
            message={message}
            isCurrentUser={message.sender === currentUser}
          />
        ))
      )}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default ChatBox;