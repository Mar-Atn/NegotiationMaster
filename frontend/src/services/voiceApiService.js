import apiClient from './apiService'

class VoiceApiService {
  constructor() {
    this.isInitialized = false
    this.characterVoiceConfigs = new Map()
    this.metrics = {
      totalRequests: 0,
      avgLatency: 0,
      errorRate: 0
    }
  }

  /**
   * Initialize the voice API service
   */
  async initialize() {
    try {
      console.log('🎵 Initializing VoiceApiService...')
      
      // Fetch character voice configurations
      await this.loadCharacterVoiceConfigs()
      
      // Test API connectivity
      await this.testConnection()
      
      this.isInitialized = true
      console.log('✅ VoiceApiService initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize VoiceApiService:', error)
      throw error
    }
  }

  /**
   * Load character voice configurations from backend
   */
  async loadCharacterVoiceConfigs() {
    try {
      const response = await apiClient.get('/voice/character-configs')
      const configs = response.data.data
      
      // Store configurations in map for quick lookup
      configs.forEach(config => {
        if (config.hasVoiceMapping) {
          this.characterVoiceConfigs.set(config.character.id, {
            character: config.character,
            voiceConfig: config.voiceConfig
          })
        }
      })
      
      console.log(`📋 Loaded ${this.characterVoiceConfigs.size} character voice configurations:`)
      this.characterVoiceConfigs.forEach((config, id) => {
        console.log(`  - ${config.character.name}: ${config.voiceConfig.personality.tone}`)
      })
      
      return configs
      
    } catch (error) {
      console.error('❌ Failed to load character voice configs:', error)
      throw error
    }
  }

  /**
   * Test connection to voice service
   */
  async testConnection() {
    try {
      const response = await apiClient.get('/voice/metrics')
      const metrics = response.data.data
      
      if (!metrics.isInitialized) {
        throw new Error('Voice service not initialized on backend')
      }
      
      console.log('📊 Voice service metrics:', metrics)
      return metrics
      
    } catch (error) {
      console.error('❌ Voice service connection test failed:', error)
      throw error
    }
  }

