require('dotenv').config({ path: '../.env' })
const voiceService = require('../services/voiceService')
const logger = require('../config/logger')

/**
 * Voice Service Integration Test
 * 
 * This script tests the ElevenLabs voice synthesis integration
 * with character-specific voice mapping and error handling.
 */

const TEST_CHARACTERS = [
  'Sarah Chen',
  'Marcus Thompson', 
  'Tony Rodriguez'
]

const TEST_MESSAGES = [
  'Hello, I understand you\'re interested in negotiating. Let\'s discuss your requirements.',
  'I appreciate your offer, but I think we can find a better solution that works for both of us.',
  'This is my final offer. Take it or leave it - I have other interested parties.',
  'Let me ask you this: what\'s most important to you in this negotiation?',
  'I need to be honest with you - the market conditions have changed significantly.'
]

class VoiceServiceTester {
  constructor() {
    this.testResults = {
      initialization: false,
      characterMappings: false,
      voiceGeneration: {},
      errorHandling: false,
      performance: {},
      fallbackTesting: false
    }
  }

  async runAllTests() {
    logger.info('🧪 Starting Voice Service Integration Tests')
    
    try {
      // Test 1: Initialization
      await this.testInitialization()
      
      // Test 2: Character voice mappings
      await this.testCharacterMappings()
      
      // Test 3: Voice generation for each character
      await this.testVoiceGeneration()
      
      // Test 4: Error handling and fallbacks
      await this.testErrorHandling()
      
      // Test 5: Performance metrics
      await this.testPerformanceMetrics()
      
      // Test 6: Circuit breaker
      await this.testCircuitBreaker()
      
      this.generateTestReport()
      
    } catch (error) {
      logger.error('❌ Voice service test suite failed:', error)
      process.exit(1)
    }
  }

  async testInitialization() {
    logger.info('🔧 Testing voice service initialization...')
    
    try {
      const initialized = await voiceService.initialize()
      this.testResults.initialization = !!initialized
      
      if (this.testResults.initialization) {
        logger.info('✅ Voice service initialization: PASSED')
      } else {
        logger.error('❌ Voice service initialization: FAILED')
      }
    } catch (error) {
      logger.error('❌ Voice service initialization failed:', error.message)
      this.testResults.initialization = false
    }
  }

  async testCharacterMappings() {
    logger.info('👥 Testing character voice mappings...')
    
    try {
      const metrics = voiceService.getMetrics()
      const hasCharacterMappings = metrics.characterMappings && metrics.characterMappings.length > 0
      
      if (hasCharacterMappings) {
        logger.info(`✅ Found ${metrics.characterMappings.length} character voice mappings:`)
        metrics.characterMappings.forEach(name => {
          logger.info(`   - ${name}`)
        })
        this.testResults.characterMappings = true
      } else {
        logger.error('❌ No character voice mappings found')
        this.testResults.characterMappings = false
      }
    } catch (error) {
      logger.error('❌ Character mappings test failed:', error.message)
      this.testResults.characterMappings = false
    }
  }

