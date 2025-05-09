# Authentication

This guide explains the authentication mechanisms used by the SelfServe API.

## Overview

The SelfServe API uses different authentication approaches for development/testing versus production environments.

## Development & Testing Environments

For local development, automated testing, and potentially shared development/staging environments, the API relies on specific HTTP headers for identifying the user and hotel context.

## Authentication Headers

For testing purposes (especially local and development environments where full authentication flow might be bypassed), use the following static headers. Refer to the [Sample Test Data](../testing/sample-data.md) for specific IDs.

### Guest API

```
X-Guest-ID: {Valid Guest ID from sample-data.md}
X-Hotel-ID: {Valid Hotel ID from sample-data.md}
```
**(Note: As of May 2025, some Guest API endpoints, particularly request endpoints like `/dining-requests`, may still incorrectly expect `guestId` as a query parameter (`?guestId=...`) instead of reading the `X-Guest-ID` header. This is an implementation inconsistency. For testing, try providing the ID in both the header and query parameter if the header alone doesn't work for certain routes.)**

### Management API

```
X-Employee-ID: {employeeId}
X-Hotel-ID: {hotelId}
```

- `X-Employee-ID`: The UUID of the hotel employee making the request.
- `X-Hotel-ID`: The UUID of the hotel the request pertains to.

Use valid IDs from the [Sample Test Data](../testing/sample-data.md) when testing.

**Important:** This header-based approach simplifies testing but should **not** be used in production frontend applications.

## Production Environment (Clerk Integration)

In production, authentication is handled externally by [Clerk](https://clerk.dev/), a third-party authentication and user management service.

### Authentication Flow

1.  **Frontend Authentication**: The user authenticates via Clerk's frontend components (e.g., login form).
2.  **Session Token**: Upon successful authentication, Clerk provides a session token (JWT) to the frontend.
3.  **API Request**: The frontend application includes this Clerk session token in the `Authorization` header of API requests to the SelfServe backend (e.g., `Authorization: Bearer <clerk_token>`).
4.  **Backend Verification**: The SelfServe backend uses Clerk's server-side SDK and middleware (`src/clerk/auth.ts`) to verify the token included in the request header.
5.  **User Identification**: If the token is valid, the middleware extracts the Clerk User ID.
6.  **Profile Association**: The backend system links the verified Clerk User ID to the corresponding `guestprofile` (or `employee`) record in the database via the `userid` column.
7.  **Authorization**: The request proceeds, with the backend now knowing the authenticated user's identity and associated profile/permissions.

### Frontend Implementation Notes

- Frontend developers need to integrate Clerk's frontend SDK (<https://clerk.com/docs/quickstarts/react> or similar).
- Ensure the Clerk session token is automatically included in API requests using Clerk's helper functions or by configuring your HTTP client.
- The `X-Guest-ID`, `X-Employee-ID` headers are **not** used by the frontend in production.
The `X-Hotel-ID` header is still required for hotel-specific operations, even with Clerk authentication.

## Error Handling

- **401 Unauthorized**: Returned if authentication fails (missing/invalid Clerk token in production, or missing/invalid headers in dev/testing).
- **403 Forbidden**: Returned if the authenticated user (identified via Clerk or headers) does not have permission to perform the requested action. 