const db = require('../config/database')
const logger = require('../config/logger')

class VoiceAnalyticsService {
  constructor() {
    this.analyticsBuffer = new Map()
    this.realTimeMetrics = {
      activeConversations: 0,
      totalVoiceInteractions: 0,
      averageLatency: 0,
      averageSessionDuration: 0,
      characterPopularity: new Map(),
      skillProgressTracking: new Map()
    }
    
    // Initialize analytics tables
    this.initializeAnalyticsTables()
  }

  /**
   * Track voice interaction metrics
   */
  async trackVoiceInteraction(data) {
    try {
      const {
        negotiationId,
        userId,
        characterId,
        streamId,
        interactionType, // 'message_sent', 'voice_generated', 'session_started', 'session_ended'
        latency,
        audioSize,
        textLength,
        metadata = {}
      } = data

      // Store in analytics buffer for batch processing
      const analyticsId = `analytics_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      this.analyticsBuffer.set(analyticsId, {
        id: analyticsId,
        negotiation_id: negotiationId,
        user_id: userId,
        character_id: characterId,
        stream_id: streamId,
        interaction_type: interactionType,
        latency_ms: latency || 0,
        audio_size_bytes: audioSize || 0,
        text_length: textLength || 0,
        metadata: JSON.stringify(metadata),
        timestamp: new Date()
      })

      // Update real-time metrics
      this.updateRealTimeMetrics(data)

      // Process buffer if it's getting large
      if (this.analyticsBuffer.size >= 100) {
        await this.flushAnalyticsBuffer()
      }

      logger.debug('Voice interaction tracked', {
        analyticsId,
        negotiationId,
        interactionType,
        latency,
        bufferSize: this.analyticsBuffer.size
      })

    } catch (error) {
      logger.error('Failed to track voice interaction', {
        error: error.message,
        data
      })
    }
  }

  /**
   * Track negotiation skill progression
   */
  async trackSkillProgression(userId, negotiationId, skillAssessment) {
    try {
      const {
        claimingValue,
        creatingValue,
        managingRelationships,
        communicationEffectiveness,
        voiceClarity,
        responseTime,
        confidence,
        adaptability
      } = skillAssessment

      const progressId = `progress_${Date.now()}_${Math.random().toString(36).substring(7)}`

      await db('voice_skill_progression').insert({
        id: progressId,
        user_id: userId,
        negotiation_id: negotiationId,
        claiming_value_score: claimingValue || 0,
        creating_value_score: creatingValue || 0,
        managing_relationships_score: managingRelationships || 0,
        communication_effectiveness: communicationEffectiveness || 0,
        voice_clarity_score: voiceClarity || 0,
        response_time_score: responseTime || 0,
        confidence_score: confidence || 0,
        adaptability_score: adaptability || 0,
        overall_score: this.calculateOverallScore(skillAssessment),
        assessment_metadata: JSON.stringify({
          assessment_method: 'voice_conversation',
          factors_considered: Object.keys(skillAssessment),
          timestamp: new Date().toISOString()
        }),
        created_at: new Date()
      })

      // Update user skill tracking
      await this.updateUserSkillTracking(userId, skillAssessment)

      logger.info('Skill progression tracked', {
        progressId,
        userId,
        negotiationId,
        overallScore: this.calculateOverallScore(skillAssessment)
      })

    } catch (error) {
      logger.error('Failed to track skill progression', {
        userId,
        negotiationId,
        error: error.message
      })
    }
  }

  /**
   * Analyze conversation patterns for insights
   */
  async analyzeConversationPatterns(negotiationId) {
    try {
      // Get voice session data
      const sessions = await db('voice_sessions')
        .where('negotiation_id', negotiationId)
        .select('*')

      if (sessions.length === 0) {
        return { patterns: [], insights: [] }
      }

      // Get conversation turns
      const turns = await db('voice_conversation_turns')
        .whereIn('session_id', sessions.map(s => s.id))
        .orderBy('created_at', 'asc')
        .select('*')

      // Analyze patterns
      const patterns = this.identifyConversationPatterns(turns)
      const insights = this.generateConversationInsights(sessions, turns, patterns)

      return {
        negotiationId,
        totalSessions: sessions.length,
        totalTurns: turns.length,
        patterns,
        insights,
        recommendations: this.generateRecommendations(patterns, insights)
      }

    } catch (error) {
      logger.error('Failed to analyze conversation patterns', {
        negotiationId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Generate performance dashboard data
   */
  async generatePerformanceDashboard(userId, timeRange = '30d') {
    try {
      const timeFilter = this.getTimeFilter(timeRange)

      // Get user's voice interactions
      const interactions = await db('voice_interaction_analytics')
        .where('user_id', userId)
        .where('timestamp', '>=', timeFilter)
        .orderBy('timestamp', 'desc')
        .select('*')

      // Get skill progression
      const skillProgression = await db('voice_skill_progression')
        .where('user_id', userId)
        .where('created_at', '>=', timeFilter)
        .orderBy('created_at', 'asc')
        .select('*')

      // Calculate metrics
      const metrics = this.calculateUserMetrics(interactions, skillProgression)

      // Generate insights
      const insights = this.generateUserInsights(metrics, interactions, skillProgression)

      return {
        userId,
        timeRange,
        summary: {
          totalVoiceInteractions: interactions.length,
          totalNegotiations: new Set(interactions.map(i => i.negotiation_id)).size,
          averageLatency: metrics.averageLatency,
          skillImprovement: metrics.skillImprovement,
          currentSkillLevel: metrics.currentSkillLevel
        },
        skillProgression: this.formatSkillProgression(skillProgression),
        performanceTrends: this.calculatePerformanceTrends(skillProgression),
        insights,
        recommendations: this.generatePersonalizedRecommendations(metrics, insights)
      }

    } catch (error) {
      logger.error('Failed to generate performance dashboard', {
        userId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Get real-time system metrics
   */
  getSystemMetrics() {
    return {
      ...this.realTimeMetrics,
      analyticsBufferSize: this.analyticsBuffer.size,
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    }
  }

  /**
   * Update real-time metrics
   */
  updateRealTimeMetrics(data) {
    const { interactionType, latency, characterId } = data

    if (interactionType === 'session_started') {
      this.realTimeMetrics.activeConversations++
    } else if (interactionType === 'session_ended') {
      this.realTimeMetrics.activeConversations = Math.max(0, this.realTimeMetrics.activeConversations - 1)
    }

    if (interactionType === 'voice_generated') {
      this.realTimeMetrics.totalVoiceInteractions++
      
      if (latency) {
        // Update average latency
        const currentAvg = this.realTimeMetrics.averageLatency
        const totalInteractions = this.realTimeMetrics.totalVoiceInteractions
        this.realTimeMetrics.averageLatency = ((currentAvg * (totalInteractions - 1)) + latency) / totalInteractions
      }
    }

    // Track character popularity
    if (characterId) {
      const currentCount = this.realTimeMetrics.characterPopularity.get(characterId) || 0
      this.realTimeMetrics.characterPopularity.set(characterId, currentCount + 1)
    }
  }

  /**
   * Flush analytics buffer to database
   */
  async flushAnalyticsBuffer() {
    if (this.analyticsBuffer.size === 0) return

    try {
      const records = Array.from(this.analyticsBuffer.values())
      
      await db('voice_interaction_analytics').insert(records)
      
      logger.info('Analytics buffer flushed', { recordCount: records.length })
      
      this.analyticsBuffer.clear()

    } catch (error) {
      logger.error('Failed to flush analytics buffer', {
        error: error.message,
        bufferSize: this.analyticsBuffer.size
      })
    }
  }

  /**
   * Identify conversation patterns
   */
  identifyConversationPatterns(turns) {
    const patterns = {
      responseTimePattern: this.analyzeResponseTimes(turns),
      conversationFlow: this.analyzeConversationFlow(turns),
      topicProgression: this.analyzeTopicProgression(turns),
      engagementLevel: this.analyzeEngagementLevel(turns),
      negotiationPhases: this.analyzeNegotiationPhases(turns)
    }

    return patterns
  }

  /**
   * Generate conversation insights
   */
  generateConversationInsights(sessions, turns, patterns) {
    const insights = []

    // Latency insights
    const avgLatency = sessions.reduce((sum, s) => sum + parseFloat(s.average_latency), 0) / sessions.length
    if (avgLatency > 1000) {
      insights.push({
        type: 'performance',
        severity: 'medium',
        message: `Average response latency is ${Math.round(avgLatency)}ms. Consider optimizing for better user experience.`,
        recommendation: 'Implement response caching or upgrade to faster voice synthesis model'
      })
    }

    // Engagement insights
    if (patterns.engagementLevel.dropoffRate > 0.3) {
      insights.push({
        type: 'engagement',
        severity: 'high',
        message: 'High conversation dropout rate detected',
        recommendation: 'Review character responses for engagement and adjust conversation flow'
      })
    }

    // Skill development insights
    if (turns.length > 20) {
      insights.push({
        type: 'learning',
        severity: 'low',
        message: 'Extended conversation detected - good for skill development',
        recommendation: 'Continue encouraging longer negotiation sessions'
      })
    }

    return insights
  }

  /**
   * Calculate overall skill score
   */
  calculateOverallScore(skillAssessment) {
    const scores = Object.values(skillAssessment).filter(score => typeof score === 'number')
    return scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0
  }

  /**
   * Initialize analytics database tables
   */
  async initializeAnalyticsTables() {
    try {
      // Voice interaction analytics table
      const hasInteractionAnalytics = await db.schema.hasTable('voice_interaction_analytics')
      if (!hasInteractionAnalytics) {
        await db.schema.createTable('voice_interaction_analytics', (table) => {
          table.string('id').primary()
          table.string('negotiation_id').references('id').inTable('negotiations').onDelete('CASCADE')
          table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
          table.string('character_id').references('id').inTable('ai_characters').onDelete('SET NULL')
          table.string('stream_id').nullable()
          table.string('interaction_type').notNullable()
          table.integer('latency_ms').defaultTo(0)
          table.integer('audio_size_bytes').defaultTo(0)
          table.integer('text_length').defaultTo(0)
          table.text('metadata')
          table.timestamp('timestamp').defaultTo(db.fn.now())
          
          table.index(['user_id', 'timestamp'])
          table.index(['negotiation_id'])
          table.index(['interaction_type'])
        })
      }

      // Skill progression tracking table
      const hasSkillProgression = await db.schema.hasTable('voice_skill_progression')
      if (!hasSkillProgression) {
        await db.schema.createTable('voice_skill_progression', (table) => {
          table.string('id').primary()
          table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
          table.string('negotiation_id').references('id').inTable('negotiations').onDelete('CASCADE')
          table.decimal('claiming_value_score', 5, 2).defaultTo(0)
          table.decimal('creating_value_score', 5, 2).defaultTo(0)
          table.decimal('managing_relationships_score', 5, 2).defaultTo(0)
          table.decimal('communication_effectiveness', 5, 2).defaultTo(0)
          table.decimal('voice_clarity_score', 5, 2).defaultTo(0)
          table.decimal('response_time_score', 5, 2).defaultTo(0)
          table.decimal('confidence_score', 5, 2).defaultTo(0)
          table.decimal('adaptability_score', 5, 2).defaultTo(0)
          table.decimal('overall_score', 5, 2).defaultTo(0)
          table.text('assessment_metadata')
          table.timestamp('created_at').defaultTo(db.fn.now())
          
          table.index(['user_id', 'created_at'])
          table.index(['overall_score'])
        })
      }

      logger.info('Analytics tables initialized successfully')

    } catch (error) {
      logger.error('Failed to initialize analytics tables', { error: error.message })
    }
  }

  /**
   * Helper methods for pattern analysis
   */
  analyzeResponseTimes(turns) {
    const responseTimes = turns.map(turn => turn.generation_latency).filter(Boolean)
    return {
      average: responseTimes.reduce((sum, time) => sum + parseFloat(time), 0) / responseTimes.length || 0,
      min: Math.min(...responseTimes) || 0,
      max: Math.max(...responseTimes) || 0,
      trend: this.calculateTrend(responseTimes)
    }
  }

  analyzeConversationFlow(turns) {
    return {
      averageTurnsPerSession: turns.length,
      conversationDepth: turns.filter(turn => turn.user_input && turn.user_input.length > 50).length,
      questionToStatementRatio: this.calculateQuestionRatio(turns)
    }
  }

  analyzeEngagementLevel(turns) {
    const totalTurns = turns.length
    const completedTurns = turns.filter(turn => turn.ai_response && turn.ai_response.length > 0).length
    
    return {
      completionRate: totalTurns > 0 ? completedTurns / totalTurns : 0,
      dropoffRate: totalTurns > 0 ? (totalTurns - completedTurns) / totalTurns : 0,
      averageResponseLength: turns.reduce((sum, turn) => sum + (turn.ai_response?.length || 0), 0) / totalTurns || 0
    }
  }

  calculateTrend(values) {
    if (values.length < 2) return 'stable'
    
    const firstHalf = values.slice(0, Math.floor(values.length / 2))
    const secondHalf = values.slice(Math.floor(values.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length
    
    const change = (secondAvg - firstAvg) / firstAvg
    
    if (change > 0.1) return 'increasing'
    if (change < -0.1) return 'decreasing'
    return 'stable'
  }

  getTimeFilter(timeRange) {
    const now = new Date()
    const days = parseInt(timeRange.replace('d', ''))
    return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
  }

  /**
   * Start periodic analytics processing
   */
  startPeriodicProcessing(intervalMs = 300000) { // 5 minutes
    setInterval(async () => {
      try {
        await this.flushAnalyticsBuffer()
        
        // Additional periodic processing can be added here
        logger.debug('Periodic analytics processing completed')
      } catch (error) {
        logger.error('Periodic analytics processing failed', { error: error.message })
      }
    }, intervalMs)
  }
}

module.exports = VoiceAnalyticsService