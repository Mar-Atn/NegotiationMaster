const voiceService = require('../services/voiceService')
const db = require('../config/database')
const logger = require('../config/logger')
const { Readable } = require('stream')

class VoiceController {
  /**
   * Generate speech audio for a character message
   */
  async generateCharacterSpeech(req, res, next) {
    try {
      const { characterId, text, options = {} } = req.body

      if (!characterId || !text) {
        return res.status(400).json({
          success: false,
          error: 'Character ID and text are required',
          code: 'MISSING_PARAMETERS'
        })
      }

      // Get character information
      const character = await db('ai_characters')
        .where({ id: characterId, is_active: true })
        .first()

      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'AI character not found',
          code: 'CHARACTER_NOT_FOUND'
        })
      }

      // Generate speech with character-specific voice
      const result = await voiceService.generateCharacterSpeech(character.name, text, options)

      // Log the voice generation request
      logger.info('Character speech generated', {
        characterId,
        characterName: character.name,
        textLength: text.length,
        latency: result.metadata.latency,
        userId: req.user?.userId
      })

      // Return audio as base64 for JSON response
      res.json({
        success: true,
        data: {
          audio: result.audio.toString('base64'),
          audioFormat: 'mp3',
          metadata: result.metadata,
          character: {
            id: character.id,
            name: character.name,
            role: character.role
          }
        }
      })

    } catch (error) {
      logger.error('Failed to generate character speech:', error)
      next(error)
    }
  }

  /**
   * Stream real-time speech for character
   */
  async streamCharacterSpeech(req, res, next) {
    try {
      const { characterId, text, options = {} } = req.body

      if (!characterId || !text) {
        return res.status(400).json({
          success: false,
          error: 'Character ID and text are required',
          code: 'MISSING_PARAMETERS'
        })
      }

      // Get character information
      const character = await db('ai_characters')
        .where({ id: characterId, is_active: true })
        .first()

      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'AI character not found',
          code: 'CHARACTER_NOT_FOUND'
        })
      }

      // Set appropriate headers for audio streaming
      res.setHeader('Content-Type', 'audio/mpeg')
      res.setHeader('Transfer-Encoding', 'chunked')
      res.setHeader('Cache-Control', 'no-cache')
      res.setHeader('Connection', 'keep-alive')

      // Stream speech with character-specific voice
      const stream = await voiceService.streamCharacterSpeech(character.name, text, res, options)

      // Handle client disconnect
      req.on('close', () => {
        if (stream && typeof stream.destroy === 'function') {
          stream.destroy()
        }
      })

      logger.info('Character speech streaming started', {
        characterId,
        characterName: character.name,
        textLength: text.length,
        userId: req.user?.userId
      })

    } catch (error) {
      logger.error('Failed to stream character speech:', error)
      
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: 'Speech streaming failed',
          code: 'STREAMING_ERROR'
        })
      }
    }
  }

  /**
   * Get voice service metrics and performance data
   */
  async getVoiceMetrics(req, res, next) {
    try {
      const metrics = voiceService.getMetrics()
      
      res.json({
        success: true,
        data: metrics
      })
    } catch (error) {
      logger.error('Failed to get voice metrics:', error)
      next(error)
    }
  }

  /**
   * Test voice generation for a specific character
   */
  async testCharacterVoice(req, res, next) {
    try {
      const { characterId, testText } = req.body

      if (!characterId) {
        return res.status(400).json({
          success: false,
          error: 'Character ID is required',
          code: 'MISSING_PARAMETERS'
        })
      }

      // Get character information
      const character = await db('ai_characters')
        .where({ id: characterId, is_active: true })
        .first()

      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'AI character not found',
          code: 'CHARACTER_NOT_FOUND'
        })
      }

      // Test voice generation
      const testResult = await voiceService.testCharacterVoice(character.name, testText)

      logger.info('Character voice test completed', {
        characterId,
        characterName: character.name,
        success: testResult.success,
        userId: req.user?.userId
      })

      res.json({
        success: true,
        data: {
          ...testResult,
          character: {
            id: character.id,
            name: character.name,
            role: character.role
          }
        }
      })

    } catch (error) {
      logger.error('Failed to test character voice:', error)
      next(error)
    }
  }

  /**
   * Get available ElevenLabs voices
   */
  async getAvailableVoices(req, res, next) {
    try {
      const voices = await voiceService.getAvailableVoices()
      
      res.json({
        success: true,
        data: voices
      })
    } catch (error) {
      logger.error('Failed to get available voices:', error)
      next(error)
    }
  }

  /**
   * Get character voice mappings and configurations
   */
  async getCharacterVoiceConfigs(req, res, next) {
    try {
      // Get all active characters
      const characters = await db('ai_characters')
        .where('is_active', true)
        .select(['id', 'name', 'role', 'description', 'communication_style'])

      // Map characters to their voice configurations
      const characterVoiceConfigs = characters.map(character => {
        const voiceConfig = voiceService.characterVoiceMapping[character.name]
        
        return {
          character: {
            id: character.id,
            name: character.name,
            role: character.role,
            description: character.description,
            communicationStyle: character.communication_style
          },
          voiceConfig: voiceConfig ? {
            voiceId: voiceConfig.voiceId,
            personality: voiceConfig.personality,
            prosody: voiceConfig.prosody,
            settings: voiceConfig.settings
          } : null,
          hasVoiceMapping: !!voiceConfig
        }
      })

      res.json({
        success: true,
        data: characterVoiceConfigs
      })

    } catch (error) {
      logger.error('Failed to get character voice configurations:', error)
      next(error)
    }
  }

  /**
   * Generate speech for negotiation message with context
   */
  async generateNegotiationSpeech(req, res, next) {
    try {
      const { negotiationId, messageId } = req.params
      const { options = {} } = req.body

      // Get the message with character information
      const messageData = await db('messages as m')
        .join('negotiations as n', 'm.negotiation_id', 'n.id')
        .join('ai_characters as c', 'n.ai_character_id', 'c.id')
        .where({
          'm.id': messageId,
          'm.negotiation_id': negotiationId,
          'm.sender_type': 'ai',
          'c.is_active': true
        })
        .select([
          'm.content',
          'm.id as message_id',
          'c.id as character_id',
          'c.name as character_name',
          'c.role as character_role'
        ])
        .first()

      if (!messageData) {
        return res.status(404).json({
          success: false,
          error: 'Message not found or not from AI character',
          code: 'MESSAGE_NOT_FOUND'
        })
      }

      // Generate speech for the message
      const result = await voiceService.generateCharacterSpeech(
        messageData.character_name,
        messageData.content,
        options
      )

      // Store voice generation metadata in database (optional)
      await db('ai_responses').insert({
        message_id: messageData.message_id,
        voice_metadata: JSON.stringify({
          voice_id: result.metadata.voiceId,
          latency: result.metadata.latency,
          audio_size: result.audio.length,
          generated_at: new Date().toISOString()
        })
      }).onConflict('message_id').merge(['voice_metadata'])

      logger.info('Negotiation message speech generated', {
        negotiationId,
        messageId,
        characterName: messageData.character_name,
        textLength: messageData.content.length,
        latency: result.metadata.latency,
        userId: req.user?.userId
      })

      res.json({
        success: true,
        data: {
          audio: result.audio.toString('base64'),
          audioFormat: 'mp3',
          metadata: result.metadata,
          message: {
            id: messageData.message_id,
            content: messageData.content
          },
          character: {
            id: messageData.character_id,
            name: messageData.character_name,
            role: messageData.character_role
          }
        }
      })

    } catch (error) {
      logger.error('Failed to generate negotiation speech:', error)
      next(error)
    }
  }

  /**
   * Initialize conversational AI session
   */
  async initializeConversationalSession(req, res, next) {
    try {
      const { negotiationId, characterId, options = {} } = req.body

      if (!negotiationId || !characterId) {
        return res.status(400).json({
          success: false,
          error: 'Negotiation ID and Character ID are required',
          code: 'MISSING_PARAMETERS'
        })
      }

      // Get character information
      const character = await db('ai_characters')
        .where({ id: characterId, is_active: true })
        .first()

      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'AI character not found',
          code: 'CHARACTER_NOT_FOUND'
        })
      }

      // Get negotiation context
      const negotiation = await db('negotiations as n')
        .join('scenarios as s', 'n.scenario_id', 's.id')
        .where('n.id', negotiationId)
        .select([
          'n.id as negotiation_id',
          'n.user_id',
          's.title as scenario_title',
          's.description as scenario_description',
          's.context as scenario_context'
        ])
        .first()

      if (!negotiation) {
        return res.status(404).json({
          success: false,
          error: 'Negotiation not found',
          code: 'NEGOTIATION_NOT_FOUND'
        })
      }

      // Create session ID
      const sessionId = `conv_${negotiationId}_${characterId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      // Get socket.io instance from app
      const io = req.app.get('io')
      
      // Initialize conversational session
      const sessionResult = await voiceService.initializeConversationalSession(
        sessionId,
        character.name,
        io,
        negotiationId,
        {
          scenarioContext: `${negotiation.scenario_title}: ${negotiation.scenario_description}. Context: ${negotiation.scenario_context}`,
          firstMessage: options.firstMessage,
          ...options
        }
      )

      // Store session info in database for tracking
      await db('ai_responses').insert({
        message_id: null, // No specific message yet
        response_metadata: JSON.stringify({
          session_id: sessionId,
          negotiation_id: negotiationId,
          character_id: characterId,
          session_type: 'conversational_ai',
          initialized_at: new Date().toISOString(),
          user_id: req.user?.userId
        })
      })

      logger.info('Conversational AI session initialized', {
        sessionId,
        negotiationId,
        characterId,
        characterName: character.name,
        userId: req.user?.userId
      })

      res.json({
        success: true,
        data: {
          ...sessionResult,
          negotiation: {
            id: negotiation.negotiation_id,
            scenario: negotiation.scenario_title
          },
          character: {
            id: character.id,
            name: character.name,
            role: character.role
          }
        }
      })

    } catch (error) {
      logger.error('Failed to initialize conversational session:', error)
      next(error)
    }
  }

  /**
   * End conversational AI session
   */
  async endConversationalSession(req, res, next) {
    try {
      const { sessionId } = req.params

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_PARAMETERS'
        })
      }

      // End the conversational session
      await voiceService.endConversationalSession(sessionId)

      logger.info('Conversational AI session ended', {
        sessionId,
        userId: req.user?.userId
      })

      res.json({
        success: true,
        message: 'Conversational session ended successfully'
      })

    } catch (error) {
      logger.error('Failed to end conversational session:', error)
      next(error)
    }
  }

  /**
   * Get active conversational sessions
   */
  async getActiveConversationalSessions(req, res, next) {
    try {
      const { negotiationId } = req.query
      
      const activeSessions = voiceService.getActiveConversationalSessions()
      
      // Filter by negotiation if specified
      const filteredSessions = negotiationId 
        ? activeSessions.filter(session => session.negotiationId === negotiationId)
        : activeSessions
      
      res.json({
        success: true,
        data: {
          sessions: filteredSessions,
          totalActive: activeSessions.length,
          filteredCount: filteredSessions.length
        }
      })

    } catch (error) {
      logger.error('Failed to get active conversational sessions:', error)
      next(error)
    }
  }

  /**
   * Get conversational AI metrics
   */
  async getConversationalMetrics(req, res, next) {
    try {
      const metrics = voiceService.getConversationalMetrics()
      const voiceMetrics = voiceService.getMetrics()
      
      res.json({
        success: true,
        data: {
          conversationalAI: metrics,
          voiceSynthesis: voiceMetrics,
          combined: {
            totalSessions: metrics.totalSessions,
            activeSessions: metrics.activeSessions,
            overallHealthStatus: voiceMetrics.sessionMetrics.healthStatus,
            uptime: voiceMetrics.sessionMetrics.uptime
          }
        }
      })

    } catch (error) {
      logger.error('Failed to get conversational metrics:', error)
      next(error)
    }
  }

  /**
   * Initialize speech recognition session
   */
  async initializeSpeechRecognition(req, res, next) {
    try {
      const { sessionId, options = {} } = req.body

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_PARAMETERS'
        })
      }

      const sttSession = await voiceService.initializeSpeechRecognition(sessionId, options)

      logger.info('Speech recognition session initialized', {
        sessionId,
        config: sttSession.config,
        userId: req.user?.userId
      })

      res.json({
        success: true,
        data: {
          sessionId,
          config: sttSession.config,
          isActive: sttSession.isActive
        }
      })

    } catch (error) {
      logger.error('Failed to initialize speech recognition:', error)
      next(error)
    }
  }

  /**
   * Process audio chunk for speech recognition
   */
  async processAudioChunk(req, res, next) {
    try {
      const { sessionId } = req.params
      const { audioData, options = {} } = req.body

      if (!sessionId || !audioData) {
        return res.status(400).json({
          success: false,
          error: 'Session ID and audio data are required',
          code: 'MISSING_PARAMETERS'
        })
      }

      // Convert base64 audio to buffer
      const audioBuffer = Buffer.from(audioData, 'base64')
      
      // Process audio for speech recognition
      const result = await voiceService.processAudioForSpeechRecognition(
        sessionId,
        audioBuffer,
        options
      )

      if (result) {
        logger.debug('Speech recognition result generated', {
          sessionId,
          transcriptLength: result.transcript.length,
          confidence: result.confidence
        })

        res.json({
          success: true,
          data: result
        })
      } else {
        res.json({
          success: true,
          data: null,
          message: 'Audio chunk processed, waiting for more data'
        })
      }

    } catch (error) {
      logger.error('Failed to process audio chunk:', error)
      next(error)
    }
  }

  /**
   * Get conversation history for a session
   */
  async getConversationHistory(req, res, next) {
    try {
      const { sessionId } = req.params
      const { limit = 50, offset = 0 } = req.query

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required',
          code: 'MISSING_PARAMETERS'
        })
      }

      // Get conversation history from the service
      const history = voiceService.conversationHistory.get(sessionId) || []
      
      // Apply pagination
      const paginatedHistory = history
        .slice(parseInt(offset), parseInt(offset) + parseInt(limit))
        .reverse() // Most recent first

      res.json({
        success: true,
        data: {
          sessionId,
          history: paginatedHistory,
          pagination: {
            total: history.length,
            limit: parseInt(limit),
            offset: parseInt(offset),
            hasMore: (parseInt(offset) + parseInt(limit)) < history.length
          }
        }
      })

    } catch (error) {
      logger.error('Failed to get conversation history:', error)
      next(error)
    }
  }

  /**
   * Get conversation transcript from ElevenLabs
   */
  async getConversationTranscript(req, res, next) {
    try {
      const { conversationId } = req.params

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          error: 'Conversation ID is required',
          code: 'MISSING_PARAMETERS'
        })
      }

      // Fetch transcript from ElevenLabs API
      const transcriptData = await voiceService.fetchConversationTranscript(conversationId)

      logger.info('Conversation transcript fetched', {
        conversationId,
        messageCount: transcriptData.transcript?.length || 0,
        status: transcriptData.status,
        userId: req.user?.userId
      })

      res.json({
        success: true,
        data: transcriptData
      })

    } catch (error) {
      logger.error('Failed to fetch conversation transcript:', error)
      next(error)
    }
  }

  /**
   * Batch generate speech for multiple messages
   */
  async batchGenerateSpeech(req, res, next) {
    try {
      const { messages, options = {} } = req.body

      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Messages array is required',
          code: 'MISSING_PARAMETERS'
        })
      }

      const results = []
      const errors = []

      // Process messages in parallel with concurrency limit
      const concurrencyLimit = 3
      const chunks = []
      for (let i = 0; i < messages.length; i += concurrencyLimit) {
        chunks.push(messages.slice(i, i + concurrencyLimit))
      }

      for (const chunk of chunks) {
        const chunkPromises = chunk.map(async (msg, index) => {
          try {
            // Get character information
            const character = await db('ai_characters')
              .where({ id: msg.characterId, is_active: true })
              .first()

            if (!character) {
              throw new Error(`Character not found: ${msg.characterId}`)
            }

            // Generate speech
            const result = await voiceService.generateCharacterSpeech(
              character.name,
              msg.text,
              options
            )

            return {
              success: true,
              messageIndex: msg.index || index,
              characterName: character.name,
              audio: result.audio.toString('base64'),
              metadata: result.metadata
            }

          } catch (error) {
            return {
              success: false,
              messageIndex: msg.index || index,
              error: error.message,
              characterId: msg.characterId
            }
          }
        })

        const chunkResults = await Promise.all(chunkPromises)
        
        chunkResults.forEach(result => {
          if (result.success) {
            results.push(result)
          } else {
            errors.push(result)
          }
        })
      }

      logger.info('Batch speech generation completed', {
        totalMessages: messages.length,
        successful: results.length,
        failed: errors.length,
        userId: req.user?.userId
      })

      res.json({
        success: true,
        data: {
          results,
          errors,
          summary: {
            total: messages.length,
            successful: results.length,
            failed: errors.length
          }
        }
      })

    } catch (error) {
      logger.error('Failed to batch generate speech:', error)
      next(error)
    }
  }
}

module.exports = new VoiceController()