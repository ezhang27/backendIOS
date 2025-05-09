# Management API Testing Documentation

This document provides instructions for testing the Management API endpoints for feedback, messages, and employee management interfaces. Authentication is disabled for testing purposes.

## API Endpoint Overview

### Management API Endpoints

| Endpoint | Method | Description | Query Parameters | Request Body |
|----------|--------|-------------|-----------------|--------------|
| `/api/management` | GET | Welcome message | None | None |
| `/api/management/feedback` | GET | List all feedback for a hotel | `hotelId` (required)<br>`type` (optional, comma-separated)<br>`rating` (optional)<br>`page` (optional)<br>`limit` (optional) | None |
| `/api/management/feedback/:feedbackId` | GET | Get details of a specific feedback | `hotelId` (required) | None |
| `/api/management/feedback/types/all` | GET | Get all feedback types | None | None |
| `/api/management/messages` | GET | List all messages sent to guests | `hotelId` (required)<br>`type` (optional, comma-separated)<br>`page` (optional)<br>`limit` (optional) | None |
| `/api/management/messages` | POST | Send a new message to a guest | None | `hotelId` (required)<br>`senderId` (required)<br>`receiverId` (required)<br>`typeId` (required)<br>`subject` (optional)<br>`content` (required) |
| `/api/management/messages/types` | GET | Get all message types | None | None |
| `/api/management/messages/announcements` | GET | List all announcements for a hotel | `hotelId` (required)<br>`announcementType` (optional, comma-separated)<br>`page` (optional)<br>`limit` (optional) | None |
| `/api/management/messages/announcements` | POST | Create a new announcement | None | `hotelId` (required)<br>`createdBy` (required)<br>`title` (required)<br>`content` (required)<br>`announcementType` (optional) |
| `/api/management/employees/me` | GET | Get current employee details (requires authentication) | None | None |
| `/api/management/employees` | GET | List all employees for a hotel | `hotelId` (required)<br>`role` (optional, comma-separated)<br>`search` (optional)<br>`page` (optional)<br>`limit` (optional) | None |
| `/api/management/employees/:employeeId` | GET | Get details of a specific employee | `hotelId` (required) | None |
| `/api/management/employees` | POST | Create a new employee | None | `hotelId` (required)<br>`userId` (required)<br>`roleId` (required)<br>`name` (required) |
| `/api/management/employees/:employeeId/role` | PUT | Update an employee's role | None | `hotelId` (required)<br>`roleId` (required) |
| `/api/management/employees/:employeeId` | DELETE | Remove an employee | `hotelId` (required) | None |
| `/api/management/employees/roles/all` | GET | Get all available roles | None | None |
| `/api/management/dining` | GET | List all dining requests for a hotel | `hotelId` (required)<br>`status` (optional, comma-separated)<br>`paymentStatus` (optional, comma-separated)<br>`page` (optional)<br>`limit` (optional) | None |
| `/api/management/dining/:requestId` | GET | Get details of a specific dining request | `hotelId` (required) | None |
| `/api/management/dining/:requestId/status` | PUT | Update dining request status | None | `hotelId` (required)<br>`status` (required) |
| `/api/management/dining/:requestId/payment` | PUT | Update dining request payment status | None | `hotelId` (required)<br>`paymentStatus` (required)<br>`paymentMethod` (optional) |
| `/api/management/reservation-requests` | GET | List all reservation requests for a hotel | `hotelId` (required)<br>`status` (optional, comma-separated)<br>`facilityType` (optional, comma-separated)<br>`page` (optional)<br>`limit` (optional) | None |
| `/api/management/reservation-requests/:requestId` | GET | Get details of a specific reservation request | `hotelId` (required) | None |
| `/api/management/reservation-requests/:requestId/status` | PUT | Update reservation request status | None | `hotelId` (required)<br>`status` (required) |
| `/api/management/general` | GET | List all general requests for a hotel | `hotelId` (required)<br>`status` (optional, comma-separated)<br>`category` (optional, comma-separated)<br>`page` (optional)<br>`limit` (optional) | None |
| `/api/management/general/:requestId` | GET | Get details of a specific general request | `hotelId` (required) | None |
| `/api/management/general/:requestId/status` | PUT | Update general request status | None | `hotelId` (required)<br>`status` (required) |
| `/api/management/general/categories/all` | GET | Get all general request categories | None | None |

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

