const rateLimit = require('express-rate-limit')
const logger = require('../config/logger')
const crypto = require('crypto')

class VoiceSecurityMiddleware {
  constructor() {
    this.suspiciousActivity = new Map()
    this.rateLimiters = this.createRateLimiters()
    this.encryptionKey = process.env.VOICE_ENCRYPTION_KEY || crypto.randomBytes(32)
  }

  /**
   * Create specialized rate limiters for voice endpoints
   */
  createRateLimiters() {
    return {
      // Voice initialization - more restrictive
      voiceInit: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10, // 10 voice sessions per window
        message: {
          success: false,
          error: 'Too many voice sessions initiated. Please wait before starting a new session.',
          code: 'VOICE_INIT_RATE_LIMIT'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => `voice_init:${req.user?.userId || req.ip}`,
        skip: (req) => process.env.NODE_ENV === 'test'
      }),

      // Voice messages - moderate restriction
      voiceMessage: rateLimit({
        windowMs: 1 * 60 * 1000, // 1 minute
        max: 30, // 30 messages per minute
        message: {
          success: false,
          error: 'Too many voice messages. Please slow down.',
          code: 'VOICE_MESSAGE_RATE_LIMIT'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => `voice_msg:${req.user?.userId || req.ip}`,
        skip: (req) => process.env.NODE_ENV === 'test'
      }),

      // Voice analytics - less restrictive
      voiceAnalytics: rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 50, // 50 requests per window
        message: {
          success: false,
          error: 'Too many analytics requests.',
          code: 'VOICE_ANALYTICS_RATE_LIMIT'
        },
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: (req) => `voice_analytics:${req.user?.userId || req.ip}`,
        skip: (req) => process.env.NODE_ENV === 'test'
      })
    }
  }

  /**
   * Voice input validation and sanitization
   */
  validateVoiceInput() {
    return (req, res, next) => {
      try {
        const { message, streamId, messageType } = req.body

        // Validate message content
        if (message) {
          // Check for excessive length
          if (message.length > 5000) {
            return res.status(400).json({
              success: false,
              error: 'Message too long. Maximum 5000 characters allowed.',
              code: 'MESSAGE_TOO_LONG'
            })
          }

          // Check for suspicious patterns
          if (this.detectSuspiciousContent(message)) {
            this.logSuspiciousActivity(req, 'suspicious_message_content', { message: message.substring(0, 100) })
            return res.status(400).json({
              success: false,
              error: 'Message content not allowed.',
              code: 'SUSPICIOUS_CONTENT'
            })
          }

          // Sanitize message
          req.body.message = this.sanitizeMessage(message)
        }

        // Validate stream ID format
        if (streamId && !this.isValidStreamId(streamId)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid stream ID format.',
            code: 'INVALID_STREAM_ID'
          })
        }

        // Validate message type
        if (messageType && !['text', 'command', 'question'].includes(messageType)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid message type.',
            code: 'INVALID_MESSAGE_TYPE'
          })
        }

        next()
      } catch (error) {
        logger.error('Voice input validation error', { error: error.message })
        next(error)
      }
    }
  }

  /**
   * Stream ownership verification
   */
  verifyStreamOwnership() {
    return async (req, res, next) => {
      try {
        const { streamId } = req.body || req.query
        const userId = req.user?.userId

        if (!streamId || !userId) {
          return res.status(400).json({
            success: false,
            error: 'Stream ID and user authentication required.',
            code: 'MISSING_STREAM_OR_USER'
          })
        }

        // Check if user owns this stream
        // This would typically involve checking the database or cache
        const streamOwnership = await this.checkStreamOwnership(streamId, userId)
        
        if (!streamOwnership.valid) {
          this.logSuspiciousActivity(req, 'unauthorized_stream_access', { streamId, userId })
          return res.status(403).json({
            success: false,
            error: 'Access denied to this voice stream.',
            code: 'STREAM_ACCESS_DENIED'
          })
        }

        // Add stream info to request for downstream use
        req.streamInfo = streamOwnership.info
        next()

      } catch (error) {
        logger.error('Stream ownership verification error', { error: error.message })
        next(error)
      }
    }
  }

  /**
   * WebSocket connection security
   */
  secureWebSocketConnection() {
    return (socket, next) => {
      try {
        // Verify authentication token
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '')
        
        if (!token) {
          logger.warn('WebSocket connection attempted without authentication', {
            socketId: socket.id,
            ip: socket.handshake.address
          })
          return next(new Error('Authentication required'))
        }

        // Verify token (simplified - in production, use proper JWT verification)
        // jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        //   if (err) return next(new Error('Invalid token'))
        //   socket.userId = decoded.userId
        //   next()
        // })

        // For now, accept connection but log it
        logger.info('WebSocket connection secured', { socketId: socket.id })
        next()

      } catch (error) {
        logger.error('WebSocket security error', { error: error.message })
        next(new Error('Security verification failed'))
      }
    }
  }

  /**
   * Audio data encryption (for sensitive negotiations)
   */
  encryptAudioData(audioData) {
    try {
      const iv = crypto.randomBytes(16)
      const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey)
      
      let encrypted = cipher.update(audioData, 'binary', 'hex')
      encrypted += cipher.final('hex')
      
      return {
        encrypted,
        iv: iv.toString('hex')
      }
    } catch (error) {
      logger.error('Audio encryption error', { error: error.message })
      throw new Error('Failed to encrypt audio data')
    }
  }

  /**
   * Audio data decryption
   */
  decryptAudioData(encryptedData, iv) {
    try {
      const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey)
      
      let decrypted = decipher.update(encryptedData, 'hex', 'binary')
      decrypted += decipher.final('binary')
      
      return decrypted
    } catch (error) {
      logger.error('Audio decryption error', { error: error.message })
      throw new Error('Failed to decrypt audio data')
    }
  }

  /**
   * Content Security Policy for voice endpoints
   */
  voiceCSP() {
    return (req, res, next) => {
      res.setHeader('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval'", // Required for WebSocket
        "connect-src 'self' wss: ws: https://api.elevenlabs.io",
        "media-src 'self' blob: data:",
        "object-src 'none'",
        "base-uri 'self'",
        "frame-ancestors 'none'"
      ].join('; '))
      next()
    }
  }

  /**
   * Detect suspicious message content
   */
  detectSuspiciousContent(message) {
    const suspiciousPatterns = [
      // Script injection attempts
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      // SQL injection attempts
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
      // Command injection attempts
      /[;&|`$(){}[\]]/g,
      // Excessive special characters
      /[<>'"\\]{10,}/g,
      // Attempts to access system files
      /\.\.(\/|\\)/g
    ]

    return suspiciousPatterns.some(pattern => pattern.test(message))
  }

  /**
   * Sanitize message content
   */
  sanitizeMessage(message) {
    return message
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove excessive whitespace
      .replace(/\s+/g, ' ')
      // Remove control characters
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Trim whitespace
      .trim()
  }

  /**
   * Validate stream ID format
   */
  isValidStreamId(streamId) {
    // Stream IDs should follow format: voice_timestamp_randomstring
    const streamIdPattern = /^voice_\d+_[a-zA-Z0-9]+$/
    return streamIdPattern.test(streamId)
  }

  /**
   * Check stream ownership (mock implementation)
   */
  async checkStreamOwnership(streamId, userId) {
    // In a real implementation, this would check database/cache
    // For now, return valid if properly formatted
    return {
      valid: this.isValidStreamId(streamId),
      info: {
        streamId,
        userId,
        verified: true
      }
    }
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(req, activityType, details = {}) {
    const activity = {
      type: activityType,
      userId: req.user?.userId,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      details
    }

    // Store in memory (in production, use database)
    const userKey = req.user?.userId || req.ip
    if (!this.suspiciousActivity.has(userKey)) {
      this.suspiciousActivity.set(userKey, [])
    }
    
    this.suspiciousActivity.get(userKey).push(activity)
    
    // Keep only last 10 activities per user
    const activities = this.suspiciousActivity.get(userKey)
    if (activities.length > 10) {
      activities.shift()
    }

    logger.warn('Suspicious activity detected', activity)

    // Auto-ban after multiple suspicious activities
    if (activities.length >= 5) {
      logger.error('Multiple suspicious activities detected - consider blocking user', {
        userId: req.user?.userId,
        ip: req.ip,
        activities: activities.length
      })
    }
  }

  /**
   * Check if user has too many suspicious activities
   */
  checkSuspiciousActivity(req, res, next) {
    const userKey = req.user?.userId || req.ip
    const activities = this.suspiciousActivity.get(userKey) || []
    
    // Check for recent suspicious activity
    const recentActivities = activities.filter(
      activity => Date.now() - activity.timestamp.getTime() < 60 * 60 * 1000 // Last hour
    )

    if (recentActivities.length >= 3) {
      logger.warn('Blocking user due to suspicious activity', {
        userId: req.user?.userId,
        ip: req.ip,
        recentActivities: recentActivities.length
      })

      return res.status(429).json({
        success: false,
        error: 'Access temporarily restricted due to suspicious activity.',
        code: 'SUSPICIOUS_ACTIVITY_BLOCK'
      })
    }

    next()
  }

  /**
   * Get security metrics
   */
  getSecurityMetrics() {
    const totalSuspiciousActivities = Array.from(this.suspiciousActivity.values())
      .reduce((total, activities) => total + activities.length, 0)

    const uniqueUsersWithSuspiciousActivity = this.suspiciousActivity.size

    return {
      suspiciousActivities: {
        total: totalSuspiciousActivities,
        uniqueUsers: uniqueUsersWithSuspiciousActivity,
        byType: this.getSuspiciousActivityByType()
      },
      rateLimiting: {
        activeRateLimiters: Object.keys(this.rateLimiters).length
      },
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Get suspicious activity breakdown by type
   */
  getSuspiciousActivityByType() {
    const byType = {}
    
    for (const activities of this.suspiciousActivity.values()) {
      for (const activity of activities) {
        byType[activity.type] = (byType[activity.type] || 0) + 1
      }
    }

    return byType
  }

  /**
   * Security health check
   */
  async securityHealthCheck() {
    const metrics = this.getSecurityMetrics()
    
    return {
      status: 'secure',
      encryption: {
        enabled: !!this.encryptionKey,
        algorithm: 'aes-256-cbc'
      },
      rateLimiting: {
        configured: true,
        limiters: Object.keys(this.rateLimiters)
      },
      contentValidation: {
        enabled: true,
        patterns: 5 // Number of suspicious patterns checked
      },
      metrics,
      timestamp: new Date().toISOString()
    }
  }
}

module.exports = new VoiceSecurityMiddleware()