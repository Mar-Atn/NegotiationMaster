const { v4: uuidv4 } = require('uuid')
const db = require('../config/database')
const AssessmentProcessor = require('./assessmentProcessor')
const logger = require('../config/logger')

/**
 * Professional Assessment Service
 * 
 * Implements the comprehensive AI-powered assessment engine for NegotiationMaster platform
 * following the exact methodology requirements:
 * 
 * 1. Executive Summary (50-75 words)
 * 2. What Was Done Well (100-150 words) with specific quotes
 * 3. Areas for Improvement (100-150 words) with quotes and suggestions  
 * 4. Next Steps & Focus Areas (50-75 words)
 * 5. 3-Dimensional Scoring with dynamic weighting
 * 6. Negotiation theory integration (Harvard Method, BATNA, ZOPA)
 */
class ProfessionalAssessmentService {
  constructor() {
    this.assessmentProcessor = new AssessmentProcessor()
    this.negotiationTheoryBase = this.initializeNegotiationTheory()
  }

  /**
   * Generate comprehensive professional assessment
   * Main entry point for the assessment pipeline
   */
  async generateAssessment(conversationId, scenarioData = null, userHistory = null) {
    try {
      console.log(`🎯 Starting professional assessment for conversation ${conversationId}`)
      
      // Check if this is an ElevenLabs conversation ID (starts with 'conv_')
      let conversationData
      if (conversationId.startsWith('conv_')) {
        // Handle ElevenLabs conversation directly
        conversationData = await this.getElevenLabsConversationData(conversationId)
      } else {
        // Handle database conversation
        conversationData = await this.getConversationData(conversationId)
      }
      
      if (!conversationData) {
        throw new Error(`Conversation ${conversationId} not found`)
      }

      // Get scenario context
      const scenario = scenarioData || await this.getScenarioContext(conversationData.scenario_id)
      
      // Get user history if available
      const userProfile = userHistory || await this.getUserProfile(conversationData.user_id)

      // Create assessment record
      const assessmentId = uuidv4()
      await this.createAssessmentRecord(assessmentId, conversationData)

      // Generate AI-powered analysis
      const assessmentResults = await this.performComprehensiveAnalysis(
        conversationData.transcript, 
        conversationData.voice_metrics,
        scenario,
        userProfile
      )

      // Save results to database
      await this.saveAssessmentResults(assessmentId, assessmentResults)

      // Format for API response
      const formattedResponse = this.formatAssessmentResponse(assessmentResults, assessmentId)

      console.log(`✅ Professional assessment completed for conversation ${conversationId}`)
      return formattedResponse

    } catch (error) {
      console.error(`❌ Professional assessment failed for conversation ${conversationId}:`, error)
      throw error
    }
  }

  /**
   * Get conversation data from ElevenLabs API
   */
  async getElevenLabsConversationData(conversationId) {
    try {
      // Use the same approach as the working transcript endpoint
      const axios = require('axios')
      const logger = require('../config/logger')
      
      const apiKey = process.env.ELEVENLABS_API_KEY
      if (!apiKey) {
        throw new Error('ElevenLabs API key not configured')
      }
      
      // Fetch transcript from ElevenLabs directly
      const url = `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`
      const headers = {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      }
      
      const response = await axios.get(url, { headers })
      const conversationData = response.data
      const transcript = conversationData.transcript || []
      
      if (!transcript || !transcript.length) {
        return null
      }

      // Convert ElevenLabs transcript to our format
      const formattedTranscript = transcript.map(msg => ({
        role: msg.role === 'agent' ? 'assistant' : 'user',
        content: msg.message,
        timestamp: msg.time_in_call_secs || 0
      }))

      return {
        id: conversationId,
        user_id: 'demo-user', // Demo user for testing
        scenario_id: null, // No specific scenario for ElevenLabs conversations
        transcript: formattedTranscript,
        voice_metrics: {},
        status: 'completed',
        duration: 0,
        outcome: null,
        isElevenLabsConversation: true
      }
    } catch (error) {
      console.error('Error fetching ElevenLabs conversation:', error)
      return null
    }
  }

  /**
   * Get conversation data from database
   */
  async getConversationData(conversationId) {
    const conversation = await db('negotiations')
      .where('id', conversationId)
      .first()

    if (!conversation) {
      return null
    }

    return {
      id: conversation.id,
      user_id: conversation.user_id,
      scenario_id: conversation.scenario_id,
      transcript: conversation.transcript || '',
      voice_metrics: conversation.voice_metrics ? JSON.parse(conversation.voice_metrics) : {},
      status: conversation.status,
      duration: conversation.duration_seconds,
      outcome: conversation.outcome
    }
  }

  /**
   * Get scenario context for assessment
   */
  async getScenarioContext(scenarioId) {
    if (!scenarioId) return null

    const scenario = await db('scenarios')
      .where('id', scenarioId)
      .first()

    return scenario
  }

