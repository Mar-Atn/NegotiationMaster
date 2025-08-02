# Socket.io Event Contracts

## Real-time Communication Specification for Chat Integration

### Connection Management

#### Client-side Connection (Frontend)
```javascript
import io from 'socket.io-client'

const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
  auth: {
    token: localStorage.getItem('accessToken')
  },
  transports: ['websocket', 'polling']
})
```

#### Server-side Authentication (Backend)
```javascript
// Add to server.js after line 27
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await db('users').where('id', decoded.userId).first()
    
    if (!user) {
      return next(new Error('User not found'))
    }
    
    socket.userId = user.id
    socket.userEmail = user.email
    next()
  } catch (err) {
    next(new Error('Authentication error'))
  }
})
```

### Core Events

#### 1. Join/Leave Negotiation Room

**Frontend Emit:**
```javascript
// Join negotiation session
socket.emit('join-negotiation', {
  negotiation_id: 'uuid-string'
})

// Leave negotiation session  
socket.emit('leave-negotiation', {
  negotiation_id: 'uuid-string'
})
```

**Backend Handler:**
```javascript
socket.on('join-negotiation', ({ negotiation_id }) => {
  // Validate user has access to negotiation
  socket.join(`negotiation-${negotiation_id}`)
  
  logger.info('User joined negotiation', {
    userId: socket.userId,
    negotiationId: negotiation_id,
    socketId: socket.id
  })
  
  // Send current negotiation state
  socket.emit('negotiation-state', {
    negotiation_id,
    status: 'active',
    participant_count: io.sockets.adapter.rooms.get(`negotiation-${negotiation_id}`)?.size || 0
  })
})
```

#### 2. Send User Message

**Frontend Emit:**
```javascript
socket.emit('send-message', {
  negotiation_id: 'uuid-string',
  content: 'I would like to discuss the salary offer',
  type: 'user',
  timestamp: new Date().toISOString()
})
```

**Backend Handler:**
```javascript
socket.on('send-message', async (data) => {
  const { negotiation_id, content, type } = data
  
  try {
    // 1. Validate negotiation exists and user has access
    const negotiation = await db('negotiations')
      .where({ id: negotiation_id, user_id: socket.userId })
      .first()
    
    if (!negotiation || negotiation.status !== 'active') {
      return socket.emit('error', { message: 'Invalid negotiation' })
    }
    
    // 2. Save user message to database
    const [message] = await db('messages').insert({
      negotiation_id,
      sender_type: 'user',
      content,
      created_at: new Date()
    }).returning('*')
    
    // 3. Broadcast message to room
    io.to(`negotiation-${negotiation_id}`).emit('message-received', {
      id: message.id,
      negotiation_id,
      sender_type: 'user',
      content,
      timestamp: message.created_at
    })
    
    // 4. Trigger AI response (async)
    generateAIResponse(negotiation_id, content, socket.userId)
    
  } catch (error) {
    socket.emit('error', { message: 'Failed to send message' })
    logger.error('Send message error', { error, userId: socket.userId })
  }
})
```

#### 3. AI Response Events

**Backend Emit (to room):**
```javascript
// After AI generates response
io.to(`negotiation-${negotiation_id}`).emit('ai-message', {
  id: aiMessage.id,
  negotiation_id,
  sender_type: 'ai',
  content: aiResponse.content,
  ai_metadata: {
    model: 'gpt-4',
    reasoning: aiResponse.reasoning,
    negotiation_state: aiResponse.state
  },
  timestamp: aiMessage.created_at
})
```

**Frontend Listener:**
```javascript
socket.on('ai-message', (data) => {
  // Add AI message to chat interface
  setChatMessages(prev => [...prev, {
    id: data.id,
    type: 'ai',
    content: data.content,
    timestamp: data.timestamp,
    metadata: data.ai_metadata
  }])
  
  // Show typing indicator off
  setAiTyping(false)
})
```

#### 4. Typing Indicators

**Frontend Emit:**
```javascript
// User starts typing
socket.emit('typing-start', { negotiation_id })

// User stops typing (debounced)
socket.emit('typing-stop', { negotiation_id })
```

