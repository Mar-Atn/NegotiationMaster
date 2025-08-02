# NegotiationMaster Voice-Powered API Documentation

## Overview

The NegotiationMaster backend provides a comprehensive API for voice-powered negotiation training with real-time AI character interactions, sophisticated voice synthesis, and advanced analytics.

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## Voice API Endpoints

### Initialize Voice Conversation

Initialize a voice-powered conversation for a negotiation session.

**Endpoint:** `POST /voice/negotiations/{negotiationId}/voice/initialize`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Response:**
```json
{
  "success": true,
  "data": {
    "streamId": "voice_12345_67890",
    "negotiationId": "neg_abc123",
    "character": {
      "id": "char_001",
      "name": "Sarah Johnson",
      "role": "HR Manager",
      "voiceConfig": {
        "voice_id": "EXAVITQu4vr4xnSDxMaL",
        "settings": {
          "stability": 0.80,
          "similarity_boost": 0.75,
          "style": 0.30,
          "use_speaker_boost": false
        }
      }
    },
    "status": "initialized",
    "capabilities": {
      "textToSpeech": true,
      "realTimeStreaming": true,
      "lowLatencyMode": true,
      "speechToText": false
    }
  },
  "message": "Voice conversation initialized successfully"
}
```

### Send Voice Message

Send a text message and receive AI voice response.

**Endpoint:** `POST /voice/negotiations/{negotiationId}/voice/message`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "streamId": "voice_12345_67890",
  "message": "I'd like to discuss the salary for this position.",
  "messageType": "text"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_12345_user",
    "streamId": "voice_12345_67890",
    "negotiationId": "neg_abc123",
    "message": "I'd like to discuss the salary for this position.",
    "status": "processing",
    "timestamp": "2024-07-30T10:30:00Z"
  },
  "message": "Voice message processing started"
}
```

### Close Voice Conversation

End a voice conversation session.

**Endpoint:** `POST /voice/negotiations/{negotiationId}/voice/close`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "streamId": "voice_12345_67890",
  "reason": "user_request"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "streamId": "voice_12345_67890",
    "negotiationId": "neg_abc123",
    "status": "closed",
    "reason": "user_request"
  },
  "message": "Voice conversation closed successfully"
}
```

### Get Voice Status

Get the status of voice conversations.

**Endpoint:** `GET /voice/negotiations/{negotiationId}/voice/status?streamId={streamId}`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "streamId": "voice_12345_67890",
    "negotiationId": "neg_abc123",
    "status": "streaming",
    "character": {
      "id": "char_001",
      "name": "Sarah Johnson"
    },
    "createdAt": "2024-07-30T10:25:00Z",
    "lastActivity": "2024-07-30T10:30:00Z",
    "totalChunks": 15,
    "totalBytes": 245760,
    "duration": 300000
  }
}
```

### Get Voice Analytics

Retrieve analytics data for voice conversations.

**Endpoint:** `GET /voice/negotiations/{negotiationId}/voice/analytics`

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "negotiationId": "neg_abc123",
    "analytics": {
      "totalSessions": 3,
      "activeSessions": 1,
      "completedSessions": 2,
      "totalConversationTurns": 24,
      "averageLatency": 847,
      "totalSpeechDuration": 45000,
      "averageSessionDuration": 12000
    },
    "serviceMetrics": {
      "averageLatency": 847,
      "totalStreamsCreated": 156,
      "totalStreamsCompleted": 154,
      "successRate": 98.7
    }
  }
}
```

## WebSocket Events

The voice system uses WebSocket connections for real-time communication.

### Client-to-Server Events

#### Join Negotiation
```javascript
socket.emit('join-negotiation', negotiationId)
```

#### Voice Stream Ready
```javascript
socket.emit('voice-stream-ready', {
  streamId: 'voice_12345_67890',
  negotiationId: 'neg_abc123'
})
```

#### Voice Stream Interrupt
```javascript
socket.emit('voice-stream-interrupt', {
  streamId: 'voice_12345_67890',
  negotiationId: 'neg_abc123',
  reason: 'user_interrupt'
})
```

### Server-to-Client Events

#### Voice Stream Ready
```javascript
socket.on('voice-stream-ready', (data) => {
  // Stream is ready for voice generation
})
```

#### Voice Generation Start
```javascript
socket.on('voice-generation-start', (data) => {
  // AI has started generating voice response
})
```

#### Voice Chunk First
```javascript
socket.on('voice-chunk-first', (data) => {
  // First audio chunk (for low latency playback)
  const audioChunk = data.chunk // base64 encoded audio
  const latency = data.latency // milliseconds
})
```

