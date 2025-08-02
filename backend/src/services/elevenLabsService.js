const axios = require('axios')
const EventEmitter = require('events')
const logger = require('../config/logger')

class ElevenLabsService extends EventEmitter {
  constructor() {
    super()
    this.apiKey = process.env.ELEVENLABS_API_KEY
    this.baseUrl = 'https://api.elevenlabs.io/v1'
    this.defaultModel = 'eleven_turbo_v2_5' // Optimized for low latency
    this.voiceCache = new Map()
    this.requestQueue = []
    this.isProcessing = false
    
    if (!this.apiKey) {
      logger.warn('ElevenLabs API key not configured')
    }
  }

  /**
   * Get optimized voice settings for character personalities
   */
  getVoiceMapping() {
    return {
      // Aggressive/Competitive Characters
      aggressive_male: {
        voice_id: 'pNInz6obpgDQGcFmaJgB', // Adam - confident, strong
        settings: {
          stability: 0.75,
          similarity_boost: 0.85,
          style: 0.45,
          use_speaker_boost: true
        }
      },
      aggressive_female: {
        voice_id: 'ThT5KcBeYPX3keUQqHPh', // Dorothy - assertive, professional
        settings: {
          stability: 0.70,
          similarity_boost: 0.80,
          style: 0.50,
          use_speaker_boost: true
        }
      },
      
      // Collaborative/Friendly Characters
      collaborative_male: {
        voice_id: 'pqHfZKP75CvOlQylNhV4', // Bill - warm, approachable
        settings: {
          stability: 0.85,
          similarity_boost: 0.75,
          style: 0.25,
          use_speaker_boost: false
        }
      },
      collaborative_female: {
        voice_id: 'EXAVITQu4vr4xnSDxMaL', // Bella - friendly, engaging
        settings: {
          stability: 0.80,
          similarity_boost: 0.75,
          style: 0.30,
          use_speaker_boost: false
        }
      },
      
      // Professional/Neutral Characters
      professional_male: {
        voice_id: 'ErXwobaYiN019PkySvjV', // Antoni - clear, professional
        settings: {
          stability: 0.85,
          similarity_boost: 0.80,
          style: 0.15,
          use_speaker_boost: false
        }
      },
      professional_female: {
        voice_id: 'MF3mGyEYCl7XYWbV9V6O', // Elli - articulate, professional
        settings: {
          stability: 0.80,
          similarity_boost: 0.85,
          style: 0.20,
          use_speaker_boost: false
        }
      }
    }
  }

  /**
   * Map character personality to appropriate voice
   */
  selectVoiceForCharacter(character) {
    const personality = character.personality_profile
    const behaviorParams = character.behavior_parameters
    const communicationStyle = character.communication_style
    
    let voiceKey = 'professional_male' // default
    
    // Determine gender (simplified logic - could be enhanced)
    const isFemale = character.name.toLowerCase().includes('female') || 
                     communicationStyle.toLowerCase().includes('feminine') ||
                     ['sarah', 'jennifer', 'amanda', 'lisa', 'emily'].some(name => 
                       character.name.toLowerCase().includes(name.toLowerCase()))
    
    // Determine personality type
    const isAggressive = behaviorParams.aggressiveness > 0.6 || 
                        personality.negotiation_style.includes('aggressive') ||
                        personality.negotiation_style.includes('competitive')
    
    const isCollaborative = personality.negotiation_style.includes('collaborative') ||
                           personality.negotiation_style.includes('friendly') ||
                           behaviorParams.patience > 0.7
    
    if (isAggressive) {
      voiceKey = isFemale ? 'aggressive_female' : 'aggressive_male'
    } else if (isCollaborative) {
      voiceKey = isFemale ? 'collaborative_female' : 'collaborative_male'
    } else {
      voiceKey = isFemale ? 'professional_female' : 'professional_male'
    }
    
    return this.getVoiceMapping()[voiceKey]
  }

