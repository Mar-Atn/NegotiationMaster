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
      
      // Try Gemini first, then Anthropic, then OpenAI
      if (this.gemini) {
        console.log('📡 Using Google Gemini for analysis')
        const model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' })
        const response = await model.generateContent(prompt)
        aiResponse = response.response.text()
      } else if (this.anthropic) {
        console.log('📡 Using Anthropic Claude for analysis')
        const response = await this.anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 4000,
          temperature: 0.1,
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
        aiResponse = response.content[0].text
      } else if (this.openai) {
        console.log('📡 Using OpenAI GPT-4 for analysis')
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4-turbo-preview',
          messages: [{
            role: 'user',
            content: prompt
          }],
          max_tokens: 4000,
          temperature: 0.1
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

    return `You are an expert negotiation coach with advanced knowledge of negotiation theory and practice. You specialize in providing constructive, actionable feedback that helps business professionals develop negotiation skills through specific analysis of their conversation performance.

Your role is to analyze this conversation and generate personalized feedback (300-400 words) that follows academic negotiation principles while being immediately practical for executive-level professionals.

SCENARIO CONTEXT:
${scenario ? `
Title: ${scenario.title}
Description: ${scenario.description}
Difficulty Level: ${scenario.difficulty_level}
Learning Objectives: Professional negotiation skill development with focus on real-world application
` : 'Scenario context not available - analyze based on conversation content'}

CONVERSATION TRANSCRIPT:
${formattedTranscript}

ANALYSIS FRAMEWORK - Evaluate across THREE CRITICAL DIMENSIONS:

**DIMENSION 1: CLAIMING VALUE (Competitive Negotiation)**
Core Assessment Areas:
- ZOPA (Zone of Possible Agreement): Did they identify and explore the range where deals can be made?
- BATNA (Best Alternative to Negotiated Agreement): How well did they understand and communicate their alternatives?
- Reciprocity Concept: Were concessions made strategically with expectation of reciprocity?
- Prisoner's Dilemma Dynamics: Did they balance competitive vs. cooperative strategies effectively?

**DIMENSION 2: CREATING VALUE (Harvard's 4 Principles)**
Core Assessment Areas:
- Separate People from Problems: Did they maintain relationships while addressing business issues?
- Focus on Interests, Not Positions: Did they explore underlying needs beyond stated positions?
- Generate Options for Mutual Gain: Were creative win-win solutions developed?
- Use Objective Criteria: Were decisions based on fair standards and benchmarks?

**DIMENSION 3: RELATIONSHIP MANAGEMENT**
Core Assessment Areas:
- Trust Building: Did they establish credibility through transparency and follow-through?
- Communication Style: How effective were their listening and communication approaches?
- Conflict Resolution: Were disagreements managed constructively without damaging relationships?
- Long-term Thinking: Did they consider future interactions and reputation impact?

REQUIRED OUTPUT FORMAT (Comprehensive Professional Feedback - JSON):
{
  "executiveSummary": "50-75 word overall performance assessment highlighting key strengths and primary development opportunities",
  "whatWasDoneWell": {
    "content": "100-150 words with specific examples and theory connections",
    "examples": [
      {
        "quote": "Exact quote from conversation",
        "concept": "Negotiation theory/technique applied",
        "impact": "How this specific action contributed to positive outcomes"
      }
    ]
  },
  "areasForImprovement": {
    "content": "100-150 words with specific missed opportunities and actionable suggestions",
    "examples": [
      {
        "quote": "Exact quote showing missed opportunity",
        "issue": "What was suboptimal about this approach",
        "suggestion": "Specific alternative approach with clear rationale"
      }
    ]
  },
  "nextStepsFocusAreas": "50-75 words with prioritized development recommendations and specific practice suggestions",
  "dimensionScores": {
    "claimingValue": {
      "score": 75,
      "assessment": "ZOPA exploration, BATNA utilization, reciprocity dynamics, competitive positioning analysis",
      "keyStrengths": ["Specific strengths observed"],
      "developmentFocus": "Specific areas for improvement with theory basis"
    },
    "creatingValue": {
      "score": 82,
      "assessment": "Harvard principles application, interest vs position focus, option generation, objective criteria use",
      "keyStrengths": ["Specific strengths observed"], 
      "developmentFocus": "Specific areas for improvement with theory basis"
    },
    "relationshipManagement": {
      "score": 88,
      "assessment": "Trust building, communication effectiveness, conflict resolution, long-term thinking analysis",
      "keyStrengths": ["Specific strengths observed"],
      "developmentFocus": "Specific areas for improvement with theory basis"
    }
  },
  "specificExamples": [
    {
      "quote": "Exact conversation quote",
      "technique": "Specific negotiation concept/technique",
      "impact": "Effectively moved beyond positions to underlying needs"
    }
  ]
}

CRITICAL REQUIREMENTS:
1. ALL quotes must be EXACT from the conversation transcript - no paraphrasing
2. Connect every observation to specific negotiation theory (Harvard Method, BATNA, ZOPA, etc.)
3. Provide actionable, specific suggestions that business professionals can implement immediately
4. Maintain professional, executive-appropriate tone throughout
5. Focus on behavior and technique, not personality judgments
6. Ensure scores reflect actual performance based on conversation evidence
7. Target 300-400 total words across all sections for comprehensive yet concise feedback

Generate your analysis now based on the provided conversation transcript and scenario context.`
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
        // New format with dimensionScores
        const overall = Math.round(
          (parsed.dimensionScores.claimingValue.score * 0.35) + 
          (parsed.dimensionScores.creatingValue.score * 0.35) + 
          (parsed.dimensionScores.relationshipManagement.score * 0.30)
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
        // Legacy format fallback
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
      throw new Error('Invalid AI response format')
    }
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