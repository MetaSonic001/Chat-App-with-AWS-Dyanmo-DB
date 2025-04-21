// src/app/api/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// Replace with your actual API endpoint
const API_BASE_URL = process.env.AWS_API_URL || 'https://your-api-url.execute-api.us-east-1.amazonaws.com/Prod';

// GET /api/messages - proxy to fetch messages
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const roomId = searchParams.get('roomId') || 'default';
  
  try {
    const response = await axios.get(`${API_BASE_URL}/messages?roomId=${roomId}`);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

// POST /api/messages - proxy to send message
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const response = await axios.post(`${API_BASE_URL}/messages`, body);
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}