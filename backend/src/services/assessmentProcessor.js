const { v4: uuidv4 } = require('uuid')
const db = require('../config/database')
const AssessmentEngine = require('./assessmentEngine')
const Anthropic = require('@anthropic-ai/sdk')
const OpenAI = require('openai')
const { GoogleGenerativeAI } = require('@google/generative-ai')

class AssessmentProcessor {
  constructor() {
    this.assessmentEngine = new AssessmentEngine()
    
    // Initialize AI clients
    this.anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    }) : null
    
    this.openai = process.env.OPENAI_API_KEY ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    }) : null

    this.gemini = process.env.GOOGLE_GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY) : null
    
    console.log('🤖 AI Assessment Processor initialized:', {
      anthropicAvailable: !!this.anthropic,
      openaiAvailable: !!this.openai,
      geminiAvailable: !!this.gemini,
      fallbackMode: !this.anthropic && !this.openai && !this.gemini
    })
  }
  
  async processConversationAnalysis(job) {
    const startTime = Date.now()
    console.log(`🔍 Processing conversation analysis for job ${job.id}`)
    
    try {
      const { conversationId, userId, scenarioId, transcript, voiceMetrics, metadata } = job.data
      
      // Create assessment record
      const assessmentId = uuidv4()
      
      // Insert initial assessment record
      await db('conversation_assessments').insert({
        id: assessmentId,
        negotiation_id: conversationId,
        user_id: userId,
        scenario_id: scenarioId,
        status: 'processing',
        started_at: new Date(),
        conversation_transcript: transcript,
        voice_metrics: JSON.stringify(voiceMetrics || {}),
        conversation_metadata: JSON.stringify(metadata || {})
      })

      // Get scenario context for assessment
      const scenario = await db('scenarios').where('id', scenarioId).first()
      
      // Use AI assessment engine for sophisticated conversation analysis
      const assessmentResults = await this.performAIAssessment(transcript, voiceMetrics, scenario)
      
      // Update assessment with results
      await db('conversation_assessments')
        .where('id', assessmentId)
        .update({
          status: 'completed',
          completed_at: new Date(),
          processing_time_ms: Date.now() - startTime,
          claiming_value_score: assessmentResults.claimingValue.score,
          creating_value_score: assessmentResults.creatingValue.score,
          relationship_management_score: assessmentResults.relationshipManagement.score,
          overall_assessment_score: assessmentResults.overall,
          negotiation_tactics_identified: JSON.stringify(assessmentResults.allTechniques),
          conversation_flow_analysis: JSON.stringify(assessmentResults.conversationFlow),
          emotional_intelligence_metrics: JSON.stringify(assessmentResults.emotionalIntelligence),
          language_pattern_analysis: JSON.stringify(assessmentResults.languagePatterns),
          strengths_identified: JSON.stringify(assessmentResults.strengths),
          development_areas: JSON.stringify(assessmentResults.developmentAreas)
        })

      console.log(`✅ Assessment completed for conversation ${conversationId} in ${Date.now() - startTime}ms`)
      
      // Queue feedback generation or process directly if Redis unavailable
      const assessmentQueueService = require('./assessmentQueue')
      
      try {
        await assessmentQueueService.queueFeedbackGeneration(assessmentId, assessmentResults)
      } catch (queueError) {
        console.warn('⚠️ Feedback queue unavailable, saving AI feedback directly to database')
        
        // Save AI feedback directly to database when queue is unavailable
        if (assessmentResults && assessmentResults.aiGenerated) {
          await db('conversation_assessments')
            .where('id', assessmentId)
            .update({
              personalized_feedback: JSON.stringify(assessmentResults),
              status: 'completed',
              completed_at: new Date()
            })
          console.log('✅ AI feedback saved directly to database')
        }
      }
      
      return {
        assessmentId,
        processingTime: Date.now() - startTime,
        results: assessmentResults
      }
      
    } catch (error) {
      console.error(`❌ Assessment processing failed for job ${job.id}:`, error)
      
      // Update assessment status to failed
      if (job.data.conversationId) {
        await db('conversation_assessments')
          .where('negotiation_id', job.data.conversationId)
          .update({
            status: 'failed',
            completed_at: new Date(),
            processing_time_ms: Date.now() - startTime
          })
      }
      
      throw error
    }
  }

  async performAIAssessment(transcript, voiceMetrics, scenario) {
    console.log('🤖 Running AI-powered assessment analysis...')
    console.log('🔍 AI clients available:', {
      gemini: !!this.gemini,
      anthropic: !!this.anthropic,  
      openai: !!this.openai
    })
    
    try {
      // Use AI analysis if available, otherwise fallback to rule-based
      if (this.gemini || this.anthropic || this.openai) {
        console.log('✅ AI client available, proceeding with AI analysis')
        return await this.performAIAnalysis(transcript, voiceMetrics, scenario)
      } else {
        console.log('⚠️ No AI API available, using enhanced fallback assessment')
        return await this.performEnhancedFallbackAssessment(transcript, voiceMetrics, scenario)
      }
      
    } catch (error) {
      console.error('❌ Error in AI assessment analysis:', error)
      console.error('🔍 Error stack:', error.stack)
      // Fallback to basic assessment if AI analysis fails
      console.log('🔄 Falling back to basic assessment due to AI error')
      return await this.performEnhancedFallbackAssessment(transcript, voiceMetrics, scenario)
    }
  }

  async performAIAnalysis(transcript, voiceMetrics, scenario) {
    console.log('🧠 Requesting AI analysis of conversation transcript...')
    
    const prompt = this.buildNegotiationAnalysisPrompt(transcript, scenario)
    
    try {
      let aiResponse
      
      // Try Gemini first for cost-effectiveness, then Anthropic for quality, then OpenAI as fallback
      if (this.gemini) {
        console.log('📡 Using Google Gemini Pro for professional analysis')
        const model = this.gemini.getGenerativeModel({ 
          model: 'gemini-1.5-pro-latest',
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 4096
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE'
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE'
            }
          ]
        })
        const response = await model.generateContent(prompt)
        aiResponse = response.response.text()
      } else if (this.anthropic) {
        console.log('📡 Using Anthropic Claude for premium analysis')
        const response = await this.anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          temperature: 0.1,
          system: 'You are Dr. Sarah Mitchell, a Harvard Business School negotiation expert providing executive-level assessment. Your responses must be professional, theory-grounded, and immediately actionable for business leaders.',
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
        aiResponse = response.content[0].text
      } else if (this.openai) {
        console.log('📡 Using OpenAI GPT-4 for comprehensive analysis')
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'system',
              content: 'You are Dr. Sarah Mitchell, Senior Executive Coach at Harvard Business School specializing in negotiation assessment. Provide sophisticated, evidence-based analysis that meets C-suite standards.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4096,
          temperature: 0.1,
          top_p: 0.9
        })
        aiResponse = response.choices[0].message.content
      }
      
      // Parse AI response and extract structured assessment
      const parsedAssessment = this.parseAIResponse(aiResponse)
      
      // Enhance with voice metrics if available
      if (voiceMetrics) {
        this.enhanceWithVoiceMetrics(parsedAssessment, voiceMetrics)
      }
      
      console.log('✅ AI analysis completed successfully')
      return parsedAssessment
      
    } catch (error) {
      console.error('❌ AI API call failed:', error.message)
      throw error
    }
  }

  buildNegotiationAnalysisPrompt(transcript, scenario) {
    // Format transcript for analysis
    const formattedTranscript = Array.isArray(transcript) 
      ? transcript.map(entry => `${entry.speaker}: ${entry.message}`).join('\n')
      : (transcript || 'No transcript available')

    return `You are Dr. Sarah Mitchell, Senior Executive Coach at Harvard Business School's Program on Negotiation, with 15+ years specializing in executive-level negotiation assessment and development. You have deep expertise in Fisher & Ury's principled negotiation framework, advanced game theory applications, and behavioral psychology in high-stakes business negotiations.

Your role is to provide sophisticated, evidence-based assessment that meets C-suite standards for negotiation coaching. Your analysis combines rigorous academic grounding with immediately actionable insights for senior business professionals.

=== NEGOTIATION THEORY FOUNDATION ===

**HARVARD NEGOTIATION METHOD (Fisher & Ury "Getting to Yes"):**
1. Separate People from Problems - Maintain relationships while addressing substantive issues
2. Focus on Interests, Not Positions - Explore underlying needs beyond stated demands  
3. Generate Options for Mutual Gain - Create multiple win-win alternatives before deciding
4. Use Objective Criteria - Apply fair standards and benchmarks for decisions

**GAME THEORY CONCEPTS:**
- BATNA (Best Alternative to Negotiated Agreement) - Source of negotiating power
- ZOPA (Zone of Possible Agreement) - Overlap between reservation points
- Reciprocity Dynamics - Strategic concession patterns and mutual exchange
- Prisoner's Dilemma Applications - Balance competitive vs. cooperative strategies

**VALUE DIMENSIONS:**
- Claiming Value: Competitive negotiation, leverage, position advocacy
- Creating Value: Collaborative problem-solving, integrative solutions, expanding the pie
- Relationship Management: Trust building, communication excellence, long-term thinking

=== SCENARIO CONTEXT ===
${scenario ? `
Scenario: ${scenario.title}
Description: ${scenario.description}
Difficulty Level: ${scenario.difficulty_level}
Learning Focus: Advanced business negotiation with theory-grounded skill development
` : 'Real-world business negotiation scenario - analyze based on conversation dynamics'}

=== CONVERSATION TRANSCRIPT ===
${formattedTranscript}

=== ASSESSMENT FRAMEWORK ===

Provide comprehensive analysis across three critical dimensions using the methodology structure below:

**EXECUTIVE SUMMARY (50-75 words)**
- Overall performance assessment
- Key strengths and primary development opportunities
- Professional tone suitable for C-suite feedback

**WHAT WAS DONE WELL (100-150 words)**
- Specific examples with exact quotes from conversation
- Connection to negotiation theory and techniques
- Impact analysis showing how actions contributed to positive outcomes

**AREAS FOR IMPROVEMENT (100-150 words)**
- Specific missed opportunities with exact quotes
- Clear identification of suboptimal approaches
- Actionable suggestions with theoretical rationale

**NEXT STEPS & FOCUS AREAS (50-75 words)**
- Prioritized development recommendations
- Specific practice suggestions
- Clear pathway for skill advancement

**3-DIMENSIONAL SCORING (1-100 scale each):**

*Claiming Value Score:* Competitive negotiation effectiveness
- ZOPA identification and exploration
- BATNA development and strategic communication
- Anchoring, concession management, leverage utilization
- Position advocacy and deal protection

*Creating Value Score:* Collaborative problem-solving capability  
- Harvard Principles application (interests vs positions, option generation)
- Integrative solution development
- Multi-issue value trades and package deals
- Creative win-win opportunity identification

*Relationship Management Score:* Interpersonal excellence
- Trust building and credibility establishment
- Communication effectiveness and active listening
- Conflict resolution and de-escalation
- Long-term relationship consideration

REQUIRED JSON OUTPUT FORMAT:
{
  "executiveSummary": "Professional assessment highlighting key performance insights",
  "whatWasDoneWell": {
    "content": "Theory-grounded analysis with specific examples",
    "examples": [
      {
        "quote": "EXACT quote from conversation",
        "concept": "Specific negotiation theory/technique",
        "impact": "Clear outcome and effectiveness explanation"
      }
    ]
  },
  "areasForImprovement": {
    "content": "Specific opportunities with actionable recommendations",
    "examples": [
      {
        "quote": "EXACT quote showing opportunity",
        "issue": "Theoretical analysis of suboptimal approach",
        "suggestion": "Specific alternative with clear rationale"
      }
    ]
  },
  "nextStepsFocusAreas": "Prioritized development pathway with specific actions",
  "dimensionScores": {
    "claimingValue": {
      "score": 0-100,
      "assessment": "Evidence-based evaluation of competitive negotiation capabilities",
      "keyStrengths": ["Specific observed strengths"],
      "developmentFocus": "Theory-based improvement recommendations"
    },
    "creatingValue": {
      "score": 0-100,
      "assessment": "Harvard Principles application and collaborative effectiveness",
      "keyStrengths": ["Specific observed strengths"],
      "developmentFocus": "Theory-based improvement recommendations"
    },
    "relationshipManagement": {
      "score": 0-100,
      "assessment": "Interpersonal excellence and long-term relationship impact",
      "keyStrengths": ["Specific observed strengths"],
      "developmentFocus": "Theory-based improvement recommendations"
    }
  },
  "specificExamples": [
    {
      "quote": "EXACT conversation quote",
      "technique": "Specific negotiation concept applied",
      "impact": "Clear explanation of effectiveness and outcomes"
    }
  ]
}

CRITICAL QUALITY STANDARDS:
1. ALL quotes must be EXACT from the transcript - zero tolerance for paraphrasing
2. Every observation must connect to specific negotiation theory (Harvard Method, BATNA, ZOPA, etc.)
3. Scores must be evidence-based and reflect actual conversation performance
4. Maintain executive-appropriate professional tone throughout
5. Focus on behavior and technique, never personality judgments
6. Provide immediately actionable recommendations for business application
7. Target 300-400 total words for comprehensive yet concise executive feedback

Generate your comprehensive analysis now, demonstrating the sophisticated assessment capabilities expected at the highest levels of business negotiation coaching.`
  }

  parseAIResponse(aiResponse) {
    try {
      // Extract JSON from the AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response')
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      
      // Handle new comprehensive feedback format
      if (parsed.dimensionScores) {
        // Dynamic weighting based on scenario context and performance
        const dynamicWeights = this.calculateDynamicWeights(parsed.dimensionScores, scenario)
        const overall = Math.round(
          (parsed.dimensionScores.claimingValue.score * dynamicWeights.claiming) + 
          (parsed.dimensionScores.creatingValue.score * dynamicWeights.creating) + 
          (parsed.dimensionScores.relationshipManagement.score * dynamicWeights.relationship)
        )
        
        return {
          // Database-compatible format
          claimingValue: { 
            score: parsed.dimensionScores.claimingValue.score,
            analysis: {
              assessment: parsed.dimensionScores.claimingValue.assessment,
              techniques: parsed.dimensionScores.claimingValue.keyStrengths || []
            }
          },
          creatingValue: { 
            score: parsed.dimensionScores.creatingValue.score,
            analysis: {
              assessment: parsed.dimensionScores.creatingValue.assessment,
              techniques: parsed.dimensionScores.creatingValue.keyStrengths || []
            }
          },
          relationshipManagement: { 
            score: parsed.dimensionScores.relationshipManagement.score,
            analysis: {
              assessment: parsed.dimensionScores.relationshipManagement.assessment,
              techniques: parsed.dimensionScores.relationshipManagement.keyStrengths || []
            }
          },
          overall,
          allTechniques: [],
          conversationFlow: this.analyzeConversationFlow(''),
          emotionalIntelligence: { empathyScore: 50 },
          languagePatterns: { patterns: [] },
          strengths: parsed.whatWasDoneWell?.examples?.map(e => e.concept) || [],
          developmentAreas: parsed.areasForImprovement?.examples?.map(e => e.suggestion) || [],
          specificExamples: parsed.specificExamples || [],
          // UI-compatible format for frontend
          scores: {
            overall,
            claimingValue: parsed.dimensionScores.claimingValue.score,
            creatingValue: parsed.dimensionScores.creatingValue.score,
            relationshipManagement: parsed.dimensionScores.relationshipManagement.score
          },
          summary: parsed.executiveSummary || 'AI-generated comprehensive negotiation analysis completed.',
          improvements: parsed.areasForImprovement?.examples || [],
          performanceAnalysis: {
            claimingValue: {
              score: parsed.dimensionScores.claimingValue.score,
              assessment: parsed.dimensionScores.claimingValue.assessment,
              developmentFocus: parsed.dimensionScores.claimingValue.developmentFocus
            },
            creatingValue: {
              score: parsed.dimensionScores.creatingValue.score,
              assessment: parsed.dimensionScores.creatingValue.assessment,
              developmentFocus: parsed.dimensionScores.creatingValue.developmentFocus
            },
            relationshipManagement: {
              score: parsed.dimensionScores.relationshipManagement.score,
              assessment: parsed.dimensionScores.relationshipManagement.assessment,
              developmentFocus: parsed.dimensionScores.relationshipManagement.developmentFocus
            }
          },
          nextStepsFocusAreas: parsed.nextStepsFocusAreas,
          aiGenerated: true
        }
      } else {
        // Legacy format with standard weighting
        const overall = Math.round(
          (parsed.claimingValue.score * 0.35) + 
          (parsed.creatingValue.score * 0.35) + 
          (parsed.relationshipManagement.score * 0.30)
        )
        
        return {
          claimingValue: parsed.claimingValue,
          creatingValue: parsed.creatingValue,
          relationshipManagement: parsed.relationshipManagement,
          overall,
          allTechniques: [],
          conversationFlow: this.analyzeConversationFlow(''),
          emotionalIntelligence: { empathyScore: 50 },
          languagePatterns: { patterns: [] },
          strengths: parsed.strengths || [],
          developmentAreas: parsed.developmentAreas || [],
          specificExamples: parsed.specificExamples || [],
          aiGenerated: true
        }
      }
      
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      console.error('Raw AI response preview:', aiResponse?.substring(0, 500))
      throw new Error('Invalid AI response format')
    }
  }

  /**
   * Calculate dynamic weights based on scenario context and performance patterns
   */
  calculateDynamicWeights(dimensionScores, scenario) {
    // Default balanced weights
    let weights = {
      claiming: 0.35,
      creating: 0.35, 
      relationship: 0.30
    }

    // Adjust based on scenario difficulty and type
    if (scenario) {
      const difficulty = scenario.difficulty_level?.toLowerCase()
      const title = scenario.title?.toLowerCase() || ''
      
      // High-stakes scenarios emphasize claiming value
      if (difficulty === 'expert' || title.includes('high-stakes') || title.includes('vendor') || title.includes('contract')) {
        weights.claiming = 0.40
        weights.creating = 0.35
        weights.relationship = 0.25
      }
      
      // Partnership/collaborative scenarios emphasize creating value
      if (title.includes('partnership') || title.includes('collaboration') || title.includes('joint venture')) {
        weights.claiming = 0.30
        weights.creating = 0.45
        weights.relationship = 0.25
      }
      
      // Long-term relationship scenarios emphasize relationship management
      if (title.includes('relationship') || title.includes('ongoing') || title.includes('supplier')) {
        weights.claiming = 0.25
        weights.creating = 0.35
        weights.relationship = 0.40
      }
    }

    // Performance-based adjustment - boost weight of strongest dimension slightly
    if (dimensionScores) {
      const scores = {
        claiming: dimensionScores.claimingValue?.score || 0,
        creating: dimensionScores.creatingValue?.score || 0,
        relationship: dimensionScores.relationshipManagement?.score || 0
      }
      
      const maxScore = Math.max(scores.claiming, scores.creating, scores.relationship)
      const minScore = Math.min(scores.claiming, scores.creating, scores.relationship)
      
      // If there's exceptional performance in one dimension (20+ point gap), slightly boost its weight
      if (maxScore - minScore >= 20) {
        const topDimension = Object.keys(scores).find(key => scores[key] === maxScore)
        if (topDimension && weights[topDimension] < 0.45) {
          const boost = 0.05
          weights[topDimension] += boost
          
          // Redistribute the boost from other dimensions
          const otherDimensions = Object.keys(weights).filter(key => key !== topDimension)
          otherDimensions.forEach(dim => {
            weights[dim] -= boost / otherDimensions.length
          })
        }
      }
    }

    // Ensure weights sum to 1.0
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0)
    if (Math.abs(totalWeight - 1.0) > 0.01) {
      Object.keys(weights).forEach(key => {
        weights[key] = weights[key] / totalWeight
      })
    }

    console.log('🎯 Dynamic weighting applied:', weights)
    return weights
  }

  enhanceWithVoiceMetrics(assessment, voiceMetrics) {
    // Enhance assessment with voice analysis if available
    if (voiceMetrics.averagePause) {
      assessment.conversationFlow.pauseAnalysis = {
        averagePause: voiceMetrics.averagePause,
        confidence: voiceMetrics.averagePause < 2 ? 'high' : 'moderate'
      }
    }
    
    if (voiceMetrics.toneVariation) {
      assessment.emotionalIntelligence.toneVariation = voiceMetrics.toneVariation
    }
    
    if (voiceMetrics.speakingRate) {
      assessment.conversationFlow.speakingRate = voiceMetrics.speakingRate
      assessment.conversationFlow.pacing = 
        voiceMetrics.speakingRate > 180 ? 'fast' :
        voiceMetrics.speakingRate < 120 ? 'slow' : 'appropriate'
    }
  }

  async performEnhancedFallbackAssessment(transcript, voiceMetrics, scenario) {
    console.log('🔄 Running enhanced fallback assessment...')
    
    try {
      // Use the existing assessment engine but with enhanced analysis
      const claimingValue = this.assessmentEngine.calculateClaimingValue(transcript, voiceMetrics, scenario)
      const creatingValue = this.assessmentEngine.calculateCreatingValue(transcript, voiceMetrics, scenario)
      const relationshipManagement = this.assessmentEngine.calculateRelationshipManagement(transcript, voiceMetrics, scenario)
      
      // Calculate weighted overall score
      const overall = Math.round(
        (claimingValue.score * 0.35) + 
        (creatingValue.score * 0.35) + 
        (relationshipManagement.score * 0.30)
      )
      
      // Aggregate all techniques identified
      const allTechniques = [
        ...claimingValue.analysis.techniques,
        ...creatingValue.analysis.techniques,
        ...relationshipManagement.analysis.techniques
      ]
      
      // Enhanced analysis functions
      const conversationFlow = this.analyzeConversationFlow(transcript)
      const emotionalIntelligence = this.analyzeEmotionalIntelligence(transcript)
      const languagePatterns = this.analyzeLanguagePatterns(transcript)
      const strengths = this.identifyStrengths(claimingValue, creatingValue, relationshipManagement)
      const developmentAreas = this.identifyDevelopmentAreas(claimingValue, creatingValue, relationshipManagement)
      
      return {
        claimingValue,
        creatingValue,
        relationshipManagement,
        overall,
        allTechniques,
        conversationFlow,
        emotionalIntelligence,
        languagePatterns,
        strengths,
        developmentAreas,
        aiGenerated: false,
        fallbackUsed: true
      }
    } catch (error) {
      console.log('⚠️ AssessmentEngine has missing methods, using simplified fallback')
      return this.generateSimplifiedAssessment(transcript, voiceMetrics, scenario)
    }
  }

  generateSimplifiedAssessment(transcript, voiceMetrics, scenario) {
    console.log('🔧 Generating simplified assessment from transcript analysis...')
    
    if (!transcript) {
      return this.generateBasicAssessment('', voiceMetrics)
    }

    // Simple text analysis for assessment
    const words = transcript.toLowerCase().split(/\s+/)
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0)
    
    // Basic negotiation technique detection
    const techniques = []
    const lowerTranscript = transcript.toLowerCase()
    
    // Claiming Value indicators
    let claimingScore = 50
    if (lowerTranscript.includes('batna') || lowerTranscript.includes('alternative') || lowerTranscript.includes('other options')) {
      claimingScore += 15
      techniques.push('BATNA Reference')
    }
    if (lowerTranscript.includes('position') || lowerTranscript.includes('firm on') || lowerTranscript.includes('need')) {
      claimingScore += 10
      techniques.push('Position Advocacy')
    }
    
    // Creating Value indicators  
    let creatingScore = 55
    if (lowerTranscript.includes('what matters') || lowerTranscript.includes('important to you') || lowerTranscript.includes('interests')) {
      creatingScore += 20
      techniques.push('Interest Exploration')
    }
    if (lowerTranscript.includes('what if') || lowerTranscript.includes('alternative') || lowerTranscript.includes('options')) {
      creatingScore += 15
      techniques.push('Option Generation')
    }
    if (lowerTranscript.includes('both parties') || lowerTranscript.includes('mutual') || lowerTranscript.includes('win-win')) {
      creatingScore += 10
      techniques.push('Mutual Benefit Focus')
    }
    
    // Relationship Management indicators
    let relationshipScore = 60
    if (lowerTranscript.includes('understand') || lowerTranscript.includes('appreciate') || lowerTranscript.includes('respect')) {
      relationshipScore += 15
      techniques.push('Empathy Expression')
    }
    if (lowerTranscript.includes('thank you') || lowerTranscript.includes('please') || lowerTranscript.includes('appreciate')) {
      relationshipScore += 10
      techniques.push('Politeness')
    }
    if (lowerTranscript.includes('partnership') || lowerTranscript.includes('together') || lowerTranscript.includes('collaborate')) {
      relationshipScore += 15
      techniques.push('Relationship Building')
    }

    // Ensure scores are within bounds
    claimingScore = Math.min(95, Math.max(20, claimingScore))
    creatingScore = Math.min(95, Math.max(20, creatingScore))
    relationshipScore = Math.min(95, Math.max(20, relationshipScore))
    
    const overall = Math.round(
      (claimingScore * 0.35) + 
      (creatingScore * 0.35) + 
      (relationshipScore * 0.30)
    )

    // Generate structured results
    const claimingValue = {
      score: claimingScore,
      analysis: {
        techniques: techniques.filter(t => ['BATNA Reference', 'Position Advocacy'].some(ct => t.includes(ct.split(' ')[0]))),
        reasoning: `Score based on competitive negotiation language patterns and strategic positioning`
      }
    }

    const creatingValue = {
      score: creatingScore,
      analysis: {
        techniques: techniques.filter(t => ['Interest Exploration', 'Option Generation', 'Mutual Benefit'].some(ct => t.includes(ct.split(' ')[0]))),
        reasoning: `Score based on collaborative language and value creation indicators`
      }
    }

    const relationshipManagement = {
      score: relationshipScore,
      analysis: {
        techniques: techniques.filter(t => ['Empathy', 'Politeness', 'Relationship'].some(ct => t.includes(ct.split(' ')[0]))),
        reasoning: `Score based on interpersonal communication and relationship building language`
      }
    }

    return {
      claimingValue,
      creatingValue,
      relationshipManagement,
      overall,
      allTechniques: techniques,
      conversationFlow: this.analyzeConversationFlow(transcript),
      emotionalIntelligence: this.analyzeEmotionalIntelligence(transcript),
      languagePatterns: this.analyzeLanguagePatterns(transcript),
      strengths: this.identifyStrengths(claimingValue, creatingValue, relationshipManagement),
      developmentAreas: this.identifyDevelopmentAreas(claimingValue, creatingValue, relationshipManagement),
      aiGenerated: false,
      fallbackUsed: true,
      simplifiedAssessment: true
    }
  }

  analyzeConversationFlow(transcript) {
    if (!transcript) return { error: 'No transcript available' }
    
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = transcript.toLowerCase().split(/\s+/)
    
    return {
      totalSentences: sentences.length,
      totalWords: words.length,
      averageWordsPerSentence: Math.round(words.length / sentences.length),
      conversationLength: 'medium', // Could be calculated based on timing
      communicationStyle: words.length > 500 ? 'detailed' : 'concise'
    }
  }

  analyzeEmotionalIntelligence(transcript) {
    if (!transcript) return { score: 0 }
    
    const emotionalWords = ['understand', 'feel', 'appreciate', 'respect', 'empathy', 'perspective']
    const words = transcript.toLowerCase().split(/\s+/)
    const emotionalCount = words.filter(word => emotionalWords.includes(word)).length
    
    return {
      emotionalWordsUsed: emotionalCount,
      empathyScore: Math.min(100, emotionalCount * 20),
      sentimentPolarity: 'neutral' // Simplified for now
    }
  }

  analyzeLanguagePatterns(transcript) {
    if (!transcript) return { patterns: [] }
    
    const patterns = []
    const lowerTranscript = transcript.toLowerCase()
    
    if (lowerTranscript.includes('i think') || lowerTranscript.includes('i believe')) {
      patterns.push('Opinion expression')
    }
    
    if (lowerTranscript.includes('what if') || lowerTranscript.includes('suppose')) {
      patterns.push('Hypothetical thinking')
    }
    
    if (lowerTranscript.includes('because') || lowerTranscript.includes('since')) {
      patterns.push('Reasoning and justification')
    }
    
    return { patterns }
  }

  identifyStrengths(claimingValue, creatingValue, relationshipManagement) {
    const strengths = []
    
    if (claimingValue.score >= 75) {
      strengths.push('Strong position advocacy and claiming value skills')
    }
    
    if (creatingValue.score >= 75) {
      strengths.push('Excellent collaborative problem-solving abilities')
    }
    
    if (relationshipManagement.score >= 75) {
      strengths.push('Outstanding interpersonal and relationship management skills')
    }
    
    // Add technique-specific strengths
    if (claimingValue.analysis.techniques.length > 3) {
      strengths.push('Diverse tactical approach to negotiation')
    }
    
    return strengths.length > 0 ? strengths : ['Demonstrated engagement in negotiation process']
  }

  identifyDevelopmentAreas(claimingValue, creatingValue, relationshipManagement) {
    const developmentAreas = []
    
    if (claimingValue.score < 60) {
      developmentAreas.push('Strengthen position advocacy and value claiming techniques')
    }
    
    if (creatingValue.score < 60) {
      developmentAreas.push('Focus on collaborative value creation and win-win solutions')
    }
    
    if (relationshipManagement.score < 60) {
      developmentAreas.push('Improve relationship building and interpersonal communication')
    }
    
    // Identify the weakest dimension for focused improvement
    const scores = { claimingValue: claimingValue.score, creatingValue: creatingValue.score, relationshipManagement: relationshipManagement.score }
    const weakest = Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b)
    
    if (scores[weakest] < 70) {
      const dimensionNames = {
        claimingValue: 'competitive negotiation strategies',
        creatingValue: 'collaborative problem-solving techniques',
        relationshipManagement: 'interpersonal communication skills'
      }
      developmentAreas.push(`Priority focus area: ${dimensionNames[weakest]}`)
    }
    
    return developmentAreas.length > 0 ? developmentAreas : ['Continue practicing to build confidence and fluency']
  }

  async performEnhancedAssessment(transcript, voiceMetrics, scenario) {
    console.log('🧠 Running enhanced 3-dimensional assessment analysis...')
    
    try {
      // Use the enhanced assessment engine for sophisticated analysis
      const claimingValue = this.assessmentEngine.calculateClaimingValue(transcript, voiceMetrics, scenario)
      const creatingValue = this.assessmentEngine.calculateCreatingValue(transcript, voiceMetrics, scenario)
      const relationshipManagement = this.assessmentEngine.calculateRelationshipManagement(transcript, voiceMetrics, scenario)
      
      // Calculate weighted overall score
      const overall = Math.round(
        (claimingValue.score * 0.35) + 
        (creatingValue.score * 0.35) + 
        (relationshipManagement.score * 0.30)
      )
      
      // Aggregate all techniques with deduplication
      const allTechniques = [...new Set([
        ...claimingValue.analysis.techniques,
        ...creatingValue.analysis.techniques,
        ...relationshipManagement.analysis.techniques
      ])]
      
      // Enhanced conversation flow analysis
      const conversationFlow = this.analyzeConversationFlow(transcript)
      
      // Basic emotional intelligence metrics (keeping existing method for now)
      const emotionalIntelligence = this.analyzeEmotionalIntelligence(transcript)
      
      // Language pattern analysis (keeping existing method for now)
      const languagePatterns = this.analyzeLanguagePatterns(transcript)
      
      // Identify strengths and development areas with basic analysis
      const strengths = this.identifyStrengths(claimingValue, creatingValue, relationshipManagement)
      const developmentAreas = this.identifyDevelopmentAreas(claimingValue, creatingValue, relationshipManagement)
      
      return {
        claimingValue,
        creatingValue,
        relationshipManagement,
        overall,
        allTechniques,
        conversationFlow,
        emotionalIntelligence,
        languagePatterns,
        strengths,
        developmentAreas
      }
      
    } catch (error) {
      console.error('Error in enhanced assessment analysis:', error)
      // Fallback to basic assessment if enhanced analysis fails
      return this.generateBasicAssessment(transcript, voiceMetrics)
    }
  }

  generateBasicAssessment(transcript, voiceMetrics) {
    // Fallback basic assessment for error cases
    const transcriptLength = transcript ? transcript.length : 0
    const baseScore = Math.min(90, Math.max(40, 50 + (transcriptLength / 100)))
    
    return {
      claimingValue: { score: Math.round(baseScore + (Math.random() * 20 - 10)), analysis: { techniques: [] } },
      creatingValue: { score: Math.round(baseScore + (Math.random() * 20 - 10)), analysis: { techniques: [] } },
      relationshipManagement: { score: Math.round(baseScore + (Math.random() * 20 - 10)), analysis: { techniques: [] } },
      overall: Math.round(baseScore + (Math.random() * 15 - 7.5)),
      allTechniques: ['Basic conversation engagement'],
      conversationFlow: { totalSentences: Math.floor(transcriptLength / 50) },
      emotionalIntelligence: { empathyScore: 50 },
      languagePatterns: { patterns: [] },
      strengths: ['Engaged in negotiation process'],
      developmentAreas: ['Continue practicing negotiation skills']
    }
  }
}

// Export both the class and the processor function for Bull queue
module.exports = AssessmentProcessor

module.exports.processConversationAnalysis = (job) => {
  const processor = new AssessmentProcessor()
  return processor.processConversationAnalysis(job)
}