### Employee IDs
- `b7b96a41-9073-4249-905c-01b5aed1c86f` (Michael Brown - Concierge)
- `ff114232-97ab-45d1-b590-0302b518d0f8` (Jane Doe - Front Desk)
- `88ed2357-de9c-428a-82ab-bcc223e2fe97` (Bob Johnson - Housekeeping)
- `8c5e3258-d09d-4b4e-a22d-7469416d9354` (John Smith - Manager)
- `020fe7f5-7d49-4377-a3a2-580303e27c1e` (Sarah Williams - Maintenance)

### Role IDs
- `87654321-8765-4321-8765-432187654321` (Administrator)
- `12345678-1234-5678-1234-567812345678` (Concierge)
- `bcafe1a0-a997-41f2-a97a-65bc885c400d` (Front Desk)
- `d74c3e5f-9c4a-4e8b-a566-0a09cf64c8d6` (Housekeeping)
- `eb829717-c87e-4de0-a218-8c2b85d88c05` (Maintenance)
- `c6bb8c13-8b8a-4ed7-8e4a-8a1d8a8c5b2f` (Manager)
- `5e3c80ef-c332-41a7-ad4a-a880b8a2ea47` (Receptionist)

## Testing the Feedback Management API Endpoints

### 1. Management Welcome Endpoint

```bash
curl -X GET "http://localhost:3000/api/management" | jq
```

**Expected Response:**
```json
{
  "message": "Welcome to the SelfServe Management API"
}
```

### 2. Get All Feedback Types

```bash
curl -X GET "http://localhost:3000/api/management/feedback/types/all" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "typeid": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
      "type": "Amenities",
      "description": "Feedback about hotel amenities"
    },
    {
      "typeid": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
      "type": "Dining",
      "description": "Feedback about food and dining experience"
    },
    {
      "typeid": "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b",
      "type": "Overall",
      "description": "Overall hotel experience feedback"
    },
    {
      "typeid": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "type": "Room",
      "description": "Feedback about room quality and cleanliness"
    },
    {
      "typeid": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
      "type": "Service",
      "description": "Feedback about staff service"
    }
  ]
}
```

### 3. Get All Feedback for a Hotel

