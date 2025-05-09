# SelfServe API Reference

## Overview

The SelfServe API provides a comprehensive interface for hotel self-service functionality, including guest profiles, messaging, feedback collection, and various hotel service requests.

## Authentication

All guest API endpoints require an `X-Guest-ID` header for authentication. Hotel-specific endpoints require an `X-Hotel-ID` header.

Example:
```
X-Guest-ID: 36c20146-5e1f-4081-97eb-b4b45c3f55f6
X-Hotel-ID: 2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f
```

## Error Handling

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

## API Endpoints

### Guest API

#### Profile Endpoints

- `GET /api/guest/profile`: Get guest profile information
- `PUT /api/guest/profile`: Update guest profile information
- `GET /api/guest/profile/preferences`: Get guest preferences
- `PUT /api/guest/profile/preferences`: Update guest preferences
- `GET /api/guest/profile/dietary-restrictions`: Get guest dietary restrictions
- `PUT /api/guest/profile/dietary-restrictions`: Update guest dietary restrictions

#### Messages Endpoints

- `GET /api/guest/messages`: Get all messages for a guest
- `GET /api/guest/messages/:messageId`: Get a specific message by ID
- `GET /api/guest/messages/announcements`: Get all hotel announcements

#### Feedback Endpoints

- `GET /api/guest/feedback/categories`: Get feedback categories
- `POST /api/guest/feedback/rating`: Submit a feedback rating
- `GET /api/guest/feedback/ratings`: Get feedback ratings submitted by a guest

### Management API

#### Hotel Management

- `GET /api/management/hotels`: Get all hotels
- `GET /api/management/hotels/:hotelId`: Get a specific hotel
- `POST /api/management/hotels`: Create a new hotel
- `PUT /api/management/hotels/:hotelId`: Update a hotel
- `DELETE /api/management/hotels/:hotelId`: Delete a hotel

#### Messages Management

- `GET /api/management/messages`: Get all messages
- `GET /api/management/messages/:messageId`: Get a specific message
- `POST /api/management/messages`: Create a new message
- `PUT /api/management/messages/:messageId`: Update a message
- `DELETE /api/management/messages/:messageId`: Delete a message

- `GET /api/management/messages/announcements`: Get all announcements
- `GET /api/management/messages/announcements/:announcementId`: Get a specific announcement
- `POST /api/management/messages/announcements`: Create a new announcement
- `PUT /api/management/messages/announcements/:announcementId`: Update an announcement
- `DELETE /api/management/messages/announcements/:announcementId`: Delete an announcement

#### Dining Management

- `GET /api/management/dining`: Get all dining requests
- `GET /api/management/dining/:requestId`: Get a specific dining request
- `PUT /api/management/dining/:requestId/status`: Update dining request status
- `PUT /api/management/dining/:requestId/payment`: Update dining request payment status

## Response Formats

All successful responses include either a single resource object or a data array with pagination metadata:

### Single Resource

```json
{
  "id": "e8f87452-a153-4655-b303-f9ee809a4730",
  "name": "Resource Name",
  "description": "Resource description",
  "createdAt": "2025-05-01T12:00:00Z"
}
```

### Resource Collection

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

## Common Request Parameters

### Pagination

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10, max: 100)

### Filtering

- Filtering parameters are specific to each endpoint, usually provided as query parameters.
- Some filter parameters may accept multiple values as a comma-separated list (e.g., `status=SUBMITTED,IN_PROGRESS`). Refer to individual endpoint documentation for details.

## API Explorer

For interactive API documentation, visit the Swagger UI at `/api-docs` when running in development mode. 