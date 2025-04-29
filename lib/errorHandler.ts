// lib/errorHandler.ts
export function handleError(error: any, defaultMessage: string) {
    let errorMessage = defaultMessage;
  
    if (error.name === "CredentialsProviderError") {
      errorMessage = "AWS credentials not found or invalid";
    } else if (error.name === "ResourceNotFoundException") {
      errorMessage = "DynamoDB table not found";
    } else if (error.code === "ENOTFOUND") {
      errorMessage = `Cannot connect to DynamoDB endpoint: ${error.hostname}`;
    }
  
    return {
      error: errorMessage,
      details: error.message
    };
  }
  