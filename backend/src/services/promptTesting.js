/**
 * AI Prompt Testing and Quality Assurance System
 * 
 * Comprehensive testing framework for validating prompt quality,
 * AI response accuracy, and educational value before deployment.
 */

const AIPromptEngine = require('./aiPromptEngine')
const promptValidation = require('./promptValidation')
const promptExamples = require('./promptExamples')
const scoringRubric = require('./scoringRubric')

class PromptTesting {
  constructor() {
    this.aiEngine = new AIPromptEngine()
    this.testResults = {
      promptTests: [],
      responseTests: [],
      qualityTests: [],
      performanceTests: []
    }
  }

  /**
   * Run comprehensive prompt testing suite
   */
  async runFullTestSuite() {
    console.log('🧪 Starting comprehensive AI prompt testing suite...')
    
    try {
      // 1. Test prompt structure and quality
      await this.testPromptStructures()
      
      // 2. Test AI response quality with examples
      await this.testAIResponseQuality()
      
      // 3. Test educational value validation
      await this.testEducationalValue()
      
      // 4. Test performance and consistency
      await this.testPerformanceConsistency()
      
      // 5. Generate comprehensive report
      const report = this.generateTestReport()
      
      console.log('✅ Prompt testing suite completed')
      return report
      
    } catch (error) {
      console.error('❌ Prompt testing suite failed:', error)
      throw error
    }
  }

