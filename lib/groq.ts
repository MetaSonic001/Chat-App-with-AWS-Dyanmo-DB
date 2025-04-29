// lib/groq.ts - Groq API integration

import { ChatMessage } from './dynamo';

// Groq API configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama3-8b-8192'; // Using a smaller model for faster responses

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: {
    message: {
      content: string;
    };
    index: number;
    finish_reason: string;
  }[];
}

export async function getGroqResponse(userMessage: string, previousMessages: ChatMessage[] = []): Promise<string> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  try {
    // Convert previous messages to Groq format
    const formattedMessages: GroqMessage[] = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Keep your responses concise and friendly. Avoid long explanations.'
      }
    ];

    // Add previous messages for context
    previousMessages.forEach(msg => {
      if (msg.sender === 'Groq') {
        formattedMessages.push({
          role: 'assistant',
          content: msg.message
        });
      } else {
        formattedMessages.push({
          role: 'user',
          content: `${msg.sender}: ${msg.message}`
        });
      }
    });

    // Add the current user message
    formattedMessages.push({
      role: 'user',
      content: userMessage
    });

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: formattedMessages,
        max_tokens: 150, // Keep responses short
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Groq API error:', errorData);
      throw new Error(`Groq API error: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json() as GroqResponse;
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting Groq response:', error);
    throw error;
  }
}