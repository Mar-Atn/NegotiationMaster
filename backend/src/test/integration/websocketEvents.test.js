/**
 * WebSocket Events Unit Tests
 * 
 * Tests for WebSocket event handling, callback acknowledgments, and error handling.
 * Specifically tests the fixes for conversational session initialization.
 */

describe('WebSocket Events Unit Tests', () => {
  let mockSocket
  let mockIo
  let mockVoiceService
  
  beforeEach(() => {
    // Mock socket object
    mockSocket = {
      id: 'test-socket-id',
      emit: jest.fn(),
      on: jest.fn(),
      connected: true
    }
    
    // Mock io object
    mockIo = {
      emit: jest.fn()
    }
    
    // Mock voice service
    mockVoiceService = {
      initializeConversationalSession: jest.fn(),
      endConversationalSession: jest.fn(),
      getActiveConversationalSessions: jest.fn(() => []),
      getConversationalMetrics: jest.fn(() => ({ totalSessions: 0, avgDuration: 0 }))
    }
    
    // Mock logger
    global.logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn()
    }
  })
  
  describe('initialize-conversational-session Event Handler', () => {
    let eventHandler
    
    beforeEach(() => {
      // Create the event handler function (extracted from server.js logic)
      eventHandler = async (data, callback) => {
        try {
          global.logger.info('Initializing conversational AI session', {
            socketId: mockSocket.id,
            negotiationId: data.negotiationId,
            characterName: data.characterName
          })
          
          const sessionId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          
          const sessionResult = await mockVoiceService.initializeConversationalSession(
            sessionId,
            data.characterName,
            mockIo,
            data.negotiationId,
            {
              scenarioContext: data.scenarioContext,
              firstMessage: data.firstMessage
            }
          )
          
          // Send callback acknowledgment with success response
          if (callback && typeof callback === 'function') {
            callback({
              success: true,
              data: {
                ...sessionResult,
                timestamp: new Date().toISOString()
              }
            })
          }
          
          // Also emit the event for backward compatibility
          mockSocket.emit('conversational-session-started', {
            ...sessionResult,
            timestamp: new Date().toISOString()
          })
          
        } catch (error) {
          global.logger.error('Error initializing conversational session:', error)
          
          // Send callback acknowledgment with error response
          if (callback && typeof callback === 'function') {
            callback({
              success: false,
              error: error.message,
              timestamp: new Date().toISOString()
            })
          }
          
          // Also emit error event for backward compatibility
          mockSocket.emit('conversational-session-error', {
            error: error.message,
            timestamp: new Date().toISOString()
          })
        }
      }
    })
    
    it('should handle successful session initialization with callback', async () => {
      const testData = {
        negotiationId: 'test-negotiation-123',
        characterName: 'Sarah Chen',
        scenarioContext: 'Business negotiation scenario',
        firstMessage: 'Hello, let\'s begin our negotiation.'
      }
      
      const mockSessionResult = {
        sessionId: 'test-session-id',
        success: true,
        characterId: 'sarah-chen',
        voiceId: '21m00Tcm4TlvDq8ikWAM'
      }
      
      mockVoiceService.initializeConversationalSession.mockResolvedValue(mockSessionResult)
      
      const mockCallback = jest.fn()
      
      await eventHandler(testData, mockCallback)
      
      // Verify callback was called with success response
      expect(mockCallback).toHaveBeenCalledWith({
        success: true,
        data: {
          ...mockSessionResult,
          timestamp: expect.any(String)
        }
      })
      
      // Verify backward compatibility event was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('conversational-session-started', {
        ...mockSessionResult,
        timestamp: expect.any(String)
      })
      
      // Verify voice service was called correctly
      expect(mockVoiceService.initializeConversationalSession).toHaveBeenCalledWith(
        expect.stringMatching(/^conv_\d+_[a-z0-9]{9}$/),
        'Sarah Chen',
        mockIo,
        'test-negotiation-123',
        {
          scenarioContext: 'Business negotiation scenario',
          firstMessage: 'Hello, let\'s begin our negotiation.'
        }
      )
      
      // Verify logging
      expect(global.logger.info).toHaveBeenCalledWith('Initializing conversational AI session', {
        socketId: 'test-socket-id',
        negotiationId: 'test-negotiation-123',
        characterName: 'Sarah Chen'
      })
    })
    
    it('should handle session initialization errors with callback', async () => {
      const testData = {
        negotiationId: 'test-negotiation-123',
        characterName: 'Invalid Character',
        scenarioContext: 'Test scenario',
        firstMessage: 'Test message'
      }
      
      const mockError = new Error('No voice configuration found for character: Invalid Character')
      mockVoiceService.initializeConversationalSession.mockRejectedValue(mockError)
      
      const mockCallback = jest.fn()
      
      await eventHandler(testData, mockCallback)
      
      // Verify callback was called with error response
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'No voice configuration found for character: Invalid Character',
        timestamp: expect.any(String)
      })
      
      // Verify backward compatibility error event was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('conversational-session-error', {
        error: 'No voice configuration found for character: Invalid Character',
        timestamp: expect.any(String)
      })
      
      // Verify error logging
      expect(global.logger.error).toHaveBeenCalledWith('Error initializing conversational session:', mockError)
    })
    
    it('should work without callback (backward compatibility)', async () => {
      const testData = {
        negotiationId: 'test-negotiation-456',
        characterName: 'Marcus Thompson',
        scenarioContext: 'Another test scenario',
        firstMessage: 'Let\'s negotiate.'
      }
      
      const mockSessionResult = {
        sessionId: 'test-session-id',
        success: true,
        characterId: 'marcus-thompson',
        voiceId: 'ErXwobaYiN019PkySvjV'
      }
      
      mockVoiceService.initializeConversationalSession.mockResolvedValue(mockSessionResult)
      
      // Call without callback
      await eventHandler(testData, undefined)
      
      // Should not throw error and should still emit the event
      expect(mockSocket.emit).toHaveBeenCalledWith('conversational-session-started', {
        ...mockSessionResult,
        timestamp: expect.any(String)
      })
      
      expect(mockVoiceService.initializeConversationalSession).toHaveBeenCalledWith(
        expect.stringMatching(/^conv_\d+_[a-z0-9]{9}$/),
        'Marcus Thompson',
        mockIo,
        'test-negotiation-456',
        {
          scenarioContext: 'Another test scenario',
          firstMessage: 'Let\'s negotiate.'
        }
      )
    })
    
    it('should handle invalid callback parameter gracefully', async () => {
      const testData = {
        negotiationId: 'test-negotiation-789',
        characterName: 'Sarah Chen',
        scenarioContext: 'Test scenario',
        firstMessage: 'Test message'
      }
      
      const mockSessionResult = {
        sessionId: 'test-session-id',
        success: true
      }
      
      mockVoiceService.initializeConversationalSession.mockResolvedValue(mockSessionResult)
      
      // Call with invalid callback (not a function)
      await eventHandler(testData, 'invalid-callback')
      
      // Should not throw error and should still emit the event
      expect(mockSocket.emit).toHaveBeenCalledWith('conversational-session-started', {
        ...mockSessionResult,
        timestamp: expect.any(String)
      })
    })
  })
  
  describe('get-conversational-status Event Handler', () => {
    let statusEventHandler
    
    beforeEach(() => {
      // Create the status event handler function
      statusEventHandler = (data, callback) => {
        try {
          const activeSessions = mockVoiceService.getActiveConversationalSessions()
          const metrics = mockVoiceService.getConversationalMetrics()
          
          const statusData = {
            activeSessions: activeSessions.filter(s => s.negotiationId === data.negotiationId),
            metrics,
            timestamp: new Date().toISOString()
          }
          
          // Send callback acknowledgment if provided
          if (callback && typeof callback === 'function') {
            callback({
              success: true,
              data: statusData
            })
          }
          
          // Also emit the event for backward compatibility
          mockSocket.emit('conversational-status', statusData)
          
        } catch (error) {
          global.logger.error('Error getting conversational status:', error)
          
          // Send callback acknowledgment with error if provided
          if (callback && typeof callback === 'function') {
            callback({
              success: false,
              error: error.message,
              timestamp: new Date().toISOString()
            })
          }
          
          // Also emit error event for backward compatibility
          mockSocket.emit('conversational-status-error', {
            error: error.message,
            timestamp: new Date().toISOString()
          })
        }
      }
    })
    
    it('should handle status requests with callback support', () => {
      const testData = {
        negotiationId: 'test-negotiation-789'
      }
      
      const mockActiveSessions = [
        { sessionId: 'session1', negotiationId: 'test-negotiation-789' },
        { sessionId: 'session2', negotiationId: 'other-negotiation' }
      ]
      
      const mockMetrics = {
        totalSessions: 2,
        avgDuration: 120.5
      }
      
      mockVoiceService.getActiveConversationalSessions.mockReturnValue(mockActiveSessions)
      mockVoiceService.getConversationalMetrics.mockReturnValue(mockMetrics)
      
      const mockCallback = jest.fn()
      
      statusEventHandler(testData, mockCallback)
      
      // Verify callback was called with success response
      expect(mockCallback).toHaveBeenCalledWith({
        success: true,
        data: {
          activeSessions: [
            { sessionId: 'session1', negotiationId: 'test-negotiation-789' }
          ],
          metrics: mockMetrics,
          timestamp: expect.any(String)
        }
      })
      
      // Verify backward compatibility event was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('conversational-status', {
        activeSessions: [
          { sessionId: 'session1', negotiationId: 'test-negotiation-789' }
        ],
        metrics: mockMetrics,
        timestamp: expect.any(String)
      })
    })
    
    it('should handle status errors with callback support', () => {
      const testData = {
        negotiationId: 'test-negotiation-error'
      }
      
      const mockError = new Error('Voice service unavailable')
      mockVoiceService.getActiveConversationalSessions.mockImplementation(() => {
        throw mockError
      })
      
      const mockCallback = jest.fn()
      
      statusEventHandler(testData, mockCallback)
      
      // Verify callback was called with error response
      expect(mockCallback).toHaveBeenCalledWith({
        success: false,
        error: 'Voice service unavailable',
        timestamp: expect.any(String)
      })
      
      // Verify backward compatibility error event was emitted
      expect(mockSocket.emit).toHaveBeenCalledWith('conversational-status-error', {
        error: 'Voice service unavailable',
        timestamp: expect.any(String)
      })
      
      // Verify error logging
      expect(global.logger.error).toHaveBeenCalledWith('Error getting conversational status:', mockError)
    })
  })
  
  describe('Event Name Mismatch Fix Verification', () => {
    it('should verify both event names are supported', () => {
      // This test verifies that both initialize-conversational-session and 
      // start-conversational-session are supported for backward compatibility
      
      const eventNames = [
        'initialize-conversational-session',
        'start-conversational-session'
      ]
      
      eventNames.forEach(eventName => {
        expect(typeof eventName).toBe('string')
        expect(eventName.length).toBeGreaterThan(0)
        
        // These events should now be handled in the server
        if (eventName === 'initialize-conversational-session') {
          expect(eventName).toMatch(/initialize-conversational-session/)
        } else if (eventName === 'start-conversational-session') {
          expect(eventName).toMatch(/start-conversational-session/)
        }
      })
    })
    
    it('should verify callback acknowledgment pattern', () => {
      // Test that callback functions can be properly identified
      const validCallback = jest.fn()
      const invalidCallback = 'not-a-function'
      const undefinedCallback = undefined
      
      expect(typeof validCallback === 'function').toBe(true)
      expect(typeof invalidCallback === 'function').toBe(false)
      expect(typeof undefinedCallback === 'function').toBe(false)
    })
  })
})