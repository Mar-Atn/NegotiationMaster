const logger = require('../config/logger')
const Redis = require('redis')

// Response caching for voice-related queries
class PerformanceOptimizationMiddleware {
  constructor() {
    this.responseCache = new Map()
    this.compressionEnabled = true
    this.rateLimitByEndpoint = new Map()
    
    // Initialize Redis if available
    this.redis = null
    this.initializeRedis()
  }

  /**
   * Initialize Redis connection for advanced caching
   */
  async initializeRedis() {
    try {
      if (process.env.REDIS_URL) {
        this.redis = Redis.createClient({
          url: process.env.REDIS_URL,
          retry_strategy: (options) => {
            if (options.attempt > 3) {
              logger.error('Redis connection failed after 3 attempts')
              return undefined
            }
            return Math.min(options.attempt * 100, 3000)
          }
        })

        await this.redis.connect()
        logger.info('Redis connected for performance optimization')
      }
    } catch (error) {
      logger.warn('Redis not available, using in-memory cache', { error: error.message })
    }
  }

  /**
   * Voice response caching middleware
   */
  voiceResponseCache(ttlSeconds = 300) {
    return async (req, res, next) => {
      // Only cache for GET requests and specific voice endpoints
      if (req.method !== 'GET' || !req.path.includes('/voice/')) {
        return next()
      }

      const cacheKey = this.generateCacheKey(req)
      
      try {
        // Check cache first
        const cachedResponse = await this.getFromCache(cacheKey)
        
        if (cachedResponse) {
          logger.debug('Serving cached response', { 
            cacheKey, 
            endpoint: req.path 
          })
          
          res.set('X-Cache', 'HIT')
          return res.json(cachedResponse)
        }

        // Override res.json to cache the response
        const originalJson = res.json.bind(res)
        res.json = (data) => {
          // Cache successful responses
          if (res.statusCode === 200) {
            this.setCache(cacheKey, data, ttlSeconds).catch(error => {
              logger.warn('Failed to cache response', { error: error.message })
            })
          }
          
          res.set('X-Cache', 'MISS')
          return originalJson(data)
        }

        next()

      } catch (error) {
        logger.error('Cache middleware error', { error: error.message })
        next()
      }
    }
  }

  /**
   * Request compression middleware
   */
  requestCompression() {
    return (req, res, next) => {
      if (!this.compressionEnabled) {
        return next()
      }

      // Enable compression for voice data
      if (req.path.includes('/voice/')) {
        res.set('Content-Encoding', 'gzip')
      }

      next()
    }
  }

  /**
   * Connection pooling optimization
   */
  connectionPooling() {
    return (req, res, next) => {
      // Set keep-alive headers for persistent connections
      res.set({
        'Connection': 'keep-alive',
        'Keep-Alive': 'timeout=5, max=1000'
      })

      next()
    }
  }

  /**
   * Request prioritization for voice endpoints
   */
  requestPrioritization() {
    return (req, res, next) => {
      // Prioritize voice-related requests
      if (req.path.includes('/voice/')) {
        req.priority = 'high'
        
        // Set response timeout for high-priority requests
        res.setTimeout(10000, () => {
          logger.warn('High-priority request timeout', { 
            path: req.path,
            method: req.method 
          })
        })
      } else {
        req.priority = 'normal'
      }

      next()
    }
  }

  /**
   * Memory optimization middleware
   */
  memoryOptimization() {
    return (req, res, next) => {
      // Clean up large request bodies after processing
      res.on('finish', () => {
        if (req.body && typeof req.body === 'object') {
          req.body = null
        }
      })

      // Monitor memory usage
      const memUsage = process.memoryUsage()
      if (memUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
        logger.warn('High memory usage detected', {
          heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
        })
        
        // Suggest garbage collection
        if (global.gc) {
          global.gc()
        }
      }

      next()
    }
  }

  /**
   * Response time optimization
   */
  responseTimeOptimization() {
    return (req, res, next) => {
      const startTime = Date.now()

      res.on('finish', () => {
        const responseTime = Date.now() - startTime
        
        // Log slow responses
        if (responseTime > 1000) {
          logger.warn('Slow response detected', {
            path: req.path,
            method: req.method,
            responseTime,
            statusCode: res.statusCode
          })
        }

        // Add response time header for monitoring
        res.set('X-Response-Time', `${responseTime}ms`)
      })

      next()
    }
  }