**Backend Broadcast:**
```javascript
socket.on('typing-start', ({ negotiation_id }) => {
  socket.to(`negotiation-${negotiation_id}`).emit('user-typing', {
    user_id: socket.userId,
    typing: true
  })
})

// AI typing indicator when generating response
const showAITyping = (negotiation_id) => {
  io.to(`negotiation-${negotiation_id}`).emit('ai-typing', {
    typing: true,
    estimated_time: 3000 // ms
  })
}
```

#### 5. Negotiation State Updates

**Backend Emit:**
```javascript
// When negotiation status changes
io.to(`negotiation-${negotiation_id}`).emit('negotiation-update', {
  negotiation_id,
  status: 'completed', // active, paused, completed, expired
  deal_terms: {
    agreed: true,
    terms: { salary: 75000, benefits: 'standard' }
  },
  final_score: {
    claiming_value: 85,
    creating_value: 70,
    managing_relationships: 90,
    overall: 82
  },
  updated_at: new Date().toISOString()
})
```

**Frontend Listener:**
```javascript
socket.on('negotiation-update', (data) => {
  setNegotiationState(data)
  
  if (data.status === 'completed') {
    // Show final results modal
    setShowResults(true)
    setFinalScore(data.final_score)
  }
})
```

#### 6. Error Handling

**Backend Error Emit:**
```javascript
socket.emit('error', {
  code: 'NEGOTIATION_EXPIRED',
  message: 'This negotiation session has expired',
  timestamp: new Date().toISOString()
})
```

**Frontend Error Listener:**
```javascript
socket.on('error', (error) => {
  console.error('Socket error:', error)
  
  // Show user-friendly error message
  setError(error.message)
  
  // Handle specific error codes
  if (error.code === 'NEGOTIATION_EXPIRED') {
    // Redirect to scenarios page
    navigate('/scenarios')
  }
})
```

### Connection Status Management

**Frontend Connection Handling:**
```javascript
useEffect(() => {
  socket.on('connect', () => {
    setConnectionStatus('connected')
    // Rejoin rooms if needed
    if (currentNegotiationId) {
      socket.emit('join-negotiation', { negotiation_id: currentNegotiationId })
    }
  })
  
  socket.on('disconnect', () => {
    setConnectionStatus('disconnected')
    setError('Connection lost. Attempting to reconnect...')
  })
  
  socket.on('reconnect', () => {
    setConnectionStatus('connected') 
    setError(null)
  })
  
  return () => {
    socket.off('connect')
    socket.off('disconnect')
    socket.off('reconnect')
  }
}, [currentNegotiationId])
```

### Message Format Standards

#### User Message Object
```javascript
{
  id: 'uuid',
  negotiation_id: 'uuid',
  sender_type: 'user',
  content: 'string',
  timestamp: 'ISO string',
  read: boolean
}
```

#### AI Message Object
```javascript
{
  id: 'uuid', 
  negotiation_id: 'uuid',
  sender_type: 'ai',
  content: 'string',
  ai_metadata: {
    model: 'gpt-4',
    reasoning: 'string',
    negotiation_state: 'opening|discussion|closing',
    confidence: 0.85
  },
  timestamp: 'ISO string'
}
```

### Testing Events

**Development Testing Commands:**
```javascript
// Backend: Force AI response for testing
socket.emit('dev-trigger-ai', { negotiation_id, force_response: true })

// Backend: Simulate negotiation completion
socket.emit('dev-complete-negotiation', { 
  negotiation_id, 
  outcome: 'success',
  score_override: { claiming_value: 90 }
})
```

### Performance Considerations

- **Rate Limiting**: Max 10 messages per minute per user
- **Message Size**: Max 1000 characters per message
- **Connection Timeout**: 30 seconds for AI responses
- **Room Cleanup**: Auto-remove empty rooms after 5 minutes
- **Message History**: Load last 50 messages on join

### Security Notes

- All events require authenticated socket connection
- Validate user access to negotiation_id on every event
- Sanitize all user input before storing or broadcasting
- Log all events for audit trail
- Implement rate limiting per user/IP