```bash
curl -X GET "http://localhost:3000/api/management/feedback?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "feedbackId": "7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
      "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
      "guestName": "Ms. Alice Johnson",
      "guestContact": {
        "email": "alice@example.com",
        "phone": "+15551234"
      },
      "feedbackType": "Room",
      "message": "The room was very clean and comfortable",
      "rating": 5,
      "createdAt": "2025-04-26T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)
- `type`: Filter by feedback type. Can be a single type or a comma-separated list (e.g., "Room,Service").
- `rating`: Filter by rating value

Example with filtering:
```bash
curl -X GET "http://localhost:3000/api/management/feedback?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&type=Room,Service&rating=5" | jq
```

### 4. Get Specific Feedback Details

```bash
curl -X GET "http://localhost:3000/api/management/feedback/7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "feedbackId": "7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
  "guestInfo": {
    "name": "Ms. Alice Johnson",
    "email": "alice@example.com",
    "phone": "+15551234"
  },
  "feedbackType": "Room",
  "typeDescription": "Feedback about room quality and cleanliness",
  "message": "The room was very clean and comfortable",
  "rating": 5,
  "createdAt": "2025-04-26T12:00:00.000Z"
}
```

## Testing the Messages and Announcements API Endpoints

### 1. Get All Message Types

```bash
curl -X GET "http://localhost:3000/api/management/messages/types" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "typeid": "3e1a2b92-4d8a-4b5c-97d2-be1a98a31bd4",
      "type": "Notification",
      "description": "General notifications"
    },
    {
      "typeid": "f8c6e8d7-9a5b-4c3d-8e2f-1a9b7c5d3e1f",
      "type": "Promotion",
      "description": "Special offers and promotions"
    },
    {
      "typeid": "d56f9f2a-227a-4a7a-9d8d-c7c4d0a81c6a",
      "type": "Reservation",
      "description": "Information about reservations"
    },
    {
      "typeid": "2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d",
      "type": "Support",
      "description": "Customer support messages"
    },
    {
      "typeid": "1dc1bd8f-0d3a-4bb8-9140-a203c83a5a57",
      "type": "Welcome",
      "description": "Welcome messages for new guests"
    }
  ]
}
```

### 2. Get All Messages for a Hotel

```bash
curl -X GET "http://localhost:3000/api/management/messages?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "messageId": "8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a",
      "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "type": "Welcome",
      "subject": "Welcome to Grand Luxe New York",
      "content": "We're delighted to welcome you to our hotel. Please let us know if there's anything we can do to make your stay more comfortable.",
      "sender": {
        "employeeId": "8c5e3258-d09d-4b4e-a22d-7469416d9354",
        "name": "Mr. John Smith"
      },
      "receiver": {
        "guestId": "85895225-aa94-4da3-96de-a33f14bc4dee",
        "name": "Ms. Alice Johnson",
        "email": "alice@example.com",
        "phone": "+15551234"
      },
      "createdAt": "2025-04-26T14:30:00.000Z",
      "updatedAt": "2025-04-26T14:30:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)
- `type`: Filter by message type. Can be a single type or a comma-separated list (e.g., "Welcome,Notification").

Example with filtering:
```bash
curl -X GET "http://localhost:3000/api/management/messages?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&type=Welcome,Notification" | jq
```

### 3. Send a New Message

```bash
curl -X POST "http://localhost:3000/api/management/messages" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "senderId": "8c5e3258-d09d-4b4e-a22d-7469416d9354",
    "receiverId": "85895225-aa94-4da3-96de-a33f14bc4dee",
    "typeId": "1dc1bd8f-0d3a-4bb8-9140-a203c83a5a57",
    "subject": "Special Offer",
    "content": "We would like to offer you a complimentary spa service during your stay."
  }' | jq
```

**Required Fields:**
- `hotelId`: The UUID of the hotel
- `senderId`: The UUID of the employee sending the message
- `receiverId`: The UUID of the guest receiving the message
- `typeId`: The UUID of the message type
- `content`: The message content

**Optional Fields:**
- `subject`: The message subject

**Expected Response:**
```json
{
  "messageId": "9f0a1b2c-3d4e-5f6g-7h8i-9j0k1l2m3n4o",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "createdAt": "2025-04-28T15:45:23.456Z"
}
```

### 4. Get All Announcements for a Hotel

```bash
curl -X GET "http://localhost:3000/api/management/messages/announcements?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "announcementId": "0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p",
      "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "title": "Pool Maintenance",
      "content": "The pool will be closed for maintenance on Wednesday from 2pm to 5pm.",
      "type": "Maintenance",
      "createdBy": {
        "employeeId": "8c5e3258-d09d-4b4e-a22d-7469416d9354",
        "name": "Mr. John Smith"
      },
      "createdAt": "2025-04-26T10:15:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)
- `announcementType`: Filter by announcement type. Can be a single type or a comma-separated list (e.g., "NORMAL,IMPORTANT").

Example with filtering:
```bash
curl -X GET "http://localhost:3000/api/management/messages/announcements?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&announcementType=NORMAL,IMPORTANT" | jq
```

### 5. Create a New Announcement

```bash
curl -X POST "http://localhost:3000/api/management/messages/announcements" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "createdBy": "8c5e3258-d09d-4b4e-a22d-7469416d9354",
    "title": "Cocktail Reception",
    "content": "Join us for a complimentary cocktail reception in the lobby from 6pm to 8pm tonight.",
    "type": "Promotion"
  }' | jq