  /**
   * Get user profile and history for personalized assessment
   */
  async getUserProfile(userId) {
    if (!userId) return {}

    // Get recent assessment history
    const recentAssessments = await db('conversation_assessments')
      .where('user_id', userId)
      .where('status', 'completed')
      .orderBy('completed_at', 'desc')
      .limit(5)

    let skillLevel = 'intermediate'
    let averagePerformance = 60

    if (recentAssessments.length > 0) {
      averagePerformance = Math.round(
        recentAssessments.reduce((sum, a) => sum + (a.overall_assessment_score || 60), 0) / recentAssessments.length
      )
      
      // Determine skill level based on recent performance
      if (averagePerformance >= 85) skillLevel = 'expert'
      else if (averagePerformance >= 70) skillLevel = 'advanced' 
      else if (averagePerformance >= 55) skillLevel = 'intermediate'
      else skillLevel = 'beginner'
    }

    return {
      skillLevel,
      averagePerformance,
      assessmentCount: recentAssessments.length,
      improvementTrend: this.calculateImprovementTrend(recentAssessments)
    }
  }

  /**
   * Calculate improvement trend from recent assessments
   */
  calculateImprovementTrend(assessments) {
    if (assessments.length < 2) return 'stable'

    const recent = assessments.slice(0, Math.ceil(assessments.length / 2))
    const older = assessments.slice(Math.ceil(assessments.length / 2))

    const recentAvg = recent.reduce((sum, a) => sum + (a.overall_assessment_score || 60), 0) / recent.length
    const olderAvg = older.reduce((sum, a) => sum + (a.overall_assessment_score || 60), 0) / older.length

    const diff = recentAvg - olderAvg
    if (Math.abs(diff) < 3) return 'stable'
    return diff > 0 ? 'improving' : 'declining'
  }

  /**
   * Create initial assessment record
   */
  async createAssessmentRecord(assessmentId, conversationData) {
    await db('conversation_assessments').insert({
      id: assessmentId,
      negotiation_id: conversationData.id,
      user_id: conversationData.user_id,
      scenario_id: conversationData.scenario_id,
      status: 'processing',
      started_at: new Date(),
      conversation_transcript: conversationData.transcript,
      voice_metrics: JSON.stringify(conversationData.voice_metrics),
      conversation_metadata: JSON.stringify({
        duration: conversationData.duration,
        outcome: conversationData.outcome,
        status: conversationData.status
      })
    })
  }

  /**
   * Perform comprehensive AI-powered analysis
   */
  async performComprehensiveAnalysis(transcript, voiceMetrics, scenario, userProfile) {
    try {
      console.log('🧠 Performing comprehensive AI analysis with methodology framework...')

      // Use the enhanced assessment processor with professional prompting
      const mockJob = {
        id: `professional_${Date.now()}`,
        data: {
          conversationId: 'analysis',
          userId: 'professional',
          scenarioId: scenario?.id || 'default',
          transcript,
          voiceMetrics,
          metadata: {
            userProfile,
            scenarioContext: scenario,
            analysisType: 'professional_comprehensive'
          }
        }
      }

      const processorResult = await this.assessmentProcessor.processConversationAnalysis(mockJob)
      
      // Enhance with methodology-specific analysis
      const enhancedResults = await this.enhanceWithMethodology(processorResult.results, scenario, userProfile)
      
      return enhancedResults

    } catch (error) {
      console.error('❌ Comprehensive analysis failed:', error)
      
      // Fallback to rule-based assessment if AI fails
      console.log('🔄 Falling back to enhanced rule-based assessment...')
      return await this.generateFallbackAssessment(transcript, voiceMetrics, scenario, userProfile)
    }
  }

  /**
   * Enhance AI results with methodology-specific analysis
   */
  async enhanceWithMethodology(aiResults, scenario, userProfile) {
    // Validate that we have the required methodology structure
    const isMethodologyCompliant = this.validateMethodologyStructure(aiResults)
    
    if (!isMethodologyCompliant) {
      console.log('⚠️ AI results not methodology compliant, applying structure...')
      return this.restructureToMethodology(aiResults, scenario, userProfile)
    }

    // Apply theory-based enhancements
    const theoryEnhanced = this.applyNegotiationTheory(aiResults, scenario)
    
    // Calculate performance percentile
    const percentileData = await this.calculatePerformancePercentile(aiResults.overall, userProfile)
    
    return {
      ...theoryEnhanced,
      ...percentileData,
      qualityMetrics: this.calculateQualityMetrics(aiResults),
      methodologyCompliant: true,
      generatedAt: new Date().toISOString()
    }
  }

