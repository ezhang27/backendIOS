# API Testing Documentation

This document provides instructions for testing the API endpoints for both the guest and management interfaces. Authentication is disabled for testing purposes.

## API Endpoint Overview

### Guest API Endpoints

| Endpoint | Method | Description | Query Parameters | Request Body |
|----------|--------|-------------|-----------------|--------------|
| `/api/guest` | GET | Welcome message | None | None |
| `/api/guest/requests` | GET | List all requests for a guest | `guestId` (required)<br>`page` (optional)<br>`limit` (optional)<br>`status` (optional) | None |
| `/api/guest/requests/:requestId` | GET | Get details of a specific request | `guestId` (required) | None |
| `/api/guest/requests` | POST | Create a new request | None | `guestId` (required)<br>`hotelId` (required)<br>`reservationId` (required)<br>`requestType` (required)<br>`description` (optional) |
| `/api/guest/requests/:requestId/cancel` | PUT | Cancel a request | `guestId` (required) | None |
| `/api/guest/hotel/:hotelId` | GET | Get hotel details | None | None |
| `/api/guest/hotel/:hotelId/events` | GET | Get hotel events | None | None |
| `/api/guest/hotel/:hotelId/rooms` | GET | Get hotel rooms | None | None |
| `/api/guest/hotel/:hotelId/restaurants` | GET | Get hotel restaurants | None | None |
| `/api/guest/hotel/:hotelId/facilities` | GET | Get hotel facilities | None | None |

### Management API Endpoints

| Endpoint | Method | Description | Query Parameters | Request Body |
|----------|--------|-------------|-----------------|--------------|
| `/api/management` | GET | Welcome message | None | None |
| `/api/management/requests` | GET | List all requests for a hotel | `hotelId` (required)<br>`status` (optional)<br>`page` (optional)<br>`limit` (optional)<br>`search` (optional) | None |
| `/api/management/requests/:requestId` | GET | Get details of a specific request | `hotelId` (required) | None |
| `/api/management/requests/:requestId/status` | PUT | Update the status of a request | None | `hotelId` (required)<br>`status` (required) |
| `/api/management/hotel/:hotelId` | GET | Get hotel details | None | None |
| `/api/management/hotel/:hotelId` | PUT | Update hotel details | None | Hotel data to update |
| `/api/management/hotel/:hotelId/events` | GET | Get all events for a hotel | None | None |
| `/api/management/hotel/:hotelId/events` | POST | Create a new event | None | Event data |
| `/api/management/hotel/:hotelId/events/:eventId` | PUT | Update an event | None | Event data to update |
| `/api/management/hotel/:hotelId/events/:eventId` | DELETE | Delete an event | None | None |
| `/api/management/hotel/:hotelId/rooms` | GET | Get all rooms for a hotel | None | None |
| `/api/management/hotel/:hotelId/rooms` | POST | Create a new room | None | Room data |
| `/api/management/hotel/:hotelId/rooms/:roomId` | PUT | Update a room | None | Room data to update |
| `/api/management/hotel/:hotelId/rooms/:roomId` | DELETE | Delete a room | None | None |
| `/api/management/hotel/:hotelId/restaurants` | GET | Get all restaurants for a hotel | None | None |
| `/api/management/hotel/:hotelId/restaurants` | POST | Create a new restaurant | None | Restaurant data |
| `/api/management/hotel/:hotelId/restaurants/:restaurantId` | PUT | Update a restaurant | None | Restaurant data to update |
| `/api/management/hotel/:hotelId/restaurants/:restaurantId` | DELETE | Delete a restaurant | None | None |
| `/api/management/hotel/:hotelId/facilities` | GET | Get all facilities for a hotel | None | None |
| `/api/management/hotel/:hotelId/facilities` | POST | Create a new facility | None | Facility data |
| `/api/management/hotel/:hotelId/facilities/:facilityId` | PUT | Update a facility | None | Facility data to update |
| `/api/management/hotel/:hotelId/facilities/:facilityId` | DELETE | Delete a facility | None | None |

## Testing Environment

The API is deployed and accessible at:

```
https://api-dev-demo-hqflj.ondigitalocean.app
```

## Sample Data for Testing

For testing purposes, you can use the following sample data:

