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
    return NextResponse.json(messagesResult);
  } catch (error: any) {
    const errorResponse = handleError(error, "Failed to fetch messages");
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// This function is now defined in lib/dynamo.ts