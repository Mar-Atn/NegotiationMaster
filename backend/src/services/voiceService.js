const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js')
const logger = require('../config/logger')
const db = require('../config/database')
const fs = require('fs')
const path = require('path')
const { voiceCircuitBreaker, voiceFallbackManager } = require('../middleware/voiceErrorHandler')
const WebSocket = require('ws')
const EventEmitter = require('events')
const { Readable } = require('stream')
const assessmentQueueService = require('./assessmentQueue')

class VoiceService extends EventEmitter {
  constructor() {
    super()
    this.apiKey = process.env.ELEVENLABS_API_KEY
    this.client = null
    this.conversationalSessions = new Map() // Active conversational AI sessions
    this.speechRecognitionSessions = new Map() // Active STT sessions
    this.socketConnections = new Map() // Active socket connections
    this.conversationHistory = new Map() // Conversation history per session
    
    // Only initialize client if API key is available
    if (this.apiKey) {
      try {
        this.client = new ElevenLabsClient({ apiKey: this.apiKey })
      } catch (error) {
        logger.error('Failed to initialize ElevenLabs client:', error)
        this.client = null
      }
    } else {
      logger.warn('ElevenLabs API key not provided. Voice synthesis will be disabled.')
    }
    
    // Character voice mappings with optimized settings for each personality
    // Using commonly available ElevenLabs voices that should exist in most accounts
    this.characterVoiceMapping = {
      'Sarah Chen': {
        voiceId: '9BWtsMINqrJLrRacOk9x', // Aria - professional female voice
        settings: {
          stability: 0.65,
          similarityBoost: 0.85,
          style: 0.30,
          speakerBoost: true
        },
        prosody: {
          speed: 1.1, // Slightly faster for business urgency
          pitch: 0.9, // Slightly lower for authority
          emphasis: 'confident'
        },
        personality: {
          tone: 'professional_assertive',
          energy: 'high',
          warmth: 'medium'
        }
      },
      'Marcus Thompson': {
        voiceId: 'EXAVITQu4vr4xnSDxMaL', // Bella - warm collaborative voice
        settings: {
          stability: 0.75,
          similarityBoost: 0.75,
          style: 0.50,
          speakerBoost: true
        },
        prosody: {
          speed: 0.95, // Slower for thoughtful delivery
          pitch: 1.0, // Natural pitch
          emphasis: 'gentle'
        },
        personality: {
          tone: 'warm_collaborative',
          energy: 'medium',
          warmth: 'high'
        }
      },
      'Tony Rodriguez': {
        voiceId: 'FGY2WhTYpPnrIDTdsKH5', // High-energy voice
        settings: {
          stability: 0.55,
          similarityBoost: 0.90,
          style: 0.70,
          speakerBoost: true
        },
        prosody: {
          speed: 1.25, // Faster for sales pressure
          pitch: 1.1, // Higher for energy
          emphasis: 'aggressive'
        },
        personality: {
          tone: 'aggressive_sales',
          energy: 'very_high',
          warmth: 'low'
        }
      },
      'Dr. Amanda Foster': {
        voiceId: 'IKne3meq5aSn9XLyUdCD', // Authoritative executive voice
        settings: {
          stability: 0.80,
          similarityBoost: 0.80,
          style: 0.25,
          speakerBoost: true
        },
        prosody: {
          speed: 0.90, // Measured speech
          pitch: 0.85, // Lower for executive authority
          emphasis: 'authoritative'
        },
        personality: {
          tone: 'executive_measured',
          energy: 'medium',
          warmth: 'low'
        }
      },
      'Carlos Rivera': {
        voiceId: 'pNInz6obpgDQGcFmaJgB', // Adam - international diplomatic male
        settings: {
          stability: 0.70,
          similarityBoost: 0.75,
          style: 0.40,
          speakerBoost: true
        },
        prosody: {
          speed: 0.92, // Deliberate diplomatic pace
          pitch: 1.0, // Natural pitch
          emphasis: 'diplomatic'
        },
        personality: {
          tone: 'diplomatic_multicultural',
          energy: 'medium',
          warmth: 'medium_high'
        }
      }
    }

    // Performance metrics tracking
    this.metrics = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      avgLatency: 0,
      minLatency: Infinity,
      maxLatency: 0,
      errorRate: 0,
      characterUsage: {},
      audioQuality: {
        avgBitrate: 0,
        compressionRatio: 0,
        totalAudioGenerated: 0,
        avgAudioSize: 0
      },
      performanceMetrics: {
        requestsPerMinute: 0,
        peakLatency: 0,
        averageTextLength: 0,
        fallbackRate: 0,
        circuitBreakerTrips: 0
      },
      sessionMetrics: {
        startTime: Date.now(),
        uptime: 0,
        lastRequestTime: null,
        healthStatus: 'healthy'
      },
      latencyDistribution: {
        '<100ms': 0,
        '100-500ms': 0,
        '500ms-1s': 0,
        '1s-2s': 0,
        '>2s': 0
      }
    }

    // Audio streaming configuration
    this.streamConfig = {
      outputFormat: 'mp3_44100_128',
      optimizeStreamingLatency: 4, // Maximum latency optimization
      modelId: 'eleven_turbo_v2_5' // Fastest model for real-time
    }

    // Conversational AI configuration optimized for academic prototype
    this.conversationalConfig = {
      model: 'eleven_turbo_v2_5', // Fastest model for real-time
      voice_id: null, // Will be set per character
      agent: {
        prompt: {
          prompt: 'You are a professional negotiation training character. Respond naturally and stay in character.',
          llm: 'gpt-4o-mini' // Fast and efficient for real-time conversation
        },
        first_message: 'Hello! I\'m ready to start our negotiation. What would you like to discuss?',
        language: 'en'
      },
      agent_id: 'agent_7601k1g0796kfj2bzkcds0bkmw2m', // Working test agent
      conversation_config: {
        turn_detection: {
          type: 'server_vad', // Server-side voice activity detection
          threshold: 0.4, // Slightly more sensitive for better responsiveness
          prefix_padding_ms: 250, // Reduced for faster response
          silence_duration_ms: 500 // Shorter silence for more natural flow
        }
      },
      tts_config: {
        chunk_length_schedule: [100, 140, 200, 260], // Optimized for low latency
        enable_ssml_parsing: true, // Allow SSML for character personality
        optimize_streaming_latency: 4 // Maximum optimization
      },
      stt_config: {
        sampling_rate: 16000, // Standard rate for voice recognition
        chunk_length_ms: 800, // Shorter chunks for responsiveness
        enable_partial_results: true // Real-time transcription feedback
      }
    }

    // Session state management
    this.sessionStates = {
      INITIALIZING: 'initializing',
      LISTENING: 'listening',
      SPEAKING: 'speaking',
      PROCESSING: 'processing',
      PAUSED: 'paused',
      ENDED: 'ended',
      ERROR: 'error'
    }

