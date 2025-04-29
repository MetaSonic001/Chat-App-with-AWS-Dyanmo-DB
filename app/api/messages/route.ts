import { NextRequest, NextResponse } from "next/server";
import { getMessages as getMessagesFromDynamo } from "@/lib/dynamo";
import { handleError } from "@/lib/errorHandler";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const conversationId = searchParams.get("conversationId");
  const lastEvaluatedKey = searchParams.get("lastEvaluatedKey");

  if (!conversationId) {
    return NextResponse.json({ error: "Conversation ID is required" }, { status: 400 });
  }

  try {
    const messagesResult = await getMessagesFromDynamo(conversationId, lastEvaluatedKey);
    
    // Log the messages for debugging
    console.log(`Retrieved ${messagesResult.items.length} messages for conversation ${conversationId}`);
    
    // Process messages to ensure consistent format
    const processedMessages = messagesResult.items.map(msg => ({
      ...msg,
      // Ensure timestamp is properly formatted for display
      timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : new Date(msg.timestamp).toISOString()
    }));
    
    return NextResponse.json({
      items: processedMessages,
      lastEvaluatedKey: messagesResult.lastEvaluatedKey
    });
  } catch (error: any) {
    const errorResponse = handleError(error, "Failed to fetch messages");
    return NextResponse.json(errorResponse, { status: 500 });
  }
}