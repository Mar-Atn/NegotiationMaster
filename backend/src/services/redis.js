const Redis = require('redis')

class RedisService {
  constructor() {
    this.client = null
    this.isConnected = false
  }

  async connect() {
    try {
      this.client = Redis.createClient({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        retryDelayOnFailover: 100,
        enableOfflineQueue: false,
        lazyConnect: true
      })

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err)
        this.isConnected = false
      })

      this.client.on('connect', () => {
        console.log('✅ Redis connected successfully')
        this.isConnected = true
      })

      this.client.on('ready', () => {
        console.log('✅ Redis client ready')
      })

      this.client.on('end', () => {
        console.log('❌ Redis connection ended')
        this.isConnected = false
      })

      await this.client.connect()
      return this.client
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
      // Don't throw - allow app to run without Redis for development
      return null
    }
  }

  async disconnect() {
    if (this.client && this.isConnected) {
      await this.client.quit()
      this.isConnected = false
    }
  }

  getClient() {
    return this.client
  }

  isHealthy() {
    return this.isConnected && this.client && this.client.isReady
  }

  // Cache helpers for assessment data
  async cacheAssessmentResult(assessmentId, data, ttlSeconds = 3600) {
    if (!this.isHealthy()) return false
    
    try {
      const key = `assessment:${assessmentId}`
      await this.client.setEx(key, ttlSeconds, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Failed to cache assessment result:', error)
      return false
    }
  }

  async getCachedAssessmentResult(assessmentId) {
    if (!this.isHealthy()) return null
    
    try {
      const key = `assessment:${assessmentId}`
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to get cached assessment result:', error)
      return null
    }
  }

  async invalidateAssessmentCache(assessmentId) {
    if (!this.isHealthy()) return false
    
    try {
      const key = `assessment:${assessmentId}`
      await this.client.del(key)
      return true
    } catch (error) {
      console.error('Failed to invalidate assessment cache:', error)
      return false
    }
  }

  // User progress caching
  async cacheUserProgress(userId, progressData, ttlSeconds = 1800) {
    if (!this.isHealthy()) return false
    
    try {
      const key = `user_progress:${userId}`
      await this.client.setEx(key, ttlSeconds, JSON.stringify(progressData))
      return true
    } catch (error) {
      console.error('Failed to cache user progress:', error)
      return false
    }
  }

  async getCachedUserProgress(userId) {
    if (!this.isHealthy()) return null
    
    try {
      const key = `user_progress:${userId}`
      const data = await this.client.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Failed to get cached user progress:', error)
      return null
    }
  }
}

// Export singleton instance
const redisService = new RedisService()
module.exports = redisService