  async testVoiceGeneration() {
    logger.info('🎤 Testing voice generation for each character...')
    
    for (const characterName of TEST_CHARACTERS) {
      try {
        const testMessage = TEST_MESSAGES[Math.floor(Math.random() * TEST_MESSAGES.length)]
        
        logger.info(`   Testing ${characterName} with: "${testMessage.substring(0, 50)}..."`)
        
        const startTime = Date.now()
        const result = await voiceService.testCharacterVoice(characterName, testMessage)
        const duration = Date.now() - startTime
        
        if (result.success) {
          this.testResults.voiceGeneration[characterName] = {
            success: true,
            latency: result.latency || duration,
            audioSize: result.audioSize || 0,
            voiceId: result.voiceId
          }
          
          logger.info(`   ✅ ${characterName}: Generated in ${duration}ms (${result.audioSize || 0} bytes)`)
        } else {
          this.testResults.voiceGeneration[characterName] = {
            success: false,
            error: result.error
          }
          logger.error(`   ❌ ${characterName}: ${result.error}`)
        }
        
        // Wait a bit between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        this.testResults.voiceGeneration[characterName] = {
          success: false,
          error: error.message
        }
        logger.error(`   ❌ ${characterName}: ${error.message}`)
      }
    }
  }

  async testErrorHandling() {
    logger.info('⚠️  Testing error handling and fallbacks...')
    
    try {
      // Test with invalid character
      try {
        await voiceService.generateCharacterSpeech('NonExistentCharacter', 'Test message')
        logger.error('   ❌ Should have failed with invalid character')
      } catch (error) {
        if (error.message.includes('No voice configuration found')) {
          logger.info('   ✅ Correctly handled invalid character')
          this.testResults.errorHandling = true
        } else {
          logger.error(`   ❌ Unexpected error: ${error.message}`)
        }
      }
      
      // Test with empty text
      try {
        await voiceService.generateCharacterSpeech('Sarah Chen', '')
        logger.error('   ❌ Should have failed with empty text')
      } catch (error) {
        logger.info('   ✅ Correctly handled empty text')
      }
      
    } catch (error) {
      logger.error('❌ Error handling test failed:', error.message)
      this.testResults.errorHandling = false
    }
  }

  async testPerformanceMetrics() {
    logger.info('📊 Testing performance metrics collection...')
    
    try {
      const metrics = voiceService.getMetrics()
      
      const hasMetrics = metrics && typeof metrics.totalRequests === 'number'
      
      if (hasMetrics) {
        this.testResults.performance = {
          totalRequests: metrics.totalRequests,
          avgLatency: metrics.avgLatency,
          errorRate: metrics.errorRate,
          characterUsage: Object.keys(metrics.characterUsage).length,
          healthStatus: metrics.sessionMetrics?.healthStatus
        }
        
        logger.info('   ✅ Performance metrics are being collected:')
        logger.info(`      - Total requests: ${metrics.totalRequests}`)
        logger.info(`      - Average latency: ${Math.round(metrics.avgLatency)}ms`)
        logger.info(`      - Error rate: ${(metrics.errorRate * 100).toFixed(1)}%`)
        logger.info(`      - Health status: ${metrics.sessionMetrics?.healthStatus}`)
        
      } else {
        logger.error('   ❌ Performance metrics not available')
        this.testResults.performance = { available: false }
      }
    } catch (error) {
      logger.error('❌ Performance metrics test failed:', error.message)
      this.testResults.performance = { error: error.message }
    }
  }

  async testCircuitBreaker() {
    logger.info('🔄 Testing circuit breaker functionality...')
    
    try {
      const circuitBreakerStatus = voiceService.getCircuitBreakerStatus()
      
      if (circuitBreakerStatus && typeof circuitBreakerStatus.state === 'string') {
        logger.info(`   ✅ Circuit breaker is active (state: ${circuitBreakerStatus.state})`)
        logger.info(`      - Failure count: ${circuitBreakerStatus.failureCount}`)
        logger.info(`      - Available: ${circuitBreakerStatus.isAvailable}`)
      } else {
        logger.error('   ❌ Circuit breaker status not available')
      }
    } catch (error) {
      logger.error('❌ Circuit breaker test failed:', error.message)
    }
  }

  generateTestReport() {
    logger.info('📋 Voice Service Test Report')
    logger.info('=' * 50)
    
    const totalTests = Object.keys(this.testResults).length
    let passedTests = 0
    
    // Check initialization
    if (this.testResults.initialization) passedTests++
    logger.info(`Initialization: ${this.testResults.initialization ? '✅ PASS' : '❌ FAIL'}`)
    
    // Check character mappings
    if (this.testResults.characterMappings) passedTests++
    logger.info(`Character Mappings: ${this.testResults.characterMappings ? '✅ PASS' : '❌ FAIL'}`)
    
    // Check voice generation
    const voiceGenResults = Object.values(this.testResults.voiceGeneration)
    const successfulVoiceTests = voiceGenResults.filter(r => r.success).length
    if (successfulVoiceTests > 0) passedTests++
    logger.info(`Voice Generation: ${successfulVoiceTests}/${voiceGenResults.length} characters working`)
    
    // Check error handling
    if (this.testResults.errorHandling) passedTests++
    logger.info(`Error Handling: ${this.testResults.errorHandling ? '✅ PASS' : '❌ FAIL'}`)
    
    // Check performance metrics
    if (this.testResults.performance.totalRequests !== undefined) passedTests++
    logger.info(`Performance Metrics: ${this.testResults.performance.totalRequests !== undefined ? '✅ PASS' : '❌ FAIL'}`)
    
    logger.info('=' * 50)
    logger.info(`Overall Result: ${passedTests}/${totalTests} tests passed`)
    
    if (passedTests === totalTests) {
      logger.info('🎉 All voice service tests PASSED!')
      process.exit(0)
    } else {
      logger.error('💥 Some voice service tests FAILED!')
      process.exit(1)
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const tester = new VoiceServiceTester()
  tester.runAllTests().catch(error => {
    logger.error('Test execution failed:', error)
    process.exit(1)
  })
}

module.exports = VoiceServiceTester