  /**
   * Validate that AI results follow the required methodology structure
   */
  validateMethodologyStructure(results) {
    const requiredFields = [
      'executiveSummary',
      'whatWasDoneWell',
      'areasForImprovement', 
      'nextStepsFocusAreas',
      'dimensionScores'
    ]

    return requiredFields.every(field => results[field] !== undefined)
  }

  /**
   * Restructure AI results to match methodology requirements
   */
  restructureToMethodology(results, scenario, userProfile) {
    console.log('🔧 Restructuring results to methodology format...')

    const scores = results.scores || {
      overall: results.overall || 70,
      claimingValue: results.claimingValue?.score || 65,
      creatingValue: results.creatingValue?.score || 75,
      relationshipManagement: results.relationshipManagement?.score || 70
    }

    return {
      executiveSummary: this.generateExecutiveSummary(scores, userProfile),
      whatWasDoneWell: this.generateWhatWasDoneWell(results, scores),
      areasForImprovement: this.generateAreasForImprovement(results, scores),
      nextStepsFocusAreas: this.generateNextStepsFocusAreas(scores, userProfile),
      dimensionScores: {
        claimingValue: {
          score: scores.claimingValue,
          assessment: this.generateDimensionAssessment('claiming', scores.claimingValue),
          keyStrengths: this.extractKeyStrengths(results, 'claiming'),
          developmentFocus: this.generateDevelopmentFocus('claiming', scores.claimingValue)
        },
        creatingValue: {
          score: scores.creatingValue,
          assessment: this.generateDimensionAssessment('creating', scores.creatingValue),
          keyStrengths: this.extractKeyStrengths(results, 'creating'),
          developmentFocus: this.generateDevelopmentFocus('creating', scores.creatingValue)
        },
        relationshipManagement: {
          score: scores.relationshipManagement,
          assessment: this.generateDimensionAssessment('relationship', scores.relationshipManagement),
          keyStrengths: this.extractKeyStrengths(results, 'relationship'),
          developmentFocus: this.generateDevelopmentFocus('relationship', scores.relationshipManagement)
        }
      },
      specificExamples: results.specificExamples || this.generateSpecificExamples(results),
      scores,
      summary: results.summary || this.generateExecutiveSummary(scores, userProfile),
      improvementSuggestions: results.improvements || this.generateImprovementSuggestions(scores),
      aiGenerated: results.aiGenerated || false,
      methodologyCompliant: true
    }
  }

  /**
   * Apply negotiation theory enhancements to results
   */
  applyNegotiationTheory(results, scenario) {
    // Add Harvard Method analysis
    const harvardPrinciplesAnalysis = this.analyzeHarvardPrinciples(results)
    
    // Add game theory concepts
    const gameTheoryAnalysis = this.analyzeGameTheory(results)
    
    // Add scenario-specific theory application
    const scenarioTheoryAnalysis = this.analyzeScenarioTheory(results, scenario)

    return {
      ...results,
      negotiationTheoryAnalysis: {
        harvardPrinciples: harvardPrinciplesAnalysis,
        gameTheory: gameTheoryAnalysis,
        scenarioSpecific: scenarioTheoryAnalysis
      }
    }
  }

  /**
   * Calculate performance percentile based on historical data
   */
  async calculatePerformancePercentile(overallScore, userProfile) {
    try {
      // Get all completed assessments for percentile calculation
      const allScores = await db('conversation_assessments')
        .where('status', 'completed')
        .whereNotNull('overall_assessment_score')
        .select('overall_assessment_score')

      if (allScores.length === 0) {
        return { percentile: 50, sampleSize: 0 }
      }

      const scores = allScores.map(a => a.overall_assessment_score).sort((a, b) => a - b)
      const rank = scores.filter(score => score < overallScore).length
      const percentile = Math.round((rank / scores.length) * 100)

      return {
        percentile: Math.max(1, Math.min(99, percentile)),
        sampleSize: scores.length,
        skillLevelDistribution: this.calculateSkillDistribution(scores)
      }

    } catch (error) {
      console.error('Error calculating percentile:', error)
      return { percentile: 50, sampleSize: 0 }
    }
  }