### Guest IDs
- `85895225-aa94-4da3-96de-a33f14bc4dee` (Alice Johnson)
- `c631efa2-32e9-4707-895d-faeaf30d4dba` (Robert Davis)
- `91df6ea6-1148-4fc2-aeed-fda8135a68dc` (Charlie Wilson)

### Hotel IDs
- `a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d` (Grand Luxe New York)
- `b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e` (Sunset Resort LA)
- `c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f` (Maple Leaf Toronto)

### Reservation IDs
- `02a63a0d-ead6-47b0-96f0-4947fc912777`
- `a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d`
- `b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e`
- `c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f`

### Request IDs
- `f25b9828-1544-4234-b92e-e2d4cea72e83` (Concierge request - COMPLETED)
- `ee490d87-d9c2-4f1d-b28f-58fe03dfe020` (Housekeeping request - SUBMITTED)
- `d2c35f14-4068-4e59-9571-a7158456f759` (Room Service request - CANCELLED)

### Employee IDs
- `1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d` (Front Desk Manager)
- `2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e` (Concierge Staff)
- `3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f` (Housekeeping Manager)
- `4d5e6f7a-8b9c-0d1e-2f3a-4b5c6d7e8f9` (Room Service Staff)

### Role IDs
- `1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d` (Manager)
- `2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e` (Staff)
- `3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f` (Admin)

### Valid Request Status Values
- `SUBMITTED` - Initial status when request is created
- `IN_PROGRESS` - Staff is actively working on the request
- `COMPLETED` - Request has been fulfilled
- `CANCELLED` - Request was cancelled by guest or staff
- `DELAYED` - Request fulfillment has been delayed
- `SCHEDULED` - Request is scheduled for future completion

### Department Values
- `Housekeeping`
- `Concierge`
- `RoomService`
- `Maintenance`
- `FrontDesk`
- `Restaurant`
- `Spa`

### Room IDs
- `a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d` (Room 101, Standard)
- `b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e` (Room 102, Standard)
- `c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f` (Room 201, Deluxe)
- `d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a` (Room 301, Suite)
- `e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b` (Room 401, Presidential)

### Restaurant IDs
- `1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d` (Grand Bistro)
- `2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e` (Sunset Café)
- `3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f` (Maple Grill)

### Facility IDs
- `a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d` (Grand Spa)
- `b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e` (Fitness Center)
- `c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f` (Sunset Pool)
- `d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a` (Maple Conference Hall)

## Testing the Guest API Endpoints

### 1. Guest Welcome Endpoint

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest"
```

**Expected Response:**
```json
{
  "message": "Welcome to the SelfServe Guest API"
}
```

### 2. Get All Requests for a Guest

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/requests?guestId=85895225-aa94-4da3-96de-a33f14bc4dee" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "requestId": "f25b9828-1544-4234-b92e-e2d4cea72e83",
      "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
      "reservationId": "02a63a0d-ead6-47b0-96f0-4947fc912777",
      "requestTypeId": "Concierge",
      "status": "Scheduled",
      "scheduledTime": "2025-04-29T00:26:44.924Z",
      "comments": "Reservation at nearby restaurant",
      "createdat": "2025-04-28T00:26:44.924Z",
      "updatedat": "2025-04-28T00:26:44.924Z"
    },
    {
      "requestId": "ee490d87-d9c2-4f1d-b28f-58fe03dfe020",
      "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
      "reservationId": "02a63a0d-ead6-47b0-96f0-4947fc912777",
      "requestTypeId": "Housekeeping",
      "status": "Submitted",
      "comments": "Need extra towels and toiletries",
      "createdat": "2025-04-26T00:26:44.924Z",
      "updatedat": "2025-04-26T00:26:44.924Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalCount": 2,
    "totalPages": 1
  }
}
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 10)
- `status`: Filter requests by status

Example with pagination and filtering:
```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/requests?guestId=85895225-aa94-4da3-96de-a33f14bc4dee&page=1&limit=5&status=Submitted" | jq
```

### 3. Get a Specific Guest Request by ID

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/requests/f25b9828-1544-4234-b92e-e2d4cea72e83?guestId=85895225-aa94-4da3-96de-a33f14bc4dee" | jq
```

