# Authentication Endpoints

## Overview
The authentication system uses JWT tokens with refresh token rotation for secure user sessions.

## Endpoints

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- 400: User already exists
```json
{
  "success": false,
  "error": "Email already registered",
  "code": "USER_EXISTS"
}
```

### POST /api/auth/login
Authenticate user and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- 401: Invalid credentials
```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

### POST /api/auth/refresh
Refresh expired access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**
- 401: Invalid or expired refresh token
```json
{
  "success": false,
  "error": "Invalid refresh token",
  "code": "INVALID_TOKEN"
}
```

### POST /api/auth/logout
Logout user and invalidate refresh token.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /api/auth/logout-all
Logout user from all devices by revoking all refresh tokens.

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out from all devices"
}
```

## Token Information

### Access Token
- **Lifetime:** 15 minutes
- **Usage:** Include in Authorization header for protected endpoints
- **Format:** `Authorization: Bearer <access-token>`

### Refresh Token
- **Lifetime:** 7 days
- **Usage:** Used to obtain new access tokens
- **Security:** Stored securely, rotated on each use
- **Device Tracking:** Associated with User-Agent for device identification

## Security Features

1. **Password Requirements:**
   - Minimum 8 characters
   - Must contain uppercase, lowercase, number, and special character

2. **Rate Limiting:**
   - Authentication endpoints: 5 requests per minute per IP
   - Failed login attempts logged with IP tracking

3. **Token Security:**
   - JWT tokens signed with HS256 algorithm
   - Refresh token rotation prevents token replay attacks
   - Device-specific refresh tokens for multi-device support

4. **Password Security:**
   - bcrypt hashing with salt rounds
   - Passwords never stored in plain text
   - Constant-time comparison to prevent timing attacks

## Error Codes

| Code | Description |
|------|-------------|
| USER_EXISTS | Email or username already registered |
| INVALID_CREDENTIALS | Email/password combination incorrect |
| TOKEN_MISSING | Required token not provided |
| INVALID_TOKEN | Token is invalid or expired |
| USER_NOT_FOUND | User account not found |