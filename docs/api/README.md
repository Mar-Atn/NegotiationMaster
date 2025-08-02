# NegotiationMaster API Documentation

## Overview

The NegotiationMaster API provides endpoints for managing users, negotiations, scenarios, and real-time communication. This RESTful API uses JWT authentication and follows conventional HTTP status codes.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Token Refresh
Access tokens expire after 15 minutes. Use the refresh endpoint to get new tokens without re-authentication.

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - Logout user

### Users
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `GET /users/progress` - Get user progress data

### Scenarios
- `GET /scenarios` - List all available scenarios
- `GET /scenarios/:id` - Get specific scenario details

### Negotiations
- `POST /negotiations` - Start new negotiation
- `GET /negotiations` - List user's negotiations
- `GET /negotiations/:id` - Get negotiation details
- `PUT /negotiations/:id/complete` - Complete negotiation
- `POST /negotiations/:id/messages` - Send message

### Feedback
- `GET /negotiations/:id/feedback` - Get negotiation feedback
- `POST /negotiations/:id/feedback` - Submit feedback

## Real-time Communication

The application uses Socket.io for real-time features:
- Negotiation messages
- Status updates
- AI responses

### Socket Events
- `join_negotiation` - Join negotiation room
- `send_message` - Send chat message
- `negotiation_update` - Status changes
- `ai_response` - AI character responses

## Error Handling

All endpoints return consistent error responses:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Rate Limited
- 500: Internal Server Error

## Rate Limiting

API endpoints are rate limited:
- Authentication: 5 requests per minute
- General: 100 requests per minute
- WebSocket: 50 messages per minute

## Data Models

See individual endpoint documentation for detailed request/response schemas.

## Detailed Endpoints

For complete endpoint documentation with request/response examples, see:
- [Authentication Endpoints](./auth.md)
- [User Endpoints](./users.md)
- [Scenario Endpoints](./scenarios.md)
- [Negotiation Endpoints](./negotiations.md)
- [Socket Events](./websockets.md)