**Expected Response:**
```json
{
  "requestId": "f25b9828-1544-4234-b92e-e2d4cea72e83",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
  "reservationId": "02a63a0d-ead6-47b0-96f0-4947fc912777",
  "requestTypeId": "Concierge",
  "status": "Scheduled",
  "scheduledTime": "2025-04-29T00:26:44.924Z",
  "comments": "Reservation at nearby restaurant",
  "createdat": "2025-04-28T00:26:44.924Z",
  "updatedat": "2025-04-28T00:26:44.924Z"
}
```

### 4. Create a New Request

```bash
curl -X POST "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/requests" \
  -H "Content-Type: application/json" \
  -d '{
    "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "reservationId": "02a63a0d-ead6-47b0-96f0-4947fc912777",
    "requestType": "Room Service",
    "description": "Need coffee and breakfast"
  }' | jq
```

**Required Fields:**
- `guestId`: The UUID of the guest making the request
- `hotelId`: The UUID of the hotel
- `reservationId`: The UUID of the reservation
- `requestType`: The type of request (e.g., "Room Service", "Housekeeping", "Maintenance")

**Optional Fields:**
- `description`: A text description of the request
- `notes`: Additional notes about the request (if not provided, description will be used)

**Example Response:**
```json
{
  "requestId": "d2c35f14-4068-4e59-9571-a7158456f759",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
  "reservationId": "02a63a0d-ead6-47b0-96f0-4947fc912777", 
  "requestTypeId": "Room Service",
  "status": "SUBMITTED",
  "comments": "Need coffee and breakfast",
  "createdat": "2025-04-28T00:27:12.876Z",
  "updatedat": "2025-04-28T00:27:12.876Z"
}
```

### 5. Cancel a Request

```bash
curl -X PUT "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/requests/d2c35f14-4068-4e59-9571-a7158456f759/cancel?guestId=85895225-aa94-4da3-96de-a33f14bc4dee" | jq
```

**Example Response:**
```json
{
  "requestId": "d2c35f14-4068-4e59-9571-a7158456f759",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
  "reservationId": "02a63a0d-ead6-47b0-96f0-4947fc912777", 
  "requestTypeId": "Room Service",
  "status": "CANCELLED",
  "comments": "Need coffee and breakfast",
  "createdat": "2025-04-28T00:27:12.876Z",
  "updatedat": "2025-04-28T00:28:45.123Z"
}
```

### 6. Get Hotel Details

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" | jq
```

**Expected Response:**
```json
{
  "hotelid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
  "name": "Sunset Resort LA",
  "addressid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
  "phone": "+1-310-555-5678",
  "email": "info@sunsetresortla.com",
  "website": "www.sunsetresortla.com",
  "mapfile": null,
  "logo": null,
  "timezone": "America/Los_Angeles",
  "createdat": "2025-04-26 23:30:35.058103+00",
  "updatedat": "2025-04-26 23:30:35.058103+00"
}
```

### 7. Get Hotel Events

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/events" | jq
```

**Expected Response:**
```json
[]
```

### 8. Get Hotel Rooms

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/rooms" | jq
```

**Expected Response:**
```json
[
  {
    "roomid": "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
    "hotelid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "buildingid": "3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    "roomnumber": "301",
    "floor": "3",
    "type": "Suite",
    "status": "available",
    "createdat": "2025-04-26 23:30:35.058103+00",
    "updatedat": "2025-04-26 23:30:35.058103+00"
  }
]
```

### 9. Get Hotel Restaurants

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/restaurants" | jq
```

**Expected Response:**
```json
[
  {
    "restaurantid": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    "hotelid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "name": "Sunset Café",
    "description": "Casual dining with ocean views",
    "addressid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "phone": "+1-310-555-5679",
    "email": "cafe@sunsetresortla.com",
    "capacity": 80,
    "link": null,
    "menucount": null,
    "headerphoto": null,
    "createdat": "2025-04-26 23:30:35.058103+00",
    "updatedat": "2025-04-26 23:30:35.058103+00"
  }
]
```

