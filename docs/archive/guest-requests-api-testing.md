# Guest Requests API Testing Document

This document outlines how to test the various guest request endpoints in the SelfServe API system.

## Table of Contents

1. [General Requests](#general-requests)
2. [Dining Requests](#dining-requests)
3. [Reservation Requests](#reservation-requests)

## General Requests

### Listing General Requests

**Endpoint:** GET /api/guest/general-requests?guestId={guestId}

**Optional Parameters:**
- status: Filter by status (e.g., SUBMITTED, IN_PROGRESS, COMPLETED, CANCELLED)
- category: Filter by category (e.g., AMENITY, INFORMATION)
- page: Page number for pagination (default: 1)
- limit: Number of items per page (default: 10)

**Sample Request:**
```bash
curl -X GET "http://localhost:3000/api/guest/general-requests?guestId=5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777&status=SUBMITTED&page=1&limit=10"
```

### Get Specific General Request

**Endpoint:** GET /api/guest/general-requests/{requestId}?guestId={guestId}

**Sample Request:**
```bash
curl -X GET "http://localhost:3000/api/guest/general-requests/5f8d0d55-8bd2-4f7b-9a7e-c95c5c888888?guestId=5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777"
```

### Create General Request

**Endpoint:** POST /api/guest/general-requests

**Request Body:**
```json
{
  "guestId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777",
  "hotelId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c111111",
  "reservationId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c222222",
  "category": "AMENITY",
  "description": "Request for extra towels",
  "roomId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c333333"
}
```

**Sample Request:**
```bash
curl -X POST "http://localhost:3000/api/guest/general-requests" \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777",
    "hotelId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c111111",
    "reservationId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c222222",
    "category": "AMENITY",
    "description": "Request for extra towels",
    "roomId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c333333"
  }'
```

### Cancel General Request

**Endpoint:** PUT /api/guest/general-requests/{requestId}/cancel?guestId={guestId}

**Sample Request:**
```bash
curl -X PUT "http://localhost:3000/api/guest/general-requests/5f8d0d55-8bd2-4f7b-9a7e-c95c5c888888/cancel?guestId=5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777"
```

## Dining Requests

### Listing Dining Requests

**Endpoint:** GET /api/guest/dining-requests?guestId={guestId}

**Optional Parameters:**
- status: Filter by status (e.g., SUBMITTED, IN_PROGRESS, COMPLETED, CANCELLED)
- paymentStatus: Filter by payment status (e.g., PENDING, PAID)
- page: Page number for pagination (default: 1)
- limit: Number of items per page (default: 10)

**Sample Request:**
```bash
curl -X GET "http://localhost:3000/api/guest/dining-requests?guestId=5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777&status=SUBMITTED&page=1&limit=10"
```

### Get Specific Dining Request

**Endpoint:** GET /api/guest/dining-requests/{requestId}?guestId={guestId}

**Sample Request:**
```bash
curl -X GET "http://localhost:3000/api/guest/dining-requests/5f8d0d55-8bd2-4f7b-9a7e-c95c5c999999?guestId=5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777"
```

### Create Dining Request

**Endpoint:** POST /api/guest/dining-requests

**Request Body:**
```json
{
  "guestId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777",
  "hotelId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c111111",
  "reservationId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c222222",
  "roomId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c333333",
  "restaurantId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c444444",
  "numGuests": 2,
  "deliveryInstructions": "Please knock loudly",
  "orderItems": [
    {
      "menuItemId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c555555",
      "quantity": 2,
      "specialInstructions": "No onions"
    },
    {
      "menuItemId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c666666",
      "quantity": 1
    }
  ]
}
```

**Sample Request:**
```bash
curl -X POST "http://localhost:3000/api/guest/dining-requests" \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777",
    "hotelId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c111111",
    "reservationId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c222222",
    "roomId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c333333",
    "restaurantId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c444444",
    "numGuests": 2,
    "deliveryInstructions": "Please knock loudly",
    "orderItems": [
      {
        "menuItemId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c555555",
        "quantity": 2,
        "specialInstructions": "No onions"
      },
      {
        "menuItemId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c666666",
        "quantity": 1
      }
    ]
  }'
```

### Cancel Dining Request

**Endpoint:** PUT /api/guest/dining-requests/{requestId}/cancel?guestId={guestId}

**Sample Request:**
```bash
curl -X PUT "http://localhost:3000/api/guest/dining-requests/5f8d0d55-8bd2-4f7b-9a7e-c95c5c999999/cancel?guestId=5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777"
```

## Reservation Requests

### Listing Reservation Requests

**Endpoint:** GET /api/guest/reservation-requests?guestId={guestId}

**Optional Parameters:**
- status: Filter by status (e.g., SUBMITTED, IN_PROGRESS, COMPLETED, CANCELLED)
- facilityType: Filter by facility type (e.g., RESTAURANT, SPA)
- page: Page number for pagination (default: 1)
- limit: Number of items per page (default: 10)

**Sample Request:**
```bash
curl -X GET "http://localhost:3000/api/guest/reservation-requests?guestId=5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777&status=SUBMITTED&page=1&limit=10"
```

### Get Specific Reservation Request

**Endpoint:** GET /api/guest/reservation-requests/{requestId}?guestId={guestId}

**Sample Request:**
```bash
curl -X GET "http://localhost:3000/api/guest/reservation-requests/5f8d0d55-8bd2-4f7b-9a7e-c95c5c000000?guestId=5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777"
```

### Create Reservation Request

**Endpoint:** POST /api/guest/reservation-requests

**Request Body:**
```json
{
  "guestId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777",
  "hotelId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c111111",
  "reservationId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c222222",
  "facilityType": "RESTAURANT",
  "facilityId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c444444",
  "reservationTime": "2023-08-30T19:00:00Z",
  "partySize": 4,
  "duration": 120,
  "specialRequests": "Window table if possible"
}
```

**Sample Request:**
```bash
curl -X POST "http://localhost:3000/api/guest/reservation-requests" \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777",
    "hotelId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c111111",
    "reservationId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c222222",
    "facilityType": "RESTAURANT",
    "facilityId": "5f8d0d55-8bd2-4f7b-9a7e-c95c5c444444",
    "reservationTime": "2023-08-30T19:00:00Z",
    "partySize": 4,
    "duration": 120,
    "specialRequests": "Window table if possible"
  }'
```

### Cancel Reservation Request

**Endpoint:** PUT /api/guest/reservation-requests/{requestId}/cancel?guestId={guestId}

**Sample Request:**
```bash
curl -X PUT "http://localhost:3000/api/guest/reservation-requests/5f8d0d55-8bd2-4f7b-9a7e-c95c5c000000/cancel?guestId=5f8d0d55-8bd2-4f7b-9a7e-c95c5c777777"
``` 