```

**Required Fields:**
- `hotelId`: The UUID of the hotel
- `createdBy`: The UUID of the employee creating the announcement
- `title`: The announcement title
- `content`: The announcement content
- `type`: The type of the announcement

**Expected Response:**
```json
{
  "announcementId": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "createdAt": "2025-04-28T16:30:45.789Z"
}
```

## Testing the Employee Management API Endpoints

### 1. Get All Available Roles

```bash
curl -X GET "http://localhost:3000/api/management/employees/roles/all" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "roleid": "87654321-8765-4321-8765-432187654321",
      "name": "Administrator",
      "description": "System administrator",
      "createdat": "2025-04-26 23:30:35.058103+00"
    },
    {
      "roleid": "12345678-1234-5678-1234-567812345678",
      "name": "Concierge",
      "description": "Guest service staff",
      "createdat": "2025-04-26 23:30:35.058103+00"
    },
    {
      "roleid": "bcafe1a0-a997-41f2-a97a-65bc885c400d",
      "name": "Front Desk",
      "description": "Guest check-in and reception",
      "createdat": "2025-04-27 21:32:54.415+00"
    }
  ]
}
```

### 2. Get All Employees for a Hotel

```bash
curl -X GET "http://localhost:3000/api/management/employees?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "employee": {
        "employeeid": "b7b96a41-9073-4249-905c-01b5aed1c86f",
        "hotelid": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "roleid": "12345678-1234-5678-1234-567812345678",
        "nameid": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
        "createdat": "2023-05-01T10:00:00.000Z",
        "updatedat": "2023-05-01T10:00:00.000Z"
      },
      "name": {
        "firstname": "Michael",
        "lastname": "Brown",
        "title": "Mr"
      },
      "role": {
        "name": "Concierge",
        "description": "Assists guests with various services"
      }
    },
    // More employees...
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "totalPages": 1
  }
}
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)
- `role`: Filter by employee role name. Can be a single role or a comma-separated list (e.g., "Concierge,Manager").
- `search`: Search by employee name (first or last).

Example with filtering:
```bash
curl -X GET "http://localhost:3000/api/management/employees?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&role=Manager,Concierge&search=Smith" | jq
```

### 3. Get Current Employee Details

This endpoint requires Clerk authentication which is currently not yet implemented for testing. This endpoint will be available when authentication is fully integrated.

> **Note: This endpoint is not testable yet** - When authentication is implemented, a user logs in through Clerk, and this endpoint will return their employee details including hotel information.

```bash
# Example for future reference (not working yet)
curl -X GET "http://localhost:3000/api/management/employees/me" \
  -H "Authorization: Bearer ${CLERK_TEST_TOKEN}" | jq
```

**Expected Response (once implemented):**
```json
{
  "employeeId": "b7b96a41-9073-4249-905c-01b5aed1c86f",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "hotel": {
    "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "name": "Grand Luxe New York",
    "logo": "/images/hotels/grand-luxe-logo.png",
    "timezone": "America/New_York"
  },
  "userId": "user_2NmGnxKdpJ5M3SJCqmMkX8xYQ9r", 
  "name": {
    "title": "Mr",
    "firstName": "Michael",
    "middleName": null,
    "lastName": "Brown",
    "suffix": null,
    "fullName": "Mr Michael Brown"
  },
  "role": {
    "roleId": "12345678-1234-5678-1234-567812345678",
    "name": "Concierge",
    "description": "Assists guests with various services"
  },
  "createdAt": "2023-05-01T10:00:00.000Z",
  "updatedAt": "2023-05-01T10:00:00.000Z"
}
```

