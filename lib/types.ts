// src/lib/types.ts
export interface Message {
    messageId: string;
    roomId: string;
    timestamp: number;
    message: string;
    sender: string;
  }
  
  export interface SendMessagePayload {
    message: string;
    sender: string;
    roomId?: string;
  }