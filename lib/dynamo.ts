import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  QueryCommand, 
  QueryCommandInput 
} from "@aws-sdk/lib-dynamodb";

// Define the ChatMessage interface
export interface ChatMessage {
  messageId: string;
  conversationId: string;
  sender: string;
  message: string;
  timestamp: number | string;
}

// Configure the DynamoDB client with proper region and credentials
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
  },
  // Add endpoint if using local DynamoDB or an alternative endpoint
  ...(process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT
  })
});

const docClient = DynamoDBDocumentClient.from(client);

// Table name should be configured via environment variable
const MESSAGES_TABLE = process.env.DYNAMODB_MESSAGES_TABLE || "ChatMessages";

// Add a message to DynamoDB
export async function addMessage(message: ChatMessage): Promise<void> {
  try {
    // Convert timestamp to ISO string format since DynamoDB expects a string
    const timestampValue = typeof message.timestamp === 'number' 
      ? new Date(message.timestamp).toISOString() 
      : typeof message.timestamp === 'string' 
        ? message.timestamp 
        : new Date().toISOString();

    await docClient.send(
      new PutCommand({
        TableName: MESSAGES_TABLE,
        Item: {
          ...message,
          timestamp: timestampValue
        }
      })
    );
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
}

// Get messages for a conversation ID
export async function getMessages(conversationId: string, lastEvaluatedKey?: string | null): Promise<{items: ChatMessage[], lastEvaluatedKey: string | null}> {
  const params: QueryCommandInput = {
    TableName: MESSAGES_TABLE,
    KeyConditionExpression: "conversationId = :conversationId",
    ExpressionAttributeValues: {
      ":conversationId": conversationId
    },
    ScanIndexForward: true, // Sort in ascending order (oldest first)
    ExclusiveStartKey: lastEvaluatedKey ? JSON.parse(lastEvaluatedKey) : undefined,
    Limit: 50 // Increased limit to show more messages
  };

  try {
    const response = await docClient.send(new QueryCommand(params));
    
    // Process messages to ensure consistent format
    const items = (response.Items || []) as ChatMessage[];
    
    // Sort messages by timestamp if available
    items.sort((a, b) => {
      // Handle different timestamp formats
      const timeA = typeof a.timestamp === 'string' 
        ? new Date(a.timestamp).getTime() 
        : Number(a.timestamp);
        
      const timeB = typeof b.timestamp === 'string' 
        ? new Date(b.timestamp).getTime() 
        : Number(b.timestamp);
        
      return timeA - timeB;
    });
    
    return {
      items,
      lastEvaluatedKey: response.LastEvaluatedKey ? JSON.stringify(response.LastEvaluatedKey) : null
    };
  } catch (error) {
    console.error("Error retrieving messages:", error);
    throw error;
  }
}