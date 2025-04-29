# Chat Application with DynamoDB and Groq AI

This application is a real-time chat system that uses Amazon DynamoDB for message storage and Groq AI for automated responses.

## Features

- Chat messaging with persistent storage in DynamoDB
- AI responses from Groq API
- Conversation history viewing
- Multiple conversation support with conversation IDs
- Responsive UI with proper message styling

## Setup Instructions

### 1. Configure AWS DynamoDB

First, create a DynamoDB table with the following configuration:

- Table Name: `ChatMessages` (or specify your own in .env)
- Partition Key: `conversationId` (String)
- Sort Key: `timestamp` (Number)

### 2. Configure Environment Variables

Copy the `.env.local` file and fill in your credentials:

```bash
# AWS Configuration
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key

# DynamoDB Configuration
DYNAMODB_MESSAGES_TABLE=ChatMessages

# Groq API Configuration
GROQ_API_KEY=your_groq_api_key
```

### 3. Install Dependencies

```bash
npm install
# or
yarn install
```

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

- `/components` - React components including the ChatInterface
- `/app/api/messages` - API routes for message handling
- `/lib` - Utility functions for DynamoDB and Groq API

## Troubleshooting

If you encounter issues:

1. Check your AWS credentials and permissions
2. Ensure the DynamoDB table is correctly configured
3. Verify your Groq API key is valid
4. Check browser console and server logs for errors

## Security Notes

- Never commit your `.env.local` file
- Consider using proper authentication for a production app
- Set up IAM roles with least privilege for DynamoDB access
