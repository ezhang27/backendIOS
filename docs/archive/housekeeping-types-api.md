# Housekeeping Types API Documentation

This document describes the API for managing housekeeping request types within a hotel.

## API Endpoints

Base URL: `/api/management/housekeeping/types`

### Get All Housekeeping Types

Retrieves all housekeeping request types for a specific hotel.

**URL**: `GET /api/management/housekeeping/types`

**Query Parameters**:
- `hotelId` (required): UUID of the hotel

**Example Request**:
```bash
curl -X GET "http://localhost:3000/api/management/housekeeping/types?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" \
  -H "Content-Type: application/json"
```

**Example Response**:
```json
{
  "data": [
    {
      "id": "b5c6d7e8-f9a0-b1c2-d3e4-f5a6b7c8d9e0",
      "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "type": "Daily Cleaning",
      "description": "Standard daily room cleaning service",
      "urgency": 3,
      "createdAt": "2023-04-25T14:32:15.120Z",
      "updatedAt": "2023-04-25T14:32:15.120Z"
    },
    {
      "id": "c6d7e8f9-a0b1-c2d3-e4f5-a6b7c8d9e0f1",
      "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "type": "Towel Replacement",
      "description": "Replace used towels with fresh ones",
      "urgency": 2,
      "createdAt": "2023-04-25T14:32:15.120Z",
      "updatedAt": "2023-04-25T14:32:15.120Z"
    }
  ],
  "meta": {
    "totalCount": 2
  }
}
```

### Get a Specific Housekeeping Type

Retrieves a specific housekeeping type by ID.

**URL**: `GET /api/management/housekeeping/types/:typeId`

**Path Parameters**:
- `typeId`: UUID of the housekeeping type

**Query Parameters**:
- `hotelId` (required): UUID of the hotel

**Example Request**:
```bash
curl -X GET "http://localhost:3000/api/management/housekeeping/types/b5c6d7e8-f9a0-b1c2-d3e4-f5a6b7c8d9e0?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" \
  -H "Content-Type: application/json"
```

**Example Response**:
```json
{
  "data": {
    "id": "b5c6d7e8-f9a0-b1c2-d3e4-f5a6b7c8d9e0",
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "type": "Daily Cleaning",
    "description": "Standard daily room cleaning service",
    "urgency": 3,
    "createdAt": "2023-04-25T14:32:15.120Z",
    "updatedAt": "2023-04-25T14:32:15.120Z"
  }
}
```

### Create a New Housekeeping Type

Creates a new housekeeping type for a hotel.

**URL**: `POST /api/management/housekeeping/types`

**Request Body**:
- `hotelId` (required): UUID of the hotel
- `type` (required): Name of the housekeeping type
- `description`: Description of the housekeeping type
- `urgency`: Urgency level from 1-5 (1 = lowest, 5 = highest)

**Example Request**:
```bash
curl -X POST "http://localhost:3000/api/management/housekeeping/types" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "type": "Bed Making",
    "description": "Making beds with fresh sheets",
    "urgency": 3
  }'
```

**Example Response**:
```json
{
  "message": "Housekeeping type created successfully",
  "data": {
    "id": "d7e8f9a0-b1c2-d3e4-f5a6-b7c8d9e0f1a2",
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "type": "Bed Making",
    "description": "Making beds with fresh sheets",
    "urgency": 3,
    "createdAt": "2023-04-25T15:26:48.382Z",
    "updatedAt": "2023-04-25T15:26:48.382Z"
  }
}
```

### Update a Housekeeping Type

Updates an existing housekeeping type.

**URL**: `PUT /api/management/housekeeping/types/:typeId`

**Path Parameters**:
- `typeId`: UUID of the housekeeping type

**Request Body**:
- `hotelId` (required): UUID of the hotel
- `type` (required): Name of the housekeeping type
- `description`: Description of the housekeeping type
- `urgency`: Urgency level from 1-5 (1 = lowest, 5 = highest)

**Example Request**:
```bash
curl -X PUT "http://localhost:3000/api/management/housekeeping/types/d7e8f9a0-b1c2-d3e4-f5a6-b7c8d9e0f1a2" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "type": "Bed Making",
    "description": "Making beds with fresh sheets and changing pillowcases",
    "urgency": 4
  }'
```

**Example Response**:
```json
{
  "message": "Housekeeping type updated successfully",
  "data": {
    "id": "d7e8f9a0-b1c2-d3e4-f5a6-b7c8d9e0f1a2",
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "type": "Bed Making",
    "description": "Making beds with fresh sheets and changing pillowcases",
    "urgency": 4,
    "createdAt": "2023-04-25T15:26:48.382Z",
    "updatedAt": "2023-04-25T15:32:15.763Z"
  }
}
```

### Delete a Housekeeping Type

Deletes a housekeeping type.

**URL**: `DELETE /api/management/housekeeping/types/:typeId`

**Path Parameters**:
- `typeId`: UUID of the housekeeping type

**Query Parameters**:
- `hotelId` (required): UUID of the hotel

**Example Request**:
```bash
curl -X DELETE "http://localhost:3000/api/management/housekeeping/types/d7e8f9a0-b1c2-d3e4-f5a6-b7c8d9e0f1a2?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" \
  -H "Content-Type: application/json"
```

**Example Response**:
```json
{
  "message": "Housekeeping type deleted successfully"
}
```

## Error Responses

The API returns appropriate HTTP status codes and error messages:

- `400 Bad Request`: Missing required parameters or invalid values (e.g., urgency outside range 1-5)
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (for create/update operations)
- `500 Internal Server Error`: Server-side error

**Example Error Response**:
```json
{
  "message": "Housekeeping type not found"
}
``` 