### 10. Get Hotel Facilities

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/guest/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/facilities" | jq
```

**Expected Response:**
```json
[
  {
    "facilityid": "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    "hotelid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "name": "Sunset Pool",
    "description": "Outdoor swimming pool with ocean view",
    "type": "Pool",
    "status": "available",
    "location": "Ground Floor",
    "headerphoto": null,
    "opentime": "07:00:00",
    "middleopentime": null,
    "middleclosetime": null,
    "closetime": "20:00:00",
    "link": null,
    "capacity": 100,
    "additionalinfo": null,
    "createdat": "2025-04-26 23:30:35.058103+00",
    "updatedat": "2025-04-26 23:30:35.058103+00"
  }
]
```

## Testing the Management API Endpoints

### 1. Management Welcome Endpoint

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management"
```

**Expected Response:**
```json
{
  "message": "Welcome to the SelfServe Management API"
}
```

### 2. Get All Requests for a Hotel

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/requests?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "requestId": "d2c35f14-4068-4e59-9571-a7158456f759",
      "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
      "guestName": "Ms. Alice Johnson",
      "guestContact": {
        "email": "alice@example.com",
        "phone": "+15551234"
      },
      "requestType": "Room Service",
      "department": null,
      "status": "CANCELLED",
      "description": "Need coffee and breakfast",
      "createdAt": "2025-04-28 00:27:12.876+00",
      "updatedAt": "2025-04-28 00:27:19.018+00",
      "scheduledTime": null,
      "completedAt": null
    },
    {
      "requestId": "f25b9828-1544-4234-b92e-e2d4cea72e83",
      "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
      "guestName": "Ms. Alice Johnson",
      "guestContact": {
        "email": "alice@example.com",
        "phone": "+15551234"
      },
      "requestType": "Concierge",
      "department": "Concierge",
      "status": "COMPLETED",
      "description": "Reservation at nearby restaurant",
      "createdAt": "2025-04-28 00:26:44.924+00",
      "updatedAt": "2025-04-28 04:26:52.923+00",
      "scheduledTime": "2025-04-29 00:26:44.924+00",
      "completedAt": "2025-04-28 04:26:52.923+00"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 6
  }
}
```

**Optional Query Parameters:**
- `status`: Filter requests by status (e.g., "SUBMITTED", "IN_PROGRESS", "COMPLETED", "CANCELLED")
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)
- `search`: Search text to filter requests by description or guest name

Example with status filtering:
```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/requests?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&status=COMPLETED" | jq
```

Example with pagination:
```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/requests?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&limit=2&page=1" | jq
```

### 3. Get a Specific Request by ID (Management View)

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/requests/ee490d87-d9c2-4f1d-b28f-58fe03dfe020?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "requestId": "ee490d87-d9c2-4f1d-b28f-58fe03dfe020",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
  "reservationId": "02a63a0d-ead6-47b0-96f0-4947fc912777",
  "guestInfo": {
    "name": "Ms. Alice Johnson",
    "email": "alice@example.com",
    "phone": "+15551234"
  },
  "requestType": "Housekeeping",
  "department": "Housekeeping",
  "status": "COMPLETED",
  "description": "Need extra towels and toiletries",
  "createdAt": "2025-04-26 00:26:44.924+00",
  "updatedAt": "2025-04-28 05:00:02.014+00",
  "scheduledTime": null,
  "completedAt": "2025-04-28 05:00:02.014+00"
}
```

### 4. Update Request Status

```bash
curl -X PUT "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/requests/ee490d87-d9c2-4f1d-b28f-58fe03dfe020/status" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "status": "IN_PROGRESS"
  }' | jq
```