  /**
   * Adaptive rate limiting based on endpoint performance
   */
  adaptiveRateLimit() {
    return (req, res, next) => {
      const endpoint = `${req.method}:${req.path}`
      const now = Date.now()
      
      if (!this.rateLimitByEndpoint.has(endpoint)) {
        this.rateLimitByEndpoint.set(endpoint, {
          requests: [],
          averageResponseTime: 0,
          limit: 100 // default
        })
      }

      const endpointData = this.rateLimitByEndpoint.get(endpoint)
      
      // Clean old requests (last minute)
      endpointData.requests = endpointData.requests.filter(
        time => now - time < 60000
      )

      // Check if limit exceeded
      if (endpointData.requests.length >= endpointData.limit) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded for this endpoint',
          code: 'ADAPTIVE_RATE_LIMIT'
        })
      }

      // Record request
      endpointData.requests.push(now)

      // Adjust limits based on performance
      res.on('finish', () => {
        const responseTime = Date.now() - now
        
        // Update average response time
        endpointData.averageResponseTime = 
          (endpointData.averageResponseTime + responseTime) / 2

        // Adjust rate limit based on performance
        if (endpointData.averageResponseTime > 2000) {
          // Slow endpoint - reduce limit
          endpointData.limit = Math.max(10, endpointData.limit - 5)
        } else if (endpointData.averageResponseTime < 500) {
          // Fast endpoint - increase limit
          endpointData.limit = Math.min(200, endpointData.limit + 5)
        }
      })

      next()
    }
  }

  /**
   * Database query optimization
   */
  queryOptimization() {
    return (req, res, next) => {
      // Add query hints for voice-related requests
      if (req.path.includes('/voice/')) {
        req.queryHints = {
          useIndex: true,
          limit: 100,
          timeout: 5000
        }
      }

      next()
    }
  }

  /**
   * Generate cache key for request
   */
  generateCacheKey(req) {
    const keyComponents = [
      req.method,
      req.path,
      JSON.stringify(req.query),
      req.user?.userId || 'anonymous'
    ]
    
    return `voice_cache:${Buffer.from(keyComponents.join(':')).toString('base64')}`
  }

  /**
   * Get data from cache
   */
  async getFromCache(key) {
    try {
      if (this.redis) {
        const data = await this.redis.get(key)
        return data ? JSON.parse(data) : null
      } else {
        return this.responseCache.get(key) || null
      }
    } catch (error) {
      logger.error('Cache get error', { error: error.message, key })
      return null
    }
  }

  /**
   * Set data in cache
   */
  async setCache(key, data, ttlSeconds) {
    try {
      if (this.redis) {
        await this.redis.setEx(key, ttlSeconds, JSON.stringify(data))
      } else {
        this.responseCache.set(key, data)
        
        // Simple TTL for in-memory cache
        setTimeout(() => {
          this.responseCache.delete(key)
        }, ttlSeconds * 1000)
      }
    } catch (error) {
      logger.error('Cache set error', { error: error.message, key })
    }
  }

  /**
   * Clear cache
   */
  async clearCache(pattern = '*') {
    try {
      if (this.redis) {
        const keys = await this.redis.keys(pattern)
        if (keys.length > 0) {
          await this.redis.del(keys)
        }
      } else {
        this.responseCache.clear()
      }
      
      logger.info('Cache cleared', { pattern })
    } catch (error) {
      logger.error('Cache clear error', { error: error.message })
    }
  }

  /**
   * Get performance metrics
   */
  getMetrics() {
    const cacheSize = this.redis ? 'redis' : this.responseCache.size
    const endpointMetrics = {}
    
    for (const [endpoint, data] of this.rateLimitByEndpoint.entries()) {
      endpointMetrics[endpoint] = {
        currentRequests: data.requests.length,
        averageResponseTime: Math.round(data.averageResponseTime),
        currentLimit: data.limit
      }
    }

    return {
      cache: {
        type: this.redis ? 'redis' : 'memory',
        size: cacheSize
      },
      endpoints: endpointMetrics,
      memory: {
        heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    }
  }

  /**
   * Health check for performance systems
   */
  async healthCheck() {
    const health = {
      cache: 'healthy',
      memory: 'healthy',
      performance: 'healthy'
    }

    try {
      // Check Redis connection
      if (this.redis) {
        await this.redis.ping()
      }
    } catch (error) {
      health.cache = 'degraded'
      logger.warn('Cache health check failed', { error: error.message })
    }

    // Check memory usage
    const memUsage = process.memoryUsage()
    if (memUsage.heapUsed > 1024 * 1024 * 1024) { // 1GB
      health.memory = 'degraded'
    }

    // Check overall performance
    const avgResponseTimes = Array.from(this.rateLimitByEndpoint.values())
      .map(data => data.averageResponseTime)
      .filter(time => time > 0)

    if (avgResponseTimes.length > 0) {
      const overallAvg = avgResponseTimes.reduce((sum, time) => sum + time, 0) / avgResponseTimes.length
      if (overallAvg > 2000) {
        health.performance = 'degraded'
      }
    }

    return {
      status: Object.values(health).every(status => status === 'healthy') ? 'healthy' : 'degraded',
      details: health,
      metrics: this.getMetrics()
    }
  }
}

module.exports = new PerformanceOptimizationMiddleware()