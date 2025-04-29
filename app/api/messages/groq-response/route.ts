import { NextRequest, NextResponse } from "next/server";
import { getGroqResponse } from "@/lib/groq";
import { addMessage, ChatMessage } from "@/lib/dynamo";
import { v4 as uuidv4 } from "uuid";
import { handleError } from "@/lib/errorHandler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body.conversationId || typeof body.conversationId !== 'string') {
      return NextResponse.json({ error: "Invalid conversationId" }, { status: 400 });
    }

    if (!body.userMessage || typeof body.userMessage !== 'string') {
      return NextResponse.json({ error: "User message is required" }, { status: 400 });
    }

    // Get a response from Groq API
    const groqResponseText = await getGroqResponse(
      body.userMessage, 
      Array.isArray(body.previousMessages) ? body.previousMessages : []
    );

    // Create a new message for the AI response
    const aiMessage: ChatMessage = {
      messageId: uuidv4(),
      conversationId: body.conversationId,
      sender: "Groq", // Set the sender as Groq
      message: groqResponseText,
      timestamp: new Date().toISOString() // Store as ISO string for consistent handling
    };

    // Save the AI response to DynamoDB
    await addMessage(aiMessage);

    return NextResponse.json({ 
      success: true, 
      message: aiMessage 
    });
  } catch (error: any) {
    console.error("Error getting Groq response:", error);
    
    const errorResponse = handleError(
      error, 
      "Failed to get AI response or save it to database"
    );
    
    return NextResponse.json(errorResponse, { status: 500 });
  }
}