  /**
   * Calculate quality metrics for the assessment
   */
  calculateQualityMetrics(results) {
    const metrics = {
      completeness: 0,
      theoryIntegration: 0,
      specificityScore: 0,
      actionabilityScore: 0
    }

    // Completeness - check if all required sections are present
    const requiredSections = ['executiveSummary', 'whatWasDoneWell', 'areasForImprovement', 'nextStepsFocusAreas']
    metrics.completeness = (requiredSections.filter(section => results[section]).length / requiredSections.length) * 100

    // Theory integration - check for negotiation theory references
    const theoryTerms = ['BATNA', 'ZOPA', 'Harvard', 'interests', 'positions', 'objective criteria', 'reciprocity']
    const allText = JSON.stringify(results).toLowerCase()
    metrics.theoryIntegration = (theoryTerms.filter(term => allText.includes(term.toLowerCase())).length / theoryTerms.length) * 100

    // Specificity - check for specific examples and quotes
    const hasSpecificExamples = results.specificExamples && results.specificExamples.length > 0
    const hasQuotes = allText.includes('quote') || allText.includes('"')
    metrics.specificityScore = (hasSpecificExamples && hasQuotes) ? 85 : hasSpecificExamples ? 60 : 30

    // Actionability - check for concrete suggestions
    const actionWords = ['practice', 'focus on', 'implement', 'develop', 'improve', 'try', 'consider']
    metrics.actionabilityScore = Math.min(100, (actionWords.filter(word => allText.includes(word)).length * 15))

    return {
      ...metrics,
      overallQuality: Math.round((metrics.completeness + metrics.theoryIntegration + metrics.specificityScore + metrics.actionabilityScore) / 4)
    }
  }

  /**
   * Save assessment results to database
   */
  async saveAssessmentResults(assessmentId, results) {
    try {
      await db('conversation_assessments')
        .where('id', assessmentId)
        .update({
          status: 'completed',
          completed_at: new Date(),
          processing_time_ms: Date.now() - new Date().getTime(),
          claiming_value_score: results.scores?.claimingValue || results.dimensionScores?.claimingValue?.score || 70,
          creating_value_score: results.scores?.creatingValue || results.dimensionScores?.creatingValue?.score || 70,
          relationship_management_score: results.scores?.relationshipManagement || results.dimensionScores?.relationshipManagement?.score || 70,
          overall_assessment_score: results.scores?.overall || 70,
          personalized_feedback: JSON.stringify(results),
          skill_level_achieved: this.determineSkillLevel(results.scores?.overall || 70),
          performance_percentile: results.percentile || 50,
          negotiation_tactics_identified: JSON.stringify(results.specificExamples || []),
          conversation_flow_analysis: JSON.stringify(results.conversationFlow || {}),
          emotional_intelligence_metrics: JSON.stringify(results.emotionalIntelligence || {}),
          language_pattern_analysis: JSON.stringify(results.languagePatterns || {}),
          strengths_identified: JSON.stringify(results.strengths || []),
          development_areas: JSON.stringify(results.developmentAreas || []),
          improvement_recommendations: JSON.stringify(results.recommendations || [])
        })

      console.log(`✅ Assessment results saved for assessment ${assessmentId}`)

    } catch (error) {
      console.error(`❌ Failed to save assessment results for ${assessmentId}:`, error)
      throw error
    }
  }

  /**
   * Format assessment response for API
   */
  formatAssessmentResponse(results, assessmentId) {
    return {
      assessmentId,
      status: 'completed',
      scores: results.scores || {
        overall: results.overall || 70,
        claimingValue: results.claimingValue?.score || 70,
        creatingValue: results.creatingValue?.score || 70,
        relationshipManagement: results.relationshipManagement?.score || 70
      },
      
      // Core methodology sections
      executiveSummary: results.executiveSummary || results.summary,
      whatWasDoneWell: results.whatWasDoneWell,
      areasForImprovement: results.areasForImprovement,
      nextStepsFocusAreas: results.nextStepsFocusAreas,
      
      // Performance analysis
      performanceAnalysis: results.performanceAnalysis || results.dimensionScores,
      
      // Recommendations and actions
      recommendations: results.recommendations || [],
      actionItems: results.actionItems || this.generateActionItems(results),
      
      // Additional metrics
      percentile: results.percentile || 50,
      qualityMetrics: results.qualityMetrics,
      negotiationTheoryAnalysis: results.negotiationTheoryAnalysis,
      
      // Metadata
      methodologyCompliant: results.methodologyCompliant || false,
      aiGenerated: results.aiGenerated || false,
      generatedAt: results.generatedAt || new Date().toISOString()
    }
  }

  // Helper methods for generating assessment components
  generateExecutiveSummary(scores, userProfile) {
    const level = this.determineSkillLevel(scores.overall)
    const trend = userProfile?.improvementTrend || 'stable'
    const strongest = this.getStrongestDimension(scores)
    
    return `Your negotiation demonstrates ${level} capabilities with ${trend === 'improving' ? 'improving' : 'consistent'} performance across recent sessions. Particular strength in ${strongest} (${Math.max(scores.claimingValue, scores.creatingValue, scores.relationshipManagement)}/100) with development opportunities in systematic technique application and strategic positioning.`
  }

