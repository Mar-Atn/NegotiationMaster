const Queue = require('bull')
const redisService = require('./redis')

class AssessmentQueueService {
  constructor() {
    this.assessmentQueue = null
    this.feedbackQueue = null
    this.isInitialized = false
  }

  async initialize() {
    try {
      // Try to initialize Redis connection
      try {
        await redisService.connect()
        console.log('✅ Redis connected for queue processing')
      } catch (redisError) {
        console.warn('⚠️ Redis not available, using fallback mode for Sprint 1:', redisError.message)
        this.isInitialized = true
        return
      }
      
      // Redis configuration for Bull
      const redisConfig = {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100
      }

      // Create assessment processing queue
      this.assessmentQueue = new Queue('assessment processing', {
        redis: redisConfig,
        defaultJobOptions: {
          removeOnComplete: 10, // Keep last 10 completed jobs
          removeOnFail: 50,     // Keep last 50 failed jobs for debugging
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      })

      // Create feedback generation queue
      this.feedbackQueue = new Queue('feedback generation', {
        redis: redisConfig,
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }
      })

      this.setupQueueEvents()
      this.setupJobProcessors()
      
      this.isInitialized = true
      console.log('✅ Assessment Queue Service initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize Assessment Queue Service:', error)
      // Don't throw - allow app to run without queues for development
    }
  }

  setupQueueEvents() {
    if (!this.assessmentQueue || !this.feedbackQueue) return

    // Assessment queue events
    this.assessmentQueue.on('completed', (job, result) => {
      console.log(`✅ Assessment job ${job.id} completed in ${Date.now() - job.timestamp}ms`)
    })

    this.assessmentQueue.on('failed', (job, err) => {
      console.error(`❌ Assessment job ${job.id} failed:`, err.message)
    })

    this.assessmentQueue.on('stalled', (job) => {
      console.warn(`⚠️ Assessment job ${job.id} stalled`)
    })

    // Feedback queue events
    this.feedbackQueue.on('completed', (job, result) => {
      console.log(`✅ Feedback job ${job.id} completed in ${Date.now() - job.timestamp}ms`)
    })

    this.feedbackQueue.on('failed', (job, err) => {
      console.error(`❌ Feedback job ${job.id} failed:`, err.message)
    })
  }

  setupJobProcessors() {
    if (!this.assessmentQueue || !this.feedbackQueue) return

    // Assessment processor
    this.assessmentQueue.process('analyze-conversation', require('./assessmentProcessor').processConversationAnalysis)
    
    // Feedback processor  
    this.feedbackQueue.process('generate-feedback', require('./feedbackProcessor').generatePersonalizedFeedback)
  }

  // Queue a conversation for assessment
  async queueConversationAssessment(conversationData, priority = 0) {
    if (!this.isInitialized) {
      console.warn('Assessment queue not available')
      return null
    }
    
    // If Redis is not available, process directly
    if (!this.assessmentQueue) {
      console.log('🔄 Processing assessment directly (no Redis)')
      const AssessmentProcessor = require('./assessmentProcessor')
      const processor = new AssessmentProcessor()
      
      const job = {
        id: `direct-${Date.now()}`,
        data: conversationData
      }
      
      try {
        await processor.processConversationAnalysis(job)
        return { id: job.id, status: 'completed' }
      } catch (error) {
        console.error('❌ Direct assessment processing failed:', error)
        return { id: job.id, status: 'failed', error: error.message }
      }
    }

    try {
      const job = await this.assessmentQueue.add('analyze-conversation', {
        conversationId: conversationData.negotiationId,
        userId: conversationData.userId,
        scenarioId: conversationData.scenarioId,
        transcript: conversationData.transcript,
        voiceMetrics: conversationData.voiceMetrics,
        metadata: conversationData.metadata
      }, {
        priority: priority,
        delay: 0, // Process immediately
        attempts: 3
      })

      console.log(`📋 Queued conversation assessment job ${job.id} for conversation ${conversationData.negotiationId}`)
      return job.id

    } catch (error) {
      console.error('Failed to queue conversation assessment:', error)
      return null
    }
  }

  // Queue feedback generation
  async queueFeedbackGeneration(assessmentId, assessmentResults, priority = 0) {
    if (!this.isInitialized || !this.feedbackQueue) {
      console.warn('Feedback queue not available, processing will be skipped')
      return null
    }

    try {
      const job = await this.feedbackQueue.add('generate-feedback', {
        assessmentId: assessmentId,
        assessmentResults: assessmentResults
      }, {
        priority: priority,
        delay: 0,
        attempts: 3
      })

      console.log(`📋 Queued feedback generation job ${job.id} for assessment ${assessmentId}`)
      return job.id

    } catch (error) {
      console.error('Failed to queue feedback generation:', error)
      return null
    }
  }

  // Get queue status
  async getQueueStatus() {
    if (!this.isInitialized) {
      return { error: 'Queue service not initialized' }
    }

    try {
      const [assessmentWaiting, assessmentActive, assessmentCompleted, assessmentFailed] = await Promise.all([
        this.assessmentQueue.getWaiting(),
        this.assessmentQueue.getActive(), 
        this.assessmentQueue.getCompleted(),
        this.assessmentQueue.getFailed()
      ])

      const [feedbackWaiting, feedbackActive, feedbackCompleted, feedbackFailed] = await Promise.all([
        this.feedbackQueue.getWaiting(),
        this.feedbackQueue.getActive(),
        this.feedbackQueue.getCompleted(), 
        this.feedbackQueue.getFailed()
      ])

      return {
        assessment: {
          waiting: assessmentWaiting.length,
          active: assessmentActive.length,
          completed: assessmentCompleted.length,
          failed: assessmentFailed.length
        },
        feedback: {
          waiting: feedbackWaiting.length,
          active: feedbackActive.length,
          completed: feedbackCompleted.length,
          failed: feedbackFailed.length
        },
        isHealthy: true
      }
    } catch (error) {
      console.error('Failed to get queue status:', error)
      return { error: error.message, isHealthy: false }
    }
  }

  // Graceful shutdown
  async shutdown() {
    console.log('Shutting down Assessment Queue Service...')
    
    if (this.assessmentQueue) {
      await this.assessmentQueue.close()
    }
    
    if (this.feedbackQueue) {
      await this.feedbackQueue.close()
    }
    
    await redisService.disconnect()
    
    console.log('Assessment Queue Service shut down successfully')
  }
}

// Export singleton instance
const assessmentQueueService = new AssessmentQueueService()
module.exports = assessmentQueueService