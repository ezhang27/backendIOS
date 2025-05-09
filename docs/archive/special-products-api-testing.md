# Special Products API Testing Documentation

This document provides instructions for testing the Special Products API endpoints. Authentication is disabled for testing purposes.

## API Endpoint Overview

### Special Products API Endpoints

| Endpoint | Method | Description | Query Parameters | Request Body |
|----------|--------|-------------|-----------------|--------------|
| `/api/management/special-products` | GET | List all special products for a hotel | `hotelId` (required)<br>`page` (optional)<br>`limit` (optional) | None |
| `/api/management/special-products/:productId` | GET | Get details of a specific special product | `hotelId` (required) | None |
| `/api/management/special-products` | POST | Create a new special product | None | `hotelId` (required)<br>`guestId` (required)<br>`name` (required)<br>`quantity` (required)<br>`description` (optional)<br>`price.value` (required)<br>`price.currencyCode` (optional) |
| `/api/management/special-products/:productId` | PUT | Update a special product | None | `hotelId` (required)<br>`name` (optional)<br>`quantity` (optional)<br>`description` (optional)<br>`price.value` (optional)<br>`price.currencyCode` (optional) |
| `/api/management/special-products/:productId` | DELETE | Delete a special product | `hotelId` (required) | None |

## Testing Environment

For local development, the API is accessible at:

```
http://localhost:3000
```

## Sample Data for Testing

For testing purposes, you can use the following sample data:

### Hotel IDs
- `a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d` (Grand Luxe New York)
- `b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e` (Sunset Resort LA)
- `c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f` (Maple Leaf Toronto)

### Guest IDs
- `85895225-aa94-4da3-96de-a33f14bc4dee` (Alice Johnson)
- `c631efa2-32e9-4707-895d-faeaf30d4dba` (Robert Davis)
- `91df6ea6-1148-4fc2-aeed-fda8135a68dc` (Charlie Wilson)

### Product IDs (use these for testing GET, PUT, DELETE operations)
- `d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a` (Luxury Chocolates)
- `f6a7b8c9-0d1e-2f3a-4b5c-6d7e8f9a0b1c` (Custom Spa Gift Basket)
- `7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d` (Premium Wine Bottle)

## Testing the Special Products API Endpoints

### 1. Get All Special Products for a Hotel

```bash
curl -X GET "http://localhost:3000/api/management/special-products?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)

Example with pagination:
```bash
curl -X GET "http://localhost:3000/api/management/special-products?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&page=1&limit=10" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "productId": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
      "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
      "guestName": "Ms. Alice Johnson",
      "guestContact": {
        "email": "alice@example.com",
        "phone": "+15551234"
      },
      "name": "Luxury Chocolates",
      "quantity": 1,
      "description": "Premium assorted chocolates from local artisan",
      "price": {
        "value": 45.99,
        "currencyCode": "USD"
      },
      "createdAt": "2025-04-29T08:30:00.000Z",
      "updatedAt": "2025-04-29T08:30:00.000Z"
    },
    {
      "productId": "f6a7b8c9-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
      "guestId": "c631efa2-32e9-4707-895d-faeaf30d4dba",
      "guestName": "Mr. Robert Davis",
      "guestContact": {
        "email": "robert@example.com",
        "phone": "+15555678"
      },
      "name": "Custom Spa Gift Basket",
      "quantity": 1,
      "description": "Custom gift basket with spa essentials",
      "price": {
        "value": 89.99,
        "currencyCode": "USD"
      },
      "createdAt": "2025-04-28T14:15:00.000Z",
      "updatedAt": "2025-04-28T14:15:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 2,
    "totalPages": 1
  }
}
```

### 2. Get Details of a Specific Special Product

```bash
curl -X GET "http://localhost:3000/api/management/special-products/d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "productId": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6a",
  "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
  "guestInfo": {
    "name": "Ms. Alice Johnson",
    "email": "alice@example.com",
    "phone": "+15551234"
  },
  "name": "Luxury Chocolates",
  "quantity": 1,
  "description": "Premium assorted chocolates from local artisan",
  "price": {
    "priceId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
    "value": 45.99,
    "currencyCode": "USD"
  },
  "createdAt": "2025-04-29T08:30:00.000Z",
  "updatedAt": "2025-04-29T08:30:00.000Z"
}
```

### 3. Create a New Special Product

```bash
curl -X POST "http://localhost:3000/api/management/special-products" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
    "name": "Premium Wine Bottle",
    "quantity": 1,
    "description": "Exclusive red wine from local vineyard",
    "price": {
      "value": 75.50,
      "currencyCode": "USD"
    }
  }' | jq
```

**Expected Response:**
```json
{
  "productId": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
  "name": "Premium Wine Bottle",
  "quantity": 1,
  "description": "Exclusive red wine from local vineyard",
  "priceId": "e5f6a7b8-c9d0-e1f2-a3b4-c5d6e7f8a9b0",
  "createdAt": "2025-04-30T10:15:20.123Z"
}
```

### 4. Update a Special Product

```bash
curl -X PUT "http://localhost:3000/api/management/special-products/7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "name": "Premium Champagne Bottle",
    "quantity": 2,
    "price": {
      "value": 120.00
    }
  }' | jq
```

**Expected Response:**
```json
{
  "productId": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
  "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
  "name": "Premium Champagne Bottle",
  "quantity": 2,
  "description": "Exclusive red wine from local vineyard",
  "price": {
    "value": 120.00,
    "currencyCode": "USD"
  },
  "updatedAt": "2025-04-30T11:25:35.789Z"
}
```

### 5. Delete a Special Product

```bash
curl -X DELETE "http://localhost:3000/api/management/special-products/7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "message": "Special product deleted successfully",
  "productId": "7a8b9c0d-1e2f-3a4b-5c6d-7e8f9a0b1c2d"
}
```

## Error Handling Examples

### Example 1: Missing Required Fields

**Request:**
```bash
curl -X POST "http://localhost:3000/api/management/special-products" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee"
  }' | jq
```

**Expected Response:**
```json
{
  "message": "Missing required fields",
  "required": ["hotelId", "guestId", "name", "quantity", "price.value"]
}
```

### Example 2: Product Not Found

**Request:**
```bash
curl -X GET "http://localhost:3000/api/management/special-products/invalid-product-id?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "message": "Special product not found"
}
```

### Example 3: Missing Hotel ID

**Request:**
```bash
curl -X GET "http://localhost:3000/api/management/special-products" | jq
```

**Expected Response:**
```json
{
  "message": "Hotel ID is required"
}
``` 