  generateWhatWasDoneWell(results, scores) {
    const strengths = results.strengths || []
    const techniques = results.allTechniques || []
    
    return {
      content: `Strong performance demonstrated through effective application of multiple negotiation techniques. Consistent engagement with theoretical frameworks and practical implementation of key concepts. ${techniques.length > 0 ? `Successfully utilized ${techniques.slice(0, 3).join(', ')} among other techniques.` : ''} Performance shows understanding of negotiation dynamics and ability to adapt approach based on conversation flow.`,
      examples: results.specificExamples?.slice(0, 3) || [
        {
          quote: "Let me understand what's most important to you in this agreement",
          concept: "Interest-focused questioning (Harvard Principle)",
          impact: "Moved conversation beyond positions to underlying needs, creating value creation opportunities"
        }
      ]
    }
  }

  generateAreasForImprovement(results, scores) {
    const weakest = this.getWeakestDimension(scores)
    const improvements = results.improvements || []
    
    return {
      content: `Primary development opportunity lies in ${weakest} dimension where systematic technique application could yield significant improvement. Focus on evidence-based positioning and strategic concession management. Enhanced preparation with market research and BATNA development would strengthen negotiating position and confidence.`,
      examples: improvements.slice(0, 3).length > 0 ? improvements.slice(0, 3) : [
        {
          quote: "That works for me, let's proceed",
          issue: "Agreed too quickly without exploring full value creation potential",
          suggestion: "Use exploratory questions like 'What flexibility exists on other terms?' to uncover additional value before finalizing"
        }
      ]
    }
  }

  generateNextStepsFocusAreas(scores, userProfile) {
    const weakest = this.getWeakestDimension(scores)
    const level = this.determineSkillLevel(scores.overall)
    
    return `Priority focus: Develop ${weakest} capabilities through targeted practice and technique refinement. ${level === 'beginner' ? 'Begin with foundational Harvard Method principles.' : level === 'expert' ? 'Challenge yourself with complex multi-party scenarios.' : 'Practice systematic application of advanced techniques in varied scenarios.'} Recommended frequency: 2-3 practice sessions per week with specific technique focus.`
  }

  generateDimensionAssessment(dimension, score) {
    const assessments = {
      claiming: {
        high: "Demonstrates strong competitive negotiation capabilities with effective value claiming techniques",
        medium: "Shows developing proficiency in competitive negotiation with room for technique refinement", 
        low: "Basic understanding present but requires systematic development of claiming value strategies"
      },
      creating: {
        high: "Excellent collaborative problem-solving with consistent application of Harvard Principles",
        medium: "Good value creation awareness with opportunity for enhanced option generation",
        low: "Limited collaborative approach - focus needed on interest exploration and win-win solutions"
      },
      relationship: {
        high: "Outstanding interpersonal skills with sophisticated relationship management capabilities",
        medium: "Solid communication foundation with opportunity for enhanced emotional intelligence",
        low: "Basic interpersonal engagement - develop active listening and empathy techniques"
      }
    }

    const level = score >= 80 ? 'high' : score >= 60 ? 'medium' : 'low'
    return assessments[dimension][level]
  }

  // Additional helper methods
  determineSkillLevel(score) {
    // CRITICAL RECALIBRATION - Much more demanding skill level thresholds
    if (score >= 80) return 'expert'        // Only exceptional performance
    if (score >= 65) return 'advanced'      // Strong demonstrated competency  
    if (score >= 45) return 'intermediate'  // Basic competency shown
    if (score >= 25) return 'beginner'      // Some engagement evident
    return 'novice'                         // Minimal or failed performance
  }

  getStrongestDimension(scores) {
    const dimensions = {
      'Claiming Value': scores.claimingValue,
      'Creating Value': scores.creatingValue,
      'Relationship Management': scores.relationshipManagement
    }
    return Object.keys(dimensions).reduce((a, b) => dimensions[a] > dimensions[b] ? a : b)
  }

  getWeakestDimension(scores) {
    const dimensions = {
      'Claiming Value': scores.claimingValue,
      'Creating Value': scores.creatingValue,
      'Relationship Management': scores.relationshipManagement
    }
    return Object.keys(dimensions).reduce((a, b) => dimensions[a] < dimensions[b] ? a : b)
  }

  /**
   * Initialize negotiation theory knowledge base
   */
  initializeNegotiationTheory() {
    return {
      harvardPrinciples: [
        'Separate People from Problems',
        'Focus on Interests, Not Positions',
        'Generate Options for Mutual Gain',
        'Use Objective Criteria'
      ],
      gameTheoryConcepts: [
        'BATNA (Best Alternative to Negotiated Agreement)',
        'ZOPA (Zone of Possible Agreement)', 
        'Reciprocity Dynamics',
        'Prisoner\'s Dilemma Applications'
      ],
      valueDimensions: [
        'Claiming Value (Competitive)',
        'Creating Value (Collaborative)',
        'Relationship Management (Interpersonal)'
      ]
    }
  }

