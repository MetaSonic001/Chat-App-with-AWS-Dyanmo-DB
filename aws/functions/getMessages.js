// aws/functions/getMessages.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const roomId = event.queryStringParameters?.roomId || 'default';
  
  const params = {
    TableName: 'ChatMessages',
    KeyConditionExpression: 'roomId = :roomId',
    ExpressionAttributeValues: {
      ':roomId': roomId
    },
    ScanIndexForward: false, // Sort in descending order (newest first)
    Limit: 50 // Get last 50 messages
  };
  
  try {
    const result = await dynamoDB.query(params).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify(result.Items)
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: 'Failed to fetch messages' })
    };
  }
};