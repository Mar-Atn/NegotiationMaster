#!/usr/bin/env node

require('dotenv').config()
const voiceService = require('./src/services/voiceService')
const logger = require('./src/config/logger')

async function testVoiceSynthesis() {
  try {
    console.log('🚀 Starting voice synthesis test...')
    
    // Initialize the voice service
    console.log('📡 Initializing voice service...')
    await voiceService.initialize()
    
    // Test generating speech for a character
    console.log('🎤 Testing character speech generation...')
    const result = await voiceService.generateCharacterSpeech(
      'Sarah Chen',
      'Hello, this is a test of my voice synthesis system.',
      {
        modelId: 'eleven_turbo_v2',
        outputFormat: 'mp3_44100_128'
      }
    )
    
    console.log('✅ Voice synthesis successful!')
    console.log(`📊 Audio buffer size: ${result.audio.length} bytes`)
    console.log(`⏱️ Latency: ${result.metadata.latency}ms`)
    console.log(`🎵 Voice ID: ${result.metadata.voiceId}`)
    
    // This should show up in your ElevenLabs usage statistics!
    console.log('🎯 Check your ElevenLabs dashboard - you should see 1 API request now!')
    
  } catch (error) {
    console.error('❌ Voice synthesis test failed:', error)
    process.exit(1)
  }
}

// Run the test
testVoiceSynthesis()
  .then(() => {
    console.log('🏁 Test completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })