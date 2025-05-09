# API Testing Guide

This guide provides practical instructions for testing the SelfServe API endpoints. It's designed for frontend developers who need to interact with the API during integration and development.

## Setting Up for Testing

### Prerequisites

- [Postman](https://www.postman.com/downloads/) or another API client tool
- Access to the SelfServe development environment
- Sample test data (found in [sample-data.md](sample-data.md))

### Base URLs

- Local Development: `http://localhost:3000`
- Development Environment: `https://api-dev-demo-hqflj.ondigitalocean.app`
- Staging Environment: `https://api-staging-demo-hqflj.ondigitalocean.app`

## Authentication for Testing

All API endpoints require authentication headers:

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

## Testing the Guest API

### Testing Profile Management

#### Get Guest Profile

```bash
curl -X GET "http://localhost:3000/api/guest/profile" \
  -H "X-Guest-ID: 85895225-aa94-4da3-96de-a33f14bc4dee" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
```

#### Update Guest Profile

```bash
curl -X PUT "http://localhost:3000/api/guest/profile" \
  -H "X-Guest-ID: 85895225-aa94-4da3-96de-a33f14bc4dee" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Alice",
    "lastName": "Johnson-Smith",
    "phone": "+1-555-987-6543"
  }'
```

### Testing Request Management

#### Get All Requests

```bash
curl -X GET "http://localhost:3000/api/guest/requests" \
  -H "X-Guest-ID: 85895225-aa94-4da3-96de-a33f14bc4dee" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
```

#### Create Room Service Request

```bash
curl -X POST "http://localhost:3000/api/guest/requests/roomservice" \
  -H "X-Guest-ID: 85895225-aa94-4da3-96de-a33f14bc4dee" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Breakfast order",
    "scheduledTime": "2025-05-09T08:00:00Z",
    "items": [
      {
        "itemId": "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
        "quantity": 1,
        "specialInstructions": "No sugar in coffee"
      },
      {
        "itemId": "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
        "quantity": 2
      }
    ]
  }'
```

### Testing Hotel Information

#### Get Room Service Menus

```bash
curl -X GET "http://localhost:3000/api/guest/hotel/roomservice/menus" \
  -H "X-Guest-ID: 85895225-aa94-4da3-96de-a33f14bc4dee" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
```

#### Get Room Service Menu Schedule

```bash
curl -X GET "http://localhost:3000/api/guest/hotel/roomservice/menus/a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d/schedule" \
  -H "X-Guest-ID: 85895225-aa94-4da3-96de-a33f14bc4dee" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
```

## Testing the Management API

### Testing Request Management

#### Get All Requests

```bash
curl -X GET "http://localhost:3000/api/management/requests" \
  -H "X-Employee-ID: 8c5e3258-d09d-4b4e-a22d-7469416d9354" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
```

#### Update Request Status

```bash
curl -X PUT "http://localhost:3000/api/management/requests/f25b9828-1544-4234-b92e-e2d4cea72e83/status" \
  -H "X-Employee-ID: 8c5e3258-d09d-4b4e-a22d-7469416d9354" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "notes": "Working on this request now"
  }'
```

### Testing Room Service Management

#### Get All Room Service Menus

```bash
curl -X GET "http://localhost:3000/api/management/hotel/roomservice/menus" \
  -H "X-Employee-ID: 8c5e3258-d09d-4b4e-a22d-7469416d9354" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d"
```

#### Create Room Service Menu

```bash
curl -X POST "http://localhost:3000/api/management/hotel/roomservice/menus" \
  -H "X-Employee-ID: 8c5e3258-d09d-4b4e-a22d-7469416d9354" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" \
  -H "Content-Type: application/json" \
  -d '{
    "menuname": "Dinner Menu",
    "description": "Available from 5pm to 10pm",
    "isactive": true
  }'
```

#### Create Room Service Item

```bash
curl -X POST "http://localhost:3000/api/management/hotel/roomservice/menus/c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f/items" \
  -H "X-Employee-ID: 8c5e3258-d09d-4b4e-a22d-7469416d9354" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Caesar Salad",
    "description": "Romaine lettuce, croutons, parmesan cheese, caesar dressing",
    "price": 18.99,
    "isactive": true,
    "category": "Starters"
  }'
```

#### Create Menu Schedule

```bash
curl -X POST "http://localhost:3000/api/management/hotel/roomservice/menus/c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f/schedules" \
  -H "X-Employee-ID: 8c5e3258-d09d-4b4e-a22d-7469416d9354" \
  -H "X-Hotel-ID: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d" \
  -H "Content-Type: application/json" \
  -d '{
    "day": "TUESDAY",
    "starttime": "06:00:00",
    "endtime": "11:00:00"
  }'
```

## Testing with Postman

For easier testing, we've provided a Postman collection that you can import:

1. Download the [SelfServe API.postman_collection.json](https://example.com/downloads/SelfServe_API.postman_collection.json) file
2. In Postman, click "Import" and select the downloaded file
3. Create an environment with the following variables:
   - `baseUrl`: Your environment URL (e.g., `http://localhost:3000`)
   - `guestId`: A valid guest ID (e.g., `85895225-aa94-4da3-96de-a33f14bc4dee`)
   - `hotelId`: A valid hotel ID (e.g., `a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d`)
   - `employeeId`: A valid employee ID (e.g., `8c5e3258-d09d-4b4e-a22d-7469416d9354`)

## Common Testing Scenarios

### Guest App Testing Scenario

1. Get the guest profile
2. View available room service menus
3. Check the schedule for a specific menu
4. Create a room service request
5. Check the status of the request
6. Send a message to hotel staff
7. Provide feedback about the service

### Management App Testing Scenario

1. View all pending requests
2. Assign a request to an employee
3. Update the status of a request
4. Create a new room service menu
5. Add items to the menu
6. Set up the schedule for the menu
7. Send a message to a guest
8. View feedback submissions

## Troubleshooting Common Issues

### Authentication Errors

If you receive a 401 Unauthorized error:
- Verify that you're using valid IDs in the authentication headers
- Check that the headers are correctly formatted

### Validation Errors

If you receive a 400 Bad Request error:
- Check the request body against the API documentation
- Ensure all required fields are provided
- Verify the data types of all fields

### Error Response Format

Remember, all error responses follow this format:

```json
{
  "error": {
    "message": "Error description",
    "type": "ErrorType",
    "details": [
      {
        "field": "Field with error",
        "message": "Specific error message"
      }
    ]
  }
}
```

## Testing Tips

1. **Use environment variables**: Set up environment variables in your API client to easily switch between development, staging, and production environments.

2. **Create workflows**: Chain together multiple API calls to test entire user journeys.

3. **Use test data consistently**: Use the same test data (guestId, hotelId, etc.) across your tests to ensure consistent results.

4. **Test error scenarios**: Deliberately send invalid data to ensure the API handles errors gracefully.

5. **Validate response formats**: Ensure the response format matches the expected format in the API documentation.

## Additional Resources

- [API Overview](../api/overview.md)
- [Guest API Reference](../api/guest-api.md)
- [Management API Reference](../api/management-api.md)
- [Error Handling Documentation](../api/error-handling.md)
- [Sample Test Data](sample-data.md) 