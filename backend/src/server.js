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
const authRoutes = require('./routes/auth')

const app = express()
const server = createServer(app)

const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}

const io = new Server(server, {
  cors: corsOptions
})

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

app.use(limiter)

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'NegotiationMaster API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  })
})

app.use('/api/auth', authRoutes)

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

  socket.on('join-negotiation', (negotiationId) => {
    socket.join(`negotiation-${negotiationId}`)
    logger.info('User joined negotiation room', { 
      socketId: socket.id, 
      negotiationId 
    })
  })

  socket.on('leave-negotiation', (negotiationId) => {
    socket.leave(`negotiation-${negotiationId}`)
    logger.info('User left negotiation room', { 
      socketId: socket.id, 
      negotiationId 
    })
  })

  socket.on('disconnect', () => {
    logger.info('User disconnected', { socketId: socket.id })
  })
})

const PORT = process.env.PORT || 5000

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    logger.info(`NegotiationMaster API server running on port ${PORT}`)
  })
}

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { error: err.message, stack: err.stack })
  process.exit(1)
})

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection', { error: err.message, stack: err.stack })
  server.close(() => {
    process.exit(1)
  })
})

module.exports = { app, server, io }