  /**
   * Generate fallback assessment when AI fails
   */
  async generateFallbackAssessment(transcript, voiceMetrics, scenario, userProfile) {
    console.log('🔧 Generating professional fallback assessment...')
    
    try {
      // Use the existing assessment engine with enhancements
      const fallbackResults = await this.assessmentProcessor.performEnhancedFallbackAssessment(
        transcript, 
        voiceMetrics, 
        scenario
      )
      
      // Apply methodology structure
      return this.restructureToMethodology(fallbackResults, scenario, userProfile)
      
    } catch (error) {
      console.error('❌ Fallback assessment failed:', error)
      
      // Ultimate fallback - basic professional assessment
      return this.generateBasicProfessionalAssessment(transcript, scenario, userProfile)
    }
  }

  /**
   * Generate basic professional assessment as ultimate fallback
   * CRITICAL SCORING OVERHAUL - Dramatically more realistic and demanding
   */
  generateBasicProfessionalAssessment(transcript, scenario, userProfile) {
    // Analyze transcript quality for STRICT realistic scoring
    const transcriptQuality = this.analyzeTranscriptQuality(transcript)
    
    console.log(`🎯 CRITICAL Assessment Analysis:`, transcriptQuality)
    
    // STRICT BASE SCORING - Start extremely low for failed conversations
    let baseScore = 5 // Minimal starting point
    
    // DEMANDING CONVERSATION LENGTH REQUIREMENTS
    if (transcriptQuality.messageCount < 3) {
      // Aborted/failed conversations: 5-15 points only
      baseScore = Math.min(15, baseScore + transcriptQuality.messageCount * 2)
      console.log(`❌ FAILED CONVERSATION: ${transcriptQuality.messageCount} messages = ${baseScore} points`)
    } else if (transcriptQuality.messageCount < 8) {
      // Very short conversations: 15-25 points
      baseScore = 15 + (transcriptQuality.messageCount - 3) * 2
      console.log(`⚠️ VERY SHORT CONVERSATION: ${transcriptQuality.messageCount} messages = ${baseScore} points`)
    } else if (transcriptQuality.messageCount < 15) {
      // Short conversations: 25-40 points
      baseScore = 25 + (transcriptQuality.messageCount - 8) * 2
      console.log(`📝 SHORT CONVERSATION: ${transcriptQuality.messageCount} messages = ${baseScore} points`)
    } else if (transcriptQuality.messageCount < 25) {
      // Moderate conversations: 40-55 points
      baseScore = 40 + (transcriptQuality.messageCount - 15) * 1.5
      console.log(`💬 MODERATE CONVERSATION: ${transcriptQuality.messageCount} messages = ${baseScore} points`)
    } else {
      // Longer conversations: 55-65 points base
      baseScore = 55 + Math.min(10, (transcriptQuality.messageCount - 25) * 0.5)
      console.log(`📚 LONGER CONVERSATION: ${transcriptQuality.messageCount} messages = ${baseScore} points`)
    }
    
    // STRICT QUALITY BONUSES - Much harder to earn
    if (transcriptQuality.averageMessageLength > 80) baseScore += 5 // Substantial messages
    if (transcriptQuality.averageMessageLength > 120) baseScore += 5 // Very detailed messages
    
    if (transcriptQuality.questionCount > 5) baseScore += 8 // Good engagement
    if (transcriptQuality.questionCount > 10) baseScore += 7 // Excellent engagement
    
    // NEGOTIATION TERM REQUIREMENTS - Much stricter
    if (transcriptQuality.negotiationTerms < 2) {
      baseScore -= 10 // Penalty for no real negotiation
      console.log(`❌ INSUFFICIENT NEGOTIATION TERMS: ${transcriptQuality.negotiationTerms} terms, -10 penalty`)
    } else if (transcriptQuality.negotiationTerms >= 5) {
      baseScore += 8 // Bonus only for significant negotiation vocabulary
    } else if (transcriptQuality.negotiationTerms >= 8) {
      baseScore += 12 // Major bonus for sophisticated vocabulary
    }
    
    // PROFESSIONAL COMPETENCY CAPS - More realistic thresholds
    if (transcriptQuality.quality === 'failed') {
      baseScore = Math.min(baseScore, 15) // Failed conversations capped at 15
    } else if (transcriptQuality.quality === 'minimal') {
      baseScore = Math.min(baseScore, 25) // Minimal conversations capped at 25
    } else if (transcriptQuality.quality === 'basic') {
      baseScore = Math.min(baseScore, 40) // Basic conversations capped at 40
    } else if (transcriptQuality.quality === 'fair') {
      baseScore = Math.min(baseScore, 60) // Fair conversations capped at 60
    } else if (transcriptQuality.quality === 'good') {
      baseScore = Math.min(baseScore, 75) // Good conversations capped at 75
    } else if (transcriptQuality.quality === 'excellent') {
      baseScore = Math.min(baseScore, 85) // Excellent conversations capped at 85
    }
    // Only exceptional conversations can score above 85
    
    // MUCH SMALLER VARIANCE for failed conversations
    const variance = transcriptQuality.messageCount < 8 ? 3 : Math.max(3, Math.floor(baseScore * 0.08))
    
    const scores = {
      overall: Math.max(5, Math.min(85, baseScore + Math.floor(Math.random() * variance) - Math.floor(variance/2))),
      claimingValue: Math.max(5, Math.min(85, baseScore + Math.floor(Math.random() * variance) - Math.floor(variance/2))),
      creatingValue: Math.max(5, Math.min(85, baseScore + Math.floor(Math.random() * variance) - Math.floor(variance/2))),
      relationshipManagement: Math.max(5, Math.min(85, baseScore + Math.floor(Math.random() * variance) - Math.floor(variance/2)))
    }

    console.log(`🎯 CRITICAL SCORING RESULTS:`, {
      quality: transcriptQuality.quality,
      messageCount: transcriptQuality.messageCount,
      negotiationTerms: transcriptQuality.negotiationTerms,
      baseScore,
      finalScores: scores
    })

    return this.restructureToMethodology({ scores }, scenario, userProfile)
  }

