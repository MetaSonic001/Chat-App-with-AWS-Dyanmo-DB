// aws/functions/sendMessage.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  try {
    const requestBody = JSON.parse(event.body);
    const { message, sender, roomId = 'default' } = requestBody;
    
    if (!message || !sender) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ error: 'Message and sender are required' })
      };
    }
    
    const timestamp = Date.now();
    const messageId = uuidv4();
    
    const params = {
      TableName: 'ChatMessages',
      Item: {
        roomId,
        timestamp,
        messageId,
        message,
        sender
      }
    };
    
    await dynamoDB.put(params).promise();
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        messageId,
        roomId,
        timestamp,
        message,
        sender
      })
    };
  } catch (error) {
    console.error('Error sending message:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ error: 'Failed to send message' })
    };
  }
};