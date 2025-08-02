const logger = require('../config/logger')

/**
 * Voice-specific error handler middleware
 */
const voiceErrorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Voice service error:', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    userId: req.user?.userId
  })

  // Determine error type and appropriate response
  let statusCode = 500
  let errorCode = 'VOICE_SERVICE_ERROR'
  let userMessage = 'Voice service temporarily unavailable'
  let fallbackOptions = []

  // ElevenLabs API errors
  if (err.message.includes('ElevenLabs') || err.message.includes('elevenlabs')) {
    statusCode = 503
    errorCode = 'ELEVENLABS_API_ERROR'
    userMessage = 'Voice synthesis service unavailable'
    fallbackOptions = ['text_only', 'basic_audio']
  }
  
  // Audio processing errors
  else if (err.message.includes('audio') || err.message.includes('Audio')) {
    statusCode = 422
    errorCode = 'AUDIO_PROCESSING_ERROR'
    userMessage = 'Audio processing failed'
    fallbackOptions = ['text_only', 'retry_audio']
  }
  
  // Network/connectivity errors
  else if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    statusCode = 503
    errorCode = 'NETWORK_ERROR'
    userMessage = 'Network connectivity issue'
    fallbackOptions = ['text_only', 'retry_later']
  }
  
  // Rate limiting errors
  else if (err.message.includes('rate limit') || err.status === 429) {
    statusCode = 429
    errorCode = 'RATE_LIMIT_EXCEEDED'
    userMessage = 'Voice service rate limit exceeded'
    fallbackOptions = ['wait_and_retry', 'text_only']
  }
  
  // Authentication errors
  else if (err.status === 401 || err.message.includes('authentication') || err.message.includes('API key')) {
    statusCode = 401
    errorCode = 'AUTHENTICATION_ERROR'
    userMessage = 'Voice service authentication failed'
    fallbackOptions = ['text_only']
  }
  
  // Character not found errors
  else if (err.message.includes('character') && err.message.includes('not found')) {
    statusCode = 404
    errorCode = 'CHARACTER_NOT_FOUND'
    userMessage = 'Character voice configuration not found'
    fallbackOptions = ['default_voice', 'text_only']
  }
  
  // Voice configuration errors
  else if (err.message.includes('voice') && err.message.includes('configuration')) {
    statusCode = 422
    errorCode = 'VOICE_CONFIG_ERROR'
    userMessage = 'Voice configuration invalid'
    fallbackOptions = ['default_voice', 'text_only']
  }

  // Don't send error response if headers already sent
  if (res.headersSent) {
    return next(err)
  }

  // Send structured error response
  res.status(statusCode).json({
    success: false,
    error: userMessage,
    code: errorCode,
    fallbackOptions,
    metadata: {
      timestamp: new Date().toISOString(),
      requestId: req.id || 'unknown',
      voiceService: 'elevenlabs'
    },
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        originalMessage: err.message,
        stack: err.stack
      }
    })
  })
}

/**
 * Voice service circuit breaker pattern
 */
class VoiceCircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5
    this.resetTimeout = options.resetTimeout || 60000 // 1 minute
    this.monitoringPeriod = options.monitoringPeriod || 300000 // 5 minutes
    
    this.failureCount = 0
    this.lastFailureTime = null
    this.state = 'CLOSED' // CLOSED, OPEN, HALF_OPEN
    this.failures = []
  }

  async execute(operation) {
    // Check circuit breaker state
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN'
        logger.info('Voice circuit breaker: Moving to HALF_OPEN state')
      } else {
        throw new Error('Voice service circuit breaker is OPEN - service temporarily disabled')
      }
    }

    try {
      const result = await operation()
      
      // Success - reset failure count if in HALF_OPEN state
      if (this.state === 'HALF_OPEN') {
        this.reset()
        logger.info('Voice circuit breaker: Moving to CLOSED state after successful operation')
      }
      
      return result
      
    } catch (error) {
      this.recordFailure()
      
      if (this.failureCount >= this.failureThreshold) {
        this.state = 'OPEN'
        this.lastFailureTime = Date.now()
        logger.warn(`Voice circuit breaker: Moving to OPEN state after ${this.failureCount} failures`)
      }
      
      throw error
    }
  }

  recordFailure() {
    const now = Date.now()
    this.failures.push(now)
    
    // Clean up old failures outside monitoring period
    this.failures = this.failures.filter(time => now - time < this.monitoringPeriod)
    
    this.failureCount = this.failures.length
  }

  reset() {
    this.failureCount = 0
    this.failures = []
    this.state = 'CLOSED'
    this.lastFailureTime = null
  }

  getState() {
    return {
      state: this.state,
      failureCount: this.failureCount,
      lastFailureTime: this.lastFailureTime,
      isAvailable: this.state !== 'OPEN'
    }
  }
}

/**
 * Voice service fallback manager
 */
class VoiceFallbackManager {
  constructor() {
    this.fallbackStrategies = new Map([
      ['text_only', this.textOnlyFallback],
      ['basic_audio', this.basicAudioFallback],
      ['default_voice', this.defaultVoiceFallback],
      ['cached_audio', this.cachedAudioFallback],
      ['retry_audio', this.retryAudioFallback]
    ])
  }

  async handleFallback(strategy, context) {
    const fallbackHandler = this.fallbackStrategies.get(strategy)
    
    if (!fallbackHandler) {
      logger.warn(`Unknown fallback strategy: ${strategy}`)
      return this.textOnlyFallback(context)
    }

    try {
      return await fallbackHandler(context)
    } catch (error) {
      logger.error(`Fallback strategy ${strategy} failed:`, error)
      return this.textOnlyFallback(context)
    }
  }

  textOnlyFallback(context) {
    logger.info('Using text-only fallback')
    return {
      success: true,
      fallback: 'text_only',
      data: {
        content: context.text,
        format: 'text',
        metadata: {
          fallbackReason: 'voice_service_unavailable',
          originalRequest: context.originalRequest
        }
      }
    }
  }

  basicAudioFallback(context) {
    logger.info('Using basic audio fallback')
    // Could implement text-to-speech using browser APIs
    return {
      success: true,
      fallback: 'basic_audio',
      data: {
        content: context.text,
        format: 'text',
        audioInstructions: 'use_browser_tts',
        metadata: {
          fallbackReason: 'elevenlabs_unavailable',
          originalRequest: context.originalRequest
        }
      }
    }
  }

  defaultVoiceFallback(context) {
    logger.info('Using default voice fallback')
    return {
      success: true,
      fallback: 'default_voice',
      data: {
        content: context.text,
        format: 'text',
        voiceConfig: 'default',
        metadata: {
          fallbackReason: 'character_voice_unavailable',
          originalRequest: context.originalRequest
        }
      }
    }
  }

  cachedAudioFallback(context) {
    logger.info('Using cached audio fallback')
    // Would check for cached audio responses
    return this.textOnlyFallback(context)
  }

  retryAudioFallback(context) {
    logger.info('Using retry audio fallback')
    return {
      success: true,
      fallback: 'retry_audio',
      data: {
        content: context.text,
        format: 'text',
        retryAfter: 5000, // 5 seconds
        metadata: {
          fallbackReason: 'temporary_audio_error',
          originalRequest: context.originalRequest
        }
      }
    }
  }
}

// Create singleton instances
const voiceCircuitBreaker = new VoiceCircuitBreaker()
const voiceFallbackManager = new VoiceFallbackManager()

module.exports = {
  voiceErrorHandler,
  voiceCircuitBreaker,
  voiceFallbackManager
}