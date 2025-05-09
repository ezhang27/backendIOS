# Price Management API

This documentation describes the endpoints available for managing price entries in the SelfServe system.

## Base URL
All endpoints are accessible at `/api/management/prices`.

## Authentication
All endpoints require authentication. Include a valid authorization token in the request headers.

## Endpoints

### Get All Prices for a Hotel
Retrieves all price entries associated with a specific hotel, with pagination.

**HTTP Method**: GET  
**Endpoint**: `/api/management/prices`  
**Query Parameters**:
- `hotelId` (required): The ID of the hotel
- `page` (optional): The page number (default: 1)
- `limit` (optional): The number of items per page (default: 20)

**Example Request**:
```http
GET /api/management/prices?hotelId=2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f&page=1&limit=10
```

**Example Response**:
```json
{
  "data": [
    {
      "priceId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "hotelId": "2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f",
      "hotelName": "Inn at Hastings Park",
      "amount": "42.99",
      "currency": {
        "currencyId": "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
        "code": "USD",
        "symbol": "$",
        "name": "US Dollar"
      },
      "createdAt": "2023-11-12T14:30:00.000Z",
      "updatedAt": "2023-11-12T14:30:00.000Z"
    },
    // More price entries...
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "totalCount": 35,
    "totalPages": 4
  }
}
```

### Create a New Price Entry
Creates a new price entry for a specific hotel.

**HTTP Method**: POST  
**Endpoint**: `/api/management/prices`  

**Request Body**:
```json
{
  "hotelId": "2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f", // Required
  "amount": "42.99", // Required
  "currencyCode": "USD" // Optional, defaults to USD
}
```

**Example Request**:
```http
POST /api/management/prices
Content-Type: application/json

{
  "hotelId": "2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f",
  "amount": "42.99",
  "currencyCode": "EUR"
}
```

**Example Response**:
```json
{
  "priceId": "a7b8c9d0-e1f2-3a4b-5c6d-7e8f9a0b1c2d",
  "hotelId": "2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f",
  "amount": "42.99",
  "currency": {
    "code": "EUR",
    "symbol": "€",
    "name": "Euro"
  },
  "createdAt": "2023-11-14T10:25:00.000Z",
  "updatedAt": "2023-11-14T10:25:00.000Z"
}
```

### Get Price by ID
Retrieves a specific price entry by its ID.

**HTTP Method**: GET  
**Endpoint**: `/api/management/prices/:priceId`  
**Path Parameters**:
- `priceId`: The ID of the price entry

**Query Parameters**:
- `hotelId` (required): The ID of the hotel (for validation)

**Example Request**:
```http
GET /api/management/prices/9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d?hotelId=2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f
```

**Example Response**:
```json
{
  "priceId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "hotelId": "2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f",
  "hotelName": "Inn at Hastings Park",
  "amount": "42.99",
  "currency": {
    "currencyId": "3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d",
    "code": "USD",
    "symbol": "$",
    "name": "US Dollar"
  },
  "createdAt": "2023-11-12T14:30:00.000Z",
  "updatedAt": "2023-11-12T14:30:00.000Z"
}
```

### Update Price
Updates a specific price entry.

**HTTP Method**: PUT  
**Endpoint**: `/api/management/prices/:priceId`  
**Path Parameters**:
- `priceId`: The ID of the price entry

**Request Body**:
```json
{
  "hotelId": "2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f", // Required
  "amount": "52.99", // Required
  "currencyCode": "USD" // Optional
}
```

**Example Request**:
```http
PUT /api/management/prices/9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d
Content-Type: application/json

{
  "hotelId": "2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f",
  "amount": "52.99",
  "currencyCode": "USD"
}
```

**Example Response**:
```json
{
  "priceId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "hotelId": "2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f",
  "amount": "52.99",
  "currency": {
    "code": "USD",
    "symbol": "$",
    "name": "US Dollar"
  },
  "updatedAt": "2023-11-13T09:15:22.000Z"
}
```

### Delete Price
Deletes a specific price entry.

**HTTP Method**: DELETE  
**Endpoint**: `/api/management/prices/:priceId`  
**Path Parameters**:
- `priceId`: The ID of the price entry

**Query Parameters**:
- `hotelId` (required): The ID of the hotel (for validation)

**Example Request**:
```http
DELETE /api/management/prices/9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d?hotelId=2f9c8b7a-6d5e-4f3e-2d1c-0b9a8c7d6e5f
```

**Example Response**:
```json
{
  "message": "Price deleted successfully",
  "priceId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d"
}
```

## Error Responses
The API returns standard HTTP status codes to indicate success or failure of an API request.

### Common Error Codes
- `400 Bad Request`: The request parameters are invalid or missing
- `401 Unauthorized`: Authentication is required
- `403 Forbidden`: The authenticated user does not have permission
- `404 Not Found`: The requested resource was not found
- `500 Internal Server Error`: An error occurred on the server

**Error Response Format**:
```json
{
  "message": "Error message describing the issue",
  "error": "Detailed error information (optional)"
}
``` 