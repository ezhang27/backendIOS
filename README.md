# SelfServe API

## Overview

SelfServe is a hotel self-service platform API that enables guests to manage their hotel stay, communicate with staff, request services, and provide feedback. This API serves as the backend for the SelfServe mobile and web applications.

## Features

- **Guest Profile Management**: View and update guest information and preferences
- **Messaging System**: Guest-staff communication and hotel announcements
- **Feedback Collection**: Guest ratings and reviews for hotel services
- **Service Requests**: Dining, housekeeping, maintenance, and amenity requests
- **Reservation Management**: View and manage reservations

## Technology Stack

- **Node.js**: JavaScript runtime
- **Express**: Web framework
- **TypeScript**: Type-safe JavaScript
- **PostgreSQL**: Database
- **Drizzle ORM**: Object-Relational Mapping
- **Swagger/OpenAPI**: API documentation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/selfserve-api.git
   cd selfserve-api
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env
   ```
   Edit the `.env` file with your database credentials and other configurations.

4. Run database migrations
   ```
   npm run db:migrate
   ```

5. Seed the database (optional)
   ```
   npm run db:seed
   ```

6. Start the development server
   ```
   npm run dev
   ```

The API will be available at `http://localhost:3000`. The Swagger UI for API documentation is available at `http://localhost:3000/api-docs`.

## API Documentation

The API documentation is available in several formats:

- **Swagger UI**: Available at `/api-docs` when running in development mode.
- **OpenAPI Spec**: Available at `/api-docs.json` when running in development mode.
- **Markdown**: See `docs/API-REFERENCE.md` for a comprehensive API reference.

## Project Structure

```
├── src/
│   ├── api/               # API routes and controllers
│   │   ├── guest/         # Guest-facing endpoints
│   │   └── management/    # Management endpoints
│   ├── config/            # Configuration files
│   ├── middleware/        # Express middleware
│   ├── models/            # Database models
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── index.ts           # Application entry point
├── docs/                  # Documentation
├── migrations/            # Database migrations
├── seeds/                 # Database seed data
├── tests/                 # Test files
└── .env                   # Environment variables
```

## Development

### Running Tests

```
npm run test
```

### Linting

```
npm run lint
```

### Building for Production

```
npm run build
```

## Error Handling

The API uses a standardized error handling approach. All errors returned follow a consistent format:

```json
{
  "error": {
    "message": "Error description",
    "type": "ErrorType",
    "details": []
  }
}
```

## Authentication

The API uses header-based authentication with the following headers:

- `X-Guest-ID`: For guest authentication
- `X-Hotel-ID`: For hotel-specific operations

## License

This project is licensed under the MIT License - see the LICENSE file for details.