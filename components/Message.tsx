// src/components/Message.tsx
import React from 'react';
import { Message as MessageType } from '@/lib/types';
import { formatDistance } from 'date-fns';

interface MessageProps {
  message: MessageType;
  isCurrentUser: boolean;
}

const Message: React.FC<MessageProps> = ({ message, isCurrentUser }) => {
  const time = formatDistance(new Date(message.timestamp), new Date(), { addSuffix: true });

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`px-4 py-2 rounded-lg max-w-xs lg:max-w-md ${
          isCurrentUser 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-gray-200 text-gray-800 rounded-bl-none'
        }`}
      >
        <div className="font-bold text-sm">
          {message.sender}
        </div>
        <p className="text-sm">{message.message}</p>
        <div className="text-xs mt-1 opacity-75">
          {time}
        </div>
      </div>
    </div>
  );
};

export default Message;