# API Endpoints

NegotiationMaster REST API documentation.

## Base URL

```
Local Development: http://localhost:5000/api
Production: https://api.negotiationmaster.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Refresh

Access tokens expire in 15 minutes. Use the refresh token to get new access tokens.

## Authentication Endpoints

### POST /auth/register

Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePassword123!",
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
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "createdAt": "2025-01-29T10:00:00.000Z"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

**Validation Rules:**
- Email: Valid email format, unique
- Username: 3-30 alphanumeric characters, unique
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- First/Last Name: 1-50 characters

### POST /auth/login

Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

### POST /auth/logout

Logout user and revoke refresh token.

**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### POST /auth/logout-all

🔒 **Protected** - Logout from all devices.

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out from all devices"
}
```

## Dashboard Endpoints

### GET /dashboard

🔒 **Protected** - Get user dashboard data.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "name": "John Doe",
      "email": "user@example.com",
      "username": "johndoe"
    },
    "progress": {
      "totalNegotiations": 5,
      "completedNegotiations": 3,
      "successfulDeals": 2,
      "skillScores": {
        "claimingValue": 75,
        "creatingValue": 68,
        "managingRelationships": 82
      },
      "overallScore": 75,
      "highestScenarioCompleted": 3,
      "lastActivity": "2025-01-29T10:00:00.000Z"
    },
    "recentNegotiations": [
      {
        "id": "uuid",
        "scenarioTitle": "Salary Negotiation - Entry Level",
        "difficultyLevel": 1,
        "status": "completed",
        "dealReached": true,
        "startedAt": "2025-01-29T09:00:00.000Z",
        "completedAt": "2025-01-29T09:30:00.000Z"
      }
    ]
  }
}
```

### GET /dashboard/scenarios

🔒 **Protected** - Get available negotiation scenarios.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "scenarios": [
      {
        "id": "uuid",
        "title": "Salary Negotiation - Entry Level",
        "description": "Negotiate your starting salary for your first job out of college.",
        "difficultyLevel": 1,
        "situation": "You have been offered a position at TechStart Inc. The initial offer is $65,000.",
        "yourRole": "Recent graduate with internship experience",
        "stakes": "Your starting salary will impact your career trajectory",
        "negotiationType": "mixed",
        "learningObjectives": [
          "Claiming Value: Maximize your outcomes",
          "Creating Value: Explore mutual interests and generate options",
          "Managing Relationships: Build trust while advocating effectively"
        ],
        "isAvailable": true,
        "isCompleted": false,
        "isLocked": false
      }
    ],
    "userProgress": {
      "highestCompleted": 0,
      "totalCompleted": 0
    },
    "theoryOverview": {
      "concepts": [
        "BATNA (Best Alternative to Negotiated Agreement)",
        "ZOPA (Zone of Possible Agreement)",
        "Distributive vs Integrative Negotiation",
        "Harvard Negotiation Project Principles"
      ],
      "skillDimensions": {
        "claimingValue": "Your ability to secure favorable terms and maximize outcomes",
        "creatingValue": "Finding win-win solutions and expanding mutual value",
        "managingRelationships": "Building trust and maintaining positive relationships"
      }
    }
  }
}
```

### POST /dashboard/negotiations/start

🔒 **Protected** - Start a new negotiation.

**Request Body:**
```json
{
  "scenarioId": "uuid"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "negotiation": {
      "id": "uuid",
      "scenarioId": "uuid",
      "status": "in_progress",
      "startedAt": "2025-01-29T10:00:00.000Z"
    },
    "scenario": {
      "id": "uuid",
      "title": "Salary Negotiation - Entry Level",
      "description": "Negotiate your starting salary for your first job out of college.",
      "difficultyLevel": 1,
      "aiCharacter": {
        "name": "Sarah Chen",
        "role": "HR Manager",
        "personality": "Professional, somewhat rigid about budget constraints",
        "initial_position": "Company has a strict salary band for entry-level positions",
        "negotiation_style": "Conservative, focused on company policies"
      },
      "context": {
        "situation": "You have been offered a position at TechStart Inc. The initial offer is $65,000.",
        "your_role": "Recent graduate with internship experience",
        "stakes": "Your starting salary will impact your career trajectory",
        "constraints": ["Company budget limitations", "Entry-level position", "Standard benefits package"],
        "background": "Market rate for similar positions ranges from $60,000-$75,000"
      },
      "evaluationCriteria": {
        "claiming_value": {
          "excellent": "Achieved salary above $70,000",
          "good": "Achieved salary between $67,000-$70,000",
          "average": "Achieved salary between $65,000-$67,000",
          "poor": "No improvement or lost the offer"
        },
        "creating_value": {
          "excellent": "Identified creative compensation alternatives",
          "good": "Discussed some additional benefits beyond salary",
          "average": "Focused primarily on salary alone",
          "poor": "Made demands without considering company needs"
        },
        "managing_relationships": {
          "excellent": "Built rapport, showed understanding of company constraints",
          "good": "Maintained professional tone throughout",
          "average": "Some tension but resolved professionally",
          "poor": "Created conflict or damaged relationship"
        }
      }
    }
  }
}
```

## Error Responses

All endpoints return consistent error formats:

### Validation Error (400)
```json
{
  "success": false,
  "error": "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character",
  "code": "VALIDATION_ERROR"
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "error": "Invalid credentials",
  "code": "INVALID_CREDENTIALS"
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "error": "Invalid or expired token",
  "code": "TOKEN_INVALID"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "error": "Scenario not found",
  "code": "SCENARIO_NOT_FOUND"
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "error": "Too many authentication attempts, please try again later",
  "code": "RATE_LIMIT_EXCEEDED"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "code": "INTERNAL_ERROR"
}
```

## Rate Limiting

- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **General endpoints**: 100 requests per 15 minutes per IP
- **WebSocket connections**: 10 concurrent connections per user

## Pagination

For endpoints that return lists, pagination follows this format:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default varies by endpoint)
- `order`: Sort order `asc` or `desc` (default: `desc`)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```