**Required Fields:**
- `hotelId`: The UUID of the hotel
- `status`: The new status value (one of: "SUBMITTED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "DELAYED", "SCHEDULED")

**Example Response:**
```json
{
  "requestId": "ee490d87-d9c2-4f1d-b28f-58fe03dfe020",
  "status": "IN_PROGRESS",
  "updatedAt": "2025-04-28 04:58:49.438+00",
  "completedAt": null
}
```

Marking a request as completed:
```bash
curl -X PUT "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/requests/ee490d87-d9c2-4f1d-b28f-58fe03dfe020/status" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "status": "COMPLETED"
  }' | jq
```

**Example Response for Complete:**
```json
{
  "requestId": "ee490d87-d9c2-4f1d-b28f-58fe03dfe020",
  "status": "COMPLETED",
  "updatedAt": "2025-04-28 05:00:02.014+00",
  "completedAt": "2025-04-28 05:00:02.014+00"
}
```

Note: When a request is marked as "COMPLETED", the `completedAt` timestamp is automatically updated. For other status changes, it remains null or unchanged.

### 5. Get Hotel Details (Management)

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" | jq
```

**Expected Response:**
```json
{
  "data": {
    "hotelid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "name": "Sunset Resort LA",
    "addressid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "phone": "+1-310-555-5678",
    "email": "info@sunsetresortla.com",
    "website": "www.sunsetresortla.com",
    "mapfile": null,
    "logo": null,
    "timezone": "America/Los_Angeles",
    "createdat": "2025-04-26 23:30:35.058103+00",
    "updatedat": "2025-04-26 23:30:35.058103+00"
  }
}
```

### 6. Update Hotel Details

```bash
curl -X PUT "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sunset Resort Los Angeles",
    "phone": "+1-310-555-5678",
    "email": "info@sunsetresortla.com",
    "website": "www.sunsetresortlosangeles.com"
  }' | jq
```

**Example Response:**
```json
{
  "data": {
    "hotelid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "name": "Sunset Resort Los Angeles",
    "addressid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "phone": "+1-310-555-5678",
    "email": "info@sunsetresortla.com",
    "website": "www.sunsetresortlosangeles.com",
    "mapfile": null,
    "logo": null,
    "timezone": "America/Los_Angeles",
    "createdat": "2025-04-26 23:30:35.058103+00",
    "updatedat": "2025-04-29 04:55:12.324+00"
  }
}
```

### 7. Get Hotel Events

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/events" | jq
```

**Example Response:**
```json
{
  "data": [
    {
      "eventid": "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
      "hotelid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      "eventname": "Summer Pool Party Extravaganza",
      "imagefile": null,
      "location": "Pool Deck",
      "description": "Annual summer pool party with DJ, refreshments, and prizes",
      "link": null,
      "frequency": null,
      "createdat": "2025-04-29 04:45:16.144+00",
      "updatedat": "2025-04-29 04:46:39.235+00"
    }
  ]
}
```

### 8. Create New Event

```bash
curl -X POST "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/events" \
  -H "Content-Type: application/json" \
  -d '{
    "eventid": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    "eventname": "Wine Tasting Evening",
    "description": "Exclusive wine tasting event featuring local wineries",
    "location": "Sky Lounge"
  }' | jq
```

**Example Response:**
```json
{
  "data": {
    "eventid": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    "hotelid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "eventname": "Wine Tasting Evening",
    "imagefile": null,
    "location": "Sky Lounge",
    "description": "Exclusive wine tasting event featuring local wineries",
    "link": null,
    "frequency": null,
    "createdat": "2025-04-29 04:57:23.512+00",
    "updatedat": "2025-04-29 04:57:23.512+00"
  }
}
```

### 9. Update Event

```bash
curl -X PUT "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/events/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e" \
  -H "Content-Type: application/json" \
  -d '{
    "eventname": "Premium Wine Tasting Evening",
    "description": "Exclusive wine tasting event featuring award-winning local wineries"
  }' | jq
```

**Example Response:**
```json
{
  "data": {
    "eventid": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    "hotelid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "eventname": "Premium Wine Tasting Evening",
    "imagefile": null,
    "location": "Sky Lounge",
    "description": "Exclusive wine tasting event featuring award-winning local wineries",
    "link": null,
    "frequency": null,
    "createdat": "2025-04-29 04:57:23.512+00",
    "updatedat": "2025-04-29 04:58:45.321+00"
  }
}
```

### 10. Delete Event

```bash
curl -X DELETE "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/events/2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e" | jq
```

**Example Response:**
```json
{
  "message": "Event deleted successfully"
}
```

### 11. Get Hotel Restaurants

```bash
curl -X GET "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/restaurants" | jq
```

**Example Response:**
```json
{
  "data": [
    {
      "restaurantid": "2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
      "hotelid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      "name": "Sunset Café",
      "description": "Casual dining with ocean views",
      "addressid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      "phone": "+1-310-555-5679",
      "email": "cafe@sunsetresortla.com",
      "capacity": 80,
      "link": null,
      "menucount": null,
      "headerphoto": null,
      "createdat": "2025-04-26 23:30:35.058103+00",
      "updatedat": "2025-04-26 23:30:35.058103+00"
    }
  ]
}
```

