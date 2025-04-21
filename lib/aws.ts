// src/lib/aws.ts
import axios from 'axios';
import { Message, SendMessagePayload } from './types';

// Replace with your API Gateway URL from AWS SAM deployment
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://your-api-url.execute-api.us-east-1.amazonaws.com/Prod';

export const fetchMessages = async (roomId: string = 'default'): Promise<Message[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/messages?roomId=${roomId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
};

export const sendMessage = async (payload: SendMessagePayload): Promise<Message | null> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/messages`, payload);
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};