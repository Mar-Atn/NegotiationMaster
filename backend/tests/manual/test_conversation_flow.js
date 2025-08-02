#!/usr/bin/env node

require('dotenv').config()
const voiceService = require('./src/services/voiceService')
const logger = require('./src/config/logger')
const { createServer } = require('http')
const { Server } = require('socket.io')

async function testConversationFlow() {
  try {
    console.log('🚀 Starting conversation flow test...')
    
    // Initialize voice service
    await voiceService.initialize()
    
    // Create mock Socket.IO for testing
    const server = createServer()
    const io = new Server(server)
    
    console.log('🤖 Testing simulated character response generation...')
    
    // Test the generateSimulatedCharacterResponse function directly
    const sessionId = 'test_session_123'
    const testSessionData = {
      sessionId,
      characterName: 'Sarah Chen',
      negotiationId: 'test_negotiation',
      conversationHistory: []
    }
    
    // Mock the session data
    voiceService.conversationalSessions.set(sessionId, testSessionData)
    
    // Mock Socket.IO emit function for testing
    const mockSocket = {
      to: () => ({
        emit: (event, data) => {
          console.log(`📡 Socket event emitted: ${event}`, {
            event,
            dataKeys: Object.keys(data),
            audioDataSize: data.audioData?.length || 0
          })
          
          if (event === 'conversational-audio-chunk') {
            console.log('🔊 Audio chunk would be sent to frontend:', {
              sessionId: data.sessionId,
              audioSize: data.audioData?.length,
              format: data.format,
              chunkIndex: data.chunkIndex,
              totalChunks: data.totalChunks
            })
          }
        }
      })
    }
    
    testSessionData.socketIo = mockSocket
    
    // Simulate user input that would trigger character response
    const userInput = "Hello, I'd like to negotiate the price of this car."
    
    console.log('🎯 Simulating character response to:', userInput)
    
    // This should trigger ElevenLabs API call and audio chunk streaming
    await voiceService.generateSimulatedCharacterResponse(sessionId, userInput)
    
    console.log('✅ Test completed! Check logs above for audio chunk events.')
    console.log('🎯 If you see "Audio chunk would be sent to frontend" messages, the backend is working correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  }
}

// Run the test
testConversationFlow()
  .then(() => {
    console.log('🏁 Conversation flow test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })