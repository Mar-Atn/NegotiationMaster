const AssessmentProcessor = require('./src/services/assessmentProcessor')

async function testDirectAIAssessment() {
  console.log('🧪 Testing direct AI assessment integration...')
  
  try {
    const processor = new AssessmentProcessor()
    
    const testJob = {
      id: 'test-123',
      data: {
        conversationId: 'test-conversation-123',
        userId: 'test-user',
        scenarioId: 'test-scenario',
        transcript: `User: I need this car for $18000. 
Dealer: Best I can do is $22000. 
User: How about $20000? 
Dealer: I can do $21000 final. 
User: That sounds reasonable, let's proceed.`,
        voiceMetrics: { 
          duration: 180, 
          wordsPerMinute: 120, 
          pauseCount: 8 
        },
        metadata: { 
          sessionType: 'demo',
          difficulty: 'intermediate'
        }
      }
    }
    
    console.log('🔄 Processing AI assessment...')
    await processor.processConversationAnalysis(testJob)
    
    console.log('✅ AI assessment completed successfully!')
    return { success: true }
    
  } catch (error) {
    console.error('❌ AI assessment failed:', error.message)
    return { success: false, error: error.message }
  }
}

testDirectAIAssessment().then(result => {
  console.log('\n🏁 Direct AI Test complete:', result.success ? 'SUCCESS' : 'FAILED')
  if (!result.success) {
    console.log('Error:', result.error)
  }
  process.exit(result.success ? 0 : 1)
})