  /**
   * Analyze transcript quality for STRICT realistic scoring
   * CRITICAL OVERHAUL - Much more demanding quality assessment
   */
  analyzeTranscriptQuality(transcript) {
    if (!transcript || typeof transcript !== 'string') {
      return {
        messageCount: 0,
        averageMessageLength: 0,
        questionCount: 0,
        negotiationTerms: 0,
        engagementLevel: 'none',
        negotiationDepth: 'none',
        quality: 'failed'
      }
    }

    // Enhanced message parsing - more accurate conversation analysis
    const lines = transcript.split(/\n/).filter(line => line.trim().length > 0)
    let messages = []
    
    // Parse structured conversation format
    for (const line of lines) {
      // Match various conversation formats
      const match = line.match(/^(?:User|user|Human|Assistant|AI|Agent|System)\s*[:;]?\s*(.+)$/i)
      if (match && match[1].trim().length > 10) {
        messages.push(match[1].trim())
      } else if (line.trim().length > 15 && !line.includes(':')) {
        // Unstructured but substantial content
        messages.push(line.trim())
      }
    }
    
    // If no structured format found, try simple sentence splitting
    if (messages.length === 0) {
      messages = transcript.split(/[.!?]+/).filter(msg => msg.trim().length > 15)
    }
    
    const messageCount = messages.length
    const totalLength = transcript.length
    const averageMessageLength = messageCount > 0 ? totalLength / messageCount : 0
    
    // Count questions (engagement indicator)
    const questionCount = (transcript.match(/\?/g) || []).length
    
    // EXPANDED negotiation-specific terms with professional categories
    const basicNegotiationTerms = [
      'price', 'cost', 'budget', 'deal', 'offer', 'propose', 'negotiate', 
      'terms', 'agreement', 'compromise', 'value', 'benefit'
    ]
    
    const advancedNegotiationTerms = [
      'trade-off', 'alternative', 'option', 'solution', 'interest', 'position', 
      'BATNA', 'leverage', 'concession', 'mutual', 'win-win', 'stakes',
      'priority', 'flexible', 'contingent', 'criteria', 'benchmark'
    ]
    
    const professionalNegotiationTerms = [
      'collaboration', 'partnership', 'strategic', 'long-term', 'relationship',
      'objective criteria', 'market rate', 'industry standard', 'precedent',
      'reciprocity', 'transparency', 'trust', 'credibility'
    ]
    
    const lowerTranscript = transcript.toLowerCase()
    
    const basicTermCount = basicNegotiationTerms.filter(term => 
      lowerTranscript.includes(term.toLowerCase())
    ).length
    
    const advancedTermCount = advancedNegotiationTerms.filter(term => 
      lowerTranscript.includes(term.toLowerCase())
    ).length
    
    const professionalTermCount = professionalNegotiationTerms.filter(term => 
      lowerTranscript.includes(term.toLowerCase())
    ).length
    
    const totalNegotiationTerms = basicTermCount + advancedTermCount + professionalTermCount
    
    // STRICT engagement level assessment
    let engagementLevel = 'none'
    if (questionCount >= 8 && averageMessageLength > 60) engagementLevel = 'excellent'
    else if (questionCount >= 5 && averageMessageLength > 40) engagementLevel = 'good'
    else if (questionCount >= 3 && averageMessageLength > 25) engagementLevel = 'fair'
    else if (questionCount >= 1 || averageMessageLength > 20) engagementLevel = 'minimal'
    
    // STRICT negotiation depth assessment
    let negotiationDepth = 'none'
    if (professionalTermCount >= 3 && advancedTermCount >= 4) negotiationDepth = 'professional'
    else if (advancedTermCount >= 3 && basicTermCount >= 4) negotiationDepth = 'advanced'
    else if (basicTermCount >= 3 && totalNegotiationTerms >= 5) negotiationDepth = 'basic'
    else if (totalNegotiationTerms >= 2) negotiationDepth = 'minimal'
    
    // REALISTIC overall quality assessment - balanced but demanding thresholds
    let quality = 'failed'
    
    if (messageCount >= 20 && engagementLevel === 'excellent' && negotiationDepth === 'professional') {
      quality = 'exceptional' // Only truly outstanding conversations
    } else if (messageCount >= 15 && engagementLevel === 'excellent' && negotiationDepth === 'advanced') {
      quality = 'excellent'
    } else if (messageCount >= 12 && engagementLevel === 'good' && negotiationDepth === 'advanced') {
      quality = 'good'
    } else if (messageCount >= 10 && (engagementLevel === 'good' || negotiationDepth === 'basic')) {
      quality = 'fair'
    } else if (messageCount >= 6 && (engagementLevel !== 'none' || negotiationDepth !== 'none')) {
      quality = 'basic'
    } else if (messageCount >= 3) {
      quality = 'minimal'
    }
    // else remains 'failed'

    return {
      messageCount,
      averageMessageLength: Math.round(averageMessageLength),
      questionCount,
      negotiationTerms: totalNegotiationTerms,
      basicTerms: basicTermCount,
      advancedTerms: advancedTermCount,
      professionalTerms: professionalTermCount,
      engagementLevel,
      negotiationDepth,
      quality
    }
  }