**Error Responses (once implemented):**
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: No employee record found for the authenticated user

### 4. Get Specific Employee Details

```bash
curl -X GET "http://localhost:3000/api/management/employees/b7b96a41-9073-4249-905c-01b5aed1c86f?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "employeeId": "b7b96a41-9073-4249-905c-01b5aed1c86f",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "hotelName": "Grand Luxe New York Updated",
  "userId": "michael_brown",
  "name": {
    "title": "Mr.",
    "firstName": "Michael",
    "middleName": null,
    "lastName": "Brown",
    "suffix": null,
    "fullName": "Mr. Michael Brown"
  },
  "role": {
    "roleId": "12345678-1234-5678-1234-567812345678",
    "name": "Concierge",
    "description": "Guest service staff"
  },
  "createdAt": "2025-04-28 00:07:37.432+00",
  "updatedAt": "2025-04-28 00:07:37.432+00"
}
```

### 5. Create a New Employee

```bash
curl -X POST "http://localhost:3000/api/management/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "userId": "mary_johnson",
    "roleId": "5e3c80ef-c332-41a7-ad4a-a880b8a2ea47",
    "name": {
      "firstName": "Mary",
      "lastName": "Johnson",
      "title": "Ms."
    }
  }' | jq
```

**Required Fields:**
- `hotelId`: The UUID of the hotel
- `userId`: The user ID for the employee (e.g., from authentication service)
- `roleId`: The UUID of the role
- `name`: Object containing at least firstName and lastName

**Expected Response:**
```json
{
  "employeeId": "2a3b4c5d-6e7f-8g9h-0i1j-2k3l4m5n6o7p",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "nameId": "3b4c5d6e-7f8g-9h0i-1j2k-3l4m5n6o7p8q",
  "roleId": "5e3c80ef-c332-41a7-ad4a-a880b8a2ea47",
  "createdAt": "2025-04-28T17:15:30.123Z"
}
```

### 6. Update an Employee's Role

```bash
curl -X PUT "http://localhost:3000/api/management/employees/b7b96a41-9073-4249-905c-01b5aed1c86f/role" \
  -H "Content-Type: application/json" \
  -d '{
    "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    "roleId": "c6bb8c13-8b8a-4ed7-8e4a-8a1d8a8c5b2f"
  }' | jq
```

**Required Fields:**
- `hotelId`: The UUID of the hotel
- `roleId`: The UUID of the new role

**Expected Response:**
```json
{
  "employeeId": "b7b96a41-9073-4249-905c-01b5aed1c86f",
  "role": {
    "roleId": "c6bb8c13-8b8a-4ed7-8e4a-8a1d8a8c5b2f",
    "name": "Manager",
    "description": "Hotel management staff"
  },
  "updatedAt": "2025-04-28T17:45:12.456Z"
}
```

### 7. Delete an Employee

```bash
curl -X DELETE "http://localhost:3000/api/management/employees/b7b96a41-9073-4249-905c-01b5aed1c86f?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "message": "Employee deleted successfully",
  "employeeId": "b7b96a41-9073-4249-905c-01b5aed1c86f"
}
```

## Testing Dining Request Management API Endpoints

### 1. Get All Dining Requests for a Hotel

