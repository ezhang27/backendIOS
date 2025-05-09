# Error Handling

The SelfServe API uses a standardized approach to error handling. This document describes the error response format and common error types.

## Standard Error Response Format

All API errors follow a consistent JSON structure:

```json
{
  "error": {
    "message": "Error description",
    "type": "ErrorType",
    "details": [
      {
        "field": "Field with error",
        "message": "Specific error message"
      }
    ]
  }
}
```

The error object contains:
- `message`: A human-readable description of the error
- `type`: The error type (see common types below)
- `details`: An array of validation errors or additional error details (may be empty for non-validation errors)

## HTTP Status Codes

The API uses standard HTTP status codes to indicate the general category of response:

| Status Code | Description | Common Use Cases |
|-------------|-------------|-----------------|
| 200 OK | The request was successful | Successful GET, PUT, DELETE operations |
| 201 Created | The request was successful and a resource was created | Successful POST operations |
| 400 Bad Request | The request was invalid | Validation errors, malformed requests |
| 401 Unauthorized | Authentication is required | Missing or invalid authentication credentials |
| 403 Forbidden | The authenticated user lacks permission | Attempting to access unauthorized resources |
| 404 Not Found | The requested resource was not found | Invalid resource IDs or paths |
| 409 Conflict | The request could not be completed due to a conflict | Resource already exists, version conflicts |
| 422 Unprocessable Entity | The request was well-formed but contains semantic errors | Business rule violations |
| 429 Too Many Requests | The user has sent too many requests | Rate limiting |
| 500 Internal Server Error | An unexpected error occurred | Server-side errors |

## Common Error Types

### ValidationError

Occurs when the request fails validation checks. The `details` array contains specific validation errors.

```json
{
  "error": {
    "message": "Validation failed",
    "type": "ValidationError",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      },
      {
        "field": "name",
        "message": "Cannot be empty"
      }
    ]
  }
}
```

### NotFoundError

Occurs when the requested resource does not exist.

```json
{
  "error": {
    "message": "Restaurant not found",
    "type": "NotFoundError",
    "details": []
  }
}
```

### UnauthorizedError

Occurs when authentication is required but not provided or is invalid.

```json
{
  "error": {
    "message": "Authentication required",
    "type": "UnauthorizedError",
    "details": []
  }
}
```

### ForbiddenError

Occurs when the authenticated user does not have permission to access the requested resource.

```json
{
  "error": {
    "message": "Insufficient permissions to access this resource",
    "type": "ForbiddenError",
    "details": []
  }
}
```

### DatabaseError

Occurs when a database operation fails. This is typically an internal server error.

```json
{
  "error": {
    "message": "Database operation failed",
    "type": "DatabaseError",
    "details": []
  }
}
```

### RateLimitError

Occurs when the client has sent too many requests in a given amount of time.

```json
{
  "error": {
    "message": "Rate limit exceeded. Try again in 30 seconds",
    "type": "RateLimitError",
    "details": []
  }
}
```

## Handling Validation Errors

For endpoints that require specific inputs, the API performs validation before processing the request. If validation fails, the API returns a `ValidationError` with details about what failed validation.

The `details` array contains objects with:
- `field`: The name of the field that failed validation
- `message`: A description of the validation error

Example validation error for a create request:

```json
{
  "error": {
    "message": "Validation failed",
    "type": "ValidationError",
    "details": [
      {
        "field": "guestId",
        "message": "Required"
      },
      {
        "field": "rating",
        "message": "Must be between 1 and 5"
      }
    ]
  }
}
```

## Error Handling Best Practices

When integrating with the SelfServe API, follow these best practices for error handling:

1. **Always check the HTTP status code first** to determine the general category of response
2. **Parse the error object** to get detailed information about what went wrong
3. **Handle validation errors gracefully** by showing field-specific error messages to users
4. **Implement retry logic with backoff** for 429 (Too Many Requests) and some 500-level errors
5. **Log 500-level errors** for troubleshooting purposes
6. **Display user-friendly error messages** rather than raw API error messages

## Example Error Handling Code

### JavaScript Example

```javascript
async function makeApiRequest(url, options) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Handle specific error types
      switch(response.status) {
        case 400:
        case 422:
          // Validation error - show field-specific errors to the user
          return handleValidationError(errorData.error);
        case 401:
          // Authentication error - redirect to login
          redirectToLogin();
          break;
        case 403:
          // Permission error - show access denied message
          showAccessDeniedMessage();
          break;
        case 404:
          // Not found error - show not found message
          showNotFoundMessage(errorData.error.message);
          break;
        case 429:
          // Rate limit error - implement retry with backoff
          return retryWithBackoff(() => makeApiRequest(url, options));
        default:
          // General error handling
          showErrorMessage(errorData.error.message);
      }
      
      throw new Error(`API Error: ${errorData.error.message}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

function handleValidationError(error) {
  const validationMessages = {};
  
  if (error.details && error.details.length > 0) {
    error.details.forEach(detail => {
      validationMessages[detail.field] = detail.message;
    });
  }
  
  // Update UI to show validation errors
  showValidationErrors(validationMessages);
}
``` 