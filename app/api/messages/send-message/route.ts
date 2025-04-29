import { NextRequest, NextResponse } from "next/server";
import { addMessage, ChatMessage } from "@/lib/dynamo";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body.conversationId || typeof body.conversationId !== 'string') {
      return NextResponse.json({ error: "Invalid conversationId" }, { status: 400 });
    }

    if (!body.sender || typeof body.sender !== 'string' || body.sender.trim().length === 0) {
      return NextResponse.json({ error: "Invalid sender" }, { status: 400 });
    }

    if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    // Create a new message object
    const newMessage: ChatMessage = {
      messageId: uuidv4(), // Generate a unique ID
      conversationId: body.conversationId,
      sender: body.sender,
      message: body.message,
      timestamp: Date.now()
    };

    // Save the message to DynamoDB
    await addMessage(newMessage);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    console.error("Error adding message:", error);
    
    // Provide more specific error message based on error type
    let errorMessage = "Failed to send message";
    
    if (error.name === "CredentialsProviderError") {
      errorMessage = "AWS credentials not found or invalid";
    } else if (error.name === "ResourceNotFoundException") {
      errorMessage = "DynamoDB table not found";
    } else if (error.code === "ENOTFOUND") {
      errorMessage = `Cannot connect to DynamoDB endpoint: ${error.hostname}`;
    }
    
    return NextResponse.json({ 
      error: errorMessage,
      details: error.message 
    }, { status: 500 });
  }
}