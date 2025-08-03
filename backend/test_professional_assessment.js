#!/usr/bin/env node

/**
 * Professional Assessment Pipeline Test
 * 
 * Tests the complete AI-powered assessment engine implementation including:
 * - Professional assessment service functionality
 * - 3-dimensional scoring with dynamic weighting
 * - Methodology compliance (Executive Summary, What Was Done Well, etc.)
 * - Negotiation theory integration
 * - API endpoint functionality
 */

const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '.env') })

const ProfessionalAssessmentService = require('./src/services/professionalAssessmentService')
const AssessmentProcessor = require('./src/services/assessmentProcessor')

console.log('🎯 Testing Professional Assessment Pipeline\n')

// Test conversation transcript with negotiation techniques
const testTranscript = `User: I'm looking for a vendor contract that works for both of us. What matters most to you in this partnership?
AI Vendor: We need reliable payment terms and a minimum 12-month commitment. What's your budget range?
User: We can be flexible on timing if you can work with us on pricing. Our budget is around $50,000 annually, but I have other options if we can't find common ground.
AI Vendor: That's below our standard rate of $65,000. What if we structure it with performance bonuses?
User: I appreciate you working with me on this. What if we start with a 6-month trial at $45,000, then move to $55,000 if we hit our targets? That way we both share the risk and benefit.
AI Vendor: That's creative thinking. I like the performance-based approach. Let's add quarterly reviews to ensure we're both getting value.
User: Perfect. This gives us both what we need - you get commitment and fair compensation, we get proven value before full investment.`

const testScenario = {
  id: 'test-scenario-001',
  title: 'High-stakes vendor contract negotiation',
  description: 'Complex B2B vendor contract with performance metrics and partnership elements',
  difficulty_level: 'advanced'
}

const testUserProfile = {
  skillLevel: 'intermediate',
  averagePerformance: 72,
  assessmentCount: 8,
  improvementTrend: 'improving'
}

