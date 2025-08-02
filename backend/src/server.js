require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const { createServer } = require('http')
const { Server } = require('socket.io')

const logger = require('./config/logger')
const errorHandler = require('./middleware/errorHandler')
const voiceService = require('./services/voiceService')
const assessmentQueueService = require('./services/assessmentQueue')
const db = require('./config/database')
const authRoutes = require('./routes/auth')
const charactersRoutes = require('./routes/characters')
const scenariosRoutes = require('./routes/scenarios')
const negotiationsRoutes = require('./routes/negotiations')
const voiceRoutes = require('./routes/voice')
const debugRoutes = require('./routes/debug')
const performanceRoutes = require('./routes/performance')
const assessmentRoutes = require('./routes/assessment')

const app = express()
const server = createServer(app)

const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
  optionsSuccessStatus: 200
}

const io = new Server(server, {
  cors: corsOptions
})

// Make io instance available to routes
app.set('io', io)

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false
})

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}))

app.use(cors(corsOptions))
app.use(compression())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  }))
}

// Temporarily disabled for development
// app.use(limiter)

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NegotiationMaster API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NegotiationMaster API',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: {
      voice: !!process.env.ELEVENLABS_API_KEY,
      database: true,
      websockets: true
    }
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/characters', charactersRoutes)
app.use('/api/scenarios', scenariosRoutes)
app.use('/api/negotiations', negotiationsRoutes)
app.use('/api/voice', voiceRoutes)
app.use('/api/debug', debugRoutes)
app.use('/api/performance', performanceRoutes)
app.use('/api/assessment', assessmentRoutes)

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'ROUTE_NOT_FOUND'
  })
})

app.use(errorHandler)

