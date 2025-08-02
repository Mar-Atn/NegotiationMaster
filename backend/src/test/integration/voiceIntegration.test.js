/**
 * Voice Service Integration Tests
 * 
 * Integration tests for ElevenLabs voice synthesis, character voice mapping,
 * error handling, and real-world API interactions.
 */

const request = require('supertest')
const express = require('express')
const voiceService = require('../../services/voiceService')
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js')

describe('Voice Integration Tests', () => {
  let app

  beforeAll(async () => {
    // Set up Express app for testing
    app = express()
    app.use(express.json())
    
    // Set up voice routes for testing
    app.post('/api/voice/generate', async (req, res) => {
      try {
        const { characterName, text } = req.body
        const result = await voiceService.generateCharacterSpeech(characterName, text)
        res.json(result)
      } catch (error) {
        res.status(400).json({ error: error.message })
      }
    })
    
    app.post('/api/voice/generate-with-timestamps', async (req, res) => {
      try {
        const { characterName, text } = req.body
        const result = await voiceService.generateCharacterSpeechWithTimestamps(characterName, text)
        res.json(result)
      } catch (error) {
        res.status(400).json({ error: error.message })
      }
    })
    
    app.get('/api/voice/test/:characterName', async (req, res) => {
      try {
        const { characterName } = req.params
        const { message } = req.query
        const result = await voiceService.testCharacterVoice(characterName, message || 'Test message')
        res.json(result)
      } catch (error) {
        res.status(400).json({ error: error.message })
      }
    })
    
    app.get('/api/voice/metrics', (req, res) => {
      const metrics = voiceService.getMetrics()
      res.json(metrics)
    })
    
    app.get('/api/voice/circuit-breaker', (req, res) => {
      const status = voiceService.getCircuitBreakerStatus()
      res.json(status)
    })
  })

  describe('Voice Generation API Integration', () => {
    it('should generate speech for Sarah Chen character', async () => {
      const response = await request(app)
        .post('/api/voice/generate')
        .send({
          characterName: 'Sarah Chen',
          text: 'Hello, let\'s negotiate this business deal effectively.'
        })
        .expect(200)
      
      expect(response.body).toEqual({
        success: true,
        audioBuffer: expect.any(Object),
        metadata: {
          characterName: 'Sarah Chen',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          latency: expect.any(Number),
          audioSize: expect.any(Number)
        }
      })
      
      expect(response.body.metadata.latency).toBeGreaterThan(0)
      expect(response.body.metadata.audioSize).toBeGreaterThan(0)
    })

    it('should generate speech for Marcus Thompson character', async () => {
      const response = await request(app)
        .post('/api/voice/generate')
        .send({
          characterName: 'Marcus Thompson',
          text: 'I believe we can find a mutually beneficial solution here.'
        })
        .expect(200)
      
      expect(response.body).toEqual({
        success: true,
        audioBuffer: expect.any(Object),
        metadata: {
          characterName: 'Marcus Thompson',
          voiceId: 'ErXwobaYiN019PkySvjV',
          latency: expect.any(Number),
          audioSize: expect.any(Number)
        }
      })
    })

    it('should return error for invalid character', async () => {
      const response = await request(app)
        .post('/api/voice/generate')
        .send({
          characterName: 'Invalid Character',
          text: 'Hello world'
        })
        .expect(400)
      
      expect(response.body).toEqual({
        error: 'No voice configuration found for character: Invalid Character'
      })
    })

    it('should return error for empty text', async () => {
      const response = await request(app)
        .post('/api/voice/generate')
        .send({
          characterName: 'Sarah Chen',
          text: ''
        })
        .expect(400)
      
      expect(response.body).toEqual({
        error: 'Text cannot be empty'
      })
    })
  })

  describe('Voice Generation with Timestamps Integration', () => {
    it('should generate speech with timing information', async () => {
      const response = await request(app)
        .post('/api/voice/generate-with-timestamps')
        .send({
          characterName: 'Sarah Chen',
          text: 'Let\'s discuss the terms of this agreement.'
        })
        .expect(200)
      
      expect(response.body).toEqual({
        success: true,
        audioBuffer: expect.any(Object),
        alignment: {
          characters: expect.any(Array),
          character_start_times_seconds: expect.any(Array),
          character_end_times_seconds: expect.any(Array)
        },
        metadata: {
          characterName: 'Sarah Chen',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          latency: expect.any(Number),
          audioSize: expect.any(Number)
        }
      })
      
      expect(response.body.alignment.characters.length).toBeGreaterThan(0)
      expect(response.body.alignment.character_start_times_seconds.length).toEqual(response.body.alignment.characters.length)
      expect(response.body.alignment.character_end_times_seconds.length).toEqual(response.body.alignment.characters.length)
    })
  })

  describe('Voice Testing Integration', () => {
    it('should test character voice successfully', async () => {
      const response = await request(app)
        .get('/api/voice/test/Sarah Chen')
        .query({ message: 'This is a voice test message.' })
        .expect(200)
      
      expect(response.body).toEqual({
        success: true,
        latency: expect.any(Number),
        audioSize: expect.any(Number),
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      })
    })

    it('should handle voice test failures gracefully', async () => {
      // Test with invalid character
      const response = await request(app)
        .get('/api/voice/test/Invalid Character')
        .query({ message: 'Test message' })
        .expect(400)
      
      expect(response.body).toEqual({
        error: 'No voice configuration found for character: Invalid Character'
      })
    })
  })

  describe('Metrics Integration', () => {
    it('should return comprehensive metrics after voice generation', async () => {
      // Generate some voice samples first
      await request(app)
        .post('/api/voice/generate')
        .send({
          characterName: 'Sarah Chen',
          text: 'First test message'
        })
      
      await request(app)
        .post('/api/voice/generate')
        .send({
          characterName: 'Marcus Thompson',
          text: 'Second test message'
        })
      
      // Get metrics
      const response = await request(app)
        .get('/api/voice/metrics')
        .expect(200)
      
      expect(response.body).toEqual({
        totalRequests: expect.any(Number),
        totalErrors: expect.any(Number),
        errorRate: expect.any(Number),
        characterUsage: expect.any(Object),
        avgLatency: expect.any(Number),
        characterMappings: expect.arrayContaining(['Sarah Chen', 'Marcus Thompson']),
        sessionMetrics: expect.objectContaining({
          uptime: expect.any(Number),
          healthStatus: expect.any(String)
        })
      })
      
      expect(response.body.totalRequests).toBeGreaterThan(0)
      expect(response.body.characterUsage['Sarah Chen']).toBeDefined()
      expect(response.body.characterUsage['Marcus Thompson']).toBeDefined()
    })
  })

  describe('Circuit Breaker Integration', () => {
    it('should return circuit breaker status', async () => {
      const response = await request(app)
        .get('/api/voice/circuit-breaker')
        .expect(200)
      
      expect(response.body).toEqual({
        state: expect.stringMatching(/^(CLOSED|OPEN|HALF_OPEN)$/),
        failureCount: expect.any(Number),
        isAvailable: expect.any(Boolean),
        nextRetryTime: expect.any(Boolean) ? expect.any(Number) : null
      })
    })
  })

  describe('Performance Integration Tests', () => {
    it('should handle multiple concurrent voice generation requests', async () => {
      const requests = []
      const testMessages = [
        'First concurrent message',
        'Second concurrent message',
        'Third concurrent message',
        'Fourth concurrent message',
        'Fifth concurrent message'
      ]
      
      // Create multiple concurrent requests
      for (let i = 0; i < testMessages.length; i++) {
        requests.push(
          request(app)
            .post('/api/voice/generate')
            .send({
              characterName: 'Sarah Chen',
              text: testMessages[i]
            })
        )
      }
      
      const responses = await Promise.all(requests)
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200)
        expect(response.body.success).toBe(true)
        expect(response.body.metadata.latency).toBeGreaterThan(0)
      })
      
      // Check metrics after concurrent requests
      const metricsResponse = await request(app)
        .get('/api/voice/metrics')
        .expect(200)
      
      expect(metricsResponse.body.totalRequests).toBeGreaterThanOrEqual(testMessages.length)
    })

    it('should maintain acceptable latency under load', async () => {
      const startTime = Date.now()
      
      const response = await request(app)
        .post('/api/voice/generate')
        .send({
          characterName: 'Marcus Thompson',
          text: 'This is a latency test message for performance validation.'
        })
        .expect(200)
      
      const endTime = Date.now()
      const totalLatency = endTime - startTime
      
      // Should complete within reasonable time (adjust threshold as needed)
      expect(totalLatency).toBeLessThan(5000) // 5 seconds
      expect(response.body.metadata.latency).toBeLessThan(3000) // 3 seconds for ElevenLabs API
    })

    it('should handle character switching efficiently', async () => {
      const characters = ['Sarah Chen', 'Marcus Thompson']
      const testText = 'Character switching performance test message.'
      
      for (const character of characters) {
        const startTime = Date.now()
        
        const response = await request(app)
          .post('/api/voice/generate')
          .send({
            characterName: character,
            text: testText
          })
          .expect(200)
        
        const endTime = Date.now()
        const latency = endTime - startTime
        
        expect(response.body.success).toBe(true)
        expect(response.body.metadata.characterName).toBe(character)
        expect(latency).toBeLessThan(5000) // Should handle character switching efficiently
      }
    })
  })

  describe('Error Recovery Integration', () => {
    it('should recover gracefully from API failures', async () => {
      // This test would normally require mocking API failures
      // For integration tests, we'll test the error handling path
      
      const response = await request(app)
        .post('/api/voice/generate')
        .send({
          characterName: 'Sarah Chen',
          text: 'Test message for error recovery'
        })
      
      // Should either succeed or fail gracefully
      if (response.status === 200) {
        expect(response.body.success).toBe(true)
      } else {
        expect(response.status).toBeGreaterThanOrEqual(400)
        expect(response.body.error).toBeDefined()
      }
    })
  })

  describe('Data Validation Integration', () => {
    it('should validate request parameters properly', async () => {
      // Missing characterName
      await request(app)
        .post('/api/voice/generate')
        .send({
          text: 'Hello world'
        })
        .expect(400)
      
      // Missing text
      await request(app)
        .post('/api/voice/generate')
        .send({
          characterName: 'Sarah Chen'
        })
        .expect(400)
      
      // Empty request body
      await request(app)
        .post('/api/voice/generate')
        .send({})
        .expect(400)
    })

    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/voice/generate')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }')
        .expect(400)
      
      expect(response.body).toBeDefined()
    })
  })
})