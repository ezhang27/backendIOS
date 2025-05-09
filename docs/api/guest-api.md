# Guest API Reference

This document provides information about the Guest API endpoints available in the SelfServe platform.

## Authentication

All Guest API endpoints require authentication using the following headers:

```
X-Guest-ID: {guestId}
X-Hotel-ID: {hotelId}
```

## Base URL

```
/api/guest
```

## Common Query Parameters

Most collection endpoints support the following query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Maximum number of items to return (default: 20, max: 100) |
| `offset` | integer | Number of items to skip (for pagination) |
| `sort` | string | Field to sort by (prefix with `-` for descending order) |

## API Endpoints

### Profile Management

- `GET /api/guest/profile` - Get guest profile information
- `PUT /api/guest/profile` - Update guest profile information
- `PUT /api/guest/profile/preferences` - Update guest preferences
- `PUT /api/guest/profile/contact` - Update contact information

### Request Management

- `GET /api/guest/general-requests` - Get all general requests
- `GET /api/guest/general-requests/:requestId` - Get general request by ID
- `POST /api/guest/general-requests` - Create general request
- `PUT /api/guest/general-requests/:requestId/cancel` - Cancel general request

- `GET /api/guest/dining-requests` - Get all dining and room service requests
- `GET /api/guest/dining-requests/:requestId` - Get dining/room service request by ID
- `POST /api/guest/dining-requests` - Create dining or room service request (Specify `rsItemId` in `orderItems` for room service)
- `PUT /api/guest/dining-requests/:requestId/cancel` - Cancel dining/room service request

- `GET /api/guest/reservation-requests` - Get all reservation requests
- `GET /api/guest/reservation-requests/:requestId` - Get reservation request by ID
- `POST /api/guest/reservation-requests` - Create reservation request
- `PUT /api/guest/reservation-requests/:requestId/cancel` - Cancel reservation request

### Hotel Information

- `GET /api/guest/hotel` - Get hotel information
- `GET /api/guest/hotel/facilities` - Get hotel facilities
- `GET /api/guest/hotel/roomservice/menus` - Get room service menus
- `GET /api/guest/hotel/roomservice/menus/:menuId/schedule` - Get room service menu schedule
- `GET /api/guest/hotel/restaurants` - Get restaurant information
- `GET /api/guest/hotel/restaurants/:restaurantId/menu` - Get restaurant menu
- `GET /api/guest/hotel/specialproducts` - Get special products

### Messaging

- `GET /api/guest/messages` - Get all messages
- `POST /api/guest/messages` - Send message
- `PUT /api/guest/messages/:messageId/read` - Mark message as read
- `GET /api/guest/messages/announcements` - Get hotel announcements

### Feedback

- `POST /api/guest/feedback` - Submit feedback
- `GET /api/guest/feedback/types` - Get feedback types

## Example Responses

### Get Guest Profile

```
GET /api/guest/profile
```

Response:

```json
{
  "id": "85895225-aa94-4da3-96de-a33f14bc4dee",
  "firstName": "Alice",
  "lastName": "Johnson",
  "email": "alice.johnson@example.com",
  "phone": "+1-555-123-4567",
  "preferences": {
    "language": "en",
    "dietaryRestrictions": ["Vegetarian"],
    "roomPreferences": ["High floor", "Away from elevator"]
  }
}
```

### Create Room Service Request

```
POST /api/guest/dining-requests
```

Request:

```json
{
  "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "reservationId": "02a63a0d-ead6-47b0-96f0-4947fc912777",
  "roomId": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
  "serviceContext": "ROOM_SERVICE",
  "scheduledTime": "2025-05-09T08:00:00Z",
  "orderItems": [
    {
      "rsItemId": "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
      "quantity": 1,
      "specialInstructions": "No sugar in coffee"
    },
    {
      "rsItemId": "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "quantity": 2
    }
  ]
}
```

Response:

```json
{
  "id": "76543210-9876-5432-1098-765432109876",
  "type": "RoomService",
  "status": "SCHEDULED",
  "description": "Breakfast order",
  "scheduledTime": "2025-05-09T08:00:00Z",
  "items": [
    {
      "itemId": "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
      "name": "Continental Breakfast",
      "quantity": 1,
      "price": 24.99,
      "specialInstructions": "No sugar in coffee"
    },
    {
      "itemId": "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
      "name": "Fresh Fruit Plate",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "totalAmount": 50.97
}
```

### Get Room Service Menus

```
GET /api/guest/hotel/roomservice/menus
```

Response:

```json
{
  "menus": [
    {
      "id": "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "menuname": "Breakfast Menu",
      "description": "Available from 6am to 11am",
      "items": [
        {
          "id": "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
          "name": "Continental Breakfast",
          "description": "Assorted pastries, fresh fruit, coffee or tea",
          "price": 24.99,
          "category": "Breakfast"
        },
        {
          "id": "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
          "name": "Fresh Fruit Plate",
          "description": "Seasonal fruits",
          "price": 12.99,
          "category": "Breakfast"
        }
      ]
    }
  ]
}
```

### Get Room Service Menu Schedule

```
GET /api/guest/hotel/roomservice/menus/:menuId/schedule
```

Response:

```json
{
  "schedule": [
    {
      "day": "MONDAY",
      "starttime": "06:00:00",
      "endtime": "11:00:00"
    },
    {
      "day": "TUESDAY",
      "starttime": "06:00:00",
      "endtime": "11:00:00"
    }
  ]
}
```

## Detailed Documentation

For detailed request/response examples and parameters for each endpoint, please refer to the [Guest API Testing Guide](../testing/guest-api-testing.md).

## Error Handling

For details on error responses, see the [Error Handling documentation](error-handling.md). 