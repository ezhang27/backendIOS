# SelfServe API Overview

The SelfServe API provides a comprehensive interface for hotel self-service functionality, enabling guests to interact with hotel services and staff to manage those services efficiently.

## API Structure

The SelfServe API is organized into two main sections:

1. **Guest API (`/api/guest`)**: Endpoints for hotel guests to view information, make requests, provide feedback, and manage their profiles.
2. **Management API (`/api/management`)**: Endpoints for hotel staff to manage guest requests, hotel information, and administrative functions.

## Authentication

### Guest Authentication

All guest API endpoints require authentication using the `X-Guest-ID` header. For hotel-specific operations, an `X-Hotel-ID` header is also required.

```
X-Guest-ID: 36c20146-5e1f-4081-97eb-b4b45c3f55f6
X-Hotel-ID: 2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f
```

In production, authentication is handled by [Clerk](https://clerk.dev/), a third-party authentication service. The application expects a valid Clerk session token in requests that require authentication.

#### Authentication Flow

1. User authenticates through Clerk's frontend components
2. Clerk issues a session token
3. Frontend includes the token in API requests
4. Backend verifies the token using Clerk's middleware
5. Backend links the Clerk user ID to the corresponding guest profile

The `userid` field in the guest table stores the Clerk User ID, and protected routes use the Clerk authentication middleware to verify the user's identity.

### Management Authentication

Management API endpoints use the same authentication pattern, requiring an `X-Employee-ID` header and an `X-Hotel-ID` header for hotel-specific operations.

```
X-Employee-ID: 88ed2357-de9c-428a-82ab-bcc223e2fe97
X-Hotel-ID: 2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f
```

## Common Response Formats

### Success Responses

For single resource requests, the API returns the resource directly:

```json
{
  "id": "e8f87452-a153-4655-b303-f9ee809a4730",
  "name": "Resource Name",
  "description": "Resource description",
  "createdAt": "2025-05-01T12:00:00Z"
}
```

For resource collections, the API returns a data array with pagination metadata:

```json
{
  "data": [
    {
      "id": "e8f87452-a153-4655-b303-f9ee809a4730",
      "name": "Resource Name",
      "description": "Resource description"
    },
    {
      "id": "a6dba5ed-adb8-4533-8932-1a626dbba791",
      "name": "Another Resource",
      "description": "Another description"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalCount": 25,
    "totalPages": 3
  }
}
```

### Error Responses

The API returns consistent error responses with the following structure:

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

Common error types:
- `ValidationError`: Request data validation failed
- `NotFoundError`: Requested resource not found
- `UnauthorizedError`: Missing or invalid authentication
- `ForbiddenError`: Insufficient permissions
- `DatabaseError`: Database operation failed

## Common Request Parameters

### Pagination

Many endpoints that return collections support pagination:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)

Example:
```
GET /api/guest/requests?page=2&limit=20
```

### Filtering

Many endpoints support filtering to narrow down results:

- Status filtering: Filter by status values (e.g., `status=SUBMITTED,IN_PROGRESS`)
- Type filtering: Filter by type values (e.g., `type=HOUSEKEEPING,MAINTENANCE`)
- Search: Free text search (e.g., `search=towel`)

Example:
```
GET /api/management/requests?status=SUBMITTED,IN_PROGRESS&type=HOUSEKEEPING
```

## API Versioning

The current API is considered v1 and does not require version specification in the URL. Future versions may use URL versioning (e.g., `/api/v2/guest`).

## Rate Limiting

In production environments, the API implements rate limiting to prevent abuse. Clients should handle HTTP 429 (Too Many Requests) responses by backing off and retrying after the time specified in the `Retry-After` header.

## Timestamps and Timezones

All timestamps in the API are returned in ISO 8601 format in UTC timezone. The API accepts timestamps in the same format.

Example: `2025-05-01T12:00:00Z`

## Recent Changes and Updates

The API undergoes regular updates and improvements. The most significant recent changes include:

1. Comprehensive `ON DELETE` policy implementations
2. Guest profile and preferences refinements
3. Overhaul of the `Charge` table structure
4. Introduction of ENUM types for better data consistency
5. Implementation of room service functionality
6. Improved response consistency across endpoints

For a detailed list of recent changes, please refer to the [Change Log](../changes/changelog.md).

## Getting Started

To start working with the SelfServe API:

1. Set up authentication using Clerk or the development mode headers
2. Explore the [Guest API](./guest-api.md) or [Management API](./management-api.md) documentation
3. Use the [Testing Guides](../testing/environment.md) to test your integration

## API Explorer

For interactive API documentation, visit the Swagger UI at `/api-docs` when running in development mode. 