  /**
   * Generate speech for a character
   */
  async generateCharacterSpeech(characterId, text, options = {}) {
    const startTime = Date.now()
    
    try {
      this.metrics.totalRequests++
      
      if (!this.isInitialized) {
        await this.initialize()
      }

      const character = this.characterVoiceConfigs.get(characterId)
      if (!character) {
        throw new Error(`No voice configuration found for character: ${characterId}`)
      }

      console.log(`🎤 Generating speech for ${character.character.name}:`, text.substring(0, 50) + '...')
      
      const response = await apiClient.post('/voice/generate', {
        characterId,
        text,
        options
      })

      const latency = Date.now() - startTime
      this.updateMetrics(latency, true)

      const result = response.data.data
      
      console.log(`✅ Speech generated for ${character.character.name}`, {
        latency: `${latency}ms`,
        audioSize: result.audio.length,
        voiceId: result.metadata.voiceId
      })

      return {
        audioData: this.base64ToArrayBuffer(result.audio),
        audioFormat: result.audioFormat,
        metadata: result.metadata,
        character: result.character,
        latency
      }

    } catch (error) {
      const latency = Date.now() - startTime
      this.updateMetrics(latency, false)
      
      console.error('❌ Failed to generate character speech:', error)
      throw new Error(`Voice generation failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Stream real-time speech for character
   */
  async streamCharacterSpeech(characterId, text, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      const character = this.characterVoiceConfigs.get(characterId)
      if (!character) {
        throw new Error(`No voice configuration found for character: ${characterId}`)
      }

      console.log(`🎙️ Streaming speech for ${character.character.name}`)
      
      // Create a fetch request for streaming
      const response = await fetch('/api/voice/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          characterId,
          text,
          options
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      // Return the readable stream
      return response.body

    } catch (error) {
      console.error('❌ Failed to stream character speech:', error)
      throw new Error(`Voice streaming failed: ${error.message}`)
    }
  }

  /**
   * Generate speech for negotiation message
   */
  async generateNegotiationSpeech(negotiationId, messageId, options = {}) {
    const startTime = Date.now()
    
    try {
      this.metrics.totalRequests++
      
      if (!this.isInitialized) {
        await this.initialize()
      }

      console.log(`🎯 Generating speech for negotiation message: ${messageId}`)
      
      const response = await apiClient.post(`/voice/negotiations/${negotiationId}/messages/${messageId}`, {
        options
      })

      const latency = Date.now() - startTime
      this.updateMetrics(latency, true)

      const result = response.data.data
      
      console.log(`✅ Negotiation speech generated`, {
        latency: `${latency}ms`,
        audioSize: result.audio.length,
        character: result.character.name
      })

      return {
        audioData: this.base64ToArrayBuffer(result.audio),
        audioFormat: result.audioFormat,
        metadata: result.metadata,
        message: result.message,
        character: result.character,
        latency
      }

    } catch (error) {
      const latency = Date.now() - startTime
      this.updateMetrics(latency, false)
      
      console.error('❌ Failed to generate negotiation speech:', error)
      throw new Error(`Negotiation speech generation failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Test voice generation for a character
   */
  async testCharacterVoice(characterId, testText = 'Hello, this is a test of my voice.') {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      const character = this.characterVoiceConfigs.get(characterId)
      if (!character) {
        throw new Error(`No voice configuration found for character: ${characterId}`)
      }

      console.log(`🧪 Testing voice for ${character.character.name}`)
      
      const response = await apiClient.post('/voice/test', {
        characterId,
        testText
      })

      return response.data.data

    } catch (error) {
      console.error('❌ Voice test failed:', error)
      throw new Error(`Voice test failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Batch generate speech for multiple messages
   */
  async batchGenerateSpeech(messages, options = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      console.log(`📦 Batch generating speech for ${messages.length} messages`)
      
      const response = await apiClient.post('/voice/batch', {
        messages,
        options
      })

      const results = response.data.data.results.map(result => ({
        ...result,
        audioData: result.audio ? this.base64ToArrayBuffer(result.audio) : null
      }))

      console.log(`✅ Batch speech generation completed:`, response.data.data.summary)
      
      return {
        results,
        errors: response.data.data.errors,
        summary: response.data.data.summary
      }

    } catch (error) {
      console.error('❌ Batch speech generation failed:', error)
      throw new Error(`Batch generation failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Get available ElevenLabs voices
   */
  async getAvailableVoices() {
    try {
      const response = await apiClient.get('/voice/voices')
      return response.data.data
    } catch (error) {
      console.error('❌ Failed to get available voices:', error)
      throw new Error(`Failed to retrieve voices: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Get voice service metrics
   */
  async getVoiceMetrics() {
    try {
      const response = await apiClient.get('/voice/metrics')
      return response.data.data
    } catch (error) {
      console.error('❌ Failed to get voice metrics:', error)
      throw new Error(`Failed to retrieve metrics: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Get character voice configuration
   */
  getCharacterVoiceConfig(characterId) {
    return this.characterVoiceConfigs.get(characterId)
  }

  /**
   * Get all character voice configurations
   */
  getAllCharacterVoiceConfigs() {
    return Array.from(this.characterVoiceConfigs.values())
  }

  /**
   * Play audio from base64 data
   */
  async playAudioFromBase64(base64Audio, format = 'mp3') {
    try {
      const audioData = this.base64ToArrayBuffer(base64Audio)
      const audioBlob = new Blob([audioData], { type: `audio/${format}` })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      const audio = new Audio(audioUrl)
      
      return new Promise((resolve, reject) => {
        audio.addEventListener('ended', () => {
          URL.revokeObjectURL(audioUrl)
          resolve()
        })
        
        audio.addEventListener('error', (error) => {
          URL.revokeObjectURL(audioUrl)
          reject(error)
        })
        
        audio.play()
      })
      
    } catch (error) {
      console.error('❌ Failed to play audio:', error)
      throw error
    }
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binaryString = window.atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    
    return bytes.buffer
  }

  /**
   * Update performance metrics
   */
  updateMetrics(latency, success) {
    // Update average latency
    this.metrics.avgLatency = (this.metrics.avgLatency * (this.metrics.totalRequests - 1) + latency) / this.metrics.totalRequests
    
    // Update error rate
    if (!success) {
      this.metrics.errorRate = (this.metrics.errorRate * (this.metrics.totalRequests - 1) + 1) / this.metrics.totalRequests
    }
  }

  /**
   * Get client-side metrics
   */
  getClientMetrics() {
    return {
      ...this.metrics,
      isInitialized: this.isInitialized,
      characterConfigsLoaded: this.characterVoiceConfigs.size
    }
  }

  /**
   * Check if character has voice support
   */
  hasVoiceSupport(characterId) {
    return this.characterVoiceConfigs.has(characterId)
  }

  /**
   * Get character personality info for voice
   */
  getCharacterPersonality(characterId) {
    const config = this.characterVoiceConfigs.get(characterId)
    return config?.voiceConfig?.personality || null
  }

  /**
   * Initialize conversational AI session
   */
  async initializeConversationalSession(params) {
    try {
      if (!this.isInitialized) {
        await this.initialize()
      }

      console.log('🤖 Initializing conversational AI session:', params)
      
      const response = await apiClient.post('/voice/conversational/initialize', params)
      
      console.log('✅ Conversational AI session initialized:', response.data.data)
      return response.data
      
    } catch (error) {
      console.error('❌ Failed to initialize conversational session:', error)
      throw new Error(`Conversational AI initialization failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * End conversational AI session
   */
  async endConversationalSession(sessionId) {
    try {
      console.log('🛑 Ending conversational AI session:', sessionId)
      
      const response = await apiClient.delete(`/voice/conversational/${sessionId}`)
      
      console.log('✅ Conversational AI session ended')
      return response.data
      
    } catch (error) {
      console.error('❌ Failed to end conversational session:', error)
      throw new Error(`Failed to end conversational session: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Get active conversational sessions
   */
  async getActiveConversationalSessions(negotiationId = null) {
    try {
      const params = negotiationId ? { negotiationId } : {}
      const response = await apiClient.get('/voice/conversational/sessions', { params })
      
      return response.data.data
      
    } catch (error) {
      console.error('❌ Failed to get active conversational sessions:', error)
      throw new Error(`Failed to get sessions: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Get conversational AI metrics
   */
  async getConversationalMetrics() {
    try {
      const response = await apiClient.get('/voice/conversational/metrics')
      return response.data.data
      
    } catch (error) {
      console.error('❌ Failed to get conversational metrics:', error)
      throw new Error(`Failed to get conversational metrics: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Initialize speech recognition session
   */
  async initializeSpeechRecognition(sessionId, options = {}) {
    try {
      console.log('🎯 Initializing speech recognition session:', sessionId)
      
      const response = await apiClient.post('/voice/speech-recognition/initialize', {
        sessionId,
        options
      })
      
      console.log('✅ Speech recognition session initialized')
      return response.data.data
      
    } catch (error) {
      console.error('❌ Failed to initialize speech recognition:', error)
      throw new Error(`Speech recognition initialization failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Process audio chunk for speech recognition
   */
  async processAudioChunk(sessionId, audioData, options = {}) {
    try {
      // Convert audio data to base64 if it's not already
      const base64Audio = audioData instanceof ArrayBuffer 
        ? this.arrayBufferToBase64(audioData)
        : audioData
      
      const response = await apiClient.post(`/voice/speech-recognition/${sessionId}/process`, {
        audioData: base64Audio,
        options
      })
      
      return response.data.data
      
    } catch (error) {
      console.error('❌ Failed to process audio chunk:', error)
      throw new Error(`Audio processing failed: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Get conversation history for a session
   */
  async getConversationHistory(sessionId, limit = 50, offset = 0) {
    try {
      const response = await apiClient.get(`/voice/conversational/${sessionId}/history`, {
        params: { limit, offset }
      })
      
      return response.data.data
      
    } catch (error) {
      console.error('❌ Failed to get conversation history:', error)
      throw new Error(`Failed to get conversation history: ${error.response?.data?.error || error.message}`)
    }
  }

  /**
   * Convert ArrayBuffer to base64
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.characterVoiceConfigs.clear()
    this.isInitialized = false
    console.log('🧹 VoiceApiService cleaned up')
  }
}

// Create singleton instance
const voiceApiService = new VoiceApiService()

export default voiceApiService