#### Voice Chunk
```javascript
socket.on('voice-chunk', (data) => {
  // Subsequent audio chunks
  const audioChunk = data.chunk // base64 encoded audio
  const chunkIndex = data.chunkIndex
})
```

#### Voice Stream Complete
```javascript
socket.on('voice-stream-complete', (data) => {
  // Voice generation completed
  const totalLatency = data.latency
  const totalChunks = data.totalChunks
})
```

#### Voice Stream Error
```javascript
socket.on('voice-stream-error', (data) => {
  // Error occurred during voice generation
  console.error('Voice error:', data.error)
})
```

## Character Management

### Get All Characters

**Endpoint:** `GET /characters`

**Response:** List of available AI characters with voice configurations.

### Get Character by ID

**Endpoint:** `GET /characters/{characterId}`

**Response:** Detailed character information including voice settings.

## Scenario Management

### Get All Scenarios

**Endpoint:** `GET /scenarios`

**Response:** List of available negotiation scenarios.

### Get Scenario by ID

**Endpoint:** `GET /scenarios/{scenarioId}`

**Response:** Detailed scenario information.

## Negotiation Management

### Create Negotiation

**Endpoint:** `POST /negotiations`

**Request Body:**
```json
{
  "scenarioId": "scenario_001"
}
```

### Get User Negotiations

**Endpoint:** `GET /negotiations`

**Response:** List of user's negotiations.

### Get Negotiation by ID

**Endpoint:** `GET /negotiations/{negotiationId}`

**Response:** Detailed negotiation information including messages.

## Health and Monitoring

### Service Health Check

**Endpoint:** `GET /voice/health`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "elevenLabs": {
        "status": "healthy",
        "latency": 234,
        "timestamp": "2024-07-30T10:30:00Z"
      },
      "voiceStreaming": {
        "status": "healthy",
        "activeStreams": 5,
        "metrics": {
          "streamsCreated": 156,
          "streamsCompleted": 154,
          "averageLatency": 847
        }
      }
    },
    "timestamp": "2024-07-30T10:30:00Z"
  }
}
```

### System Metrics

**Endpoint:** `GET /debug/metrics` (development only)

**Response:** Comprehensive system metrics.

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

- `UNAUTHORIZED`: Invalid or missing authentication token
- `FORBIDDEN`: Insufficient permissions
- `VALIDATION_ERROR`: Request validation failed
- `NEGOTIATION_NOT_FOUND`: Specified negotiation doesn't exist
- `STREAM_NOT_FOUND`: Voice stream not found
- `ELEVENLABS_ERROR`: ElevenLabs API error
- `RATE_LIMIT_EXCEEDED`: Too many requests

## Rate Limiting

The API implements rate limiting with the following defaults:
- 100 requests per 15-minute window per IP
- Voice endpoints have adaptive rate limiting based on performance

## Audio Format

Voice responses are streamed as MP3 audio chunks encoded in base64:
- Format: MP3
- Sample Rate: 44.1 kHz
- Bitrate: 128 kbps
- Channels: Mono

## Performance Optimization

The API includes several performance optimizations:

### Caching
- Response caching for frequently accessed data
- Redis support for distributed caching
- Intelligent cache invalidation

### Connection Management
- HTTP keep-alive connections
- Connection pooling for database
- WebSocket connection optimization

### Low Latency Voice
- Streaming audio chunks as they're generated
- Optimized ElevenLabs settings for speed
- First chunk prioritization (< 75ms target)

## Security

### Authentication
- JWT-based authentication
- Refresh token rotation
- Secure cookie handling

### Input Validation
- Request validation middleware
- SQL injection prevention
- XSS protection

### Headers
- Security headers via Helmet.js
- CORS configuration
- CSP policies

## Development

### Environment Setup
1. Copy `.env.example` to `.env`
2. Configure ElevenLabs API key
3. Set up database connection
4. Configure Redis (optional)

### Running the Server
```bash
npm install
npm run dev
```

### Testing
```bash
npm test
npm run test:watch
```

### API Testing with cURL

Initialize voice conversation:
```bash
curl -X POST http://localhost:5000/api/voice/negotiations/neg_123/voice/initialize \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

Send voice message:
```bash
curl -X POST http://localhost:5000/api/voice/negotiations/neg_123/voice/message \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"streamId": "voice_123", "message": "Hello, let'\''s start negotiating"}'
```

## Support

For technical support or questions about the API, please refer to the project documentation or contact the development team.