# Guest API Documentation

This document provides details for all Guest API endpoints in the SelfServe application.

## Table of Contents

1. [Authentication with Clerk](#authentication-with-clerk)
2. [Profile Management](#profile-management)
3. [Hotel Information](#hotel-information)
4. [Request APIs](#request-apis)
   - [General Requests](#general-requests)
   - [Dining Requests](#dining-requests)
   - [Reservation Requests](#reservation-requests)
5. [Communication](#communication)
   - [Messages](#messages)
   - [Announcements](#announcements)
6. [Feedback](#feedback)

## Authentication with Clerk

Authentication is handled by [Clerk](https://clerk.dev/), a third-party authentication service. The application expects a valid Clerk session token in requests that require authentication.

### User Identity

After authentication with Clerk, the user's Clerk ID is linked to their guest profile in our system. This linkage is handled automatically by the middleware in `src/clerk/auth.ts`.

- The `userid` field in the guest table stores the Clerk User ID
- Protected routes use the Clerk authentication middleware to verify the user's identity
- The system automatically associates the authenticated user with their guest profile

### Authentication Flow

1. User authenticates through Clerk's frontend components
2. Clerk issues a session token
3. Frontend includes the token in API requests
4. Our backend verifies the token using Clerk's middleware
5. Backend links the Clerk user ID to the corresponding guest or employee record

## Profile Management

### Get Profile

```
GET /api/guest/profile?guestId=uuid
```

### Update Preferences

```
PUT /api/guest/profile/preferences
```

**Request Body:**
```json
{
  "guestId": "uuid",
  "preferenceType": "RoomTemperature",
  "preferenceValue": {"temperature": 72, "unit": "F"}
}
```

### Update Dietary Restrictions

```
PUT /api/guest/profile/dietary-restrictions
```

**Request Body:**
```json
{
  "guestId": "uuid",
  "restrictionCodes": ["VEGAN", "GLUTEN"]
}
```

## Request APIs

### General Requests

#### List All General Requests

```
GET /api/guest/general-requests?guestId=uuid&status=SUBMITTED,IN_PROGRESS&category=AMENITY,MAINTENANCE&page=1&limit=10
```

**Query Parameters:**
- `guestId` (string, required): The UUID of the guest.
- `status` (string, optional): Filter by request status. Can be a single status or a comma-separated list (e.g., "SUBMITTED,IN_PROGRESS").
- `category` (string, optional): Filter by request category. Can be a single category or a comma-separated list (e.g., "AMENITY,MAINTENANCE").
- `page` (number, optional): Page number for pagination (default: 1).
- `limit` (number, optional): Number of items per page (default: 10).

#### Get Specific General Request

```
GET /api/guest/general-requests/:requestId?guestId=uuid
```

#### Create General Request

```
POST /api/guest/general-requests
```

**Request Body:**
```json
{
  "guestId": "uuid",
  "hotelId": "uuid",
  "reservationId": "uuid",
  "category": "AMENITY",
  "description": "Need extra towels",
  "roomId": "uuid"
}
```

**Required Fields:**
- `guestId`: The UUID of the guest making the request
- `hotelId`: The UUID of the hotel
- `reservationId`: The UUID of the reservation
- `category`: The category of the request (e.g., "AMENITY", "INFORMATION")

**Optional Fields:**
- `description`: A text description of the request
- `roomId`: The room ID if applicable

#### Cancel General Request

```
PUT /api/guest/general-requests/:requestId/cancel?guestId=uuid
```

### Dining Requests

#### List All Dining Requests

```
GET /api/guest/dining-requests?guestId=uuid&status=SUBMITTED,CONFIRMED&paymentStatus=PENDING,PAID&page=1&limit=10
```

**Query Parameters:**
- `guestId` (string, required): The UUID of the guest.
- `status` (string, optional): Filter by request status. Can be a single status or a comma-separated list (e.g., "SUBMITTED,CONFIRMED").
- `paymentStatus` (string, optional): Filter by payment status. Can be a single status or a comma-separated list (e.g., "PENDING,PAID").
- `page` (number, optional): Page number for pagination (default: 1).
- `limit` (number, optional): Number of items per page (default: 10).

#### Get Specific Dining Request

```
GET /api/guest/dining-requests/:requestId?guestId=uuid
```

#### Create Dining Request

```
POST /api/guest/dining-requests
```

**Request Body:**
```json
{
  "guestId": "uuid",
  "hotelId": "uuid",
  "reservationId": "uuid",
  "roomId": "uuid",
  "restaurantId": "uuid",
  "numGuests": 2,
  "deliveryInstructions": "Please knock loudly",
  "orderItems": [
    {
      "menuItemId": "uuid",
      "quantity": 2,
      "specialInstructions": "No onions"
    }
  ]
}
```

**Required Fields:**
- `guestId`: The UUID of the guest making the request
- `hotelId`: The UUID of the hotel
- `reservationId`: The UUID of the reservation
- `roomId`: The room ID for delivery
- `orderItems`: Array of items with menuItemId and quantity

**Optional Fields:**
- `restaurantId`: The restaurant ID if ordering from a specific restaurant
- `numGuests`: Number of guests for the order
- `deliveryInstructions`: Special delivery instructions

#### Cancel Dining Request

```
PUT /api/guest/dining-requests/:requestId/cancel?guestId=uuid
```

### Reservation Requests

#### List All Reservation Requests

```
GET /api/guest/reservation-requests?guestId=uuid&status=SUBMITTED,CONFIRMED&page=1&limit=10
```

**Query Parameters:**
- `guestId` (string, required): The UUID of the guest.
- `status` (string, optional): Filter by request status. Can be a single status or a comma-separated list (e.g., "SUBMITTED,CONFIRMED").
- `page` (number, optional): Page number for pagination (default: 1).
- `limit` (number, optional): Number of items per page (default: 10).

#### Get Specific Reservation Request

```
GET /api/guest/reservation-requests/:requestId?guestId=uuid
```

#### Create Reservation Request

```
POST /api/guest/reservation-requests
```

**Request Body:**
```json
{
  "guestId": "uuid",
  "hotelId": "uuid",
  "reservationId": "uuid",
  "facilityType": "RESTAURANT",
  "facilityId": "uuid",
  "reservationTime": "2023-08-30T19:00:00Z",
  "partySize": 4,
  "duration": 120,
  "specialRequests": "Window table if possible"
}
```

**Required Fields:**
- `guestId`: The UUID of the guest making the request
- `hotelId`: The UUID of the hotel
- `reservationId`: The UUID of the reservation
- `facilityType`: The type of facility (e.g., "RESTAURANT", "SPA")
- `facilityId`: The ID of the facility
- `reservationTime`: The requested reservation time

**Optional Fields:**
- `partySize`: Number of people in the party
- `duration`: Duration in minutes
- `specialRequests`: Special requests for the reservation

#### Cancel Reservation Request

```
PUT /api/guest/reservation-requests/:requestId/cancel?guestId=uuid
```

## Communication

### Messages

#### List All Messages

```
GET /api/guest/messages?guestId=uuid&type=WELCOME&page=1&limit=10
```

**Query Parameters:**
- `guestId` (string, required): The UUID of the guest.
- `type` (string, optional): Filter messages by type (e.g., "WELCOME", "INFO"). This parameter accepts a single value.
- `page` (number, optional): Page number for pagination (default: 1).
- `limit` (number, optional): Number of items per page (default: 10).

#### Get Specific Message

```
GET /api/guest/messages/:messageId?guestId=uuid
```

### Announcements

#### List All Announcements

```
GET /api/guest/messages/announcements?hotelId=uuid&announcementType=NORMAL,IMPORTANT&page=1&limit=10
```

**Query Parameters:**
- `hotelId` (string, required): The UUID of the hotel. (Note: Typically passed as X-Hotel-ID header for guest routes, confirm actual implementation if guestId is also used for filtering specific announcements to a guest).
- `announcementType` (string, optional): Filter by announcement type. Can be a single type or a comma-separated list (e.g., "NORMAL,IMPORTANT", "EMERGENCY").
- `page` (number, optional): Page number for pagination (default: 1).
- `limit` (number, optional): Number of items per page (default: 10).

## Feedback

### List All Feedback

```
GET /api/guest/feedback?guestId=uuid&hotelId=uuid&page=1&limit=10
```

### Get Feedback Categories

```
GET /api/guest/feedback/categories
```

### Get Feedback Types

```
GET /api/guest/feedback/types
```

### Submit Feedback

```
POST /api/guest/feedback
```

**Request Body:**
```json
{
  "guestId": "uuid",
  "hotelId": "uuid",
  "typeId": "uuid",
  "message": "Great service!",
  "rating": 5
}
```

### Submit Rating

```
POST /api/guest/feedback/rating
```

**Request Body:**
```json
{
  "guestId": "uuid",
  "hotelId": "uuid",
  "categoryId": "uuid",
  "rating": 5,
  "comment": "Excellent room cleanliness"
}
```