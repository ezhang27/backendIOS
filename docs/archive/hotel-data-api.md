# Hotel Data API Documentation

This document provides detailed information about the Hotel Data API endpoints for both guest and management interfaces.

## Guest API Endpoints

### Hotel Information

#### Get Hotel Details
```http
GET /api/guest/hotel/:hotelId
```

**Response:**
```json
{
  "data": {
    "hotelid": "string",
    "name": "string",
    "phone": "string",
    "email": "string",
    "website": "string",
    "mapfile": "string",
    "logo": "string",
    "timezone": "string"
  }
}
```

### Rooms

#### List Hotel Rooms
```http
GET /api/guest/hotel/:hotelId/rooms
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by room type
- `status` (optional): Filter by room status

**Response:**
```json
{
  "data": [
    {
      "roomid": "string",
      "hotelid": "string",
      "roomnumber": "string",
      "floor": "string",
      "type": "string",
      "status": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

#### Get Room Details
```http
GET /api/guest/hotel/:hotelId/rooms/:roomId
```

**Response:**
```json
{
  "data": {
    "roomid": "string",
    "hotelid": "string",
    "roomnumber": "string",
    "floor": "string",
    "type": "string",
    "status": "string"
  }
}
```

### Restaurants

#### List Hotel Restaurants
```http
GET /api/guest/hotel/:hotelId/restaurants
```

**Response:**
```json
{
  "data": [
    {
      "restaurantid": "string",
      "hotelid": "string",
      "name": "string",
      "description": "string",
      "phone": "string",
      "email": "string",
      "capacity": 0,
      "link": "string",
      "menucount": 0,
      "headerphoto": "string"
    }
  ]
}
```

#### Get Restaurant Details
```http
GET /api/guest/hotel/:hotelId/restaurants/:restaurantId
```

**Response:**
```json
{
  "data": {
    "restaurantid": "string",
    "hotelid": "string",
    "name": "string",
    "description": "string",
    "phone": "string",
    "email": "string",
    "capacity": 0,
    "link": "string",
    "menucount": 0,
    "headerphoto": "string"
  }
}
```

#### List Restaurant Menu Items
```http
GET /api/guest/hotel/:hotelId/restaurants/:restaurantId/menus
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)
- `category` (optional): Filter by menu item category

**Response:**
```json
{
  "data": [
    {
      "menuitemid": "string",
      "hotelid": "string",
      "restaurantmenuid": "string",
      "photo": "string",
      "description": "string",
      "ingredients": "string",
      "category": "string",
      "mastersection": "string",
      "itemname": "string",
      "spicelevel": "string",
      "price": "string",
      "isspecial": false,
      "specialstartdate": "string",
      "specialenddate": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

### Facilities

#### List Hotel Facilities
```http
GET /api/guest/hotel/:hotelId/facilities
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by facility type

**Response:**
```json
{
  "data": [
    {
      "facilityid": "string",
      "hotelid": "string",
      "name": "string",
      "description": "string",
      "type": "string",
      "status": "string",
      "location": "string",
      "headerphoto": "string",
      "opentime": "string",
      "closetime": "string",
      "capacity": 0,
      "link": "string",
      "additionalinfo": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

#### Get Facility Details
```http
GET /api/guest/hotel/:hotelId/facilities/:facilityId
```

**Response:**
```json
{
  "data": {
    "facilityid": "string",
    "hotelid": "string",
    "name": "string",
    "description": "string",
    "type": "string",
    "status": "string",
    "location": "string",
    "headerphoto": "string",
    "opentime": "string",
    "closetime": "string",
    "capacity": 0,
    "link": "string",
    "additionalinfo": "string"
  }
}
```

### Events

#### List Hotel Events
```http
GET /api/guest/hotel/:hotelId/events
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:**
```json
{
  "data": [
    {
      "eventid": "string",
      "hotelid": "string",
      "eventname": "string",
      "imagefile": "string",
      "location": "string",
      "description": "string",
      "link": "string",
      "frequency": "string"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

#### Get Event Details
```http
GET /api/guest/hotel/:hotelId/events/:eventId
```

**Response:**
```json
{
  "data": {
    "eventid": "string",
    "hotelid": "string",
    "eventname": "string",
    "imagefile": "string",
    "location": "string",
    "description": "string",
    "link": "string",
    "frequency": "string"
  }
}
```

## Management API Endpoints

### Hotel Information

#### Get Hotel Details
```http
GET /api/management/hotel/:hotelId
```

**Response:** Same as guest API

#### Update Hotel Details
```http
PUT /api/management/hotel/:hotelId
```

**Request Body:**
```json
{
  "name": "string",
  "phone": "string",
  "email": "string",
  "website": "string",
  "mapfile": "string",
  "logo": "string",
  "timezone": "string"
}
```

**Response:**
```json
{
  "data": {
    "hotelid": "string",
    "name": "string",
    "phone": "string",
    "email": "string",
    "website": "string",
    "mapfile": "string",
    "logo": "string",
    "timezone": "string",
    "createdat": "string",
    "updatedat": "string"
  }
}
```

### Rooms Management

#### List Rooms
```http
GET /api/management/hotel/:hotelId/rooms
```

**Query Parameters:** Same as guest API

**Response:** Same as guest API

#### Create Room
```http
POST /api/management/hotel/:hotelId/rooms
```

**Request Body:**
```json
{
  "roomnumber": "string",
  "floor": "string",
  "type": "string",
  "status": "string"
}
```

**Response:**
```json
{
  "data": {
    "roomid": "string",
    "hotelid": "string",
    "roomnumber": "string",
    "floor": "string",
    "type": "string",
    "status": "string",
    "createdat": "string",
    "updatedat": "string"
  }
}
```

#### Update Room
```http
PUT /api/management/hotel/:hotelId/rooms/:roomId
```

**Request Body:**
```json
{
  "roomnumber": "string",
  "floor": "string",
  "type": "string",
  "status": "string"
}
```

**Response:** Same as create room

#### Delete Room
```http
DELETE /api/management/hotel/:hotelId/rooms/:roomId
```

**Response:**
```json
{
  "message": "Room deleted successfully"
}
```

### Restaurant Management

#### List Restaurants
```http
GET /api/management/hotel/:hotelId/restaurants
```

**Response:**
```json
{
  "data": [
    {
      "restaurantid": "string",
      "hotelid": "string",
      "name": "string",
      "description": "string",
      "phone": "string",
      "email": "string",
      "capacity": 0,
      "link": "string",
      "menucount": 0,
      "headerphoto": "string"
    }
  ]
}
```

#### Create Restaurant
```http
POST /api/management/hotel/:hotelId/restaurants
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "phone": "string",
  "email": "string",
  "capacity": 0,
  "link": "string",
  "menucount": 0,
  "headerphoto": "string"
}
```

**Response:**
```json
{
  "data": {
    "restaurantid": "string",
    "hotelid": "string",
    "name": "string",
    "description": "string",
    "phone": "string",
    "email": "string",
    "capacity": 0,
    "link": "string",
    "menucount": 0,
    "headerphoto": "string",
    "createdat": "string",
    "updatedat": "string"
  }
}
```

#### Update Restaurant
```http
PUT /api/management/hotel/:hotelId/restaurants/:restaurantId
```

**Request Body:** Same as create restaurant

**Response:** Same as create restaurant

#### Delete Restaurant
```http
DELETE /api/management/hotel/:hotelId/restaurants/:restaurantId
```

**Response:**
```json
{
  "message": "Restaurant deleted successfully"
}
```

### Menu Management

#### List Menu Items
```http
GET /api/management/hotel/:hotelId/restaurants/:restaurantId/menus
```

**Query Parameters:** Same as guest API

**Response:** Same as guest API

#### Create Menu Item
```http
POST /api/management/hotel/:hotelId/restaurants/:restaurantId/menus
```

**Request Body:**
```json
{
  "photo": "string",
  "description": "string",
  "ingredients": "string",
  "category": "string",
  "mastersection": "string",
  "itemname": "string",
  "spicelevel": "string",
  "price": "string",
  "isspecial": false,
  "specialstartdate": "string",
  "specialenddate": "string"
}
```

**Response:**
```json
{
  "data": {
    "menuitemid": "string",
    "hotelid": "string",
    "restaurantmenuid": "string",
    "photo": "string",
    "description": "string",
    "ingredients": "string",
    "category": "string",
    "mastersection": "string",
    "itemname": "string",
    "spicelevel": "string",
    "price": "string",
    "isspecial": false,
    "specialstartdate": "string",
    "specialenddate": "string",
    "createdat": "string",
    "updatedat": "string"
  }
}
```

#### Update Menu Item
```http
PUT /api/management/hotel/:hotelId/restaurants/:restaurantId/menus/:menuId/items/:itemId
```

**Request Body:** Same as create menu item

**Response:** Same as create menu item

#### Delete Menu Item
```http
DELETE /api/management/hotel/:hotelId/restaurants/:restaurantId/menus/:menuId/items/:itemId
```

**Response:**
```json
{
  "message": "Menu item deleted successfully"
}
```

### Facility Management

#### List Facilities
```http
GET /api/management/hotel/:hotelId/facilities
```

**Query Parameters:** Same as guest API

**Response:** Same as guest API

#### Create Facility
```http
POST /api/management/hotel/:hotelId/facilities
```

**Request Body:**
```json
{
  "name": "string",
  "description": "string",
  "type": "string",
  "status": "string",
  "location": "string",
  "headerphoto": "string",
  "opentime": "string",
  "closetime": "string",
  "capacity": 0,
  "link": "string",
  "additionalinfo": "string"
}
```

**Response:**
```json
{
  "data": {
    "facilityid": "string",
    "hotelid": "string",
    "name": "string",
    "description": "string",
    "type": "string",
    "status": "string",
    "location": "string",
    "headerphoto": "string",
    "opentime": "string",
    "closetime": "string",
    "capacity": 0,
    "link": "string",
    "additionalinfo": "string",
    "createdat": "string",
    "updatedat": "string"
  }
}
```

#### Update Facility
```http
PUT /api/management/hotel/:hotelId/facilities/:facilityId
```

**Request Body:** Same as create facility

**Response:** Same as create facility

**Validation Requirements:**
- `status` must be one of: 'available', 'maintenance', 'closed'
- `name` and `type` fields are required and cannot be null
- `opentime` and `closetime` must be provided together, and open time must be earlier than close time
- `capacity` must be a positive number or null
- Facility names must be unique within a hotel

**Error Responses:**
```json
// Invalid status value
{
  "message": "Invalid status value",
  "validValues": ["available", "maintenance", "closed"]
}

// Missing required field
{
  "message": "name is required and cannot be null"
}

// Time constraint violation
{
  "message": "Both opentime and closetime must be provided together"
}

// Opening time must be earlier than closing time
{
  "message": "Opening time must be earlier than closing time and both must be provided together"
}

// Capacity constraint violation
{
  "message": "Capacity must be a positive number or null"
}

// Name uniqueness constraint
{
  "message": "A facility with this name already exists at this hotel"
}
```

#### Delete Facility
```http
DELETE /api/management/hotel/:hotelId/facilities/:facilityId
```

**Response:**
```json
{
  "message": "Facility deleted successfully"
}
```

### Event Management

#### List Events
```http
GET /api/management/hotel/:hotelId/events
```

**Query Parameters:** Same as guest API

**Response:** Same as guest API

#### Create Event
```http
POST /api/management/hotel/:hotelId/events
```

**Request Body:**
```json
{
  "eventname": "string",
  "imagefile": "string",
  "location": "string",
  "description": "string",
  "link": "string",
  "frequency": "string"
}
```

**Response:**
```json
{
  "data": {
    "eventid": "string",
    "hotelid": "string",
    "eventname": "string",
    "imagefile": "string",
    "location": "string",
    "description": "string",
    "link": "string",
    "frequency": "string",
    "createdat": "string",
    "updatedat": "string"
  }
}
```

#### Update Event
```http
PUT /api/management/hotel/:hotelId/events/:eventId
```

**Request Body:** Same as create event

**Response:** Same as create event

#### Delete Event
```http
DELETE /api/management/hotel/:hotelId/events/:eventId
```

**Response:**
```json
{
  "message": "Event deleted successfully"
}
```

## Common Response Formats

### Error Response
```json
{
  "message": "Error message describing what went wrong"
}
```

### Pagination
All list endpoints support pagination with the following query parameters:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

Response includes pagination metadata:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

## Status Codes

- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error 