  // Analysis helper methods (simplified implementations)
  analyzeHarvardPrinciples(results) {
    return {
      separatePeopleFromProblems: 'Adequate relationship management observed',
      focusOnInterests: 'Some interest exploration evident',
      generateOptions: 'Limited option generation identified',
      objectiveCriteria: 'Basic use of standards and benchmarks'
    }
  }

  analyzeGameTheory(results) {
    return {
      batnaUtilization: 'Limited alternative reference',
      zopaExploration: 'Basic value range awareness',
      reciprocityDynamics: 'Some strategic concession patterns',
      competitiveCooperativeBalance: 'Moderate balance of approaches'
    }
  }

  analyzeScenarioTheory(results, scenario) {
    return {
      scenarioRelevance: scenario ? `Analysis relevant to ${scenario.title}` : 'General business negotiation context',
      difficultyAppropriate: scenario ? `Assessment aligned with ${scenario.difficulty_level} level` : 'Standard assessment level',
      contextualFactors: 'Professional business negotiation dynamics considered'
    }
  }

  generateActionItems(results) {
    return [
      {
        category: 'immediate',
        title: 'Next Session Focus',
        description: 'Apply specific feedback in upcoming negotiation practice',
        priority: 'high',
        timeframe: 'Next session'
      },
      {
        category: 'weekly',
        title: 'Technique Development',
        description: 'Practice 2-3 specific negotiation techniques identified for improvement',
        priority: 'medium', 
        timeframe: 'Within 7 days'
      }
    ]
  }

  calculateSkillDistribution(scores) {
    const total = scores.length
    return {
      beginner: Math.round((scores.filter(s => s < 55).length / total) * 100),
      intermediate: Math.round((scores.filter(s => s >= 55 && s < 70).length / total) * 100),
      advanced: Math.round((scores.filter(s => s >= 70 && s < 85).length / total) * 100),
      expert: Math.round((scores.filter(s => s >= 85).length / total) * 100)
    }
  }

  extractKeyStrengths(results, dimension) {
    const allStrengths = results.strengths || results.allTechniques || []
    return allStrengths.filter(strength => 
      strength.toLowerCase().includes(dimension.substring(0, 4))
    ).slice(0, 3)
  }

  generateDevelopmentFocus(dimension, score) {
    const focuses = {
      claiming: score < 70 ? 'Develop systematic anchoring and BATNA utilization strategies' : 'Refine advanced competitive positioning techniques',
      creating: score < 70 ? 'Practice Harvard Principles application and option generation' : 'Master complex multi-issue value creation',
      relationship: score < 70 ? 'Build active listening and empathy skills' : 'Develop advanced conflict resolution capabilities'
    }
    return focuses[dimension] || 'Continue developing professional negotiation capabilities'
  }

  generateSpecificExamples(results) {
    return [
      {
        quote: "Let's explore what would work best for both of us",
        technique: "Collaborative framing",
        impact: "Created cooperative atmosphere for mutual problem-solving"
      }
    ]
  }

  generateImprovementSuggestions(scores) {
    const weakest = this.getWeakestDimension(scores)
    return [
      {
        area: weakest,
        suggestion: `Focus on developing ${weakest.toLowerCase()} through targeted practice and technique application`,
        priority: 'high'
      }
    ]
  }
}

module.exports = ProfessionalAssessmentService