```bash
curl -X GET "http://localhost:3000/api/management/dining?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)
- `status`: Filter by request status. Can be a single status or a comma-separated list (e.g., "SUBMITTED,IN_PROGRESS").
- `paymentStatus`: Filter by payment status. Can be a single status or a comma-separated list (e.g., "PENDING,PAID").

Example with filtering:
```bash
curl -X GET "http://localhost:3000/api/management/dining?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&status=SUBMITTED,IN_PROGRESS&paymentStatus=PENDING" | jq
```

### 2. Get Specific Dining Request Details

```bash
curl -X GET "http://localhost:3000/api/management/dining/9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "requestId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "status": "SUBMITTED",
  "paymentStatus": "PENDING",
  "paymentMethod": null,
  "createdAt": "2025-04-26T12:00:00.000Z",
  "updatedAt": "2025-04-26T12:00:00.000Z"
}
```

## Testing Reservation Request Management API Endpoints

### 1. Get All Reservation Requests for a Hotel

```bash
curl -X GET "http://localhost:3000/api/management/reservation-requests?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)
- `status`: Filter by request status. Can be a single status or a comma-separated list (e.g., "SUBMITTED,SCHEDULED").
- `facilityType`: Filter by facility type. Can be a single type or a comma-separated list (e.g., "RESTAURANT,SPA").

Example with filtering:
```bash
curl -X GET "http://localhost:3000/api/management/reservation-requests?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&status=SUBMITTED,SCHEDULED&facilityType=SPA" | jq
```

### 2. Get Specific Reservation Request Details

```bash
curl -X GET "http://localhost:3000/api/management/reservation-requests/9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "requestId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "status": "SUBMITTED",
  "facilityType": "RESTAURANT",
  "createdAt": "2025-04-26T12:00:00.000Z",
  "updatedAt": "2025-04-26T12:00:00.000Z"
}
```

## Testing General Request Management API Endpoints

### 1. Get All General Request Categories

```bash
curl -X GET "http://localhost:3000/api/management/general/categories/all" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "categoryid": "87654321-8765-4321-8765-432187654321",
      "name": "Amenity",
      "description": "Feedback about hotel amenities"
    },
    {
      "categoryid": "12345678-1234-5678-1234-567812345678",
      "name": "Dining",
      "description": "Feedback about food and dining experience"
    },
    {
      "categoryid": "bcafe1a0-a997-41f2-a97a-65bc885c400d",
      "name": "Overall",
      "description": "Overall hotel experience feedback"
    },
    {
      "categoryid": "d74c3e5f-9c4a-4e8b-a566-0a09cf64c8d6",
      "name": "Room",
      "description": "Feedback about room quality and cleanliness"
    },
    {
      "categoryid": "eb829717-c87e-4de0-a218-8c2b85d88c05",
      "name": "Service",
      "description": "Feedback about staff service"
    }
  ]
}
```

### 2. Get All General Requests for a Hotel

```bash
curl -X GET "http://localhost:3000/api/management/general?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "data": [
    {
      "requestId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
      "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "status": "SUBMITTED",
      "category": "Dining",
      "createdAt": "2025-04-26T12:00:00.000Z",
      "updatedAt": "2025-04-26T12:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 1,
    "totalPages": 1
  }
}
```

**Optional Query Parameters:**
- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 20)
- `status`: Filter by request status. Can be a single status or a comma-separated list (e.g., "SUBMITTED,IN_PROGRESS").
- `category`: Filter by request category. Can be a single category or a comma-separated list (e.g., "AMENITY,MAINTENANCE").

Example with filtering:
```bash
curl -X GET "http://localhost:3000/api/management/general?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d&status=COMPLETED&category=AMENITY,MAINTENANCE" | jq
```

### 3. Get Specific General Request Details

```bash
curl -X GET "http://localhost:3000/api/management/general/9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d?hotelId=a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" | jq
```

**Expected Response:**
```json
{
  "requestId": "9a8b7c6d-5e4f-3a2b-1c0d-9e8f7a6b5c4d",
  "hotelId": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
  "status": "SUBMITTED",
  "category": "Dining",
  "createdAt": "2025-04-26T12:00:00.000Z",
  "updatedAt": "2025-04-26T12:00:00.000Z"
}
```

This guide provides a comprehensive overview of testing the SelfServe Management API. For any questions or issues, please contact the development team. 