  /**
   * Generate speech from text with optimized settings for low latency
   */
  async generateSpeech(text, character, options = {}) {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    const startTime = Date.now()
    
    try {
      const voiceConfig = this.selectVoiceForCharacter(character)
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`
      
      // Optimize text for speech synthesis
      const optimizedText = this.optimizeTextForSpeech(text)
      
      logger.info('Generating speech', {
        requestId,
        characterId: character.id,
        characterName: character.name,
        voiceId: voiceConfig.voice_id,
        textLength: optimizedText.length,
        originalTextLength: text.length
      })

      const requestConfig = {
        method: 'POST',
        url: `${this.baseUrl}/text-to-speech/${voiceConfig.voice_id}/stream`,
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.apiKey
        },
        data: {
          text: optimizedText,
          model_id: options.model_id || this.defaultModel,
          voice_settings: {
            ...voiceConfig.settings,
            ...options.voice_settings
          },
          // Optimization flags for low latency
          optimize_streaming_latency: 4, // Maximum optimization
          output_format: 'mp3_44100_128', // Balanced quality/size
          apply_text_normalization: 'auto'
        },
        responseType: 'stream',
        timeout: 30000, // 30 second timeout
        // Connection keep-alive for better performance
        headers: {
          ...axios.defaults.headers,
          'Connection': 'keep-alive'
        }
      }

      const response = await axios(requestConfig)
      const latency = Date.now() - startTime
      
      logger.info('Speech generation completed', {
        requestId,
        latencyMs: latency,
        characterId: character.id,
        voiceId: voiceConfig.voice_id,
        success: true
      })

      // Emit performance metrics
      this.emit('speechGenerated', {
        requestId,
        characterId: character.id,
        latency,
        textLength: optimizedText.length,
        voiceId: voiceConfig.voice_id
      })

      return {
        audioStream: response.data,
        metadata: {
          requestId,
          characterId: character.id,
          voiceId: voiceConfig.voice_id,
          latency,
          textLength: optimizedText.length,
          model: options.model_id || this.defaultModel
        }
      }
      
    } catch (error) {
      const latency = Date.now() - startTime
      
      logger.error('Speech generation failed', {
        characterId: character.id,
        error: error.message,
        latencyMs: latency,
        statusCode: error.response?.status,
        responseData: error.response?.data
      })

      // Emit error metrics
      this.emit('speechError', {
        characterId: character.id,
        error: error.message,
        latency,
        statusCode: error.response?.status
      })

      throw new Error(`Speech synthesis failed: ${error.message}`)
    }
  }

  /**
   * Optimize text for better speech synthesis
   */
  optimizeTextForSpeech(text) {
    return text
      // Replace common abbreviations with full words for better pronunciation
      .replace(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)/g, '$1 dollars')
      .replace(/(\d+)%/g, '$1 percent')
      .replace(/\bw\/\b/g, 'with')
      .replace(/\betc\./g, 'etcetera')
      .replace(/\bi\.e\./g, 'that is to say')
      .replace(/\be\.g\./g, 'for example')
      
      // Improve pacing for negotiation contexts
      .replace(/\.\s+/g, '. ') // Ensure single space after periods
      .replace(/,\s+/g, ', ') // Ensure single space after commas
      .replace(/;\s+/g, '; ') // Ensure single space after semicolons
      
      // Add natural pauses in longer sentences
      .replace(/(\b(?:however|therefore|meanwhile|furthermore|moreover|nevertheless|consequently)\b)/gi, '$1,')
      
      // Normalize quotation marks for speech
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      
      // Remove excessive punctuation
      .replace(/[!]{2,}/g, '!')
      .replace(/[?]{2,}/g, '?')
      .replace(/[.]{3,}/g, '...')
      
      // Ensure text doesn't exceed optimal length for synthesis
      .substring(0, 5000) // ElevenLabs has character limits
      .trim()
  }

  /**
   * Get available voices with their characteristics
   */
  async getAvailableVoices() {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    try {
      const response = await axios.get(`${this.baseUrl}/voices`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      return response.data.voices.map(voice => ({
        voice_id: voice.voice_id,
        name: voice.name,
        category: voice.category,
        description: voice.description,
        preview_url: voice.preview_url,
        available_for_tiers: voice.available_for_tiers,
        settings: voice.settings
      }))
    } catch (error) {
      logger.error('Failed to fetch available voices', { error: error.message })
      throw new Error(`Failed to fetch voices: ${error.message}`)
    }
  }

  /**
   * Get current usage and quota information
   */
  async getUsageInfo() {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured')
    }

    try {
      const response = await axios.get(`${this.baseUrl}/user/subscription`, {
        headers: {
          'xi-api-key': this.apiKey
        }
      })

      return {
        character_count: response.data.character_count,
        character_limit: response.data.character_limit,
        can_extend_character_limit: response.data.can_extend_character_limit,
        allowed_to_extend_character_limit: response.data.allowed_to_extend_character_limit,
        next_character_count_reset_unix: response.data.next_character_count_reset_unix,
        voice_limit: response.data.voice_limit,
        max_voice_add_edits: response.data.max_voice_add_edits,
        voice_add_edit_counter: response.data.voice_add_edit_counter,
        professional_voice_limit: response.data.professional_voice_limit,
        can_extend_voice_limit: response.data.can_extend_voice_limit,
        can_use_voice_design: response.data.can_use_voice_design,
        can_use_instant_voice_cloning: response.data.can_use_instant_voice_cloning,
        available_models: response.data.available_models
      }
    } catch (error) {
      logger.error('Failed to fetch usage info', { error: error.message })
      throw new Error(`Failed to fetch usage info: ${error.message}`)
    }
  }

  /**
   * Health check for ElevenLabs service
   */
  async healthCheck() {
    if (!this.apiKey) {
      return { status: 'error', message: 'API key not configured' }
    }

    try {
      const startTime = Date.now()
      await this.getUsageInfo()
      const latency = Date.now() - startTime
      
      return {
        status: 'healthy',
        latency,
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        status: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }
}

module.exports = new ElevenLabsService()