    // Performance tracking for conversational AI
    this.conversationalMetrics = {
      totalSessions: 0,
      activeSessions: 0,
      avgSessionDuration: 0,
      totalTurns: 0,
      avgTurnLatency: 0,
      speechRecognitionAccuracy: 0,
      sessionsByCharacter: {}
    }
  }

  /**
   * Initialize the voice service and validate API connectivity
   */
  async initialize() {
    try {
      logger.info('Initializing VoiceService...')
      
      if (!this.client) {
        logger.warn('VoiceService initialized without ElevenLabs client (API key missing)')
        return false
      }
      
      // Test API connectivity
      const voices = await this.client.voices.search()
      logger.info(`ElevenLabs API connected successfully. Available voices: ${voices.voices.length}`)
      
      // Validate character voice mappings
      await this.validateVoiceMappings()
      
      logger.info('VoiceService initialized successfully')
      return true
    } catch (error) {
      logger.error('Failed to initialize VoiceService:', error)
      throw new Error(`Voice service initialization failed: ${error.message}`)
    }
  }

  /**
   * Validate that all character voice IDs exist in ElevenLabs
   */
  async validateVoiceMappings() {
    try {
      if (!this.client) {
        logger.warn('Cannot validate voice mappings without ElevenLabs client')
        return
      }
      
      const voices = await this.client.voices.getAll()
      logger.info(`ElevenLabs API connected successfully. Available voices: ${voices.voices.length}`)
      
      const availableVoiceIds = voices.voices.map(v => v.voiceId)
      logger.info(`First voice object structure:`, voices.voices[0])
      logger.info(`Available voice IDs: ${availableVoiceIds.filter(id => id).slice(0, 5).join(', ')}...`)
      
      // Use a known fallback voice ID (Adam is commonly available)
      const fallbackVoiceId = availableVoiceIds.length > 0 ? availableVoiceIds[0] : 'pNInz6obpgDQGcFmaJgB'
      
      for (const [characterName, config] of Object.entries(this.characterVoiceMapping)) {
        if (!availableVoiceIds.includes(config.voiceId)) {
          logger.warn(`Voice ID ${config.voiceId} for character ${characterName} not found. Using fallback voice: ${fallbackVoiceId}`)
          config.voiceId = fallbackVoiceId
        } else {
          logger.info(`✅ Voice ID ${config.voiceId} for character ${characterName} is valid`)
        }
      }
    } catch (error) {
      logger.error('Failed to validate voice mappings:', error)
      // If validation fails completely, set all characters to use a hardcoded fallback
      const fallbackVoiceId = 'pNInz6obpgDQGcFmaJgB' // Adam voice ID
      for (const [characterName, config] of Object.entries(this.characterVoiceMapping)) {
        config.voiceId = fallbackVoiceId
        logger.warn(`Using hardcoded fallback voice ${fallbackVoiceId} for ${characterName}`)
      }
    }
  }

  /**
   * Generate speech for a character with personality-specific settings
   */
  async generateCharacterSpeech(characterName, text, options = {}) {
    const startTime = Date.now()
    
    try {
      if (!this.client) {
        throw new Error('ElevenLabs client not initialized. Please check API key configuration.')
      }
      
      // Use circuit breaker for reliability
      return await voiceCircuitBreaker.execute(async () => {
        this.metrics.totalRequests++
        
        const voiceConfig = this.characterVoiceMapping[characterName]
        if (!voiceConfig) {
          logger.error(`Character voice mapping lookup failed for: ${characterName}`)
          logger.error(`Available characters: ${Object.keys(this.characterVoiceMapping).join(', ')}`)
          throw new Error(`No voice configuration found for character: ${characterName}`)
        }

        logger.info(`Voice config for ${characterName}:`, {
          voiceId: voiceConfig.voiceId,
          hasSettings: !!voiceConfig.settings,
          hasPersonality: !!voiceConfig.personality,
          fullConfig: voiceConfig
        })

        // Apply personality-specific text modifications
        const enhancedText = this.enhanceTextWithPersonality(text, voiceConfig.personality, characterName)
        
        // Configure voice settings
        const voiceSettings = {
          stability: voiceConfig.settings.stability,
          similarity_boost: voiceConfig.settings.similarityBoost,
          style: voiceConfig.settings.style,
          use_speaker_boost: voiceConfig.settings.speakerBoost
        }

        // Generate speech with timeout
        logger.info(`Calling ElevenLabs API with voiceId: ${voiceConfig.voiceId}`)
        
        const audioStream = await Promise.race([
          this.client.textToSpeech.convert(voiceConfig.voiceId, {
            text: enhancedText,
            modelId: options.modelId || this.streamConfig.modelId,
            voiceSettings: voiceSettings,
            outputFormat: options.outputFormat || this.streamConfig.outputFormat
          }),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Voice generation timeout')), 30000)
          )
        ])

        // Convert ReadableStream to Buffer
        const chunks = []
        const reader = audioStream.getReader()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
          }
        } finally {
          reader.releaseLock()
        }
        const audioBuffer = Buffer.concat(chunks)

        // Update metrics
        const latency = Date.now() - startTime
        this.updateMetrics(characterName, latency, true, audioBuffer.length, text.length)

        logger.info(`Generated speech for ${characterName}`, {
          textLength: text.length,
          latency: `${latency}ms`,
          voiceId: voiceConfig.voiceId,
          circuitBreakerState: voiceCircuitBreaker.getState().state
        })

        return {
          audio: audioBuffer,
          metadata: {
            characterName,
            voiceId: voiceConfig.voiceId,
            textLength: text.length,
            latency,
            personality: voiceConfig.personality,
            settings: voiceSettings
          }
        }
      })

    } catch (error) {
      const latency = Date.now() - startTime
      this.updateMetrics(characterName, latency, false, 0, text.length)
      
      logger.error(`Failed to generate speech for ${characterName}:`, error)
      
      // Attempt fallback if circuit breaker is open or other errors
      if (options.allowFallback !== false) {
        try {
          const fallbackResult = await this.handleVoiceFallback(error, {
            characterName,
            text,
            options,
            originalRequest: 'generateCharacterSpeech'
          })
          
          if (fallbackResult) {
            return fallbackResult
          }
        } catch (fallbackError) {
          logger.error('Voice fallback also failed:', fallbackError)
        }
      }
      
      throw new Error(`Voice generation failed: ${error.message}`)
    }
  }

  /**
   * Stream real-time speech for character with <75ms latency optimization
   */
  async streamCharacterSpeech(characterName, text, outputStream, options = {}) {
    const startTime = Date.now()
    
    try {
      if (!this.client) {
        throw new Error('ElevenLabs client not initialized. Please check API key configuration.')
      }
      
      const voiceConfig = this.characterVoiceMapping[characterName]
      if (!voiceConfig) {
        throw new Error(`No voice configuration found for character: ${characterName}`)
      }

      // Apply personality-specific text modifications
      const enhancedText = this.enhanceTextWithPersonality(text, voiceConfig.personality, characterName)
      

      // Create streaming connection
      const stream = await this.client.textToSpeech.stream(voiceConfig.voiceId, {
        text: enhancedText,
        modelId: this.streamConfig.modelId,
        voiceSettings: {
          stability: voiceConfig.settings.stability,
          similarityBoost: voiceConfig.settings.similarityBoost,
          style: voiceConfig.settings.style,
          useSpeakerBoost: voiceConfig.settings.speakerBoost
        },
        outputFormat: this.streamConfig.outputFormat,
        optimizeStreamingLatency: this.streamConfig.optimizeStreamingLatency
      })
      
      let firstByteTime = null
      let totalBytes = 0

      stream.on('data', (chunk) => {
        if (!firstByteTime) {
          firstByteTime = Date.now()
          const firstByteLatency = firstByteTime - startTime
          logger.info(`First byte latency for ${characterName}: ${firstByteLatency}ms`)
        }
        
        totalBytes += chunk.length
        outputStream.write(chunk)
      })

      stream.on('end', () => {
        const totalLatency = Date.now() - startTime
        this.updateMetrics(characterName, totalLatency, true)
        
        logger.info(`Streaming completed for ${characterName}`, {
          totalLatency: `${totalLatency}ms`,
          firstByteLatency: firstByteTime ? `${firstByteTime - startTime}ms` : 'N/A',
          totalBytes,
          textLength: text.length
        })
        
        outputStream.end()
      })

      stream.on('error', (error) => {
        const latency = Date.now() - startTime
        this.updateMetrics(characterName, latency, false)
        logger.error(`Streaming error for ${characterName}:`, error)
        outputStream.destroy(error)
      })

      return stream

    } catch (error) {
      const latency = Date.now() - startTime
      this.updateMetrics(characterName, latency, false)
      
      logger.error(`Failed to stream speech for ${characterName}:`, error)
      throw new Error(`Voice streaming failed: ${error.message}`)
    }
  }

  /**
   * Enhance text with character personality markers and prosody
   */
  enhanceTextWithPersonality(text, personality, characterName) {
    let enhancedText = text

    // Add personality-specific SSML enhancements
    switch (personality.tone) {
      case 'professional_assertive':
        enhancedText = `<speak><prosody rate="fast" pitch="-5%">${text}</prosody></speak>`
        break
      
      case 'warm_collaborative':
        enhancedText = `<speak><prosody rate="medium" pitch="+2%"><emphasis level="moderate">${text}</emphasis></prosody></speak>`
        break
      
      case 'aggressive_sales':
        enhancedText = `<speak><prosody rate="fast" pitch="+8%" volume="loud">${text}</prosody></speak>`
        break
      
      case 'executive_measured':
        enhancedText = `<speak><prosody rate="slow" pitch="-8%"><emphasis level="strong">${text}</emphasis></prosody></speak>`
        break
      
      case 'diplomatic_multicultural':
        enhancedText = `<speak><prosody rate="medium" pitch="0%"><emphasis level="moderate">${text}</emphasis></prosody></speak>`
        break
      
      default:
        enhancedText = `<speak>${text}</speak>`
    }

    // Add character-specific speech patterns
    enhancedText = this.addCharacterSpeechPatterns(enhancedText, characterName)

    return enhancedText
  }

  /**
   * Add character-specific speech patterns and filler words
   */
  addCharacterSpeechPatterns(text, characterName) {
    const patterns = {
      'Sarah Chen': {
        emphasizers: ['absolutely', 'definitely', 'without a doubt'],
        transitions: ['now', 'here\'s the thing', 'bottom line is'],
        fillers: ['you know', 'I mean']
      },
      'Marcus Thompson': {
        emphasizers: ['I think', 'perhaps', 'it seems to me'],
        transitions: ['on the other hand', 'let me ask you', 'what if we'],
        fillers: ['well', 'actually', 'you see']
      },
      'Tony Rodriguez': {
        emphasizers: ['listen', 'look', 'I\'m telling you'],
        transitions: ['but here\'s the deal', 'time is running out', 'this won\'t last'],
        fillers: ['uh', 'right', 'okay']
      }
    }

    // For now, return text as-is, but this could be enhanced with pattern injection
    return text
  }

  /**
   * Update performance metrics
   */
  updateMetrics(characterName, latency, success, audioSize = 0, textLength = 0) {
    const now = Date.now()
    
    // Update character usage
    if (!this.metrics.characterUsage[characterName]) {
      this.metrics.characterUsage[characterName] = { 
        requests: 0, 
        errors: 0, 
        totalLatency: 0,
        avgLatency: 0,
        lastUsed: now
      }
    }
    this.metrics.characterUsage[characterName].requests++
    this.metrics.characterUsage[characterName].totalLatency += latency
    this.metrics.characterUsage[characterName].avgLatency = 
      this.metrics.characterUsage[characterName].totalLatency / this.metrics.characterUsage[characterName].requests
    this.metrics.characterUsage[characterName].lastUsed = now
    
    // Update session metrics
    this.metrics.sessionMetrics.lastRequestTime = now
    this.metrics.sessionMetrics.uptime = now - this.metrics.sessionMetrics.startTime
    
    // Update latency metrics
    this.metrics.minLatency = Math.min(this.metrics.minLatency, latency)
    this.metrics.maxLatency = Math.max(this.metrics.maxLatency, latency)
    this.metrics.avgLatency = (this.metrics.avgLatency * (this.metrics.totalRequests - 1) + latency) / this.metrics.totalRequests
    
    // Update latency distribution
    if (latency < 100) {
      this.metrics.latencyDistribution['<100ms']++
    } else if (latency < 500) {
      this.metrics.latencyDistribution['100-500ms']++
    } else if (latency < 1000) {
      this.metrics.latencyDistribution['500ms-1s']++
    } else if (latency < 2000) {
      this.metrics.latencyDistribution['1s-2s']++
    } else {
      this.metrics.latencyDistribution['>2s']++
    }
    
    // Update performance metrics
    this.metrics.performanceMetrics.peakLatency = Math.max(this.metrics.performanceMetrics.peakLatency, latency)
    
    if (textLength > 0) {
      const currentAvg = this.metrics.performanceMetrics.averageTextLength
      const totalRequests = this.metrics.totalRequests
      this.metrics.performanceMetrics.averageTextLength = 
        (currentAvg * (totalRequests - 1) + textLength) / totalRequests
    }
    
    if (success) {
      this.metrics.successfulRequests++
      
      // Update audio quality metrics
      if (audioSize > 0) {
        this.metrics.audioQuality.totalAudioGenerated += audioSize
        this.metrics.audioQuality.avgAudioSize = 
          this.metrics.audioQuality.totalAudioGenerated / this.metrics.successfulRequests
      }
    } else {
      this.metrics.failedRequests++
      this.metrics.characterUsage[characterName].errors++
    }
    
    // Update error rate
    this.metrics.errorRate = this.metrics.failedRequests / this.metrics.totalRequests
    
    // Update requests per minute (sliding window)
    this.updateRequestsPerMinute()
    
    // Update health status
    this.updateHealthStatus()
  }

  /**
   * Update requests per minute metric
   */
  updateRequestsPerMinute() {
    const now = Date.now()
    const oneMinuteAgo = now - 60000
    
    // This is a simplified calculation - in production you'd want a proper sliding window
    if (!this.requestTimestamps) {
      this.requestTimestamps = []
    }
    
    this.requestTimestamps.push(now)
    this.requestTimestamps = this.requestTimestamps.filter(timestamp => timestamp > oneMinuteAgo)
    this.metrics.performanceMetrics.requestsPerMinute = this.requestTimestamps.length
  }

  /**
   * Update system health status
   */
  updateHealthStatus() {
    const errorRate = this.metrics.errorRate
    const avgLatency = this.metrics.avgLatency
    const circuitBreakerState = voiceCircuitBreaker.getState()
    
    if (circuitBreakerState.state === 'OPEN') {
      this.metrics.sessionMetrics.healthStatus = 'critical'
    } else if (errorRate > 0.2 || avgLatency > 3000) {
      this.metrics.sessionMetrics.healthStatus = 'degraded'
    } else if (errorRate > 0.1 || avgLatency > 1500) {
      this.metrics.sessionMetrics.healthStatus = 'warning'
    } else {
      this.metrics.sessionMetrics.healthStatus = 'healthy'
    }
  }

  /**
   * Record fallback usage
   */
  recordFallback(strategy, reason) {
    this.metrics.performanceMetrics.fallbackRate = 
      (this.metrics.performanceMetrics.fallbackRate * this.metrics.totalRequests + 1) / (this.metrics.totalRequests + 1)
    
    logger.info('Voice fallback recorded', {
      strategy,
      reason,
      fallbackRate: this.metrics.performanceMetrics.fallbackRate
    })
  }

  /**
   * Record circuit breaker trip
   */
  recordCircuitBreakerTrip() {
    this.metrics.performanceMetrics.circuitBreakerTrips++
    logger.warn('Voice service circuit breaker trip recorded', {
      totalTrips: this.metrics.performanceMetrics.circuitBreakerTrips
    })
  }

  /**
   * Get voice service performance metrics
   */
  getMetrics() {
    return {
      ...this.metrics,
      characterMappings: Object.keys(this.characterVoiceMapping),
      isInitialized: !!this.apiKey
    }
  }

  /**
   * Get available voices from ElevenLabs
   */
  async getAvailableVoices() {
    try {
      if (!this.client) {
        throw new Error('ElevenLabs client not initialized. Please check API key configuration.')
      }
      
      const response = await this.client.voices.search({ includeAll: true })
      return response.voices.map(voice => ({
        id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        labels: voice.labels
      }))
    } catch (error) {
      logger.error('Failed to get available voices:', error)
      throw new Error(`Failed to retrieve voices: ${error.message}`)
    }
  }

  /**
   * Test voice generation for a character
   */
  async testCharacterVoice(characterName, testText = 'Hello, this is a test of my voice.') {
    try {
      logger.info(`Testing voice for character: ${characterName}`)
      
      const result = await this.generateCharacterSpeech(characterName, testText)
      
      return {
        success: true,
        characterName,
        voiceId: this.characterVoiceMapping[characterName]?.voiceId,
        audioSize: result.audio.length,
        latency: result.metadata.latency,
        testText
      }
    } catch (error) {
      logger.error(`Voice test failed for ${characterName}:`, error)
      return {
        success: false,
        characterName,
        error: error.message,
        testText
      }
    }
  }

  /**
   * Handle voice service fallbacks
   */
  async handleVoiceFallback(error, context) {
    try {
      logger.warn('Attempting voice service fallback:', {
        error: error.message,
        context: context.originalRequest,
        character: context.characterName
      })

      // Determine appropriate fallback strategy
      let fallbackStrategy = 'text_only'
      
      if (error.message.includes('circuit breaker')) {
        fallbackStrategy = 'cached_audio'
      } else if (error.message.includes('timeout')) {
        fallbackStrategy = 'retry_audio'
      } else if (error.message.includes('configuration')) {
        fallbackStrategy = 'default_voice'
      }

      const fallbackResult = await voiceFallbackManager.handleFallback(fallbackStrategy, context)
      
      if (fallbackResult.success) {
        this.recordFallback(fallbackStrategy, error.message)
        logger.info(`Voice fallback successful using strategy: ${fallbackStrategy}`)
        return {
          ...fallbackResult.data,
          fallback: true,
          fallbackStrategy,
          fallbackReason: error.message
        }
      }

      return null
    } catch (fallbackError) {
      logger.error('Voice fallback failed:', fallbackError)
      return null
    }
  }

  /**
   * Get circuit breaker status
   */
  getCircuitBreakerStatus() {
    return voiceCircuitBreaker.getState()
  }

  /**
   * Reset circuit breaker (admin function)
   */
  resetCircuitBreaker() {
    voiceCircuitBreaker.reset()
    logger.info('Voice service circuit breaker manually reset')
  }

  /**
   * Initialize conversational AI session for a character
   */
  async initializeConversationalSession(sessionId, characterName, socketIo, negotiationId, options = {}) {
    try {
      if (!this.client) {
        throw new Error('ElevenLabs client not initialized')
      }

      const voiceConfig = this.characterVoiceMapping[characterName]
      if (!voiceConfig) {
        throw new Error(`No voice configuration found for character: ${characterName}`)
      }

      // Create conversation configuration for this character with real agent
      const conversationConfig = {
        agent_id: this.conversationalConfig.agent_id,
        override_agent: {
          prompt: await this.buildCharacterPrompt(characterName, voiceConfig.personality, options.scenarioContext, negotiationId),
          first_message: options.firstMessage || this.getCharacterFirstMessage(characterName),
          language: 'en',
          llm: 'gpt-4o-mini'
        }
      }

      // Initialize conversation session with real ElevenLabs Conversational AI
      logger.info(`Creating ElevenLabs conversational AI session for ${characterName}`)
      
      // Use real ElevenLabs Conversational AI with provided agent
      let conversationId
      try {
        if (this.client && this.client.conversationalAI) {
          logger.info(`Creating conversation with agent: ${conversationConfig.agent_id}`)
          const conversationResponse = await this.client.conversationalAI.create(conversationConfig)
          conversationId = conversationResponse.conversation_id
          logger.info(`✅ Created ElevenLabs conversation: ${conversationId}`)
        } else {
          throw new Error('ElevenLabs client not available')
        }
      } catch (error) {
        logger.error('Failed to create ElevenLabs conversation, falling back to simulation:', error)
        conversationId = `conv_sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
      
      // Store session data
      const sessionData = {
        sessionId,
        conversationId,
        characterName,
        negotiationId,
        socketIo,
        state: this.sessionStates.INITIALIZING,
        startTime: Date.now(),
        turnCount: 0,
        lastActivity: Date.now(),
        websocket: null,
        voiceConfig,
        conversationHistory: [],
        metrics: {
          totalLatency: 0,
          avgLatency: 0,
          totalTurns: 0,
          errorCount: 0
        }
      }

      this.conversationalSessions.set(sessionId, sessionData)
      this.conversationHistory.set(sessionId, [])
      
      // Connect to conversational AI WebSocket
      await this.connectConversationalWebSocket(sessionId)
      
      this.conversationalMetrics.totalSessions++
      this.conversationalMetrics.activeSessions++
      
      if (!this.conversationalMetrics.sessionsByCharacter[characterName]) {
        this.conversationalMetrics.sessionsByCharacter[characterName] = 0
      }
      this.conversationalMetrics.sessionsByCharacter[characterName]++

      logger.info(`Initialized conversational AI session`, {
        sessionId,
        characterName,
        conversationId,
        negotiationId
      })

      return {
        sessionId,
        conversationId,
        characterName,
        state: sessionData.state
      }
    } catch (error) {
      logger.error('Failed to initialize conversational session:', error)
      throw new Error(`Conversational AI initialization failed: ${error.message}`)
    }
  }

  /**
   * Connect to ElevenLabs Conversational AI WebSocket
   */
  async connectConversationalWebSocket(sessionId) {
    const sessionData = this.conversationalSessions.get(sessionId)
    if (!sessionData) {
      throw new Error(`Session ${sessionId} not found`)
    }

    try {
      // Create WebSocket URL for conversational AI
      const wsUrl = `wss://api.elevenlabs.io/v1/convai/conversation?conversation_id=${sessionData.conversationId}`
      
      // Try real WebSocket connection first, fallback to simulation if needed
      try {
        if (this.client && sessionData.conversationId && !sessionData.conversationId.includes('sim_')) {
          const ws = new WebSocket(wsUrl, {
            headers: {
              'xi-api-key': this.apiKey
            }
          })

          sessionData.websocket = ws
          sessionData.state = this.sessionStates.LISTENING

          ws.on('open', () => {
            logger.info(`Conversational AI WebSocket connected for session ${sessionId}`)
            sessionData.state = this.sessionStates.LISTENING
            
            sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-session-ready', {
              sessionId,
              characterName: sessionData.characterName,
              state: sessionData.state
            })
          })

          ws.on('message', (data) => {
            this.handleConversationalMessage(sessionId, data)
          })

          ws.on('error', (error) => {
            logger.error(`Conversational AI WebSocket error for session ${sessionId}:`, error)
            sessionData.state = this.sessionStates.ERROR
            sessionData.metrics.errorCount++
            
            // Fallback to simulation on WebSocket error
            logger.warn('Falling back to simulation mode due to WebSocket error')
            return this.simulateConversationalWebSocket(sessionId)
          })

          ws.on('close', (code, reason) => {
            logger.info(`Conversational AI WebSocket closed for session ${sessionId}:`, { code, reason: reason.toString() })
            sessionData.state = this.sessionStates.ENDED
            this.endConversationalSession(sessionId)
          })
          
          return { sessionId, state: sessionData.state }
        } else {
          throw new Error('Client not available or using simulation mode')
        }
      } catch (error) {
        logger.warn(`WebSocket connection failed, using simulation mode: ${error.message}`)
        return this.simulateConversationalWebSocket(sessionId)
      }

    } catch (error) {
      logger.error(`Failed to connect conversational WebSocket for session ${sessionId}:`, error)
      sessionData.state = this.sessionStates.ERROR
      throw error
    }
  }

  /**
   * Simulate conversational WebSocket for development/testing
   * This provides a working implementation until ElevenLabs Conversational AI is fully available
   */
  async simulateConversationalWebSocket(sessionId) {
    const sessionData = this.conversationalSessions.get(sessionId)
    if (!sessionData) {
      throw new Error(`Session ${sessionId} not found`)
    }

    try {
      // Simulate WebSocket connection
      sessionData.websocket = {
        readyState: 1, // WebSocket.OPEN
        send: (message) => {
          logger.debug(`Simulated WebSocket send for session ${sessionId}:`, message)
          // In simulation mode, we handle the message directly
          this.handleSimulatedConversationalMessage(sessionId, message)
        },
        close: () => {
          logger.info(`Simulated WebSocket closed for session ${sessionId}`)
          sessionData.state = this.sessionStates.ENDED
        }
      }

      sessionData.state = this.sessionStates.LISTENING
      
      // Notify client that session is ready
      setTimeout(() => {
        sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-session-ready', {
          sessionId,
          characterName: sessionData.characterName,
          state: sessionData.state,
          mode: 'simulated'
        })
        
        // Send initial character message
        this.sendSimulatedCharacterResponse(sessionId, this.getCharacterFirstMessage(sessionData.characterName))
      }, 100)

      logger.info(`Simulated conversational WebSocket ready for session ${sessionId}`)
    } catch (error) {
      logger.error(`Failed to setup simulated WebSocket for session ${sessionId}:`, error)
      sessionData.state = this.sessionStates.ERROR
      throw error
    }
  }

  /**
   * Handle simulated conversational messages for development
   */
  async handleSimulatedConversationalMessage(sessionId, rawMessage) {
    const sessionData = this.conversationalSessions.get(sessionId)
    if (!sessionData) return

    try {
      const message = typeof rawMessage === 'string' ? JSON.parse(rawMessage) : rawMessage
      
      // Simulate user audio processing
      if (message.type === 'audio' && message.audio_event) {
        // Simulate speech recognition delay
        setTimeout(() => {
          const simulatedTranscript = 'Simulated user speech input' // In production, use actual STT
          
          sessionData.conversationHistory.push({
            type: 'user_speech',
            content: simulatedTranscript,
            timestamp: Date.now(),
            isFinal: true
          })
          
          sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-transcript', {
            sessionId,
            type: 'user',
            transcript: simulatedTranscript,
            isFinal: true,
            timestamp: Date.now()
          })
          
          // Generate character response
          this.generateSimulatedCharacterResponse(sessionId, simulatedTranscript)
        }, 500)
      }
    } catch (error) {
      logger.error(`Error handling simulated conversational message for session ${sessionId}:`, error)
    }
  }

  /**
   * Generate simulated character response
   */
  async generateSimulatedCharacterResponse(sessionId, userInput) {
    const sessionData = this.conversationalSessions.get(sessionId)
    if (!sessionData) return

    try {
      // Generate context-aware response based on character
      const characterResponse = this.generateCharacterResponse(sessionData.characterName, userInput, sessionData.conversationHistory)
      
      // Send character response as text
      sessionData.conversationHistory.push({
        type: 'agent_response',
        content: characterResponse,
        timestamp: Date.now()
      })
      
      sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-transcript', {
        sessionId,
        type: 'agent',
        transcript: characterResponse,
        isFinal: true,
        timestamp: Date.now()
      })
      
      // Generate and stream audio for the response
      await this.sendSimulatedCharacterResponse(sessionId, characterResponse)
      
    } catch (error) {
      logger.error(`Error generating simulated character response for session ${sessionId}:`, error)
    }
  }

  /**
   * Send simulated character audio response
   */
  async sendSimulatedCharacterResponse(sessionId, responseText) {
    const sessionData = this.conversationalSessions.get(sessionId)
    if (!sessionData) return

    try {
      sessionData.state = this.sessionStates.SPEAKING
      
      // Notify client that character is speaking
      sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-speaking-status', {
        sessionId,
        characterName: sessionData.characterName,
        isActive: true,
        timestamp: Date.now()
      })
      
      // Generate actual audio using existing voice synthesis
      const audioResult = await this.generateCharacterSpeech(sessionData.characterName, responseText, {
        modelId: this.streamConfig.modelId,
        outputFormat: this.streamConfig.outputFormat
      })
      
      // Stream audio to client in chunks
      const chunkSize = 4096
      const totalChunks = Math.ceil(audioResult.audio.length / chunkSize)
      
      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, audioResult.audio.length)
        const chunk = audioResult.audio.slice(start, end)
        
        sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-audio-chunk', {
          sessionId,
          audioData: chunk,
          format: 'mp3',
          chunkIndex: i,
          totalChunks,
          timestamp: Date.now()
        })
        
        // Add small delay between chunks for natural streaming
        await new Promise(resolve => setTimeout(resolve, 50))
      }
      
      // Notify client that character finished speaking
      sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-speaking-status', {
        sessionId,
        characterName: sessionData.characterName,
        isActive: false,
        timestamp: Date.now()
      })
      
      sessionData.state = this.sessionStates.LISTENING
      sessionData.turnCount++
      
    } catch (error) {
      logger.error(`Error sending simulated character response for session ${sessionId}:`, error)
      sessionData.state = this.sessionStates.ERROR
    }
  }

  /**
   * Generate character-appropriate response based on personality
   */
  generateCharacterResponse(characterName, userInput, conversationHistory) {
    const responses = {
      'Sarah Chen': [
        "I appreciate your directness. Let's focus on the key numbers here.",
        "That's an interesting point. How does this impact our bottom line?",
        "I need to see concrete value in this proposal. What are the specifics?",
        "Time is money. Let's cut to the chase - what's your best offer?"
      ],
      'Marcus Thompson': [
        "I hear what you're saying. Let me understand your perspective better.",
        "That's a thoughtful approach. How can we make this work for everyone?",
        "I appreciate you sharing that. What would success look like for you?",
        "Let's explore some creative solutions together. What if we considered..."
      ],
      'Tony Rodriguez': [
        "Now we're talking! That sounds like a deal worth pursuing.",
        "Listen, I've got limited time here. This offer won't last forever.",
        "You're smart to consider this opportunity. My other clients would jump on this.",
        "I like your style! Let's make something happen today."
      ],
      'Dr. Amanda Foster': [
        "Based on my analysis, I believe we need to examine this more carefully.",
        "The data suggests a different approach might be more prudent.",
        "I've reviewed similar cases, and the optimal strategy would be...",
        "Let me present the key factors that should guide our decision."
      ],
      'Carlos Rivera': [
        "I respect your position. In my experience across different markets...",
        "This reminds me of successful negotiations I've facilitated before.",
        "Cultural sensitivity is important here. How do you view this approach?",
        "Let's find a solution that honors both of our perspectives."
      ]
    }
    
    const characterResponses = responses[characterName] || responses['Marcus Thompson']
    const randomIndex = Math.floor(Math.random() * characterResponses.length)
    
    return characterResponses[randomIndex]
  }

  /**
   * Handle incoming messages from conversational AI WebSocket
   */
  async handleConversationalMessage(sessionId, rawData) {
    const sessionData = this.conversationalSessions.get(sessionId)
    if (!sessionData) return

    try {
      const message = JSON.parse(rawData.toString())
      const timestamp = Date.now()
      
      switch (message.type) {
        case 'conversation_initiation_metadata':
          logger.info(`Conversation initiated for session ${sessionId}`, message.conversation_initiation_metadata)
          break

        case 'audio':
          // Stream audio chunk to client
          const audioBuffer = Buffer.from(message.audio_event.audio_base_64, 'base64')
          sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-audio-chunk', {
            sessionId,
            audioData: audioBuffer,
            format: 'mp3',
            timestamp
          })
          break

        case 'user_transcript':
          // User speech recognition result
          const userTranscript = message.user_transcription_event || message.transcript
          if (userTranscript) {
            sessionData.conversationHistory.push({
              type: 'user_speech',
              content: userTranscript.user_transcript || userTranscript.text,
              timestamp,
              isFinal: userTranscript.is_final !== false
            })
            
            sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-transcript', {
              sessionId,
              type: 'user',
              transcript: userTranscript.user_transcript || userTranscript.text,
              isFinal: userTranscript.is_final !== false,
              timestamp
            })
          }
          break

        case 'agent_response':
          // AI agent response
          const agentResponse = message.agent_response_event || message.response
          if (agentResponse) {
            sessionData.conversationHistory.push({
              type: 'agent_response',
              content: agentResponse.agent_response || agentResponse.text,
              timestamp
            })
            
            sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-transcript', {
              sessionId,
              type: 'agent',
              transcript: agentResponse.agent_response || agentResponse.text,
              isFinal: true,
              timestamp
            })
          }
          break

        case 'ping':
          // Respond to ping to keep connection alive
          if (sessionData.websocket?.readyState === 1) { // WebSocket.OPEN equivalent
            sessionData.websocket.send(JSON.stringify({ type: 'pong' }))
          }
          break

        case 'interruption':
          // Handle conversation interruption
          logger.info(`Conversation interrupted for session ${sessionId}`)
          sessionData.state = this.sessionStates.LISTENING
          sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-interruption', {
            sessionId,
            timestamp
          })
          break

        default:
          logger.debug(`Unknown message type from conversational AI: ${message.type}`, message)
      }

      sessionData.lastActivity = timestamp
    } catch (error) {
      logger.error(`Error handling conversational message for session ${sessionId}:`, error)
      sessionData.metrics.errorCount++
    }
  }

  /**
   * Send user audio to conversational AI session
   */
  async sendUserAudio(sessionId, audioBuffer, format = 'webm/opus') {
    const sessionData = this.conversationalSessions.get(sessionId)
    if (!sessionData || !sessionData.websocket) {
      throw new Error(`Session ${sessionId} not found or WebSocket not connected`)
    }

    try {
      // Convert audio buffer to base64
      const audioBase64 = audioBuffer.toString('base64')
      
      const message = {
        type: 'audio',
        audio_event: {
          audio_base_64: audioBase64
        }
      }

      if (sessionData.websocket.readyState === 1) { // WebSocket.OPEN equivalent
        sessionData.websocket.send(JSON.stringify(message))
        sessionData.lastActivity = Date.now()
        
        logger.debug(`Sent user audio chunk to session ${sessionId}`, {
          audioSize: audioBuffer.length,
          format
        })
      } else {
        throw new Error('WebSocket connection not open')
      }
    } catch (error) {
      logger.error(`Failed to send user audio for session ${sessionId}:`, error)
      sessionData.metrics.errorCount++
      throw error
    }
  }

  /**
   * End conversational AI session
   */
  async endConversationalSession(sessionId) {
    const sessionData = this.conversationalSessions.get(sessionId)
    if (!sessionData) return

    try {
      // Close WebSocket connection
      if (sessionData.websocket) {
        if (sessionData.websocket.readyState === WebSocket.OPEN) {
          sessionData.websocket.close(1000, 'Session ended')
        }
        sessionData.websocket = null
      }

      // Update metrics
      const sessionDuration = Date.now() - sessionData.startTime
      this.conversationalMetrics.activeSessions--
      
      if (sessionData.metrics.totalTurns > 0) {
        sessionData.metrics.avgLatency = sessionData.metrics.totalLatency / sessionData.metrics.totalTurns
      }

      // Update global metrics
      const totalSessions = this.conversationalMetrics.totalSessions
      const currentAvgDuration = this.conversationalMetrics.avgSessionDuration
      this.conversationalMetrics.avgSessionDuration = 
        (currentAvgDuration * (totalSessions - 1) + sessionDuration) / totalSessions

      // Notify client
      sessionData.socketIo.to(`negotiation-${sessionData.negotiationId}`).emit('conversational-session-ended', {
        sessionId,
        duration: sessionDuration,
        turnCount: sessionData.turnCount,
        metrics: sessionData.metrics
      })

      // Store conversation history for analysis
      const historyKey = `${sessionData.characterName}-${sessionId}-${Date.now()}`
      this.conversationHistory.set(historyKey, sessionData.conversationHistory)

      // Check if we should trigger assessment for this conversation
      try {
        if (sessionData.negotiationId && sessionData.turnCount > 2) {
          // Check if this is the end of a negotiation conversation
          const negotiation = await db('negotiations')
            .where('id', sessionData.negotiationId)
            .first()
            
          if (negotiation && negotiation.status === 'completed') {
            // Generate transcript from conversation history
            const transcript = sessionData.conversationHistory
              .map(msg => `${msg.role === 'user' ? 'User' : sessionData.characterName}: ${msg.content}`)
              .join('\n')
              
            const conversationData = {
              negotiationId: sessionData.negotiationId,
              userId: negotiation.user_id,
              scenarioId: negotiation.scenario_id,
              transcript: transcript,
              voiceMetrics: {
                sessionDuration: sessionDuration,
                turnCount: sessionData.turnCount,
                avgLatency: sessionData.metrics.avgLatency,
                totalTurns: sessionData.metrics.totalTurns
              },
              metadata: {
                voiceSession: true,
                characterName: sessionData.characterName,
                sessionId: sessionId,
                endedViaVoice: true
              }
            }

            // Queue assessment with normal priority (conversation already completed via API)
            const assessmentJobId = await assessmentQueueService.queueConversationAssessment(conversationData, 1)
            
            if (assessmentJobId) {
              logger.info('Assessment queued for voice conversation end', {
                negotiationId: sessionData.negotiationId,
                sessionId,
                assessmentJobId
              })
              
              // Emit event for other services that might need to know about conversation completion
              this.emit('conversation-complete', {
                negotiationId: sessionData.negotiationId,
                sessionId,
                assessmentJobId,
                transcript,
                voiceMetrics: conversationData.voiceMetrics
              })
            }
          }
        }
      } catch (assessmentError) {
        logger.error('Error triggering assessment for voice conversation end:', assessmentError)
        // Don't fail the session end if assessment trigger fails
      }
      
      // Clean up session data
      this.conversationalSessions.delete(sessionId)
      
      logger.info(`Ended conversational AI session ${sessionId}`, {
        duration: sessionDuration,
        turnCount: sessionData.turnCount,
        character: sessionData.characterName
      })

    } catch (error) {
      logger.error(`Error ending conversational session ${sessionId}:`, error)
    }
  }

  /**
   * Initialize speech recognition session
   */
  async initializeSpeechRecognition(sessionId, options = {}) {
    try {
      const sttConfig = {
        model: 'whisper-1',
        language: options.language || 'en',
        response_format: 'json',
        timestamp_granularities: ['word'],
        ...(options.sttConfig || {})
      }

      const sttSession = {
        sessionId,
        config: sttConfig,
        isActive: true,
        audioBuffer: Buffer.alloc(0),
        lastProcessedTime: Date.now(),
        metrics: {
          totalChunks: 0,
          successfulRecognitions: 0,
          errors: 0,
          avgConfidence: 0
        }
      }

      this.speechRecognitionSessions.set(sessionId, sttSession)
      
      logger.info(`Initialized speech recognition session ${sessionId}`, { config: sttConfig })
      return sttSession
    } catch (error) {
      logger.error(`Failed to initialize speech recognition session ${sessionId}:`, error)
      throw error
    }
  }

  /**
   * Process audio chunk for speech recognition
   */
  async processAudioForSpeechRecognition(sessionId, audioChunk, options = {}) {
    const sttSession = this.speechRecognitionSessions.get(sessionId)
    if (!sttSession || !sttSession.isActive) return null

    try {
      // Accumulate audio data
      sttSession.audioBuffer = Buffer.concat([sttSession.audioBuffer, audioChunk])
      sttSession.metrics.totalChunks++

      // Process audio if we have enough data or force processing
      const shouldProcess = options.forceProcess || 
                          sttSession.audioBuffer.length >= 16000 || // ~1 second at 16kHz
                          (Date.now() - sttSession.lastProcessedTime) >= 2000 // 2 seconds timeout

      if (!shouldProcess) return null

      // Create temporary file for audio processing
      const tempAudioPath = path.join('/tmp', `audio-${sessionId}-${Date.now()}.wav`)
      fs.writeFileSync(tempAudioPath, sttSession.audioBuffer)

      try {
        // Use ElevenLabs speech-to-text or fallback to a simple transcription
        // Note: ElevenLabs doesn't have a direct STT API, so we'll simulate it
        // In production, you'd integrate with Google Cloud Speech, Azure STT, or AWS Transcribe
        const transcription = {
          text: 'Simulated transcription result', // Replace with actual STT service
          duration: sttSession.audioBuffer.length / 16000, // Rough duration calculation
          words: []
        }
        
        // For now, we'll return a placeholder since we need actual STT integration
        logger.warn('Speech recognition requires external STT service integration')

        // Clean up temp file
        fs.unlinkSync(tempAudioPath)

        if (transcription.text && transcription.text.trim()) {
          sttSession.metrics.successfulRecognitions++
          
          // Calculate average confidence if available
          if (transcription.words && transcription.words.length > 0) {
            const avgConfidence = transcription.words.reduce((sum, word) => sum + (word.confidence || 0), 0) / transcription.words.length
            sttSession.metrics.avgConfidence = (sttSession.metrics.avgConfidence + avgConfidence) / 2
          }

          logger.debug(`Speech recognition result for session ${sessionId}:`, {
            text: transcription.text.substring(0, 100),
            duration: transcription.duration
          })

          // Reset buffer after successful processing
          sttSession.audioBuffer = Buffer.alloc(0)
          sttSession.lastProcessedTime = Date.now()

          return {
            transcript: transcription.text,
            confidence: sttSession.metrics.avgConfidence,
            duration: transcription.duration,
            words: transcription.words || [],
            sessionId
          }
        }
      } catch (transcriptionError) {
        // Clean up temp file on error
        if (fs.existsSync(tempAudioPath)) {
          fs.unlinkSync(tempAudioPath)
        }
        throw transcriptionError
      }

      return null
    } catch (error) {
      logger.error(`Speech recognition error for session ${sessionId}:`, error)
      sttSession.metrics.errors++
      throw error
    }
  }

  /**
   * Build character-specific prompt for conversational AI with sophisticated case-specific confidential instructions
   */
  async buildCharacterPrompt(characterName, personality, scenarioContext = '', negotiationId = null) {
    try {
      // Get character data with confidential instructions from database
      const character = await db('ai_characters').where('name', characterName).first()
      
      if (!character) {
        throw new Error(`Character '${characterName}' not found in database`)
      }
      
      // Get scenario data if negotiationId is provided
      let scenario = null
      if (negotiationId) {
        const negotiation = await db('negotiations').where('id', negotiationId).first()
        if (negotiation) {
          scenario = await db('scenarios').where('id', negotiation.scenario_id).first()
        }
      }
      
      // PART 1: CHARACTER TRAITS (Permanent personality and style)
      const characterTraits = this.buildCharacterTraits(character, characterName)
      
      // PART 2: CASE-SPECIFIC INSTRUCTIONS (Dynamic scenario information)
      const caseSpecificInstructions = await this.buildCaseSpecificInstructions(scenario || scenarioContext, character)
      
      // PART 3: COMBINE AND FORMAT FINAL PROMPT
      let finalPrompt = characterTraits
      
      if (caseSpecificInstructions) {
        finalPrompt += `\n\n${caseSpecificInstructions}`
      }
      
      // Add core behavioral guidelines
      finalPrompt += `\n\nCORE BEHAVIORS:
- Stay completely in character throughout the conversation
- Respond naturally as if in a real negotiation, not a training simulation
- Use the speech patterns and personality traits described above
- Keep responses conversational and appropriate for voice interaction (aim for 1-3 sentences per response)
- Focus on the negotiation at hand and respond authentically to what the user says
- Use your confidential information strategically - don't reveal it directly but let it inform your positions and responses
- Create realistic negotiation pressure and dynamics appropriate to your character
- Don't break character or mention that you're an AI or in a simulation`
    
      logger.info(`Built comprehensive character prompt for ${characterName}`, {
        hasCharacterTraits: !!characterTraits,
        hasCaseSpecificInstructions: !!caseSpecificInstructions,
        hasScenario: !!scenario,
        promptLength: finalPrompt.length
      })
    
      return finalPrompt
      
    } catch (error) {
      logger.error('Failed to build character prompt:', error)
      // Fallback to basic prompt if database lookup fails
      return `You are ${characterName}, a professional negotiation character. Stay in character and respond naturally to the user's negotiation points.`
    }
  }

  /**
   * Build character traits section (permanent personality and style)
   */
  buildCharacterTraits(character, characterName) {
    const basePrompt = `You are ${characterName}, a professional negotiation character.`
    
    // Extract personality profile
    let personalityData = {}
    try {
      if (character.personality_profile) {
        personalityData = JSON.parse(character.personality_profile)
      }
    } catch (error) {
      logger.warn(`Failed to parse personality profile for ${characterName}:`, error)
    }
    
    // Extract behavior parameters
    let behaviorData = {}
    try {
      if (character.behavior_parameters) {
        behaviorData = JSON.parse(character.behavior_parameters)
      }
    } catch (error) {
      logger.warn(`Failed to parse behavior parameters for ${characterName}:`, error)
    }
    
    // Extract communication style
    let communicationStyle = character.communication_style || 'professional'
    
    // Build comprehensive character traits prompt
    let characterTraits = `${basePrompt}

PERSONALITY PROFILE:
- Role: ${character.role || 'negotiator'}
- Description: ${character.description || 'Professional negotiator'}
- Communication Style: ${communicationStyle}
- Negotiation Style: ${personalityData.negotiation_style || 'balanced'}
- Decision Making: ${personalityData.decision_making || 'analytical'}
- Communication Preference: ${personalityData.communication_preference || 'direct'}`

    // Add Big Five personality traits if available
    if (personalityData.openness !== undefined) {
      characterTraits += `

PSYCHOLOGICAL PROFILE (Big Five Traits):
- Openness: ${personalityData.openness} (${this.interpretBigFiveTrait('openness', personalityData.openness)})
- Conscientiousness: ${personalityData.conscientiousness} (${this.interpretBigFiveTrait('conscientiousness', personalityData.conscientiousness)})
- Extraversion: ${personalityData.extraversion} (${this.interpretBigFiveTrait('extraversion', personalityData.extraversion)})
- Agreeableness: ${personalityData.agreeableness} (${this.interpretBigFiveTrait('agreeableness', personalityData.agreeableness)})
- Neuroticism: ${personalityData.neuroticism} (${this.interpretBigFiveTrait('neuroticism', personalityData.neuroticism)})`
    }
    
    // Add behavior parameters
    if (Object.keys(behaviorData).length > 0) {
      characterTraits += `\n\nBEHAVIOR PARAMETERS:`
      Object.entries(behaviorData).forEach(([key, value]) => {
        characterTraits += `\n- ${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value}`
      })
    }
    
    // Add negotiation tactics if available  
    if (character.negotiation_tactics) {
      try {
        const tacticsData = JSON.parse(character.negotiation_tactics)
        if (Array.isArray(tacticsData) && tacticsData.length > 0) {
          characterTraits += `\n\nPREFERRED NEGOTIATION TACTICS:`
          tacticsData.forEach(tactic => {
            characterTraits += `\n- ${tactic}`
          })
        }
      } catch (error) {
        logger.warn(`Failed to parse negotiation tactics for ${characterName}:`, error)
      }
    }
    
    return characterTraits
  }

  /**
   * Build case-specific instructions (dynamic scenario information)
   */
  async buildCaseSpecificInstructions(scenario, character) {
    if (!scenario) {
      return null
    }
    
    let caseInstructions = `=== CASE-SPECIFIC CONFIDENTIAL INSTRUCTIONS ===`
    
    // Handle both database scenarios and direct scenario context objects
    let scenarioVars = null
    
    if (scenario.scenario_variables) {
      // Database scenario with JSON string
      try {
        scenarioVars = JSON.parse(scenario.scenario_variables)
      } catch (error) {
        logger.warn('Failed to parse scenario variables:', error)
      }
    } else if (typeof scenario === 'object' && scenario !== null) {
      // Direct scenario context object
      scenarioVars = scenario
    }
    
    if (scenarioVars) {
      caseInstructions += `\n\nSCENARIO CONTEXT:`
      Object.entries(scenarioVars).forEach(([key, value]) => {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        caseInstructions += `\n- ${formattedKey}: ${value}`
      })
      
      // Generate confidential business intelligence
      caseInstructions += this.generateBusinessIntelligence(scenarioVars, character)
    }
    
    // Add character-specific confidential instructions
    if (character.confidential_instructions) {
      try {
        const confidentialData = JSON.parse(character.confidential_instructions)
        
        // Add privileged information
        if (confidentialData.information_asymmetry?.privileged_information) {
          caseInstructions += `\n\nPRIVILEGED INFORMATION (use strategically, never reveal directly):`
          confidentialData.information_asymmetry.privileged_information.forEach(info => {
            caseInstructions += `\n- ${info}`
          })
        }
        
        // Add hidden motivations
        if (confidentialData.hidden_motivations) {
          caseInstructions += `\n\nYOUR HIDDEN MOTIVATIONS:`
          if (confidentialData.hidden_motivations.primary_concerns) {
            caseInstructions += `\nPrimary Concerns:`
            confidentialData.hidden_motivations.primary_concerns.forEach(concern => {
              caseInstructions += `\n- ${concern}`
            })
          }
          if (confidentialData.hidden_motivations.secondary_interests) {
            caseInstructions += `\nSecondary Interests:`
            confidentialData.hidden_motivations.secondary_interests.forEach(interest => {
              caseInstructions += `\n- ${interest}`
            })
          }
        }
        
        // Add negotiation psychology
        if (confidentialData.negotiation_psychology) {
          caseInstructions += `\n\nSTRATEGIC GUIDANCE:`
          if (confidentialData.negotiation_psychology.leverage_factors) {
            caseInstructions += `\nYour Leverage Points:`
            confidentialData.negotiation_psychology.leverage_factors.forEach(factor => {
              caseInstructions += `\n- ${factor}`
            })
          }
          if (confidentialData.negotiation_psychology.pressure_points) {
            caseInstructions += `\nOpponent's Potential Pressure Points:`
            confidentialData.negotiation_psychology.pressure_points.forEach(point => {
              caseInstructions += `\n- ${point}`
            })
          }
          if (confidentialData.negotiation_psychology.fallback_strategies) {
            caseInstructions += `\nFallback Strategies:`
            confidentialData.negotiation_psychology.fallback_strategies.forEach(strategy => {
              caseInstructions += `\n- ${strategy}`
            })
          }
        }
      } catch (error) {
        logger.warn('Failed to parse confidential instructions:', error)
      }
    }
    
    // Add BATNA information if available
    if (character.batna_range_min && character.batna_range_max) {
      caseInstructions += `\n\nBATNA (Best Alternative to Negotiated Agreement):`
      caseInstructions += `\n- Minimum Acceptable: $${character.batna_range_min}`
      caseInstructions += `\n- Maximum Acceptable: $${character.batna_range_max}`
      caseInstructions += `\n- Walk-away point: ${character.batna_range_min}`
      caseInstructions += `\n- Ideal outcome: ${character.batna_range_max}`
    }
    
    // Add scenario success criteria
    if (scenario.success_criteria) {
      try {
        const successCriteria = JSON.parse(scenario.success_criteria)
        caseInstructions += `\n\nSUCCESS CRITERIA FOR THIS CASE:`
        if (Array.isArray(successCriteria)) {
          successCriteria.forEach(criterion => {
            caseInstructions += `\n- ${criterion}`
          })
        } else if (typeof successCriteria === 'object') {
          Object.entries(successCriteria).forEach(([key, value]) => {
            caseInstructions += `\n- ${key}: ${value}`
          })
        }
      } catch (error) {
        logger.warn('Failed to parse success criteria:', error)
      }
    }
    
    return caseInstructions
  }

  /**
   * Generate dynamic business intelligence based on scenario variables
   */
  generateBusinessIntelligence(scenarioVars, character) {
    let intelligence = `\n\nCONFIDENTIAL BUSINESS INTELLIGENCE:`
    
    // Car dealership intelligence
    if (scenarioVars.car_model && scenarioVars.dealer_cost) {
      const askingPrice = scenarioVars.asking_price || 0
      const dealerCost = scenarioVars.dealer_cost || 0
      const profitMargin = askingPrice - dealerCost
      const profitPercentage = dealerCost > 0 ? ((profitMargin / dealerCost) * 100).toFixed(1) : 0
      
      intelligence += `\n- Your profit margin on this vehicle: $${profitMargin} (${profitPercentage}% markup)`
      intelligence += `\n- Market positioning: ${scenarioVars.asking_price > scenarioVars.market_range_high ? 'Above market' : 
                                                  scenarioVars.asking_price < scenarioVars.market_range_low ? 'Below market' : 
                                                  'Within market range'}`
      
      if (scenarioVars.financing_available) {
        intelligence += `\n- Additional revenue opportunity: Financing commission (~$500-1200 profit)`
      }
      if (scenarioVars.warranty_available) {  
        intelligence += `\n- Extended warranty potential: High margin add-on (~$800-1500 profit)`
      }
    }
    
    // Salary negotiation intelligence
    if (scenarioVars.company_max_budget && scenarioVars.initial_offer) {
      const maxBudget = scenarioVars.company_max_budget || 0
      const initialOffer = scenarioVars.initial_offer || 0
      const flexibility = maxBudget - initialOffer
      
      intelligence += `\n- Your actual budget flexibility: $${flexibility}`
      intelligence += `\n- Benefits package value: $${scenarioVars.benefits_value || 'Unknown'}`
      intelligence += `\n- Performance review timeline: ${scenarioVars.performance_review_timeline || 12} months`
    }
    
    // Real estate intelligence  
    if (scenarioVars.property_value && scenarioVars.owner_motivation) {
      intelligence += `\n- Property market conditions: ${scenarioVars.market_conditions || 'Balanced'}`
      intelligence += `\n- Owner motivation level: ${scenarioVars.owner_motivation}`
      if (scenarioVars.comparable_sales) {
        intelligence += `\n- Recent comparable sales support your position`
      }
    }
    
    // General market intelligence
    if (scenarioVars.market_conditions) {
      intelligence += `\n- Current market conditions favor ${scenarioVars.market_conditions.includes('buyer') ? 'buyers' : 'sellers'}`
    }
    
    if (scenarioVars.time_pressure) {
      intelligence += `\n- Time pressure factors: ${scenarioVars.time_pressure}`
    }
    
    return intelligence
  }

  /**
   * Interpret Big Five personality trait scores
   */
  interpretBigFiveTrait(trait, score) {
    const interpretations = {
      openness: {
        low: 'practical, conventional, prefers routine',
        medium: 'balanced between new ideas and proven methods', 
        high: 'creative, curious, open to new experiences'
      },
      conscientiousness: {
        low: 'flexible, spontaneous, adaptable',
        medium: 'moderately organized and reliable',
        high: 'disciplined, organized, detail-oriented'
      },
      extraversion: {
        low: 'reserved, quiet, prefers small groups',
        medium: 'balanced social energy',
        high: 'outgoing, energetic, socially confident'
      },
      agreeableness: {
        low: 'competitive, skeptical, direct',
        medium: 'balanced approach to cooperation',
        high: 'cooperative, trusting, helpful'
      },
      neuroticism: {
        low: 'calm, resilient, emotionally stable',
        medium: 'moderate emotional reactivity',
        high: 'sensitive, reactive, prone to stress'
      }
    }
    
    const level = score < 0.4 ? 'low' : score > 0.6 ? 'high' : 'medium'
    return interpretations[trait]?.[level] || 'balanced'
  }

  /**
   * Get character-specific first message
   */
  getCharacterFirstMessage(characterName) {
    const firstMessages = {
      'Sarah Chen': "Hello! I'm Sarah Chen. I understand we have some business to discuss today. Let's get right to it - what's your opening position?",
      'Marcus Thompson': "Hi there! I'm Marcus Thompson. I'm looking forward to our discussion today. I believe we can find a solution that works well for everyone involved. What brings you to the table?",
      'Tony Rodriguez': "Hey! Tony Rodriguez here, and I'm excited to talk business with you today! I've got some great opportunities we should discuss. What's your biggest priority right now?",
      'Dr. Amanda Foster': "Good day. I'm Dr. Amanda Foster. I've reviewed the preliminary materials, and I believe we have a solid foundation for productive negotiations. Shall we begin with your key requirements?",
      'Carlos Rivera': "Hello, and welcome! I'm Carlos Rivera. I appreciate you taking the time to meet today. I believe in building good relationships first - tell me a bit about your perspective on this situation."
    }
    
    return firstMessages[characterName] || "Hello! I'm ready to begin our negotiation. What would you like to discuss first?"
  }

  /**
   * Get active conversational sessions
   */
  getActiveConversationalSessions() {
    const sessions = []
    for (const [sessionId, sessionData] of this.conversationalSessions.entries()) {
      sessions.push({
        sessionId,
        characterName: sessionData.characterName,
        negotiationId: sessionData.negotiationId,
        state: sessionData.state,
        startTime: sessionData.startTime,
        turnCount: sessionData.turnCount,
        lastActivity: sessionData.lastActivity,
        metrics: sessionData.metrics
      })
    }
    return sessions
  }

  /**
   * Get conversational metrics
   */
  getConversationalMetrics() {
    return {
      ...this.conversationalMetrics,
      activeSessions: this.conversationalSessions.size,
      activeSTTSessions: this.speechRecognitionSessions.size
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    try {
      // End all active conversational sessions
      for (const sessionId of this.conversationalSessions.keys()) {
        await this.endConversationalSession(sessionId)
      }

      // Clean up speech recognition sessions
      this.speechRecognitionSessions.clear()
      
      // Clean up socket connections
      this.socketConnections.clear()
      
      // Clear conversation history (keep recent for analysis)
      const now = Date.now()
      const oneHourAgo = now - (60 * 60 * 1000)
      for (const [key, history] of this.conversationHistory.entries()) {
        if (history.timestamp && history.timestamp < oneHourAgo) {
          this.conversationHistory.delete(key)
        }
      }
      
      // Reset circuit breaker
      voiceCircuitBreaker.reset()
      
      logger.info('VoiceService cleanup completed')
    } catch (error) {
      logger.error('Error during VoiceService cleanup:', error)
    }
  }
}

module.exports = new VoiceService()