### 12. Create New Restaurant

```bash
curl -X POST "https://api-dev-demo-hqflj.ondigitalocean.app/api/management/hotel/b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e/restaurants" \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantid": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    "name": "Sky Lounge",
    "description": "Rooftop restaurant with panoramic views",
    "phone": "+1-310-555-8765",
    "email": "skylounge@sunsetresortla.com",
    "capacity": 120
  }' | jq
```

**Example Response:**
```json
{
  "data": {
    "restaurantid": "5e6f7a8b-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    "hotelid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    "name": "Sky Lounge",
    "description": "Rooftop restaurant with panoramic views",
    "addressid": null,
    "phone": "+1-310-555-8765",
    "email": "skylounge@sunsetresortla.com",
    "capacity": 120,
    "link": null,
    "menucount": null,
    "headerphoto": null,
    "createdat": "2025-04-29 05:00:36.123+00",
    "updatedat": "2025-04-29 05:00:36.123+00"
  }
}
```

Similar examples for rooms and facilities endpoints would follow the same pattern.

## Request Status Types

Requests can have the following status values:

- `SUBMITTED`: Initial status when a request is created
- `IN_PROGRESS`: Request is being processed by staff
- `SCHEDULED`: Request is scheduled for a future time
- `COMPLETED`: Request has been fulfilled
- `CANCELLED`: Request has been cancelled by the guest or staff
- `DELAYED`: Request is delayed for some reason

## Common Request Types

The following request types are supported:

- `Room Service`: Food and beverage delivery to rooms
- `Housekeeping`: Cleaning services and room maintenance requests
- `Maintenance`: Issues needing repair or attention
- `Concierge`: Information, reservations, and general assistance

## Future Development

In future implementations, authentication will be enabled using Clerk:
- Guest API: The `guestId` parameter will be extracted from the guest's authenticated session
- Management API: The `hotelId` parameter will be extracted from the employee's hotel assignment 

## Management API - Housekeeping Types

The housekeeping types API allows hotel management to create, read, update, and delete housekeeping request types (like "Room Cleaning", "Towel Service", etc.) and set urgency levels.

### 1. Get All Housekeeping Types for a Hotel

```bash
curl -X GET "http://localhost:3000/api/management/housekeeping/types?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
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

### 2. Get a Specific Housekeeping Type

```bash
curl -X GET "http://localhost:3000/api/management/housekeeping/types/b5c6d7e8-f9a0-b1c2-d3e4-f5a6b7c8d9e0?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
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

### 3. Create a New Housekeeping Type

```bash
curl -X POST "http://localhost:3000/api/management/housekeeping/types" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "type": "Bed Making",
    "description": "Making beds with fresh sheets",
    "urgency": 3
  }' | jq
```

**Required Fields:**
- `hotelId`: The UUID of the hotel
- `type`: The name of the housekeeping type

**Optional Fields:**
- `description`: A description of the housekeeping type
- `urgency`: Urgency level from 1-5 (1 = lowest, 5 = highest)

**Expected Response:**
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

### 4. Update a Housekeeping Type

```bash
curl -X PUT "http://localhost:3000/api/management/housekeeping/types/d7e8f9a0-b1c2-d3e4-f5a6-b7c8d9e0f1a2" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "type": "Bed Making",
    "description": "Making beds with fresh sheets and changing pillowcases",
    "urgency": 4
  }' | jq
```

**Required Fields:**
- `hotelId`: The UUID of the hotel
- `type`: The name of the housekeeping type

**Optional Fields:**
- `description`: A description of the housekeeping type
- `urgency`: Urgency level from 1-5 (1 = lowest, 5 = highest)

**Expected Response:**
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

### 5. Delete a Housekeeping Type

```bash
curl -X DELETE "http://localhost:3000/api/management/housekeeping/types/d7e8f9a0-b1c2-d3e4-f5a6-b7c8d9e0f1a2?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "message": "Housekeeping type deleted successfully"
}
``` 