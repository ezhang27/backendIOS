# Request Management API Testing Documentation

This document provides instructions for testing the specialized request API endpoints and employee profile management. Authentication is disabled for testing purposes.

## API Endpoint Overview

### Specialized Request API Endpoints

| Endpoint | Method | Description | Query Parameters | Request Body |
|----------|--------|-------------|-----------------|--------------|
| `/api/management/dining` | GET | List all dining requests for a hotel | `hotelId` (required)<br>`status` (optional)<br>`paymentStatus` (optional)<br>`page` (optional)<br>`limit` (optional) | None |
| `/api/management/dining/:requestId` | GET | Get details of a specific dining request | `hotelId` (required) | None |
| `/api/management/dining/:requestId/status` | PUT | Update the status of a dining request | None | `hotelId` (required)<br>`status` (required) |
| `/api/management/dining/:requestId/payment` | PUT | Update the payment status of a dining request | None | `hotelId` (required)<br>`paymentStatus` (required)<br>`paymentMethod` (optional) |
| `/api/management/reservation-requests` | GET | List all reservation requests for a hotel | `hotelId` (required)<br>`status` (optional)<br>`facilityType` (optional)<br>`page` (optional)<br>`limit` (optional) | None |
| `/api/management/reservation-requests/:requestId` | GET | Get details of a specific reservation request | `hotelId` (required) | None |
| `/api/management/reservation-requests/:requestId/status` | PUT | Update the status of a reservation request | None | `hotelId` (required)<br>`status` (required) |
| `/api/management/general` | GET | List all general requests for a hotel | `hotelId` (required)<br>`status` (optional)<br>`category` (optional)<br>`page` (optional)<br>`limit` (optional) | None |
| `/api/management/general/:requestId` | GET | Get details of a specific general request | `hotelId` (required) | None |
| `/api/management/general/:requestId/status` | PUT | Update the status of a general request | None | `hotelId` (required)<br>`status` (required) |
| `/api/management/general/categories/all` | GET | Get all available general request categories | None | None |
| `/api/management/employees/:employeeId/profile` | PUT | Update an employee's profile information | None | `hotelId` (required)<br>`name` (required, with at least one name field) |

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

### Request IDs
Dining request:
- `0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p`

Reservation request:
- `1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p`

General request:
- `2a3b4c5d-6e7f-8g8h-9i0j-1k2l3m4n5o6p`

### Employee IDs
- `b7b96a41-9073-4249-905c-01b5aed1c86f` (Michael Brown - Concierge)
- `ff114232-97ab-45d1-b590-0302b518d0f8` (Jane Doe - Front Desk)
- `88ed2357-de9c-428a-82ab-bcc223e2fe97` (Bob Johnson - Housekeeping)

### Request Status Values
- `SUBMITTED` - Initial status when request is created
- `IN_PROGRESS` - Staff is actively working on the request
- `COMPLETED` - Request has been fulfilled
- `CANCELLED` - Request was cancelled by guest or staff
- `DELAYED` - Request fulfillment has been delayed
- `SCHEDULED` - Request is scheduled for future completion

### Payment Status Values
- `PENDING` - Payment is pending
- `PAID` - Payment has been completed
- `REFUNDED` - Payment has been refunded
- `CANCELLED` - Payment has been cancelled

## Testing the Dining Request API Endpoints

### 1. Get All Dining Requests

```bash
curl -X GET "http://localhost:3000/api/management/dining?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)
- `status`: Filter by request status (e.g., "SUBMITTED", "IN_PROGRESS", "COMPLETED")
- `paymentStatus`: Filter by payment status (e.g., "PENDING", "PAID")

Example with filtering:
```bash
curl -X GET "http://localhost:3000/api/management/dining?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&status=IN_PROGRESS&paymentStatus=PENDING" | jq
```

### 2. Get Specific Dining Request Details

```bash
curl -X GET "http://localhost:3000/api/management/dining/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

### 3. Update Dining Request Status

```bash
curl -X PUT "http://localhost:3000/api/management/dining/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p/status" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "status": "IN_PROGRESS"
  }' | jq
```

### 4. Update Dining Request Payment Status

```bash
curl -X PUT "http://localhost:3000/api/management/dining/0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p/payment" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "paymentStatus": "PAID",
    "paymentMethod": "Credit Card"
  }' | jq
```

## Testing the Reservation Request API Endpoints

### 1. Get All Reservation Requests

```bash
curl -X GET "http://localhost:3000/api/management/reservation-requests?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)
- `status`: Filter by request status (e.g., "SUBMITTED", "IN_PROGRESS", "COMPLETED")
- `facilityType`: Filter by facility type (e.g., "Restaurant", "Spa")

Example with filtering:
```bash
curl -X GET "http://localhost:3000/api/management/reservation-requests?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&status=SCHEDULED&facilityType=Restaurant" | jq
```

### 2. Get Specific Reservation Request Details

```bash
curl -X GET "http://localhost:3000/api/management/reservation-requests/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

### 3. Update Reservation Request Status

```bash
curl -X PUT "http://localhost:3000/api/management/reservation-requests/1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p/status" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "status": "COMPLETED"
  }' | jq
```

## Testing the General Request API Endpoints

### 1. Get All General Requests

```bash
curl -X GET "http://localhost:3000/api/management/general?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)
- `status`: Filter by request status (e.g., "SUBMITTED", "IN_PROGRESS", "COMPLETED")
- `category`: Filter by request category (e.g., "Housekeeping", "Maintenance")

Example with filtering:
```bash
curl -X GET "http://localhost:3000/api/management/general?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&status=IN_PROGRESS&category=Housekeeping" | jq
```

### 2. Get All Request Categories

```bash
curl -X GET "http://localhost:3000/api/management/general/categories/all" | jq
```

### 3. Get Specific General Request Details

```bash
curl -X GET "http://localhost:3000/api/management/general/2a3b4c5d-6e7f-8g8h-9i0j-1k2l3m4n5o6p?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

### 4. Update General Request Status

```bash
curl -X PUT "http://localhost:3000/api/management/general/2a3b4c5d-6e7f-8g8h-9i0j-1k2l3m4n5o6p/status" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "status": "COMPLETED"
  }' | jq
```

## Testing the Employee Profile Management API Endpoints

### 1. Update Employee Profile

```bash
curl -X PUT "http://localhost:3000/api/management/employees/b7b96a41-9073-4249-905c-01b5aed1c86f/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "name": {
      "firstName": "Michael",
      "lastName": "Brown",
      "title": "Mr.",
      "middleName": "J",
      "suffix": "Jr."
    }
  }' | jq
```

You can update individual name fields:

```bash
curl -X PUT "http://localhost:3000/api/management/employees/b7b96a41-9073-4249-905c-01b5aed1c86f/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "name": {
      "title": "Dr."
    }
  }' | jq
``` 