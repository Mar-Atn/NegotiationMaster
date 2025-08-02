# NegotiationMaster Technical Architecture

**Version:** 2.0.0  
**Last Updated:** August 2, 2025  
**Status:** Production-Ready Components Documentation

---

## 🏗️ System Overview

NegotiationMaster is a voice-powered negotiation training platform built with:
- **Frontend:** React.js single-page application
- **Backend:** Node.js/Express.js REST API
- **Database:** SQLite (development) / PostgreSQL (production-ready)
- **Voice Integration:** ElevenLabs Conversational AI
- **Real-time Communication:** Socket.io WebSocket connections
- **Authentication:** JWT with refresh token rotation

---

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/register` | Create new user account | No |
| POST | `/login` | Authenticate user, receive tokens | No |
| POST | `/refresh` | Refresh access token | No |
| POST | `/logout` | Invalidate refresh token | No |
| POST | `/logout-all` | Invalidate all user tokens | Yes |

### Character Routes (`/api/characters`)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/` | List all active AI characters | No |
| GET | `/:id` | Get specific character details | No |
| GET | `/role/:role` | Get characters by role type | No |
| POST | `/test` | Test character interaction | Yes |

### Scenario Routes (`/api/scenarios`)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/` | List all active scenarios | No |
| GET | `/difficulty/:level` | Get scenarios by difficulty | No |
| GET | `/:id` | Get specific scenario details | No |
| POST | `/:id/start` | Start new negotiation session | Yes |

### Negotiation Routes (`/api/negotiations`)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/` | Get user's negotiation history | Yes |
| GET | `/:id` | Get specific negotiation details | Yes |
| PUT | `/:id/state` | Update negotiation state | Yes |
| POST | `/:id/messages` | Send negotiation message | Yes |
| PUT | `/:id/complete` | Complete negotiation session | Yes |

### Voice Routes (`/api/voice`)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/generate` | Generate voice from text | Yes |
| POST | `/stream` | Stream voice synthesis | Yes |
| GET | `/metrics` | Get voice service metrics | Yes |
| POST | `/test` | Test voice synthesis | Yes |
| GET | `/voices` | List available voices | Yes |
| GET | `/character-configs` | Get voice configurations | Yes |
| POST | `/conversational/initialize` | Start ElevenLabs session | Yes |
| DELETE | `/conversational/:sessionId` | End voice session | Yes |
| GET | `/conversational/sessions` | List active sessions | Yes |
| GET | `/conversational/metrics` | Get conversation metrics | Yes |
| POST | `/create-agent-session` | Create AI agent session | Yes |

### Performance Routes (`/api/performance`)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/negotiations/:id/analyze` | Analyze negotiation performance | Yes |
| GET | `/negotiations/:id` | Get performance details | Yes |
| GET | `/users/analytics` | Get user analytics | Yes |
| GET | `/scenarios/:id/criteria` | Get scoring criteria | Yes |
| POST | `/milestone` | Record achievement milestone | Yes |
| GET | `/leaderboard` | Get performance rankings | Yes |

### Debug Routes (`/api/debug`)
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/test` | Test system connectivity | No |
| GET | `/cors` | Verify CORS configuration | No |
| GET | `/scenarios` | Debug scenario data | No |

### Health Check Routes
| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/health` | Basic health check | No |
| GET | `/api/health` | Detailed health status | No |

---

## 🔧 Service Architecture

### Core Services

#### 1. **authService.js**
- JWT token generation and validation
- Password hashing with bcrypt
- Refresh token management
- Session handling

#### 2. **voiceService.js**
- ElevenLabs API integration
- Voice synthesis coordination
- Session management for conversations
- Audio streaming control

#### 3. **elevenLabsService.js**
- Direct ElevenLabs API wrapper
- WebSocket connection management
- Audio format conversion
- Voice model selection

#### 4. **enhancedAIEngine.js**
- Character prompt generation
- Scenario context management
- Negotiation state tracking
- Response generation logic

#### 5. **performanceAnalyticsService.js**
- Real-time performance tracking
- Skill dimension analysis
- Feedback generation
- Progress calculation

#### 6. **voiceSessionManager.js**
- Active session tracking
- Resource cleanup
- Session state persistence
- Concurrent session limits

---

## 💾 Data Flow Architecture

### Request Flow
```
Client (React) 
    ↓ HTTPS
Express Server
    ↓ Middleware (Auth, Validation, Rate Limiting)
Route Handler
    ↓ Service Layer
Database / External APIs
    ↑ Response
Service Layer
    ↑ JSON Response
Express Server
    ↑ HTTPS
Client (React)
```

### Voice Conversation Flow
```
User Speech (Browser)
    ↓ WebRTC/MediaRecorder
Frontend Voice Component
    ↓ Socket.io
Backend WebSocket Handler
    ↓ 
ElevenLabs Conversational API
    ↓ AI Processing
Character Prompt + Context
    ↓ Response Generation
ElevenLabs Voice Synthesis
    ↓ Audio Stream
Socket.io Broadcast
    ↓
Frontend Audio Player
    ↓
User Hears Response
```