io.on('connection', (socket) => {
  logger.info('User connected', { socketId: socket.id })

  // Join negotiation room for text and voice
  socket.on('join-negotiation', (negotiationId) => {
    socket.join(`negotiation-${negotiationId}`)
    logger.info('User joined negotiation room', { 
      socketId: socket.id, 
      negotiationId 
    })
  })

  // Leave negotiation room
  socket.on('leave-negotiation', (negotiationId) => {
    socket.leave(`negotiation-${negotiationId}`)
    logger.info('User left negotiation room', { 
      socketId: socket.id, 
      negotiationId 
    })
  })

  // Voice-specific events
  socket.on('voice-stream-ready', (data) => {
    logger.info('Client ready for voice stream', {
      socketId: socket.id,
      streamId: data.streamId,
      negotiationId: data.negotiationId
    })
    
    // Acknowledge readiness
    socket.emit('voice-stream-acknowledged', {
      streamId: data.streamId,
      timestamp: new Date().toISOString()
    })
  })

  // Handle voice stream interruption
  socket.on('voice-stream-interrupt', (data) => {
    logger.info('Voice stream interrupted by client', {
      socketId: socket.id,
      streamId: data.streamId,
      reason: data.reason
    })
    
    // Broadcast interruption to negotiation room
    socket.to(`negotiation-${data.negotiationId}`).emit('voice-stream-interrupted', {
      streamId: data.streamId,
      reason: data.reason,
      timestamp: new Date().toISOString()
    })
  })

  // Handle audio chunk acknowledgment for flow control
  socket.on('voice-chunk-received', (data) => {
    logger.debug('Voice chunk acknowledged', {
      socketId: socket.id,
      streamId: data.streamId,
      chunkIndex: data.chunkIndex
    })
  })

  // User audio input for conversational AI
  socket.on('user-audio-chunk', async (data) => {
    try {
      logger.debug('Received user audio chunk', {
        socketId: socket.id,
        sessionId: data.sessionId,
        chunkSize: data.audioData?.length || 0
      })
      
      if (data.sessionId && data.audioData) {
        // Send to conversational AI session
        await voiceService.sendUserAudio(data.sessionId, Buffer.from(data.audioData), data.format)
        
        socket.emit('user-audio-acknowledged', {
          sessionId: data.sessionId,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error) {
      logger.error('Error processing user audio chunk:', error)
      socket.emit('user-audio-error', {
        sessionId: data.sessionId,
        error: error.message
      })
    }
  })

  // Handle connection quality reporting
  socket.on('connection-quality', (data) => {
    logger.debug('Connection quality report', {
      socketId: socket.id,
      latency: data.latency,
      bandwidth: data.bandwidth,
      quality: data.quality
    })
  })

  // Conversational AI session management - with callback support
  socket.on('initialize-conversational-session', async (data, callback) => {
    try {
      logger.info('Initializing conversational AI session', {
        socketId: socket.id,
        negotiationId: data.negotiationId,
        characterId: data.characterId,
        options: data.options
      })
      
      // Get character name from ID
      const character = await db('ai_characters')
        .where({ id: data.characterId, is_active: true })
        .first()
        
      if (!character) {
        throw new Error('Character not found')
      }
      
      const sessionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const sessionResult = await voiceService.initializeConversationalSession(
        sessionId,
        character.name,
        io,
        data.negotiationId,
        {
          scenarioContext: data.options?.scenarioContext,
          firstMessage: data.options?.firstMessage,
          ...data.options
        }
      )
      
      // Send callback acknowledgment with success response
      if (callback && typeof callback === 'function') {
        callback({
          success: true,
          data: {
            ...sessionResult,
            timestamp: new Date().toISOString()
          }
        })
      }
      
      // Also emit the event for backward compatibility
      socket.emit('conversational-session-started', {
        ...sessionResult,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error initializing conversational session:', error)
      
      // Send callback acknowledgment with error response
      if (callback && typeof callback === 'function') {
        callback({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
      
      // Also emit error event for backward compatibility
      socket.emit('conversational-session-error', {
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  })

  // Legacy event handler for backward compatibility
  socket.on('start-conversational-session', async (data) => {
    try {
      logger.info('Starting conversational AI session (legacy)', {
        socketId: socket.id,
        negotiationId: data.negotiationId,
        characterName: data.characterName
      })
      
      const sessionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const sessionResult = await voiceService.initializeConversationalSession(
        sessionId,
        data.characterName,
        io,
        data.negotiationId,
        {
          scenarioContext: data.scenarioContext,
          firstMessage: data.firstMessage
        }
      )
      
      socket.emit('conversational-session-started', {
        ...sessionResult,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error starting conversational session (legacy):', error)
      socket.emit('conversational-session-error', {
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  })

  // End conversational AI session
  socket.on('end-conversational-session', async (data) => {
    try {
      logger.info('Ending conversational AI session', {
        socketId: socket.id,
        sessionId: data.sessionId
      })
      
      await voiceService.endConversationalSession(data.sessionId)
      
      socket.emit('conversational-session-ended', {
        sessionId: data.sessionId,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error ending conversational session:', error)
      socket.emit('conversational-session-error', {
        sessionId: data.sessionId,
        error: error.message
      })
    }
  })

  // Start speech recognition session
  socket.on('start-speech-recognition', async (data) => {
    try {
      logger.info('Starting speech recognition session', {
        socketId: socket.id,
        sessionId: data.sessionId
      })
      
      const sttSession = await voiceService.initializeSpeechRecognition(
        data.sessionId,
        data.options
      )
      
      socket.emit('speech-recognition-started', {
        sessionId: data.sessionId,
        config: sttSession.config,
        timestamp: new Date().toISOString()
      })
      
    } catch (error) {
      logger.error('Error starting speech recognition:', error)
      socket.emit('speech-recognition-error', {
        sessionId: data.sessionId,
        error: error.message
      })
    }
  })

  // Process audio for speech recognition
  socket.on('speech-recognition-audio', async (data) => {
    try {
      const result = await voiceService.processAudioForSpeechRecognition(
        data.sessionId,
        Buffer.from(data.audioData),
        data.options
      )
      
      if (result) {
        socket.emit('speech-recognition-result', {
          ...result,
          timestamp: new Date().toISOString()
        })
      }
      
    } catch (error) {
      logger.error('Error processing speech recognition audio:', error)
      socket.emit('speech-recognition-error', {
        sessionId: data.sessionId,
        error: error.message
      })
    }
  })

  // Get conversational session status
  socket.on('get-conversational-status', (data, callback) => {
    try {
      const activeSessions = voiceService.getActiveConversationalSessions()
      const metrics = voiceService.getConversationalMetrics()
      
      const statusData = {
        activeSessions: activeSessions.filter(s => s.negotiationId === data.negotiationId),
        metrics,
        timestamp: new Date().toISOString()
      }
      
      // Send callback acknowledgment if provided
      if (callback && typeof callback === 'function') {
        callback({
          success: true,
          data: statusData
        })
      }
      
      // Also emit the event for backward compatibility
      socket.emit('conversational-status', statusData)
      
    } catch (error) {
      logger.error('Error getting conversational status:', error)
      
      // Send callback acknowledgment with error if provided
      if (callback && typeof callback === 'function') {
        callback({
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
      
      // Also emit error event for backward compatibility
      socket.emit('conversational-status-error', {
        error: error.message,
        timestamp: new Date().toISOString()
      })
    }
  })

  // Handle disconnection
  socket.on('disconnect', async (reason) => {
    logger.info('User disconnected', { 
      socketId: socket.id, 
      reason,
      timestamp: new Date().toISOString()
    })
    
    try {
      // Cleanup any active conversational sessions for this socket
      const activeSessions = voiceService.getActiveConversationalSessions()
      for (const session of activeSessions) {
        // Check if this socket was associated with the session
        // In a more sophisticated implementation, we'd track socket->session mapping
        logger.info('Cleaning up session on disconnect', {
          sessionId: session.sessionId,
          socketId: socket.id,
          timestamp: new Date().toISOString()
        })
        
        // Attempt to cleanup the session
        try {
          await voiceService.endConversationalSession(session.sessionId)
        } catch (cleanupError) {
          logger.warn('Failed to cleanup session on disconnect', {
            sessionId: session.sessionId,
            socketId: socket.id,
            error: cleanupError.message
          })
        }
      }
    } catch (error) {
      logger.error('Error during disconnect cleanup:', {
        socketId: socket.id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      })
    }
  })

  // Handle connection errors
  socket.on('error', (error) => {
    logger.error('Socket connection error', {
      socketId: socket.id,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
    
    // Emit error details to the client if socket is still connected
    try {
      if (socket.connected) {
        socket.emit('connection-error', {
          error: 'Connection error occurred',
          timestamp: new Date().toISOString()
        })
      }
    } catch (emitError) {
      logger.error('Failed to emit error to client:', {
        socketId: socket.id,
        originalError: error.message,
        emitError: emitError.message
      })
    }
  })
})

const PORT = process.env.PORT || 5000

// Initialize services
async function initializeServices() {
  try {
    // Initialize assessment queue service
    await assessmentQueueService.initialize()
    logger.info('Assessment queue service initialized successfully')
    
    if (process.env.ELEVENLABS_API_KEY) {
      await voiceService.initialize()
      logger.info('Voice service initialized successfully')
    } else {
      logger.warn('ELEVENLABS_API_KEY not found - voice features disabled')
    }
  } catch (error) {
    logger.error('Failed to initialize services:', error)
  }
}

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, async () => {
    logger.info(`NegotiationMaster API server running on port ${PORT}`)
    await initializeServices()
  })
}

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack })
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { error: err.message, stack: err.stack })
  server.close(async () => {
    await assessmentQueueService.shutdown()
    process.exit(1)
  })
})

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...')
  server.close(async () => {
    await assessmentQueueService.shutdown()
    process.exit(0)
  })
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...')
  server.close(async () => {
    await assessmentQueueService.shutdown()
    process.exit(0)
  })
})

module.exports = { app, server, io }