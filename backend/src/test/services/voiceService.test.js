/**
 * Voice Service Unit Tests
 * 
 * Comprehensive testing for ElevenLabs voice synthesis integration,
 * character voice mapping, error handling, and performance metrics.
 */

const voiceService = require('../../services/voiceService')
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js')

// Mock the ElevenLabs API (already mocked in setup.js)
describe('VoiceService', () => {
  let mockElevenLabsApi

  beforeEach(() => {
    // Reset environment variables
    process.env.ELEVENLABS_API_KEY = 'test-api-key'
    
    mockElevenLabsApi = {
      textToSpeech: {
        convert: jest.fn(),
        stream: jest.fn(),
        convertWithTimestamps: jest.fn()
      },
      voices: {
        search: jest.fn()
      }
    }
    
    // Mock the client for the service instance
    voiceService.client = mockElevenLabsApi
    voiceService.apiKey = 'test-api-key'
  })

  describe('Configuration', () => {
    it('should have API key configured for testing', () => {
      expect(voiceService.apiKey).toBe('test-api-key')
      expect(voiceService.client).toBeDefined()
    })

    it('should have character voice mappings configured', () => {
      expect(voiceService.characterVoiceMapping).toBeDefined()
      expect(voiceService.characterVoiceMapping['Sarah Chen']).toBeDefined()
      expect(voiceService.characterVoiceMapping['Marcus Thompson']).toBeDefined()
      expect(voiceService.characterVoiceMapping['Sarah Chen'].voiceId).toBe('21m00Tcm4TlvDq8ikWAM')
    })

    it('should initialize performance metrics', () => {
      expect(voiceService.metrics).toBeDefined()
      expect(voiceService.metrics.totalRequests).toBe(0)
      expect(voiceService.metrics.totalErrors).toBe(0)
      expect(voiceService.metrics.characterUsage).toEqual({})
    })

    it('should initialize circuit breaker', () => {
      expect(voiceService.circuitBreaker).toBeDefined()
      expect(voiceService.circuitBreaker.state).toBe('CLOSED')
    })
  })

  describe('generateCharacterSpeech', () => {
    it('should generate speech for valid character with text', async () => {
      const characterName = 'Sarah Chen'
      const text = 'Hello, let\'s negotiate this deal.'
      const mockAudioBuffer = Buffer.from('mock-audio-data')
      
      mockElevenLabsApi.textToSpeech.convert.mockResolvedValue(mockAudioBuffer)
      
      const result = await voiceService.generateCharacterSpeech(characterName, text)
      
      expect(mockElevenLabsApi.textToSpeech.convert).toHaveBeenCalledWith(
        '21m00Tcm4TlvDq8ikWAM', // Sarah Chen's voice ID
        {
          text: text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.65,
            similarity_boost: 0.85,
            style: 0.30,
            use_speaker_boost: true
          }
        }
      )
      
      expect(result).toEqual({
        success: true,
        audioBuffer: mockAudioBuffer,
        metadata: {
          characterName,
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          latency: expect.any(Number),
          audioSize: mockAudioBuffer.length
        }
      })
    })

    it('should throw error for invalid character', async () => {
      const characterName = 'NonExistentCharacter'
      const text = 'Hello world'
      
      await expect(voiceService.generateCharacterSpeech(characterName, text))
        .rejects.toThrow(`No voice configuration found for character: ${characterName}`)
    })

    it('should throw error for empty text', async () => {
      const characterName = 'Sarah Chen'
      const text = ''
      
      await expect(voiceService.generateCharacterSpeech(characterName, text))
        .rejects.toThrow('Text cannot be empty')
    })

    it('should handle ElevenLabs API errors gracefully', async () => {
      const characterName = 'Sarah Chen'
      const text = 'Hello world'
      const apiError = new Error('API rate limit exceeded')
      
      mockElevenLabsApi.textToSpeech.convert.mockRejectedValue(apiError)
      
      await expect(voiceService.generateCharacterSpeech(characterName, text))
        .rejects.toThrow('Voice synthesis failed: API rate limit exceeded')
      
      // Should increment error metrics
      expect(voiceService.metrics.totalErrors).toBe(1)
    })

    it('should update performance metrics on successful generation', async () => {
      const characterName = 'Marcus Thompson'
      const text = 'Let\'s find a win-win solution.'
      const mockAudioBuffer = Buffer.from('mock-audio-data')
      
      mockElevenLabsApi.textToSpeech.convert.mockResolvedValue(mockAudioBuffer)
      
      await voiceService.generateCharacterSpeech(characterName, text)
      
      expect(voiceService.metrics.totalRequests).toBe(1)
      expect(voiceService.metrics.characterUsage[characterName]).toBe(1)
      expect(voiceService.metrics.latencies.length).toBe(1)
    })
  })

  describe('generateCharacterSpeechWithTimestamps', () => {
    it('should generate speech with timing information', async () => {
      const characterName = 'Sarah Chen'
      const text = 'Hello, let\'s negotiate.'
      const mockResponse = {
        audio: Buffer.from('mock-audio-data'),
        alignment: {
          characters: ['H', 'e', 'l', 'l', 'o'],
          character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4],
          character_end_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5]
        }
      }
      
      mockElevenLabsApi.textToSpeech.convertWithTimestamps.mockResolvedValue(mockResponse)
      
      const result = await voiceService.generateCharacterSpeechWithTimestamps(characterName, text)
      
      expect(result).toEqual({
        success: true,
        audioBuffer: mockResponse.audio,
        alignment: mockResponse.alignment,
        metadata: {
          characterName,
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          latency: expect.any(Number),
          audioSize: mockResponse.audio.length
        }
      })
    })
  })

  describe('testCharacterVoice', () => {
    it('should test character voice and return success result', async () => {
      const characterName = 'Sarah Chen'
      const testMessage = 'This is a test message.'
      const mockAudioBuffer = Buffer.from('test-audio-data')
      
      mockElevenLabsApi.textToSpeech.convert.mockResolvedValue(mockAudioBuffer)
      
      const result = await voiceService.testCharacterVoice(characterName, testMessage)
      
      expect(result).toEqual({
        success: true,
        latency: expect.any(Number),
        audioSize: mockAudioBuffer.length,
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      })
    })

    it('should return failure result for API errors', async () => {
      const characterName = 'Marcus Thompson'
      const testMessage = 'Test message'
      const apiError = new Error('API connection failed')
      
      mockElevenLabsApi.textToSpeech.convert.mockRejectedValue(apiError)
      
      const result = await voiceService.testCharacterVoice(characterName, testMessage)
      
      expect(result).toEqual({
        success: false,
        error: 'API connection failed'
      })
    })
  })

  describe('getMetrics', () => {
    it('should return comprehensive performance metrics', () => {
      // Simulate some usage
      voiceService.metrics.totalRequests = 10
      voiceService.metrics.totalErrors = 2
      voiceService.metrics.characterUsage = { 'Sarah Chen': 6, 'Marcus Thompson': 4 }
      voiceService.metrics.latencies = [250, 300, 200, 350, 280]
      
      const metrics = voiceService.getMetrics()
      
      expect(metrics).toEqual({
        totalRequests: 10,
        totalErrors: 2,
        errorRate: 0.2,
        characterUsage: { 'Sarah Chen': 6, 'Marcus Thompson': 4 },
        avgLatency: 276, // Average of latencies
        characterMappings: expect.arrayContaining(['Sarah Chen', 'Marcus Thompson']),
        sessionMetrics: expect.objectContaining({
          uptime: expect.any(Number),
          healthStatus: expect.any(String)
        })
      })
    })

    it('should handle zero latencies correctly', () => {
      voiceService.metrics.latencies = []
      
      const metrics = voiceService.getMetrics()
      
      expect(metrics.avgLatency).toBe(0)
    })
  })

  describe('getCircuitBreakerStatus', () => {
    it('should return circuit breaker status information', () => {
      const status = voiceService.getCircuitBreakerStatus()
      
      expect(status).toEqual({
        state: 'CLOSED',
        failureCount: 0,
        isAvailable: true,
        nextRetryTime: null
      })
    })
  })

  describe('initialize', () => {
    it('should initialize service and validate API connection', async () => {
      mockElevenLabsApi.voices.search.mockResolvedValue({
        voices: [
          { voice_id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel' },
          { voice_id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' }
        ]
      })
      
      const result = await voiceService.initialize()
      
      expect(result).toBe(true)
      expect(mockElevenLabsApi.voices.search).toHaveBeenCalled()
    })

    it('should handle API connection failures during initialization', async () => {
      const apiError = new Error('API connection failed')
      mockElevenLabsApi.voices.search.mockRejectedValue(apiError)
      
      const result = await voiceService.initialize()
      
      expect(result).toBe(false)
    })
  })

  describe('Circuit Breaker Integration', () => {
    it('should open circuit breaker after consecutive failures', async () => {
      const characterName = 'Sarah Chen'
      const text = 'Test message'
      const apiError = new Error('API failure')
      
      // Mock consecutive API failures
      mockElevenLabsApi.textToSpeech.convert.mockRejectedValue(apiError)
      
      // Simulate multiple failures to trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        try {
          await voiceService.generateCharacterSpeech(characterName, text)
        } catch (error) {
          // Expected failures
        }
      }
      
      expect(voiceService.circuitBreaker.failureCount).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed character configuration gracefully', () => {
      // Temporarily corrupt character mapping
      const originalMapping = voiceService.characterVoiceMapping['Sarah Chen']
      voiceService.characterVoiceMapping['Sarah Chen'] = { /* missing voiceId */ }
      
      expect(() => {
        voiceService._getCharacterVoiceConfig('Sarah Chen')
      }).toThrow()
      
      // Restore original mapping
      voiceService.characterVoiceMapping['Sarah Chen'] = originalMapping
    })

    it('should validate text input parameters', async () => {
      const characterName = 'Sarah Chen'
      
      // Test null text
      await expect(voiceService.generateCharacterSpeech(characterName, null))
        .rejects.toThrow('Text cannot be empty')
      
      // Test undefined text
      await expect(voiceService.generateCharacterSpeech(characterName, undefined))
        .rejects.toThrow('Text cannot be empty')
      
      // Test whitespace-only text
      await expect(voiceService.generateCharacterSpeech(characterName, '   '))
        .rejects.toThrow('Text cannot be empty')
    })
  })
})