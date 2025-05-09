# Sample Test Data

This document provides sample data for testing the SelfServe API endpoints. Use these sample IDs and values when making test requests to ensure consistent results.

## Guest IDs

Use these guest IDs for testing guest-focused endpoints:

| Guest ID | Name | Description |
|----------|------|-------------|
| `85895225-aa94-4da3-96de-a33f14bc4dee` | Alice Johnson | Primary test guest with multiple requests |
| `c631efa2-32e9-4707-895d-faeaf30d4dba` | Robert Davis | Guest with minimal request history |
| `91df6ea6-1148-4fc2-aeed-fda8135a68dc` | Charlie Wilson | Guest with numerous requests |

## Hotel IDs

Use these hotel IDs for testing hotel-specific endpoints:

| Hotel ID | Name | Description |
|----------|------|-------------|
| `a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d` | Grand Luxe New York | Primary test hotel with complete data |
| `b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e` | Sunset Resort LA | Secondary test hotel |
| `c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f` | Maple Leaf Toronto | Tertiary test hotel |

## Reservation IDs

Use these reservation IDs for testing reservation-related endpoints:

| Reservation ID | Guest | Hotel | Status |
|----------------|-------|-------|--------|
| `02a63a0d-ead6-47b0-96f0-4947fc912777` | Alice Johnson | Grand Luxe New York | Active |
| `a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d` | Robert Davis | Sunset Resort LA | Active |
| `b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e` | Charlie Wilson | Grand Luxe New York | Completed |
| `c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f` | Alice Johnson | Maple Leaf Toronto | Upcoming |

## Request IDs

Use these request IDs for testing request-related endpoints:

| Request ID | Type | Guest | Status | Description |
|------------|------|-------|--------|-------------|
| `f25b9828-1544-4234-b92e-e2d4cea72e83` | Concierge | Alice Johnson | COMPLETED | Reservation at nearby restaurant |
| `ee490d87-d9c2-4f1d-b28f-58fe03dfe020` | Housekeeping | Alice Johnson | SUBMITTED | Need extra towels and toiletries |
| `d2c35f14-4068-4e59-9571-a7158456f759` | Room Service | Charlie Wilson | CANCELLED | Breakfast delivery |

## Employee IDs

Use these employee IDs for testing management endpoints:

| Employee ID | Name | Role | Department |
|-------------|------|------|------------|
| `b7b96a41-9073-4249-905c-01b5aed1c86f` | Michael Brown | Concierge | Concierge |
| `ff114232-97ab-45d1-b590-0302b518d0f8` | Jane Doe | Receptionist | Front Desk |
| `88ed2357-de9c-428a-82ab-bcc223e2fe97` | Bob Johnson | Staff | Housekeeping |
| `8c5e3258-d09d-4b4e-a22d-7469416d9354` | John Smith | Manager | Management |
| `020fe7f5-7d49-4377-a3a2-580303e27c1e` | Sarah Williams | Staff | Maintenance |

## Role IDs

Use these role IDs for testing role-related endpoints:

| Role ID | Role |
|---------|------|
| `87654321-8765-4321-8765-432187654321` | Administrator |
| `12345678-1234-5678-1234-567812345678` | Concierge |
| `bcafe1a0-a997-41f2-a97a-65bc885c400d` | Front Desk |
| `d74c3e5f-9c4a-4e8b-a566-0a09cf64c8d6` | Housekeeping |
| `eb829717-c87e-4de0-a218-8c2b85d88c05` | Maintenance |
| `c6bb8c13-8b8a-4ed7-8e4a-8a1d8a8c5b2f` | Manager |
| `5e3c80ef-c332-41a7-ad4a-a880b8a2ea47` | Receptionist |

## Request Status Values

Use these status values for filtering requests and updating request status:

| Status | Description |
|--------|-------------|
| `SUBMITTED` | Initial status when request is created |
| `IN_PROGRESS` | Staff is actively working on the request |
| `COMPLETED` | Request has been fulfilled |
| `CANCELLED` | Request was cancelled by guest or staff |
| `DELAYED` | Request fulfillment has been delayed |
| `SCHEDULED` | Request is scheduled for future completion |

## Department Values

Use these department values for filtering and categorizing:

| Department | Description |
|------------|-------------|
| `Housekeeping` | Room cleaning and maintenance |
| `Concierge` | Guest services and assistance |
| `RoomService` | In-room dining and services |
| `Maintenance` | Facility repairs and maintenance |
| `FrontDesk` | Check-in/out and general inquiries |
| `Restaurant` | Hotel dining facilities |
| `Spa` | Wellness and relaxation services |

## Room IDs

Use these room IDs for testing room-related endpoints:

| Room ID | Room Number | Type | Hotel |
|---------|-------------|------|-------|
| `a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d` | 101 | Standard | Grand Luxe New York |
| `b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e` | 102 | Standard | Grand Luxe New York |
| `c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f` | 201 | Deluxe | Grand Luxe New York |
| `d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a` | 301 | Suite | Grand Luxe New York |
| `e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b` | 401 | Presidential | Grand Luxe New York |

## Restaurant IDs

Use these restaurant IDs for testing restaurant-related endpoints:

| Restaurant ID | Name | Hotel |
|---------------|------|-------|
| `1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d` | Grand Bistro | Grand Luxe New York |
| `2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e` | Sunset Café | Sunset Resort LA |
| `3c4d5e6f-7a8b-9c0d-1e2f-3a4b5c6d7e8f` | Maple Grill | Maple Leaf Toronto |

## Facility IDs

Use these facility IDs for testing facility-related endpoints:

| Facility ID | Name | Type | Hotel |
|-------------|------|------|-------|
| `a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d` | Grand Spa | SPA | Grand Luxe New York |
| `b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e` | Fitness Center | GYM | Grand Luxe New York |
| `c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f` | Sunset Pool | POOL | Sunset Resort LA |
| `d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a` | Maple Conference Hall | CONFERENCE | Maple Leaf Toronto |

## Payment Status Values

Use these payment status values for dining and charge-related endpoints:

| Status | Description |
|--------|-------------|
| `PENDING` | Payment not yet processed |
| `PAID` | Payment has been successfully processed |
| `FAILED` | Payment processing failed |
| `WAIVED` | Payment has been waived |
| `REFUNDED` | Payment has been refunded |

## Testing Headers

Include these headers in API requests when testing:

### Guest API
```
X-Guest-ID: 85895225-aa94-4da3-96de-a33f14bc4dee
X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d
```

### Management API
```
X-Employee-ID: 8c5e3258-d09d-4b4e-a22d-7469416d9354
X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d
```

## Testing Environment

For local development, the API is accessible at:

```
http://localhost:3000
```

For development environment testing:

```
https://api-dev-demo-hqflj.ondigitalocean.app
``` 