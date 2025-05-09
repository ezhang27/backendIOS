# Test Environment Setup

This document describes how to set up your environment for testing the SelfServe API.

## API Base URLs

The API is deployed to several environments:

- **Local Development**: `http://localhost:3000`
  - Use this when running the backend server locally on your machine.
- **Development Environment**: `https://api-dev-demo-hqflj.ondigitalocean.app`
  - Shared environment for development and integration testing.
- **Staging Environment**: `https://api-staging-demo-hqflj.ondigitalocean.app`
  - Pre-production environment for final testing before release.

Choose the appropriate Base URL based on where you need to direct your test requests.

## Authentication Headers

For testing purposes (especially local and development environments where full authentication flow might be bypassed), use the following static headers. Refer to the [Sample Test Data](./sample-data.md) for specific IDs.

### Guest API

```
X-Guest-ID: {Valid Guest ID from sample-data.md}
X-Hotel-ID: {Valid Hotel ID from sample-data.md}
```

### Management API

```
X-Employee-ID: {Valid Employee ID from sample-data.md}
X-Hotel-ID: {Valid Hotel ID from sample-data.md}
```

**Note**: In production, authentication relies on Clerk. Ensure your frontend application correctly handles the Clerk authentication flow and sends the appropriate session tokens when interacting with the production API.

## Using Postman

Postman is a recommended tool for API testing.

### Setting up a Postman Environment

1.  Create a new Environment in Postman.
2.  Add the following variables:
    *   `baseUrl`: Set this to the Base URL of the environment you are targeting (e.g., `http://localhost:3000`).
    *   `guestId`: A valid Guest ID from `sample-data.md`.
    *   `hotelId`: A valid Hotel ID from `sample-data.md`.
    *   `employeeId`: A valid Employee ID from `sample-data.md`.
3.  Ensure this environment is active when running requests.

### Importing the Collection

*(Note: A Postman collection is mentioned in api-testing-guide.md but the link is currently an example. Once available, add the link here.)*

1.  Download the SelfServe API Postman collection file (link TBD).
2.  In Postman, click `Import` and select the downloaded `.json` file.
3.  The collection should appear in your Postman workspace.

### Using the Collection

- Requests in the collection are typically pre-configured to use the environment variables (e.g., `{{baseUrl}}`, `{{guestId}}`).
- Set the appropriate Authentication headers in the "Headers" tab of each request or configure them at the collection level, using the environment variables (e.g., `X-Guest-ID: {{guestId}}`).

## Local Development Setup

Refer to the main project README for instructions on setting up and running the backend server locally. 