  /**
   * Test prompt structures for all scenario types
   */
  async testPromptStructures() {
    console.log('🔍 Testing prompt structures...')
    
    const scenarioTypes = ['vendor_contract', 'partnership_agreement', 'salary_negotiation', 'conflict_resolution']
    
    for (const scenarioType of scenarioTypes) {
      const testPrompts = promptExamples.generateTestPrompts(scenarioType)
      
      // Test master prompt
      const masterValidation = promptValidation.validatePromptQuality(
        testPrompts.masterPrompt,
        promptExamples.getExample(scenarioType).sampleTranscript,
        promptExamples.getExample(scenarioType).scenario
      )
      
      this.testResults.promptTests.push({
        scenarioType,
        promptType: 'master',
        validation: masterValidation,
        timestamp: new Date().toISOString()
      })
      
      // Test dimension-specific prompts
      for (const [dimension, prompt] of Object.entries(testPrompts.dimensionPrompts)) {
        const dimensionValidation = promptValidation.validatePromptQuality(
          prompt,
          promptExamples.getExample(scenarioType).sampleTranscript,
          promptExamples.getExample(scenarioType).scenario
        )
        
        this.testResults.promptTests.push({
          scenarioType,
          promptType: dimension,
          validation: dimensionValidation,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  /**
   * Test AI response quality using example scenarios
   */
  async testAIResponseQuality() {
    console.log('🤖 Testing AI response quality...')
    
    const testScenarios = ['vendor_contract', 'partnership_agreement']
    
    for (const scenarioType of testScenarios) {
      const example = promptExamples.getExample(scenarioType)
      
      try {
        // Generate AI analysis
        const aiAnalysis = await this.aiEngine.generateComprehensiveAnalysis(
          example.sampleTranscript,
          example.scenario,
          null, // no voice metrics for testing
          'intermediate'
        )
        
        // Validate response quality
        const responseValidation = promptValidation.validateAIResponse(
          aiAnalysis.rawAnalysis,
          null
        )
        
        // Compare with expected results
        const accuracyScore = this.compareWithExpectedResults(
          aiAnalysis.structuredAnalysis,
          example.expectedAnalysis
        )
        
        this.testResults.responseTests.push({
          scenarioType,
          aiAnalysis,
          responseValidation,
          accuracyScore,
          timestamp: new Date().toISOString()
        })
        
      } catch (error) {
        console.error(`AI testing failed for ${scenarioType}:`, error)
        this.testResults.responseTests.push({
          scenarioType,
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }
  }

  /**
   * Test educational value of generated feedback
   */
  async testEducationalValue() {
    console.log('📚 Testing educational value...')
    
    // Test with different skill levels
    const skillLevels = ['beginner', 'intermediate', 'advanced']
    const example = promptExamples.getExample('vendor_contract')
    
    for (const skillLevel of skillLevels) {
      try {
        const aiAnalysis = await this.aiEngine.generateComprehensiveAnalysis(
          example.sampleTranscript,
          example.scenario,
          null,
          skillLevel
        )
        
        const educationalAssessment = this.assessEducationalValue(
          aiAnalysis.rawAnalysis,
          skillLevel
        )
        
        this.testResults.qualityTests.push({
          skillLevel,
          educationalAssessment,
          responseLength: aiAnalysis.rawAnalysis.length,
          tokensUsed: aiAnalysis.tokensUsed,
          timestamp: new Date().toISOString()
        })
        
      } catch (error) {
        console.error(`Educational testing failed for ${skillLevel}:`, error)
      }
    }
  }

  /**
   * Test performance and consistency across multiple runs
   */
  async testPerformanceConsistency() {
    console.log('⚡ Testing performance and consistency...')
    
    const example = promptExamples.getExample('salary_negotiation')
    const runs = 3 // Limited for testing
    const results = []
    
    for (let i = 0; i < runs; i++) {
      const startTime = Date.now()
      
      try {
        const aiAnalysis = await this.aiEngine.generateComprehensiveAnalysis(
          example.sampleTranscript,
          example.scenario,
          null,
          'intermediate'
        )
        
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        results.push({
          run: i + 1,
          responseTime,
          tokensUsed: aiAnalysis.tokensUsed,
          scores: aiAnalysis.structuredAnalysis.scores,
          success: true
        })
        
      } catch (error) {
        results.push({
          run: i + 1,
          error: error.message,
          success: false
        })
      }
    }
    
    // Calculate consistency metrics
    const successfulRuns = results.filter(r => r.success)
    const consistencyMetrics = this.calculateConsistencyMetrics(successfulRuns)
    
    this.testResults.performanceTests.push({
      totalRuns: runs,
      successfulRuns: successfulRuns.length,
      consistencyMetrics,
      results,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Compare AI results with expected results
   */
  compareWithExpectedResults(aiResults, expectedResults) {
    let accuracyScore = 100
    let comparisons = []
    
    // Compare scores
    if (aiResults.scores && expectedResults) {
      Object.keys(expectedResults).forEach(dimension => {
        if (aiResults.scores[dimension] && expectedResults[dimension].score) {
          const difference = Math.abs(aiResults.scores[dimension] - expectedResults[dimension].score)
          const dimensionAccuracy = Math.max(0, 100 - (difference * 2)) // 2 points per point difference
          
          comparisons.push({
            dimension,
            aiScore: aiResults.scores[dimension],
            expectedScore: expectedResults[dimension].score,
            difference,
            accuracy: dimensionAccuracy
          })
          
          accuracyScore -= (difference * 0.5) // Reduce overall accuracy
        }
      })
    }
    
    return {
      overallAccuracy: Math.max(0, accuracyScore),
      dimensionComparisons: comparisons
    }
  }

  /**
   * Assess educational value of AI response
   */
  assessEducationalValue(aiResponse, skillLevel) {
    const assessment = {
      score: 100,
      strengths: [],
      improvements: []
    }
    
    // Check for skill-level appropriate content
    const skillKeywords = {
      'beginner': ['basic', 'fundamental', 'start with', 'simple', 'foundation'],
      'intermediate': ['develop', 'enhance', 'build on', 'improve', 'technique'],
      'advanced': ['sophisticated', 'strategic', 'complex', 'mastery', 'nuanced']
    }
    
    const appropriateKeywords = skillKeywords[skillLevel] || skillKeywords['intermediate']
    const hasAppropriateLevel = appropriateKeywords.some(keyword => 
      aiResponse.toLowerCase().includes(keyword)
    )
    
    if (hasAppropriateLevel) {
      assessment.strengths.push(`Content appropriate for ${skillLevel} level`)
    } else {
      assessment.improvements.push(`Should include more ${skillLevel}-appropriate language`)
      assessment.score -= 15
    }
    
    // Check for actionable recommendations
    const actionWords = ['practice', 'try', 'focus on', 'develop', 'improve', 'work on']
    const actionCount = actionWords.filter(word => aiResponse.toLowerCase().includes(word)).length
    
    if (actionCount >= 3) {
      assessment.strengths.push('Rich in actionable recommendations')
    } else {
      assessment.improvements.push('Needs more actionable suggestions')
      assessment.score -= 10
    }
    
    // Check for conversation examples
    const quoteCount = (aiResponse.match(/"/g) || []).length / 2 // Rough quote count
    if (quoteCount >= 3) {
      assessment.strengths.push('Good use of conversation examples')
    } else {
      assessment.improvements.push('Should include more conversation quotes')
      assessment.score -= 15
    }
    
    return assessment
  }

  /**
   * Calculate consistency metrics across multiple runs
   */
  calculateConsistencyMetrics(results) {
    if (results.length < 2) {
      return { error: 'Insufficient data for consistency analysis' }
    }
    
    // Response time consistency
    const responseTimes = results.map(r => r.responseTime)
    const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    const responseTimeVariance = responseTimes.reduce((acc, time) => acc + Math.pow(time - avgResponseTime, 2), 0) / responseTimes.length
    
    // Token usage consistency
    const tokenUsages = results.map(r => r.tokensUsed)
    const avgTokenUsage = tokenUsages.reduce((a, b) => a + b, 0) / tokenUsages.length
    
    // Score consistency (if available)
    let scoreConsistency = null
    if (results.every(r => r.scores)) {
      const dimensions = Object.keys(results[0].scores)
      scoreConsistency = {}
      
      dimensions.forEach(dimension => {
        const scores = results.map(r => r.scores[dimension]).filter(s => s !== undefined)
        if (scores.length > 1) {
          const variance = scores.reduce((acc, score) => {
            const mean = scores.reduce((a, b) => a + b, 0) / scores.length
            return acc + Math.pow(score - mean, 2)
          }, 0) / scores.length
          
          scoreConsistency[dimension] = {
            variance: Math.round(variance * 100) / 100,
            standardDeviation: Math.round(Math.sqrt(variance) * 100) / 100
          }
        }
      })
    }
    
    return {
      responseTime: {
        average: Math.round(avgResponseTime),
        variance: Math.round(responseTimeVariance),
        consistency: responseTimeVariance < 5000 ? 'high' : responseTimeVariance < 10000 ? 'medium' : 'low'
      },
      tokenUsage: {
        average: Math.round(avgTokenUsage),
        range: Math.max(...tokenUsages) - Math.min(...tokenUsages)
      },
      scoreConsistency
    }
  }

  /**
   * Generate comprehensive test report
   */
  generateTestReport() {
    const report = {
      overview: {
        totalTests: this.testResults.promptTests.length + this.testResults.responseTests.length + 
                   this.testResults.qualityTests.length + this.testResults.performanceTests.length,
        timestamp: new Date().toISOString(),
        systemStatus: 'operational'
      },
      promptStructureResults: this.analyzePromptStructureResults(),
      aiResponseResults: this.analyzeAIResponseResults(),
      educationalValueResults: this.analyzeEducationalValueResults(),
      performanceResults: this.analyzePerformanceResults(),
      recommendations: this.generateTestRecommendations()
    }
    
    return report
  }

  /**
   * Analyze prompt structure test results
   */
  analyzePromptStructureResults() {
    const promptTests = this.testResults.promptTests
    
    return {
      totalPromptTests: promptTests.length,
      averageScore: promptTests.reduce((sum, test) => sum + test.validation.score, 0) / promptTests.length,
      validPrompts: promptTests.filter(test => test.validation.isValid).length,
      commonIssues: this.extractCommonIssues(promptTests.map(test => test.validation.issues).flat()),
      byScenarioType: this.groupResultsByScenario(promptTests)
    }
  }

  /**
   * Analyze AI response test results
   */
  analyzeAIResponseResults() {
    const responseTests = this.testResults.responseTests.filter(test => !test.error)
    
    if (responseTests.length === 0) {
      return { error: 'No successful AI response tests completed' }
    }
    
    return {
      totalResponseTests: responseTests.length,
      averageAccuracy: responseTests.reduce((sum, test) => sum + test.accuracyScore.overallAccuracy, 0) / responseTests.length,
      averageResponseTime: responseTests.reduce((sum, test) => sum + (test.aiAnalysis.tokensUsed || 0), 0) / responseTests.length,
      qualityDistribution: this.analyzeQualityDistribution(responseTests)
    }
  }

  /**
   * Analyze educational value test results
   */
  analyzeEducationalValueResults() {
    const qualityTests = this.testResults.qualityTests
    
    return {
      totalQualityTests: qualityTests.length,
      averageEducationalScore: qualityTests.reduce((sum, test) => sum + test.educationalAssessment.score, 0) / qualityTests.length,
      bySkillLevel: this.groupQualityBySkillLevel(qualityTests),
      commonStrengths: this.extractCommonStrengths(qualityTests),
      commonImprovements: this.extractCommonImprovements(qualityTests)
    }
  }

  /**
   * Analyze performance test results
   */
  analyzePerformanceResults() {
    const performanceTests = this.testResults.performanceTests
    
    if (performanceTests.length === 0) {
      return { error: 'No performance tests completed' }
    }
    
    const latestTest = performanceTests[performanceTests.length - 1]
    
    return {
      successRate: (latestTest.successfulRuns / latestTest.totalRuns) * 100,
      consistencyMetrics: latestTest.consistencyMetrics,
      reliability: latestTest.successfulRuns === latestTest.totalRuns ? 'high' : 'medium'
    }
  }

  /**
   * Generate testing recommendations
   */
  generateTestRecommendations() {
    const recommendations = []
    
    // Analyze overall test results and generate recommendations
    const promptStructure = this.analyzePromptStructureResults()
    const aiResponse = this.analyzeAIResponseResults()
    const educational = this.analyzeEducationalValueResults()
    const performance = this.analyzePerformanceResults()
    
    if (promptStructure.averageScore < 80) {
      recommendations.push({
        category: 'prompt_quality',
        priority: 'high',
        recommendation: 'Improve prompt structure quality',
        details: 'Several prompts scored below 80. Focus on educational framework alignment and conversation quote requirements.'
      })
    }
    
    if (aiResponse.averageAccuracy && aiResponse.averageAccuracy < 75) {
      recommendations.push({
        category: 'ai_accuracy',
        priority: 'high',
        recommendation: 'Improve AI response accuracy',
        details: 'AI responses not matching expected results consistently. Consider prompt refinement or model tuning.'
      })
    }
    
    if (educational.averageEducationalScore < 80) {
      recommendations.push({
        category: 'educational_value',
        priority: 'medium',
        recommendation: 'Enhance educational value',
        details: 'Focus on skill-level appropriate content and actionable recommendations.'
      })
    }
    
    if (performance.reliability === 'medium') {
      recommendations.push({
        category: 'reliability',
        priority: 'medium',
        recommendation: 'Improve system reliability',
        details: 'Some AI analysis attempts are failing. Check API connectivity and error handling.'
      })
    }
    
    return recommendations
  }

  // Helper methods for analysis
  extractCommonIssues(issues) {
    const issueCount = {}
    issues.forEach(issue => {
      issueCount[issue] = (issueCount[issue] || 0) + 1
    })
    return Object.entries(issueCount).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }

  groupResultsByScenario(tests) {
    const grouped = {}
    tests.forEach(test => {
      if (!grouped[test.scenarioType]) {
        grouped[test.scenarioType] = []
      }
      grouped[test.scenarioType].push(test)
    })
    return grouped
  }

  analyzeQualityDistribution(tests) {
    const scores = tests.map(test => test.accuracyScore.overallAccuracy)
    return {
      excellent: scores.filter(s => s >= 90).length,
      good: scores.filter(s => s >= 75 && s < 90).length,
      fair: scores.filter(s => s >= 60 && s < 75).length,
      poor: scores.filter(s => s < 60).length
    }
  }

  groupQualityBySkillLevel(tests) {
    const grouped = {}
    tests.forEach(test => {
      if (!grouped[test.skillLevel]) {
        grouped[test.skillLevel] = []
      }
      grouped[test.skillLevel].push(test.educationalAssessment.score)
    })
    
    Object.keys(grouped).forEach(level => {
      const scores = grouped[level]
      grouped[level] = {
        average: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length
      }
    })
    
    return grouped
  }

  extractCommonStrengths(tests) {
    const strengths = tests.map(test => test.educationalAssessment.strengths).flat()
    return this.extractCommonIssues(strengths)
  }

  extractCommonImprovements(tests) {
    const improvements = tests.map(test => test.educationalAssessment.improvements).flat()
    return this.extractCommonIssues(improvements)
  }
}

module.exports = PromptTesting