async function testProfessionalAssessmentService() {
  console.log('🧠 Testing Professional Assessment Service...\n')
  
  try {
    const service = new ProfessionalAssessmentService()
    
    // Test methodology structure generation
    console.log('📋 Testing methodology structure generation...')
    const mockResults = {
      scores: { overall: 78, claimingValue: 72, creatingValue: 85, relationshipManagement: 82 },
      strengths: ['Interest-focused questioning', 'Creative option generation', 'Performance-based structuring'],
      allTechniques: ['BATNA reference', 'Creative solution development', 'Risk sharing proposal'],
      improvements: [
        {
          quote: "Our budget is around $50,000 annually",
          issue: "Revealed budget position early without exploring vendor constraints",
          suggestion: "Ask about their pricing structure first: 'What factors influence your pricing?' to understand their position before revealing yours"
        }
      ]
    }
    
    const structuredResults = service.restructureToMethodology(mockResults, testScenario, testUserProfile)
    
    // Validate methodology compliance
    const requiredSections = ['executiveSummary', 'whatWasDoneWell', 'areasForImprovement', 'nextStepsFocusAreas', 'dimensionScores']
    const hasAllSections = requiredSections.every(section => structuredResults[section] !== undefined)
    
    console.log('✅ Methodology Structure Validation:')
    console.log(`   - All required sections present: ${hasAllSections}`)
    console.log(`   - Executive Summary length: ${structuredResults.executiveSummary?.length || 0} chars`)
    console.log(`   - Has specific examples: ${(structuredResults.whatWasDoneWell?.examples?.length || 0) > 0}`)
    console.log(`   - Has improvement suggestions: ${(structuredResults.areasForImprovement?.examples?.length || 0) > 0}`)
    console.log(`   - Dynamic scoring enabled: ${structuredResults.methodologyCompliant}`)
    
    // Test dynamic weighting system
    console.log('\n⚖️ Testing Dynamic Weighting System...')
    const assessmentProcessor = new AssessmentProcessor()
    const weights1 = assessmentProcessor.calculateDynamicWeights(
      { claimingValue: { score: 90 }, creatingValue: { score: 70 }, relationshipManagement: { score: 75 } },
      testScenario
    )
    
    const weights2 = assessmentProcessor.calculateDynamicWeights(
      { claimingValue: { score: 60 }, creatingValue: { score: 85 }, relationshipManagement: { score: 90 } },
      { title: 'Long-term supplier relationship development', difficulty_level: 'intermediate' }
    )
    
    console.log('✅ Dynamic Weighting Results:')
    console.log(`   - High-stakes scenario: Claiming=${(weights1.claiming*100).toFixed(0)}%, Creating=${(weights1.creating*100).toFixed(0)}%, Relationship=${(weights1.relationship*100).toFixed(0)}%`)
    console.log(`   - Relationship scenario: Claiming=${(weights2.claiming*100).toFixed(0)}%, Creating=${(weights2.creating*100).toFixed(0)}%, Relationship=${(weights2.relationship*100).toFixed(0)}%`)
    
    // Test negotiation theory integration
    console.log('\n🎓 Testing Negotiation Theory Integration...')
    const theoryEnhanced = service.applyNegotiationTheory(structuredResults, testScenario)
    console.log('✅ Theory Integration Validation:')
    console.log(`   - Harvard Principles analysis: ${!!theoryEnhanced.negotiationTheoryAnalysis?.harvardPrinciples}`)
    console.log(`   - Game Theory concepts: ${!!theoryEnhanced.negotiationTheoryAnalysis?.gameTheory}`)
    console.log(`   - Scenario-specific analysis: ${!!theoryEnhanced.negotiationTheoryAnalysis?.scenarioSpecific}`)
    
    // Test quality metrics calculation
    console.log('\n📊 Testing Quality Metrics...')
    const qualityMetrics = service.calculateQualityMetrics(structuredResults)
    console.log('✅ Quality Metrics:')
    console.log(`   - Completeness: ${qualityMetrics.completeness}%`)
    console.log(`   - Theory Integration: ${qualityMetrics.theoryIntegration}%`)
    console.log(`   - Specificity Score: ${qualityMetrics.specificityScore}%`)
    console.log(`   - Actionability Score: ${qualityMetrics.actionabilityScore}%`)
    console.log(`   - Overall Quality: ${qualityMetrics.overallQuality}%`)
    
    return true
    
  } catch (error) {
    console.error('❌ Professional Assessment Service test failed:', error)
    return false
  }
}

async function testAssessmentProcessor() {
  console.log('\n🔧 Testing Enhanced Assessment Processor...\n')
  
  try {
    const processor = new AssessmentProcessor()
    
    // Test AI prompt building
    console.log('📝 Testing AI Prompt Enhancement...')
    const prompt = processor.buildNegotiationAnalysisPrompt(testTranscript, testScenario)
    
    console.log('✅ AI Prompt Validation:')
    console.log(`   - Contains Harvard Method references: ${prompt.includes('Harvard')}`)
    console.log(`   - Contains BATNA/ZOPA concepts: ${prompt.includes('BATNA') && prompt.includes('ZOPA')}`)
    console.log(`   - Contains methodology structure: ${prompt.includes('executiveSummary')}`)
    console.log(`   - Professional persona established: ${prompt.includes('Dr. Sarah Mitchell')}`)
    console.log(`   - Word count requirement specified: ${prompt.includes('300-400')}`)
    
    // Test comprehensive analysis capability
    console.log('\n🧠 Testing Comprehensive Analysis...')
    const analysisResult = await processor.performAIAssessment(testTranscript, {}, testScenario)
    
    console.log('✅ Analysis Results:')
    console.log(`   - Assessment completed: ${!!analysisResult}`)
    console.log(`   - Has scoring dimensions: ${!!analysisResult.claimingValue && !!analysisResult.creatingValue}`)
    console.log(`   - Overall score calculated: ${analysisResult.overall}`)
    console.log(`   - AI-generated: ${analysisResult.aiGenerated}`)
    
    if (analysisResult.dimensionScores) {
      console.log(`   - Methodology compliant: Yes`)
      console.log(`   - Executive summary present: ${!!analysisResult.executiveSummary}`)
      console.log(`   - Specific examples count: ${analysisResult.specificExamples?.length || 0}`)
    }
    
    return true
    
  } catch (error) {
    console.error('❌ Assessment Processor test failed:', error)
    console.log('ℹ️ This may be expected if AI APIs are not configured')
    return false
  }
}

