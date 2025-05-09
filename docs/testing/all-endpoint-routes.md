# Simple list of All endpoint routes, params and methods

## Guest API Endpoints

### General Requests

#### List All General Requests
```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/general-requests?guestId=85895225-aa94-4da3-96de-a33f14bc4dee&status=SUBMITTED,IN_PROGRESS&category=AMENITY,MAINTENANCE&page=1&limit=10"
```

**Query Parameters:**
- `guestId` (required): UUID of the guest
- `status` (optional): Filter by status (comma-separated list)
- `category` (optional): Filter by category (comma-separated list)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

#### Create General Request
```bash
curl -X POST "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/general-requests" \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "reservationId": "02a63a0d-ead6-47b0-96f0-4947fc912777",
    "category": "AMENITY",
    "description": "Need extra towels",
    "roomId": "f25b9828-1544-4234-b92e-e2d4cea72e83"
  }'
```

**Required Fields:**
- `guestId`: UUID of the guest
- `hotelId`: UUID of the hotel
- `reservationId`: UUID of the reservation
- `category`: Request category
- `description`: Request description

**Optional Fields:**
- `roomId`: UUID of the room
- `scheduledTime`: ISO timestamp
- `notes`: Additional notes
- `chargeDetails`: Object with amount, currencyCode, and chargeDescription

#### Cancel General Request
```bash
curl -X PUT "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/general-requests/f25b9828-1544-4234-b92e-e2d4cea72e83/cancel?guestId=85895225-aa94-4da3-96de-a33f14bc4dee"
```

### Dining Requests

#### List All Dining Requests
```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/dining-requests?guestId=85895225-aa94-4da3-96de-a33f14bc4dee&status=SUBMITTED,CONFIRMED&paymentStatus=PENDING,PAID&page=1&limit=10"
```

**Query Parameters:**
- `guestId` (required): UUID of the guest
- `status` (optional): Filter by status
- `paymentStatus` (optional): Filter by payment status
- `page` (optional): Page number
- `limit` (optional): Items per page

#### Create Dining Request
```bash
curl -X POST "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/dining-requests" \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "reservationId": "02a63a0d-ead6-47b0-96f0-4947fc912777",
    "currencyCode": "USD",
    "roomId": "f25b9828-1544-4234-b92e-e2d4cea72e83",
    "restaurantId": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    "numGuests": 2,
    "deliveryInstructions": "Please deliver to room 301",
    "paymentMethod": "ROOM_CHARGE",
    "items": [
      {
        "menuItemId": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
        "quantity": 2,
        "priceId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d"
      }
    ],
    "context": "ROOM_SERVICE"
  }'
```

**Required Fields:**
- `guestId`: UUID of the guest
- `hotelId`: UUID of the hotel
- `reservationId`: UUID of the reservation
- `currencyCode`: Currency code (e.g., "USD")
- `items`: Array of order items
- `context`: Request context (e.g., "ROOM_SERVICE")

**Optional Fields:**
- `roomId`: UUID of the room
- `restaurantId`: UUID of the restaurant
- `numGuests`: Number of guests
- `deliveryInstructions`: Special instructions
- `paymentMethod`: Payment method
- `paymentStatus`: Payment status
- `scheduledTime`: ISO timestamp
- `notes`: Additional notes

## Management API Endpoints

### Hotel Management

#### Get Hotel Details
```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
```

#### Update Hotel Details
```bash
curl -X PUT "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunset Resort",
    "phone": "+1-310-555-1234",
    "email": "info@sunsetresort.com",
    "website": "https://sunsetresort.com",
    "timezone": "America/Los_Angeles"
  }'
```

### Room Management

#### List Rooms
```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/rooms"
```

#### Create Room
```bash
curl -X POST "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/rooms" \
  -H "Content-Type: application/json" \
  -d '{
    "roomnumber": "301",
    "floor": "3",
    "type": "Deluxe",
    "status": "available"
  }'
```

#### Update Room
```bash
curl -X PUT "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/rooms/f25b9828-1544-4234-b92e-e2d4cea72e83" \
  -H "Content-Type: application/json" \
  -d '{
    "roomnumber": "301",
    "floor": "3",
    "type": "Deluxe",
    "status": "maintenance"
  }'
```

#### Delete Room
```bash
curl -X DELETE "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/rooms/f25b9828-1544-4234-b92e-e2d4cea72e83"
```

### Restaurant Management

#### List Restaurants
```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/restaurants"
```

#### Create Restaurant
```bash
curl -X POST "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/restaurants" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sky Lounge",
    "description": "Rooftop restaurant with panoramic views",
    "phone": "+1-310-555-8765",
    "email": "skylounge@sunsetresort.com",
    "capacity": 120
  }'
```

#### Update Restaurant
```bash
curl -X PUT "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/restaurants/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sky Lounge",
    "description": "Updated description",
    "phone": "+1-310-555-8765",
    "email": "skylounge@sunsetresort.com",
    "capacity": 150
  }'
```

#### Delete Restaurant
```bash
curl -X DELETE "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/restaurants/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e"
```

### Facility Management

#### List Facilities
```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/facilities"
```

#### Create Facility
```bash
curl -X POST "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/facilities" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Swimming Pool",
    "description": "Outdoor swimming pool with ocean view",
    "type": "POOL",
    "status": "available",
    "location": "Level 3",
    "opentime": "08:00",
    "closetime": "20:00",
    "capacity": 50
  }'
```

#### Update Facility
```bash
curl -X PUT "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/facilities/f25b9828-1544-4234-b92e-e2d4cea72e83" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Swimming Pool",
    "description": "Updated description",
    "type": "POOL",
    "status": "maintenance",
    "location": "Level 3",
    "opentime": "09:00",
    "closetime": "21:00",
    "capacity": 50
  }'
```

#### Delete Facility
```bash
curl -X DELETE "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/facilities/f25b9828-1544-4234-b92e-e2d4cea72e83"
```

### Price Management

#### Create Price
```bash
curl -X POST "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/prices" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "amount": "42.99",
    "currencyCode": "USD",
    "priceType": "ROOM_RATE",
    "description": "Standard room rate"
  }'
```

#### Update Price
```bash
curl -X PUT "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/prices/9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "amount": "52.99",
    "currencyCode": "USD"
  }'
```

#### Delete Price
```bash
curl -X DELETE "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/prices/9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
```

## Common Response Formats

### Success Response
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "createdAt": "ISO timestamp",
    "updatedAt": "ISO timestamp"
  }
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": "Detailed error information"
}
```

### Paginated Response
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string"
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

## Common Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