### Authentication Flow
```
Login Request
    ↓ Credentials
authController.login
    ↓ Validation
authService.validateUser
    ↓ bcrypt compare
Generate JWT + Refresh Token
    ↓ Store refresh token
Return tokens to client
    ↓
Client stores in memory/httpOnly cookies
```

---

## 🔌 Frontend-Backend Communication

### 1. **REST API Communication**
- Base URL: `http://localhost:5000/api`
- Authentication: Bearer token in Authorization header
- Content-Type: application/json
- Error format: `{ success: false, error: "message", code: "ERROR_CODE" }`

### 2. **WebSocket Events (Socket.io)**

#### Client → Server Events
- `join-negotiation`: Join negotiation room
- `leave-negotiation`: Leave negotiation room
- `voice-stream-ready`: Signal readiness for voice
- `voice-stream-interrupt`: Interrupt active stream
- `user-audio-chunk`: Send user audio data
- `initialize-conversational-session`: Start ElevenLabs session
- `end-conversational-session`: End voice session
- `get-conversational-status`: Request session status

#### Server → Client Events
- `voice-stream-acknowledged`: Confirm stream ready
- `voice-stream-interrupted`: Broadcast interruption
- `user-audio-acknowledged`: Confirm audio received
- `conversational-session-started`: Session initialized
- `conversational-session-ended`: Session terminated
- `conversational-session-error`: Error occurred
- `ai-audio-chunk`: AI voice data stream
- `ai-transcript`: AI text transcript

---

## 📁 File Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/
│   │   ├── database.js      # Knex configuration
│   │   └── logger.js        # Winston logger setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── charactersController.js
│   │   ├── negotiationsController.js
│   │   ├── scenariosController.js
│   │   └── voiceController.js
│   ├── database/
│   │   ├── migrations/      # Schema migrations
│   │   └── seeds/          # Development data
│   ├── middleware/
│   │   ├── auth.js         # JWT verification
│   │   ├── errorHandler.js # Global error handling
│   │   ├── validation.js   # Request validation
│   │   └── voiceSecurity.js # Voice-specific security
│   ├── routes/
│   │   ├── auth.js
│   │   ├── characters.js
│   │   ├── negotiations.js
│   │   ├── scenarios.js
│   │   ├── voice.js
│   │   └── performance.js
│   ├── services/
│   │   └── [service files]
│   └── server.js           # Main application entry
├── knexfile.js            # Database configuration
└── package.json
```

### Frontend Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── VoiceConversation/
│   │   ├── NegotiationChat/
│   │   ├── LiveFeedback/
│   │   └── Layout/
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Dashboard.js
│   │   ├── NegotiationChat.js
│   │   └── AcademicPrototype.js
│   ├── services/
│   │   ├── apiService.js
│   │   ├── authService.js
│   │   ├── socketService.js
│   │   └── voiceService.js
│   └── App.js
└── package.json
```

---

## 🔐 Security Measures

1. **Authentication**
   - JWT with 15-minute expiration
   - Refresh tokens with 7-day expiration
   - bcrypt password hashing (12 rounds)
   - Token rotation on refresh

2. **API Security**
   - CORS configuration for allowed origins
   - Helmet.js for security headers
   - Rate limiting (disabled in dev)
   - Input validation middleware

3. **Voice Security**
   - Session-based access control
   - Audio stream encryption
   - API key management
   - Request signing

---

## 🚀 Performance Optimizations

1. **Database**
   - Indexed columns for common queries
   - Connection pooling
   - Prepared statements

2. **API**
   - Response compression
   - JSON size optimization
   - Async/await for all I/O

3. **Voice**
   - Audio chunk streaming
   - Buffer management
   - Session pooling

4. **Frontend**
   - Code splitting
   - Lazy loading
   - Memoization

---

## 🔄 Integration Points

### ElevenLabs Integration
- **API Endpoint:** `https://api.elevenlabs.io/v1/`
- **WebSocket:** `wss://api.elevenlabs.io/v1/convai/conversation`
- **Authentication:** API key in x-api-key header
- **Models Used:** `eleven_turbo_v2_5` for speed
- **Voice IDs:** Character-specific voice assignments

### Database Connections
- **Development:** SQLite file at `backend/dev.sqlite3`
- **Production Ready:** PostgreSQL connection string
- **ORM:** Knex.js for query building
- **Migrations:** Tracked in `database/migrations/`

---

## 📊 Monitoring & Logging

1. **Application Logs**
   - Winston logger to `logs/combined.log`
   - Error logs to `logs/error.log`
   - Console output in development

2. **Voice Metrics**
   - Session duration tracking
   - Audio quality metrics
   - Latency measurements
   - Error rate monitoring

3. **Performance Tracking**
   - API response times
   - Database query performance
   - WebSocket connection health
   - Memory usage patterns

---

## 🛠️ Development Tools

- **Node.js:** v16+ required
- **Database:** SQLite3 (dev), PostgreSQL (prod)
- **Package Manager:** npm
- **Testing:** Jest for unit tests
- **Linting:** ESLint configuration
- **Environment:** dotenv for configuration