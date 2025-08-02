# ADR-002: Socket.io for Real-time Communication

## Status
Accepted

## Context
The NegotiationMaster application requires real-time communication for:
- Live chat during negotiations
- Real-time AI responses from negotiation characters
- Status updates (user joined/left, negotiation state changes)
- Immediate feedback delivery
- Future voice integration support

We need to choose a real-time communication technology that provides:
- Bidirectional communication between client and server
- Reliable message delivery
- Automatic reconnection handling
- Room-based communication for negotiation sessions
- Integration with existing Express.js backend
- Support for authentication and authorization

Options considered:
1. **WebSockets**: Native browser WebSocket API
2. **Socket.io**: Library built on top of WebSockets with fallbacks
3. **Server-Sent Events (SSE)**: Unidirectional server-to-client communication
4. **WebRTC**: Peer-to-peer communication

## Decision
We will use Socket.io for real-time communication in the NegotiationMaster application.

Socket.io provides:
- WebSocket transport with graceful fallbacks (polling, etc.)
- Built-in room management for negotiation sessions
- Automatic reconnection with exponential backoff
- Message acknowledgments for reliability
- Easy integration with Express.js
- JWT authentication support
- Broadcasting capabilities
- Namespace support for organizing different types of connections

## Consequences

### Positive
- **Reliability**: Automatic fallbacks ensure connection stability across different network conditions
- **Room Management**: Built-in support for negotiation session isolation
- **Reconnection**: Automatic reconnection with state recovery
- **Authentication**: Easy integration with JWT tokens
- **Broadcasting**: Efficient message distribution to multiple clients
- **Development Speed**: Simplified API compared to raw WebSockets
- **Community**: Large community and extensive documentation
- **Future-Proof**: Supports future features like voice channels

### Negative
- **Bundle Size**: Larger client library compared to native WebSockets
- **Complexity**: Additional abstraction layer over WebSockets
- **Server Resources**: Maintains connection state on server
- **Debugging**: Can be more complex to debug than HTTP requests

### Neutral
- **Protocol Overhead**: Minimal additional protocol overhead
- **Browser Support**: Excellent browser support with fallbacks
- **Scalability**: Requires consideration for horizontal scaling (Redis adapter)

## Implementation

### Server-side Setup
```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true
  }
})

// JWT authentication middleware
io.use(authenticateSocket)

// Negotiation namespace
const negotiationNamespace = io.of('/negotiations')
```

### Room Management
- Each negotiation session creates a unique room
- Users join rooms when entering negotiations
- Messages are broadcast only to room participants
- AI characters are represented as server-side participants

### Event Types
- `join_negotiation`: User joins negotiation room
- `leave_negotiation`: User leaves negotiation room
- `send_message`: Send chat message
- `negotiation_update`: Status or state changes
- `ai_response`: AI character responses
- `typing_indicator`: Show typing status

### Client Integration
- React context for socket connection management
- Automatic reconnection handling
- Message queuing during disconnections
- Integration with chat components

## References
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Socket.io with JWT Authentication](https://socket.io/docs/v4/middlewares/#sending-credentials)
- [Scaling Socket.io Applications](https://socket.io/docs/v4/using-multiple-nodes/)