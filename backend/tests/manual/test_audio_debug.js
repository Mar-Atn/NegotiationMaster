#!/usr/bin/env node

require('dotenv').config()
const voiceService = require('./src/services/voiceService')
const logger = require('./src/config/logger')

async function testAudioGeneration() {
  try {
    console.log('🚀 Testing direct audio generation...')
    
    // Initialize voice service
    await voiceService.initialize()
    
    // Test direct audio generation
    const result = await voiceService.generateCharacterSpeech(
      'Sarah Chen',
      'Hello, I understand you want to negotiate the price. Let me see what I can do for you.',
      {
        modelId: 'eleven_turbo_v2',
        outputFormat: 'mp3_44100_128'
      }
    )
    
    console.log('✅ Audio generation result:', {
      hasAudio: !!result.audio,
      audioType: typeof result.audio,
      audioLength: result.audio?.length || 0,
      audioConstructor: result.audio?.constructor?.name,
      metadata: result.metadata
    })
    
    if (result.audio && result.audio.length > 0) {
      console.log('🔊 Audio buffer details:', {
        byteLength: result.audio.length,
        firstBytes: Array.from(result.audio.slice(0, 10)),
        isBuffer: Buffer.isBuffer(result.audio),
        isUint8Array: result.audio instanceof Uint8Array
      })
      
      // Test chunking simulation
      const chunkSize = 4096
      const totalChunks = Math.ceil(result.audio.length / chunkSize)
      console.log(`📦 Would create ${totalChunks} chunks of ${chunkSize} bytes each`)
      
      for (let i = 0; i < Math.min(3, totalChunks); i++) {
        const start = i * chunkSize
        const end = Math.min(start + chunkSize, result.audio.length)
        const chunk = result.audio.slice(start, end)
        console.log(`📦 Chunk ${i}: ${chunk.length} bytes`)
      }
    } else {
      console.log('❌ No audio data generated!')
    }
    
  } catch (error) {
    console.error('❌ Audio generation test failed:', error)
    process.exit(1)
  }
}

// Run the test
testAudioGeneration()
  .then(() => {
    console.log('🏁 Audio generation test completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Test failed:', error)
    process.exit(1)
  })