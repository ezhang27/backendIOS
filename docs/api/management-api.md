# Management API Reference

This document provides information about the Management API endpoints available in the SelfServe platform. The Management API allows hotel staff and administrators to manage hotel operations, guest requests, and various hotel services.

## Authentication

All Management API endpoints require authentication using the following headers:

```
X-Employee-ID: {employeeId}
X-Hotel-ID: {hotelId}
```

## Base URL

```
/api/management
```

## Common Query Parameters

Most collection endpoints support the following query parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | integer | Maximum number of items to return (default: 20, max: 100) |
| `offset` | integer | Number of items to skip (for pagination) |
| `sort` | string | Field to sort by (prefix with `-` for descending order) |

## API Endpoints

### Request Management

**Generic Request Operations:**

- `GET /api/management/requests` - Get all requests (any type) with filtering/searching
- `GET /api/management/requests/:requestId` - Get basic details for any request by ID
- `PUT /api/management/requests/:requestId/status` - Update status for any request

**Type-Specific Request Operations:**

- `GET /api/management/dining` - Get all dining requests with dining-specific filters
- `GET /api/management/dining/:requestId` - Get dining request details (incl. order items)
- `PUT /api/management/dining/:requestId/status` - Update dining request status
- `PUT /api/management/dining/:requestId/payment` - Update dining request payment status

- `GET /api/management/general` - Get all general requests with general-specific filters
- `GET /api/management/general/:requestId` - Get general request details
- `PUT /api/management/general/:requestId/status` - Update general request status

- `GET /api/management/reservation-requests` - Get all reservation requests with reservation-specific filters
- `GET /api/management/reservation-requests/:requestId` - Get reservation request details
- `PUT /api/management/reservation-requests/:requestId/status` - Update reservation request status

### Employee Management

- `GET /api/management/employees` - Get all employees
- `GET /api/management/employees/:employeeId` - Get employee by ID
- `POST /api/management/employees` - Create new employee
- `PUT /api/management/employees/:employeeId` - Update employee
- `DELETE /api/management/employees/:employeeId` - Deactivate employee

### Hotel Management

- `GET /api/management/hotel` - Get hotel information
- `PUT /api/management/hotel` - Update hotel information

### Room Service Management

- `GET /api/management/hotel/roomservice/menus` - Get all room service menus
- `POST /api/management/hotel/roomservice/menus` - Create room service menu
- `PUT /api/management/hotel/roomservice/menus/:menuId` - Update room service menu
- `DELETE /api/management/hotel/roomservice/menus/:menuId` - Delete room service menu
- `GET /api/management/hotel/roomservice/menus/:menuId/items` - Get all items for a menu
- `POST /api/management/hotel/roomservice/menus/:menuId/items` - Create room service item
- `PUT /api/management/hotel/roomservice/menus/:menuId/items/:itemId` - Update room service item
- `DELETE /api/management/hotel/roomservice/menus/:menuId/items/:itemId` - Delete room service item
- `GET /api/management/hotel/roomservice/menus/:menuId/schedules` - Get all menu schedules
- `POST /api/management/hotel/roomservice/menus/:menuId/schedules` - Create menu schedule
- `PUT /api/management/hotel/roomservice/menus/:menuId/schedules/:scheduleId` - Update menu schedule
- `DELETE /api/management/hotel/roomservice/menus/:menuId/schedules/:scheduleId` - Delete menu schedule

### Restaurant Management

- `GET /api/management/dining/restaurants` - Get all restaurants
- `GET /api/management/dining/restaurants/:restaurantId/schedule` - Get restaurant operating hours
- `PUT /api/management/dining/restaurants/:restaurantId/schedule/:day` - Update restaurant operating hours

### Special Products Management

- `GET /api/management/hotel/specialproducts` - Get all special products
- `POST /api/management/hotel/specialproducts` - Create special product
- `PUT /api/management/hotel/specialproducts/:productId` - Update special product
- `DELETE /api/management/hotel/specialproducts/:productId` - Delete special product

### Price Management

- `GET /api/management/prices` - Get all prices for the hotel
- `POST /api/management/prices` - Create a new price entry
- `GET /api/management/prices/:priceId` - Get specific price by ID
- `PUT /api/management/prices/:priceId` - Update a price
- `DELETE /api/management/prices/:priceId` - Delete a price

### Housekeeping Types Management

- `GET /api/management/housekeeping/types` - Get all housekeeping types for the hotel
- `POST /api/management/housekeeping/types` - Create a new housekeeping type
- `GET /api/management/housekeeping/types/:typeId` - Get specific housekeeping type by ID
- `PUT /api/management/housekeeping/types/:typeId` - Update a housekeeping type
- `DELETE /api/management/housekeeping/types/:typeId` - Delete a housekeeping type

### Feedback Management

- `GET /api/management/feedback` - Get all feedback
- `GET /api/management/feedback/types` - Get feedback types

### Messaging

- `GET /api/management/messages` - Get all messages
- `GET /api/management/messages/guest/:guestId` - Get guest conversation
- `POST /api/management/messages/guest/:guestId` - Send message to guest

## Detailed Documentation

For detailed request/response examples and parameters for each endpoint, please refer to the [Management API Testing Guide](../testing/management-api-testing.md).

## Error Handling

For details on error responses, see the [Error Handling documentation](error-handling.md). 