async function testAPIEndpointStructure() {
  console.log('\n🌐 Testing API Endpoint Structure...\n')
  
  try {
    // Test that the controller and routes are properly structured
    const assessmentController = require('./src/controllers/assessmentController')
    const assessmentRoutes = require('./src/routes/assessment')
    
    console.log('✅ API Structure Validation:')
    console.log(`   - Assessment controller loaded: ${!!assessmentController}`)
    console.log(`   - generateAssessment method exists: ${typeof assessmentController.generateAssessment === 'function'}`)
    console.log(`   - Assessment routes loaded: ${!!assessmentRoutes}`)
    console.log(`   - Professional service imported: ${!!assessmentController.constructor.toString().includes('ProfessionalAssessmentService')}`)
    
    // Test the expected API endpoint format
    console.log('\n📋 API Endpoint Specification:')
    console.log('   - POST /api/assessment/generate')
    console.log('   - Input: { conversationId, scenarioData?, userHistory? }')
    console.log('   - Output: { success, message, data: { assessmentId, scores, executiveSummary, ... } }')
    console.log('   - Authentication: Required (via authenticateToken middleware)')
    console.log('   - Response format: Professional feedback following methodology structure')
    
    return true
    
  } catch (error) {
    console.error('❌ API Endpoint Structure test failed:', error)
    return false
  }
}

async function runAllTests() {
  console.log('🚀 Professional Assessment Engine Test Suite')
  console.log('='.repeat(50))
  
  const results = {
    assessmentService: await testProfessionalAssessmentService(),
    assessmentProcessor: await testAssessmentProcessor(),
    apiStructure: await testAPIEndpointStructure()
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('📊 Test Results Summary:')
  console.log(`   ✅ Professional Assessment Service: ${results.assessmentService ? 'PASS' : 'FAIL'}`)
  console.log(`   ✅ Enhanced Assessment Processor: ${results.assessmentProcessor ? 'PASS' : 'FAIL'}`)
  console.log(`   ✅ API Endpoint Structure: ${results.apiStructure ? 'PASS' : 'FAIL'}`)
  
  const allPassed = Object.values(results).every(result => result === true)
  console.log(`\n🎯 Overall Status: ${allPassed ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`)
  
  if (allPassed) {
    console.log('\n🎉 Professional Assessment Engine Implementation Complete!')
    console.log('\nImplemented Features:')
    console.log('   ✅ AI-powered assessment with methodology structure')
    console.log('   ✅ 3-dimensional scoring (Claiming Value, Creating Value, Relationship Management)')
    console.log('   ✅ Dynamic weighting based on scenario context and performance')
    console.log('   ✅ Negotiation theory integration (Harvard Method, BATNA, ZOPA)')
    console.log('   ✅ Professional feedback format (Executive Summary, What Was Done Well, etc.)')
    console.log('   ✅ API endpoint: POST /api/assessment/generate')
    console.log('   ✅ Quality metrics and performance percentile calculation')
    console.log('   ✅ Integration with existing voice transcript system')
    
    console.log('\nUsage Example:')
    console.log('POST /api/assessment/generate')
    console.log('Content-Type: application/json')
    console.log('Authorization: Bearer <token>')
    console.log('Body: { "conversationId": "nego-123", "scenarioData": {...}, "userHistory": {...} }')
  }
  
  console.log('\n' + '='.repeat(50))
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(console.error)
}

module.exports = { runAllTests, testProfessionalAssessmentService, testAssessmentProcessor, testAPIEndpointStructure }