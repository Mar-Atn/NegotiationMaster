const db = require('../config/database')
const logger = require('../config/logger')

class VoiceSessionManager {
  constructor() {
    this.activeSessions = new Map()
    this.sessionTimeout = 300000 // 5 minutes
  }

  /**
   * Create a new voice conversation session
   */
  async createSession(streamId, negotiationId, userId, character) {
    try {
      const sessionId = `voice_session_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      const sessionData = {
        sessionId,
        streamId,
        negotiationId,
        userId,
        characterId: character.id,
        status: 'active',
        createdAt: new Date(),
        lastActivity: new Date(),
        conversationTurns: 0,
        totalSpeechDuration: 0,
        averageLatency: 0,
        voiceSettings: JSON.stringify(character.voice_settings || {}),
        metadata: JSON.stringify({
          characterName: character.name,
          characterRole: character.role,
          voiceId: character.voice_id,
          initializedAt: new Date().toISOString()
        })
      }

      // Store in memory for quick access
      this.activeSessions.set(sessionId, sessionData)

      // Persist to database
      await this.persistSession(sessionData)

      logger.info('Voice session created', {
        sessionId,
        streamId,
        negotiationId,
        userId,
        characterId: character.id
      })

      return sessionId

    } catch (error) {
      logger.error('Failed to create voice session', {
        streamId,
        negotiationId,
        error: error.message,
        stack: error.stack
      })
      throw error
    }
  }

  /**
   * Update session with new data
   */
  async updateSession(streamId, updateData) {
    try {
      const session = this.getSessionByStreamId(streamId)
      
      if (!session) {
        logger.warn('Attempted to update non-existent session', { streamId })
        return
      }

      // Update in memory
      Object.assign(session, {
        ...updateData,
        lastActivity: new Date()
      })

      // Update in database
      await this.persistSession(session)

      logger.debug('Voice session updated', {
        sessionId: session.sessionId,
        streamId,
        updateKeys: Object.keys(updateData)
      })

    } catch (error) {
      logger.error('Failed to update voice session', {
        streamId,
        error: error.message
      })
    }
  }

  /**
   * Record a conversation turn (user speaks, AI responds)
   */
  async recordConversationTurn(streamId, turnData) {
    try {
      const session = this.getSessionByStreamId(streamId)
      
      if (!session) {
        throw new Error(`Session not found for stream ${streamId}`)
      }

      session.conversationTurns++
      session.lastActivity = new Date()

      // Update speech duration and latency
      if (turnData.speechDuration) {
        session.totalSpeechDuration += turnData.speechDuration
      }

      if (turnData.latency) {
        // Calculate running average latency
        const totalLatency = (session.averageLatency * (session.conversationTurns - 1)) + turnData.latency
        session.averageLatency = totalLatency / session.conversationTurns
      }

      // Store turn details in database
      await this.recordTurnInDatabase(session.sessionId, turnData)

      // Update session
      await this.persistSession(session)

      logger.info('Conversation turn recorded', {
        sessionId: session.sessionId,
        streamId,
        turnNumber: session.conversationTurns,
        latency: turnData.latency,
        speechDuration: turnData.speechDuration
      })

    } catch (error) {
      logger.error('Failed to record conversation turn', {
        streamId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Close a voice session
   */
  async closeSession(streamId, reason = 'completed') {
    try {
      const session = this.getSessionByStreamId(streamId)
      
      if (!session) {
        logger.warn('Attempted to close non-existent session', { streamId })
        return
      }

      session.status = 'closed'
      session.closedAt = new Date()
      session.closeReason = reason

      // Calculate session metrics
      const sessionDuration = session.closedAt.getTime() - session.createdAt.getTime()
      session.sessionDuration = sessionDuration

      // Final database update
      await this.persistSession(session)

      // Remove from active sessions
      this.activeSessions.delete(session.sessionId)

      logger.info('Voice session closed', {
        sessionId: session.sessionId,
        streamId,
        reason,
        duration: sessionDuration,
        conversationTurns: session.conversationTurns,
        averageLatency: session.averageLatency
      })

      return {
        sessionId: session.sessionId,
        duration: sessionDuration,
        conversationTurns: session.conversationTurns,
        averageLatency: session.averageLatency,
        totalSpeechDuration: session.totalSpeechDuration
      }

    } catch (error) {
      logger.error('Failed to close voice session', {
        streamId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Get session by stream ID
   */
  getSessionByStreamId(streamId) {
    for (const session of this.activeSessions.values()) {
      if (session.streamId === streamId) {
        return session
      }
    }
    return null
  }

  /**
   * Get session by session ID
   */
  getSession(sessionId) {
    return this.activeSessions.get(sessionId)
  }

  /**
   * Get all active sessions for a negotiation
   */
  getSessionsForNegotiation(negotiationId) {
    const sessions = []
    
    for (const session of this.activeSessions.values()) {
      if (session.negotiationId === negotiationId) {
        sessions.push(session)
      }
    }

    return sessions
  }

  /**
   * Get all active sessions for a user
   */
  getSessionsForUser(userId) {
    const sessions = []
    
    for (const session of this.activeSessions.values()) {
      if (session.userId === userId) {
        sessions.push(session)
      }
    }

    return sessions
  }

  /**
   * Persist session data to database
   */
  async persistSession(sessionData) {
    try {
      // First check if we need to create the voice_sessions table
      await this.ensureVoiceSessionsTable()

      const dbData = {
        id: sessionData.sessionId,
        stream_id: sessionData.streamId,
        negotiation_id: sessionData.negotiationId,
        user_id: sessionData.userId,
        character_id: sessionData.characterId,
        status: sessionData.status,
        conversation_turns: sessionData.conversationTurns,
        total_speech_duration: sessionData.totalSpeechDuration,
        average_latency: sessionData.averageLatency,
        session_duration: sessionData.sessionDuration || null,
        voice_settings: sessionData.voiceSettings,
        metadata: sessionData.metadata,
        close_reason: sessionData.closeReason || null,
        created_at: sessionData.createdAt,
        closed_at: sessionData.closedAt || null,
        updated_at: new Date()
      }

      // Use upsert (insert or update)
      await db('voice_sessions')
        .insert(dbData)
        .onConflict('id')
        .merge()

    } catch (error) {
      logger.error('Failed to persist session to database', {
        sessionId: sessionData.sessionId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Record individual conversation turn in database
   */
  async recordTurnInDatabase(sessionId, turnData) {
    try {
      await this.ensureVoiceTurnsTable()

      const turnId = `turn_${Date.now()}_${Math.random().toString(36).substring(7)}`

      await db('voice_conversation_turns').insert({
        id: turnId,
        session_id: sessionId,
        turn_number: turnData.turnNumber || 1,
        user_input: turnData.userInput || null,
        ai_response: turnData.aiResponse || null,
        speech_duration: turnData.speechDuration || 0,
        generation_latency: turnData.latency || 0,
        voice_chunk_count: turnData.chunkCount || 0,
        audio_size_bytes: turnData.audioSize || 0,
        metadata: JSON.stringify(turnData.metadata || {}),
        created_at: new Date()
      })

    } catch (error) {
      logger.error('Failed to record turn in database', {
        sessionId,
        error: error.message
      })
    }
  }

  /**
   * Ensure voice_sessions table exists
   */
  async ensureVoiceSessionsTable() {
    try {
      const exists = await db.schema.hasTable('voice_sessions')
      
      if (!exists) {
        await db.schema.createTable('voice_sessions', (table) => {
          table.string('id').primary()
          table.string('stream_id').notNullable()
          table.string('negotiation_id').references('id').inTable('negotiations').onDelete('CASCADE')
          table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
          table.string('character_id').references('id').inTable('ai_characters').onDelete('SET NULL')
          table.string('status').notNullable().defaultTo('active')
          table.integer('conversation_turns').defaultTo(0)
          table.integer('total_speech_duration').defaultTo(0) // milliseconds
          table.decimal('average_latency', 10, 2).defaultTo(0) // milliseconds
          table.integer('session_duration').nullable() // milliseconds
          table.text('voice_settings') // JSON string
          table.text('metadata') // JSON string
          table.string('close_reason').nullable()
          table.timestamp('created_at').defaultTo(db.fn.now())
          table.timestamp('closed_at').nullable()
          table.timestamp('updated_at').defaultTo(db.fn.now())
          
          table.index(['negotiation_id'])
          table.index(['user_id'])
          table.index(['character_id'])
          table.index(['status'])
        })

        logger.info('Created voice_sessions table')
      }
    } catch (error) {
      logger.error('Failed to ensure voice_sessions table', { error: error.message })
    }
  }

  /**
   * Ensure voice_conversation_turns table exists
   */
  async ensureVoiceTurnsTable() {
    try {
      const exists = await db.schema.hasTable('voice_conversation_turns')
      
      if (!exists) {
        await db.schema.createTable('voice_conversation_turns', (table) => {
          table.string('id').primary()
          table.string('session_id').references('id').inTable('voice_sessions').onDelete('CASCADE')
          table.integer('turn_number').notNullable()
          table.text('user_input').nullable()
          table.text('ai_response').nullable()
          table.integer('speech_duration').defaultTo(0) // milliseconds
          table.decimal('generation_latency', 10, 2).defaultTo(0) // milliseconds
          table.integer('voice_chunk_count').defaultTo(0)
          table.integer('audio_size_bytes').defaultTo(0)
          table.text('metadata') // JSON string
          table.timestamp('created_at').defaultTo(db.fn.now())
          
          table.index(['session_id'])
          table.index(['turn_number'])
        })

        logger.info('Created voice_conversation_turns table')
      }
    } catch (error) {
      logger.error('Failed to ensure voice_conversation_turns table', { error: error.message })
    }
  }

  /**
   * Get session analytics for a negotiation
   */
  async getSessionAnalytics(negotiationId) {
    try {
      await this.ensureVoiceSessionsTable()

      const sessions = await db('voice_sessions')
        .where('negotiation_id', negotiationId)
        .select('*')

      const analytics = {
        totalSessions: sessions.length,
        activeSessions: sessions.filter(s => s.status === 'active').length,
        completedSessions: sessions.filter(s => s.status === 'closed').length,
        totalConversationTurns: sessions.reduce((sum, s) => sum + s.conversation_turns, 0),
        averageLatency: sessions.length > 0 
          ? sessions.reduce((sum, s) => sum + parseFloat(s.average_latency), 0) / sessions.length 
          : 0,
        totalSpeechDuration: sessions.reduce((sum, s) => sum + s.total_speech_duration, 0),
        averageSessionDuration: sessions
          .filter(s => s.session_duration)
          .reduce((sum, s) => sum + s.session_duration, 0) / 
          Math.max(sessions.filter(s => s.session_duration).length, 1)
      }

      return analytics

    } catch (error) {
      logger.error('Failed to get session analytics', {
        negotiationId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    const now = Date.now()
    const expiredSessions = []

    for (const [sessionId, session] of this.activeSessions.entries()) {
      const age = now - session.lastActivity.getTime()
      if (age > this.sessionTimeout && session.status === 'active') {
        expiredSessions.push(sessionId)
      }
    }

    // Close expired sessions
    expiredSessions.forEach(sessionId => {
      const session = this.activeSessions.get(sessionId)
      if (session) {
        this.closeSession(session.streamId, 'timeout').catch(error => {
          logger.error('Failed to close expired session', {
            sessionId,
            error: error.message
          })
        })
      }
    })

    return expiredSessions.length
  }

  /**
   * Start periodic cleanup
   */
  startCleanupInterval(intervalMs = 60000) { // 1 minute
    setInterval(() => {
      const cleaned = this.cleanupExpiredSessions()
      if (cleaned > 0) {
        logger.info('Cleaned up expired voice sessions', { count: cleaned })
      }
    }, intervalMs)
  }

  /**
   * Get service health metrics
   */
  getHealthMetrics() {
    return {
      activeSessions: this.activeSessions.size,
      totalMemoryUsage: process.memoryUsage().heapUsed,
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  }
}

module.exports = VoiceSessionManager