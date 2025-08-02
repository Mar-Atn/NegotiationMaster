const natural = require('natural')
const TfIdf = natural.TfIdf
const WordTokenizer = natural.WordTokenizer
const SentimentAnalyzer = natural.SentimentAnalyzer
const stemmer = natural.PorterStemmer
const AIPromptEngine = require('./aiPromptEngine')

class AssessmentEngine {
  constructor() {
    this.tokenizer = new WordTokenizer()
    this.tfidf = new TfIdf()
    this.sentimentAnalyzer = new SentimentAnalyzer('English', stemmer, 'afinn')
    
    // Initialize assessment frameworks
    this.assessmentFrameworks = this.initializeFrameworks()
    
    // Initialize AI prompt engine for advanced analysis (optional)
    try {
      this.aiPromptEngine = new AIPromptEngine()
    } catch (error) {
      console.log('ℹ️ AI prompt engine unavailable, using rule-based analysis only')
      this.aiPromptEngine = null
    }
    
    // Control flags for analysis modes
    this.useAIAnalysis = process.env.USE_AI_ANALYSIS !== 'false' && this.aiPromptEngine !== null
    this.enableHybridMode = process.env.ENABLE_HYBRID_ANALYSIS === 'true'
  }

  /**
   * Master assessment method that combines rule-based and AI analysis
   * Uses AI for sophisticated feedback generation and rule-based for scoring validation
   */
  async generateComprehensiveAssessment(transcript, voiceMetrics, scenarioContext, userProfile = {}) {
    try {
      console.log('🎯 Starting comprehensive negotiation assessment...')
      
      // Rule-based analysis for baseline scores and validation
      const ruleBasedResults = this.generateRuleBasedAssessment(transcript, voiceMetrics, scenarioContext)
      
      let aiResults = null
      let finalResults = ruleBasedResults
      
      // AI analysis for enhanced feedback (if enabled)
      if (this.useAIAnalysis) {
        try {
          aiResults = await this.aiPromptEngine.generateComprehensiveAnalysis(
            transcript, 
            scenarioContext, 
            voiceMetrics,
            userProfile.skillLevel || 'intermediate'
          )
          
          // Validate AI analysis quality
          const qualityCheck = this.aiPromptEngine.validateAnalysisQuality(aiResults)
          
          if (qualityCheck.isValid) {
            // Use AI analysis with rule-based validation
            finalResults = this.combineAnalysisResults(ruleBasedResults, aiResults)
            console.log('✅ Using AI-enhanced analysis results')
          } else {
            console.log('⚠️ AI analysis quality insufficient, using rule-based results')
            console.log('Quality issues:', qualityCheck.issues)
          }
          
        } catch (aiError) {
          console.error('❌ AI analysis failed, falling back to rule-based:', aiError)
          // Continue with rule-based results
        }
      }
      
      // Calculate overall performance metrics
      const performanceMetrics = this.calculatePerformanceMetrics(finalResults)
      
      return {
        ...finalResults,
        ...performanceMetrics,
        analysisMode: aiResults ? 'ai_enhanced' : 'rule_based',
        aiAnalysisAvailable: aiResults !== null,
        timestamp: new Date().toISOString()
      }
      
    } catch (error) {
      console.error('❌ Comprehensive assessment failed:', error)
      throw error
    }
  }

  /**
   * Rule-based assessment method (existing functionality)
   */
  generateRuleBasedAssessment(transcript, voiceMetrics, scenarioContext) {
    const claimingValue = this.calculateClaimingValue(transcript, voiceMetrics, scenarioContext)
    const creatingValue = this.calculateCreatingValue(transcript, voiceMetrics, scenarioContext)
    const relationshipManagement = this.calculateRelationshipManagement(transcript, voiceMetrics, scenarioContext)
    
    const overall = Math.round((claimingValue.score + creatingValue.score + relationshipManagement.score) / 3)
    
    return {
      claimingValue,
      creatingValue,
      relationshipManagement,
      overall,
      analysisType: 'rule_based'
    }
  }

  /**
   * Combine rule-based and AI analysis results
   */
  combineAnalysisResults(ruleBasedResults, aiResults) {
    const aiScores = aiResults.structuredAnalysis.scores
    
    // Use AI scores if available and reasonable, otherwise use rule-based scores
    const combinedScores = {
      claimingValue: {
        score: this.validateAndUseScore(aiScores.claimingValue, ruleBasedResults.claimingValue.score),
        analysis: {
          ...ruleBasedResults.claimingValue.analysis,
          aiInsights: aiResults.structuredAnalysis.dimensionAnalysis.claimingValue,
          aiQuotes: aiResults.structuredAnalysis.conversationQuotes.filter((_, i) => i < 3)
        }
      },
      creatingValue: {
        score: this.validateAndUseScore(aiScores.creatingValue, ruleBasedResults.creatingValue.score),
        analysis: {
          ...ruleBasedResults.creatingValue.analysis,
          aiInsights: aiResults.structuredAnalysis.dimensionAnalysis.creatingValue,
          aiQuotes: aiResults.structuredAnalysis.conversationQuotes.filter((_, i) => i >= 3 && i < 6)
        }
      },
      relationshipManagement: {
        score: this.validateAndUseScore(aiScores.relationshipManagement, ruleBasedResults.relationshipManagement.score),
        analysis: {
          ...ruleBasedResults.relationshipManagement.analysis,
          aiInsights: aiResults.structuredAnalysis.dimensionAnalysis.relationshipManagement,
          aiQuotes: aiResults.structuredAnalysis.conversationQuotes.filter((_, i) => i >= 6)
        }
      }
    }
    
    const overall = Math.round((combinedScores.claimingValue.score + combinedScores.creatingValue.score + combinedScores.relationshipManagement.score) / 3)
    
    return {
      ...combinedScores,
      overall,
      analysisType: 'ai_enhanced',
      executiveSummary: aiResults.structuredAnalysis.executiveSummary,
      aiRecommendations: aiResults.structuredAnalysis.recommendations,
      aiRawAnalysis: aiResults.rawAnalysis,
      tokensUsed: aiResults.tokensUsed
    }
  }

  /**
   * Validate AI score against rule-based score for reasonableness
   */
  validateAndUseScore(aiScore, ruleBasedScore) {
    if (!aiScore || isNaN(aiScore) || aiScore < 0 || aiScore > 100) {
      return ruleBasedScore
    }
    
    // If AI score differs by more than 25 points from rule-based, use average
    const difference = Math.abs(aiScore - ruleBasedScore)
    if (difference > 25) {
      console.log(`⚠️ Large score difference detected (${difference} points), using average`)
      return Math.round((aiScore + ruleBasedScore) / 2)
    }
    
    return aiScore
  }

  /**
   * Calculate additional performance metrics
   */
  calculatePerformanceMetrics(results) {
    const scores = [results.claimingValue.score, results.creatingValue.score, results.relationshipManagement.score]
    
    const consistency = this.calculateConsistency(scores)
    const balance = this.calculateBalance(scores)
    const strengthDimension = this.getStrongestDimension(results)
    const developmentDimension = this.getWeakestDimension(results)
    
    return {
      performanceMetrics: {
        consistency: Math.round(consistency * 100),
        balance: Math.round(balance * 100),
        strengthDimension,
        developmentDimension,
        averageScore: results.overall
      }
    }
  }

  calculateConsistency(scores) {
    if (scores.length < 2) return 1
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    // Return consistency score (0-1, where 1 is most consistent)
    return Math.max(0, 1 - (standardDeviation / 25))
  }

  calculateBalance(scores) {
    const max = Math.max(...scores)
    const min = Math.min(...scores)
    const range = max - min
    
    // Return balance score (0-1, where 1 is most balanced)
    return Math.max(0, 1 - (range / 100))
  }

  getStrongestDimension(results) {
    const scores = {
      'Claiming Value': results.claimingValue.score,
      'Creating Value': results.creatingValue.score,
      'Relationship Management': results.relationshipManagement.score
    }
    
    return Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)
  }

  getWeakestDimension(results) {
    const scores = {
      'Claiming Value': results.claimingValue.score,
      'Creating Value': results.creatingValue.score,
      'Relationship Management': results.relationshipManagement.score
    }
    
    return Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b)
  }

  /**
   * Calculate Claiming Value Score (0-100)
   * Measures competitive negotiation effectiveness, BATNA usage, position advocacy
   */
  calculateClaimingValue(transcript, voiceMetrics, scenarioContext) {
    let score = 0
    const analysis = {
      techniques: [],
      strengths: [],
      weaknesses: [],
      examples: []
    }

    if (!transcript || transcript.length < 50) {
      return { score: 0, analysis: { error: 'Insufficient conversation data' } }
    }

    // Parse conversation into structured format
    const conversation = this.parseConversationTranscript(transcript)
    const userMessages = conversation.filter(msg => msg.speaker === 'user')
    const fullText = userMessages.map(msg => msg.content).join(' ').toLowerCase()
    
    // 1. Strategic Anchoring (25 points) - Enhanced with context analysis
    const anchoringResult = this.analyzeStrategicAnchoring(userMessages, scenarioContext)
    score += anchoringResult.score
    analysis.techniques.push(...anchoringResult.techniques)
    analysis.examples.push(...anchoringResult.examples)

    // 2. BATNA Development & Usage (20 points) - Enhanced with leverage detection
    const batnaResult = this.analyzeBATNAUtilization(userMessages, scenarioContext)
    score += batnaResult.score
    analysis.techniques.push(...batnaResult.techniques)
    analysis.examples.push(...batnaResult.examples)

    // 3. Systematic Concession Management (25 points) - Enhanced pattern recognition
    const concessionResult = this.analyzeConcessionStrategy(userMessages, conversation)
    score += concessionResult.score
    analysis.techniques.push(...concessionResult.techniques)
    analysis.examples.push(...concessionResult.examples)

    // 4. Information Asymmetry Exploitation (15 points) - Advanced questioning analysis
    const infoResult = this.analyzeInformationStrategy(userMessages)
    score += infoResult.score
    analysis.techniques.push(...infoResult.techniques)
    analysis.examples.push(...infoResult.examples)

    // 5. Negotiation Pressure & Deadlines (15 points) - Timing and urgency analysis
    const pressureResult = this.analyzePressureApplication(userMessages, voiceMetrics)
    score += pressureResult.score
    analysis.techniques.push(...pressureResult.techniques)
    analysis.examples.push(...pressureResult.examples)

    // Normalize to 0-100 scale with sophisticated weighting
    score = Math.min(100, Math.max(0, score))
    
    // Add contextual bonus for advanced techniques
    const advancedBonus = this.calculateAdvancedClaimingBonus(analysis.techniques, fullText)
    score = Math.min(100, score + advancedBonus)

    return { score: Math.round(score), analysis }
  }

  /**
   * Calculate Creating Value Score (0-100)  
   * Measures collaborative problem-solving, interest identification, win-win solutions
   */
  calculateCreatingValue(transcript, voiceMetrics, scenarioContext) {
    let score = 0
    const analysis = {
      techniques: [],
      strengths: [],
      weaknesses: [],
      examples: []
    }

    if (!transcript || transcript.length < 50) {
      return { score: 0, analysis: { error: 'Insufficient conversation data' } }
    }

    // Parse conversation into structured format
    const conversation = this.parseConversationTranscript(transcript)
    const userMessages = conversation.filter(msg => msg.speaker === 'user')
    const fullText = userMessages.map(msg => msg.content).join(' ').toLowerCase()

    // 1. Deep Interest Exploration (30 points) - Advanced questioning and probing
    const interestResult = this.analyzeInterestExploration(userMessages, conversation)
    score += interestResult.score
    analysis.techniques.push(...interestResult.techniques)
    analysis.examples.push(...interestResult.examples)

    // 2. Multi-Issue Option Generation (25 points) - Creative solution development
    const optionResult = this.analyzeOptionGeneration(userMessages, scenarioContext)
    score += optionResult.score
    analysis.techniques.push(...optionResult.techniques)
    analysis.examples.push(...optionResult.examples)

    // 3. Value Trade-off Intelligence (25 points) - Priority mapping and exchanges
    const tradeoffResult = this.analyzeValueTradeoffs(userMessages, conversation)
    score += tradeoffResult.score
    analysis.techniques.push(...tradeoffResult.techniques)
    analysis.examples.push(...tradeoffResult.examples)

    // 4. Long-term Relationship Building (10 points) - Future-focused collaboration
    const relationshipResult = this.analyzeFutureValueCreation(userMessages)
    score += relationshipResult.score
    analysis.techniques.push(...relationshipResult.techniques)
    analysis.examples.push(...relationshipResult.examples)

    // 5. Integrative Problem Solving (10 points) - Creative win-win solutions
    const integrationResult = this.analyzeIntegrativeSolutions(userMessages, scenarioContext)
    score += integrationResult.score
    analysis.techniques.push(...integrationResult.techniques)
    analysis.examples.push(...integrationResult.examples)

    // Normalize to 0-100 scale with collaborative bonus
    score = Math.min(100, Math.max(0, score))
    
    // Add contextual bonus for sophisticated value creation
    const collaborativeBonus = this.calculateCollaborativeBonus(analysis.techniques, fullText)
    score = Math.min(100, score + collaborativeBonus)

    return { score: Math.round(score), analysis }
  }

  /**
   * Calculate Relationship Management Score (0-100)
   * Measures interpersonal dynamics, trust building, long-term relationship impact
   */
  calculateRelationshipManagement(transcript, voiceMetrics, scenarioContext) {
    let score = 0
    const analysis = {
      techniques: [],
      strengths: [],
      weaknesses: [],
      examples: []
    }

    if (!transcript || transcript.length < 50) {
      return { score: 0, analysis: { error: 'Insufficient conversation data' } }
    }

    // Parse conversation into structured format
    const conversation = this.parseConversationTranscript(transcript)
    const userMessages = conversation.filter(msg => msg.speaker === 'user')
    const fullText = userMessages.map(msg => msg.content).join(' ').toLowerCase()

    // 1. Advanced Active Listening (25 points) - Sophisticated acknowledgment and reflection
    const listeningResult = this.analyzeActiveLisening(userMessages, conversation)
    score += listeningResult.score
    analysis.techniques.push(...listeningResult.techniques)
    analysis.examples.push(...listeningResult.examples)

    // 2. Emotional Intelligence & Empathy (25 points) - Perspective-taking and validation
    const empathyResult = this.analyzeEmotionalIntelligence(userMessages, conversation)
    score += empathyResult.score
    analysis.techniques.push(...empathyResult.techniques)
    analysis.examples.push(...empathyResult.examples)

    // 3. Professional Communication Excellence (20 points) - Clarity, respect, persuasion
    const communicationResult = this.analyzeCommunicationExcellence(userMessages, voiceMetrics)
    score += communicationResult.score
    analysis.techniques.push(...communicationResult.techniques)
    analysis.examples.push(...communicationResult.examples)

    // 4. Conflict Resolution & De-escalation (15 points) - Tension management
    const conflictResult = this.analyzeConflictManagement(userMessages, conversation)
    score += conflictResult.score
    analysis.techniques.push(...conflictResult.techniques)
    analysis.examples.push(...conflictResult.examples)

    // 5. Trust & Credibility Building (15 points) - Relationship foundation
    const trustResult = this.analyzeTrustBuilding(userMessages, conversation)
    score += trustResult.score
    analysis.techniques.push(...trustResult.techniques)
    analysis.examples.push(...trustResult.examples)

    // Normalize to 0-100 scale with interpersonal bonus
    score = Math.min(100, Math.max(0, score))
    
    // Add contextual bonus for exceptional relationship management
    const interpersonalBonus = this.calculateInterpersonalBonus(analysis.techniques, fullText)
    score = Math.min(100, score + interpersonalBonus)

    return { score: Math.round(score), analysis }
  }

  // ==================== ENHANCED CONVERSATION ANALYSIS METHODS ====================
  
  /**
   * Parse conversation transcript into structured format
   */
  parseConversationTranscript(transcript) {
    const lines = transcript.split('\n').filter(line => line.trim().length > 0)
    const conversation = []
    
    for (const line of lines) {
      const match = line.match(/^(User|\w+):\s*(.+)$/)
      if (match) {
        const [, speaker, content] = match
        conversation.push({
          speaker: speaker.toLowerCase() === 'user' ? 'user' : 'ai',
          originalSpeaker: speaker,
          content: content.trim(),
          timestamp: conversation.length
        })
      }
    }
    
    return conversation
  }
  
  /**
   * Extract conversation examples with context
   */
  extractConversationExample(messages, targetIndex, concept) {
    if (!messages[targetIndex]) return null
    
    const message = messages[targetIndex]
    const context = {
      previousMessage: targetIndex > 0 ? messages[targetIndex - 1] : null,
      nextMessage: targetIndex < messages.length - 1 ? messages[targetIndex + 1] : null
    }
    
    return {
      concept,
      quote: message.content,
      speaker: message.originalSpeaker,
      context,
      timestamp: message.timestamp
    }
  }
  
  // ==================== CLAIMING VALUE ANALYSIS METHODS ====================
  
  /**
   * Analyze Strategic Anchoring - Enhanced with market research and positioning
   */
  analyzeStrategicAnchoring(userMessages, scenarioContext) {
    let score = 0
    const techniques = []
    const examples = []
    
    const anchoringPatterns = {
      numerical: {
        regex: /\$[\d,]+|\d+(?:\.\d+)?%|\d+(?:\.\d+)?\s*(?:million|thousand|billion|k|dollars?|percent)/gi,
        weight: 8,
        name: 'Specific numerical anchoring'
      },
      market_based: {
        phrases: ['market rate', 'industry standard', 'comparable', 'benchmark', 'fair market value', 'going rate'],
        weight: 10,
        name: 'Market-based anchoring'
      },
      research_backed: {
        phrases: ['research shows', 'data indicates', 'studies suggest', 'analysis reveals', 'evidence supports'],
        weight: 12,
        name: 'Research-backed positioning'
      },
      opening_moves: {
        phrases: ['initial offer', 'starting point', 'opening position', 'first proposal', 'beginning with'],
        weight: 6,
        name: 'Strategic opening positioning'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      // Check for numerical anchoring
      const numericalMatches = content.match(anchoringPatterns.numerical.regex)
      if (numericalMatches && numericalMatches.length > 0) {
        score += anchoringPatterns.numerical.weight
        techniques.push(anchoringPatterns.numerical.name)
        examples.push(this.extractConversationExample(userMessages, index, 'Strategic Anchoring'))
      }
      
      // Check for other anchoring patterns
      Object.entries(anchoringPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases && pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Strategic Anchoring'))
        }
      })
    })
    
    return { score: Math.min(25, score), techniques, examples }
  }
  
  /**
   * Analyze BATNA Utilization - Enhanced with leverage and alternative development
   */
  analyzeBATNAUtilization(userMessages, scenarioContext) {
    let score = 0
    const techniques = []
    const examples = []
    
    const batnaPatterns = {
      explicit_alternatives: {
        phrases: ['other option', 'alternative', 'different approach', 'plan b', 'backup plan', 'other opportunity'],
        weight: 8,
        name: 'Explicit alternative reference'
      },
      leverage_building: {
        phrases: ['walk away', 'other opportunities', 'competing offer', 'better deal elsewhere', 'multiple options'],
        weight: 12,
        name: 'Leverage building through alternatives'
      },
      confidence_signals: {
        phrases: ['comfortable walking away', 'not desperate', 'have choices', 'flexible on timing', 'other directions'],
        weight: 10,
        name: 'Confidence through BATNA strength'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(batnaPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'BATNA Usage'))
        }
      })
    })
    
    return { score: Math.min(20, score), techniques, examples }
  }
  
  /**
   * Analyze Concession Strategy - Enhanced with pattern recognition and timing
   */
  analyzeConcessionStrategy(userMessages, fullConversation) {
    let score = 0
    const techniques = []
    const examples = []
    
    const concessionPatterns = {
      conditional: {
        phrases: ['if you can', 'provided that', 'on condition', 'assuming', 'contingent on'],
        weight: 10,
        name: 'Conditional concession strategy'
      },
      reciprocal: {
        phrases: ['in exchange for', 'trade off', 'swap', 'give and take', 'mutual adjustment'],
        weight: 12,
        name: 'Reciprocal concession approach'
      },
      graduated: {
        phrases: ['small step', 'gradual', 'incremental', 'step by step', 'piece by piece'],
        weight: 8,
        name: 'Graduated concession pattern'
      },
      final_offers: {
        phrases: ['final offer', 'last proposal', 'best I can do', 'bottom line', 'take it or leave it'],
        weight: 6,
        name: 'Final offer positioning'
      }
    }
    
    // Analyze concession timing and patterns
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(concessionPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Concession Management'))
        }
      })
    })
    
    // Bonus for systematic concession pattern across conversation
    const concessionCount = techniques.length
    if (concessionCount >= 3) {
      score += 5 // Bonus for systematic approach
      techniques.push('Systematic concession management')
    }
    
    return { score: Math.min(25, score), techniques, examples }
  }
  
  /**
   * Analyze Information Strategy - Enhanced questioning and intelligence gathering
   */
  analyzeInformationStrategy(userMessages) {
    let score = 0
    const techniques = []
    const examples = []
    
    const questionPatterns = {
      open_ended: {
        starters: ['what', 'how', 'why', 'tell me about', 'explain', 'describe'],
        weight: 3,
        name: 'Open-ended questioning'
      },
      probing: {
        phrases: ['what if', 'suppose', 'imagine', 'consider this', 'how would you feel'],
        weight: 4,
        name: 'Probing and hypothetical questions'
      },
      interests: {
        phrases: ['what matters to you', 'your priorities', 'important to you', 'your concerns', 'what do you need'],
        weight: 6,
        name: 'Interest-focused questioning'
      },
      constraints: {
        phrases: ['what prevents', 'limitations', 'constraints', 'restrictions', 'boundaries'],
        weight: 5,
        name: 'Constraint identification'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      // Count questions
      const questionCount = (content.match(/\?/g) || []).length
      if (questionCount > 0) {
        score += Math.min(3, questionCount) // Up to 3 points per message
      }
      
      Object.entries(questionPatterns).forEach(([key, pattern]) => {
        const hasPattern = pattern.starters ? 
          pattern.starters.some(starter => content.includes(starter)) :
          pattern.phrases.some(phrase => content.includes(phrase))
          
        if (hasPattern) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Information Strategy'))
        }
      })
    })
    
    return { score: Math.min(15, score), techniques, examples }
  }
  
  /**
   * Analyze Pressure Application - Enhanced timing and urgency tactics
   */
  analyzePressureApplication(userMessages, voiceMetrics) {
    let score = 0
    const techniques = []
    const examples = []
    
    const pressurePatterns = {
      time_pressure: {
        phrases: ['deadline', 'limited time', 'expires', 'urgent', 'time sensitive', 'by tomorrow'],
        weight: 6,
        name: 'Time pressure application'
      },
      scarcity: {
        phrases: ['limited availability', 'only one', 'last chance', 'won\'t last', 'while supplies last'],
        weight: 7,
        name: 'Scarcity pressure'
      },
      competition: {
        phrases: ['other interested parties', 'competitive situation', 'others are bidding', 'multiple offers'],
        weight: 8,
        name: 'Competitive pressure'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(pressurePatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Pressure Application'))
        }
      })
    })
    
    return { score: Math.min(15, score), techniques, examples }
  }

  // ==================== CREATING VALUE ANALYSIS METHODS ====================
  
  /**
   * Analyze Interest Exploration - Enhanced with deep questioning and understanding
   */
  analyzeInterestExploration(userMessages, fullConversation) {
    let score = 0
    const techniques = []
    const examples = []
    
    const interestPatterns = {
      direct_inquiry: {
        phrases: ['what matters to you', 'your priorities', 'important to you', 'what do you value', 'your main concerns'],
        weight: 12,
        name: 'Direct interest inquiry'
      },
      underlying_needs: {
        phrases: ['why is that important', 'what would that accomplish', 'what drives that', 'underlying reason'],
        weight: 15,
        name: 'Underlying needs exploration'
      },
      perspective_taking: {
        phrases: ['from your perspective', 'I can see why', 'that makes sense because', 'I understand your position'],
        weight: 10,
        name: 'Perspective-taking and validation'
      },
      clarification: {
        phrases: ['help me understand', 'could you explain', 'what do you mean by', 'can you clarify'],
        weight: 8,
        name: 'Clarification seeking'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(interestPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Interest Exploration'))
        }
      })
    })
    
    return { score: Math.min(30, score), techniques, examples }
  }
  
  /**
   * Analyze Option Generation - Enhanced with creative solution development
   */
  analyzeOptionGeneration(userMessages, scenarioContext) {
    let score = 0
    const techniques = []
    const examples = []
    
    const optionPatterns = {
      brainstorming: {
        phrases: ['what if we', 'another option', 'different approach', 'alternative way', 'could we consider'],
        weight: 8,
        name: 'Collaborative brainstorming'
      },
      multiple_options: {
        phrases: ['several options', 'few different ways', 'multiple approaches', 'various solutions'],
        weight: 10,
        name: 'Multiple option generation'
      },
      creative_solutions: {
        phrases: ['creative solution', 'innovative approach', 'outside the box', 'unique way', 'novel idea'],
        weight: 12,
        name: 'Creative problem solving'
      },
      package_deals: {
        phrases: ['bundle', 'package deal', 'combination', 'group together', 'comprehensive solution'],
        weight: 15,
        name: 'Package deal construction'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(optionPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Option Generation'))
        }
      })
    })
    
    return { score: Math.min(25, score), techniques, examples }
  }
  
  /**
   * Analyze Value Tradeoffs - Enhanced with priority mapping and exchanges
   */
  analyzeValueTradeoffs(userMessages, fullConversation) {
    let score = 0
    const techniques = []
    const examples = []
    
    const tradeoffPatterns = {
      explicit_trades: {
        phrases: ['in exchange for', 'trade off', 'swap', 'give you this for that', 'exchange'],
        weight: 12,
        name: 'Explicit value trades'
      },
      priority_differences: {
        phrases: ['more important to you', 'I care more about', 'your priority', 'value differently'],
        weight: 15,
        name: 'Priority difference recognition'
      },
      contingent_agreements: {
        phrases: ['if this then that', 'depending on', 'contingent', 'conditional trade'],
        weight: 10,
        name: 'Contingent agreement structuring'
      },
      win_win: {
        phrases: ['both benefit', 'mutual advantage', 'win-win', 'good for both', 'shared value'],
        weight: 8,
        name: 'Win-win framing'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(tradeoffPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Value Tradeoffs'))
        }
      })
    })
    
    return { score: Math.min(25, score), techniques, examples }
  }
  
  /**
   * Analyze Future Value Creation - Enhanced with long-term thinking
   */
  analyzeFutureValueCreation(userMessages) {
    let score = 0
    const techniques = []
    const examples = []
    
    const futurePatterns = {
      relationship_building: {
        phrases: ['long term relationship', 'future partnership', 'ongoing collaboration', 'build together'],
        weight: 6,
        name: 'Long-term relationship focus'
      },
      future_opportunities: {
        phrases: ['future opportunities', 'next time', 'future deals', 'down the road'],
        weight: 4,
        name: 'Future opportunity development'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(futurePatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Future Value Creation'))
        }
      })
    })
    
    return { score: Math.min(10, score), techniques, examples }
  }
  
  /**
   * Analyze Integrative Solutions - Enhanced with creative win-win development
   */
  analyzeIntegrativeSolutions(userMessages, scenarioContext) {
    let score = 0
    const techniques = []
    const examples = []
    
    const integrationPatterns = {
      problem_solving: {
        phrases: ['solve this together', 'work together', 'joint solution', 'collaborative approach'],
        weight: 6,
        name: 'Collaborative problem solving'
      },
      expanding_pie: {
        phrases: ['expand the deal', 'bigger picture', 'additional value', 'more than just'],
        weight: 4,
        name: 'Value expansion thinking'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(integrationPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Integrative Solutions'))
        }
      })
    })
    
    return { score: Math.min(10, score), techniques, examples }
  }

  // ==================== RELATIONSHIP MANAGEMENT ANALYSIS METHODS ====================
  
  /**
   * Analyze Advanced Active Listening - Enhanced with reflection and acknowledgment
   */
  analyzeActiveLisening(userMessages, fullConversation) {
    let score = 0
    const techniques = []
    const examples = []
    
    const listeningPatterns = {
      reflection: {
        phrases: ['so you\'re saying', 'if I understand correctly', 'what I hear is', 'let me make sure I understand'],
        weight: 12,
        name: 'Active reflection and clarification'
      },
      acknowledgment: {
        phrases: ['I hear you', 'I understand', 'that makes sense', 'I can see why'],
        weight: 8,
        name: 'Acknowledgment and validation'
      },
      summarizing: {
        phrases: ['to summarize', 'so far we\'ve covered', 'let me recap', 'the key points are'],
        weight: 10,
        name: 'Summarizing and synthesis'
      },
      building_on: {
        phrases: ['building on what you said', 'adding to your point', 'that reminds me', 'along those lines'],
        weight: 6,
        name: 'Building on partner\'s ideas'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(listeningPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Active Listening'))
        }
      })
    })
    
    return { score: Math.min(25, score), techniques, examples }
  }
  
  /**
   * Analyze Emotional Intelligence - Enhanced with empathy and perspective-taking
   */
  analyzeEmotionalIntelligence(userMessages, fullConversation) {
    let score = 0
    const techniques = []
    const examples = []
    
    const emotionalPatterns = {
      empathy: {
        phrases: ['I can imagine', 'that must be', 'I understand how you feel', 'from your perspective'],
        weight: 12,
        name: 'Empathy and perspective-taking'
      },
      emotional_validation: {
        phrases: ['I appreciate your concern', 'that\'s understandable', 'I can see why that matters', 'valid point'],
        weight: 10,
        name: 'Emotional validation'
      },
      tone_management: {
        phrases: ['let\'s stay positive', 'I want to be fair', 'respectfully', 'I appreciate your patience'],
        weight: 8,
        name: 'Positive tone management'
      },
      stress_acknowledgment: {
        phrases: ['I know this is stressful', 'challenging situation', 'difficult decision', 'pressure you\'re under'],
        weight: 6,
        name: 'Stress and pressure acknowledgment'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(emotionalPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Emotional Intelligence'))
        }
      })
    })
    
    return { score: Math.min(25, score), techniques, examples }
  }
  
  /**
   * Analyze Communication Excellence - Enhanced with clarity and persuasion
   */
  analyzeCommunicationExcellence(userMessages, voiceMetrics) {
    let score = 0
    const techniques = []
    const examples = []
    
    const communicationPatterns = {
      clarity: {
        phrases: ['to be clear', 'specifically', 'let me be precise', 'exactly what I mean'],
        weight: 8,
        name: 'Clear and precise communication'
      },
      politeness: {
        phrases: ['please', 'thank you', 'I appreciate', 'would you mind', 'if you don\'t mind'],
        weight: 6,
        name: 'Professional courtesy'
      },
      persuasive_framing: {
        phrases: ['the benefit is', 'this works because', 'the advantage', 'value proposition'],
        weight: 10,
        name: 'Persuasive benefit framing'
      },
      collaborative_language: {
        phrases: ['let\'s work together', 'our mutual interest', 'we both want', 'together we can'],
        weight: 8,
        name: 'Collaborative language patterns'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(communicationPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Communication Excellence'))
        }
      })
    })
    
    return { score: Math.min(20, score), techniques, examples }
  }
  
  /**
   * Analyze Conflict Management - Enhanced with de-escalation techniques
   */
  analyzeConflictManagement(userMessages, fullConversation) {
    let score = 0
    const techniques = []
    const examples = []
    
    const conflictPatterns = {
      de_escalation: {
        phrases: ['let\'s step back', 'I understand your frustration', 'let\'s find common ground', 'we\'re on the same side'],
        weight: 12,
        name: 'De-escalation techniques'
      },
      reframing: {
        phrases: ['another way to look at this', 'from a different angle', 'let\'s reframe', 'consider this perspective'],
        weight: 10,
        name: 'Reframing and perspective shift'
      },
      problem_focus: {
        phrases: ['focus on the issue', 'solve the problem', 'address the concern', 'find a solution'],
        weight: 8,
        name: 'Problem-focused approach'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(conflictPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Conflict Management'))
        }
      })
    })
    
    return { score: Math.min(15, score), techniques, examples }
  }
  
  /**
   * Analyze Trust Building - Enhanced with credibility and relationship foundation
   */
  analyzeTrustBuilding(userMessages, fullConversation) {
    let score = 0
    const techniques = []
    const examples = []
    
    const trustPatterns = {
      transparency: {
        phrases: ['to be honest', 'transparent about', 'full disclosure', 'openly share', 'candid with you'],
        weight: 10,
        name: 'Transparency and openness'
      },
      reliability: {
        phrases: ['you can count on', 'I commit to', 'I guarantee', 'reliable', 'dependable'],
        weight: 8,
        name: 'Reliability commitments'
      },
      shared_values: {
        phrases: ['we both value', 'common ground', 'shared interest', 'mutual respect', 'same principles'],
        weight: 6,
        name: 'Shared values identification'
      }
    }
    
    userMessages.forEach((message, index) => {
      const content = message.content.toLowerCase()
      
      Object.entries(trustPatterns).forEach(([key, pattern]) => {
        if (pattern.phrases.some(phrase => content.includes(phrase))) {
          score += pattern.weight
          techniques.push(pattern.name)
          examples.push(this.extractConversationExample(userMessages, index, 'Trust Building'))
        }
      })
    })
    
    return { score: Math.min(15, score), techniques, examples }
  }

  // ==================== BONUS CALCULATION METHODS ====================
  
  /**
   * Calculate advanced claiming bonus for sophisticated techniques
   */
  calculateAdvancedClaimingBonus(techniques, fullText) {
    let bonus = 0
    
    // Bonus for using multiple sophisticated techniques
    const uniqueTechniques = [...new Set(techniques)]
    if (uniqueTechniques.length >= 5) bonus += 3
    if (uniqueTechniques.length >= 7) bonus += 2
    
    // Bonus for sophisticated language patterns
    const sophisticatedPatterns = [
      'leverage', 'negotiate from strength', 'strategic position', 'market dynamics',
      'competitive advantage', 'value proposition', 'roi', 'return on investment'
    ]
    
    const advancedCount = sophisticatedPatterns.filter(pattern => fullText.includes(pattern)).length
    bonus += Math.min(3, advancedCount)
    
    return bonus
  }
  
  /**
   * Calculate collaborative bonus for value creation techniques
   */
  calculateCollaborativeBonus(techniques, fullText) {
    let bonus = 0
    
    // Bonus for collaborative language
    const collaborativeWords = ['together', 'mutual', 'shared', 'partnership', 'collaboration']
    const collabCount = collaborativeWords.filter(word => fullText.includes(word)).length
    bonus += Math.min(3, collabCount)
    
    // Bonus for creative solution indicators
    const creativityIndicators = ['innovative', 'creative', 'unique', 'novel', 'outside the box']
    const creativityCount = creativityIndicators.filter(phrase => fullText.includes(phrase)).length
    bonus += Math.min(2, creativityCount)
    
    return bonus
  }
  
  /**
   * Calculate interpersonal bonus for relationship management
   */
  calculateInterpersonalBonus(techniques, fullText) {
    let bonus = 0
    
    // Bonus for emotional intelligence language
    const emotionalWords = ['understand', 'appreciate', 'respect', 'empathy', 'perspective']
    const emotionalCount = emotionalWords.filter(word => fullText.includes(word)).length
    bonus += Math.min(3, emotionalCount)
    
    // Bonus for positive relationship building
    const relationshipWords = ['trust', 'partnership', 'relationship', 'rapport', 'connection']
    const relationshipCount = relationshipWords.filter(word => fullText.includes(word)).length
    bonus += Math.min(2, relationshipCount)
    
    return bonus
  }

  // ==================== ENHANCED CONVERSATION CONTEXT INITIALIZATION ====================
  
  /**
   * Initialize negotiation patterns for advanced analysis
   */
  initializeNegotiationPatterns() {
    return {
      harvardPrinciples: {
        interests: ['underlying interests', 'real needs', 'what matters most', 'why important'],
        options: ['multiple options', 'creative alternatives', 'different approaches', 'brainstorm solutions'],
        criteria: ['objective criteria', 'fair standards', 'market rates', 'precedent'],
        batna: ['best alternative', 'other options', 'walk away point', 'backup plan']
      },
      psychologicalTechniques: {
        anchoring: ['starting point', 'initial offer', 'reference point'],
        reciprocity: ['in return', 'exchange', 'give and take'],
        commitment: ['promise', 'guarantee', 'commit to'],
        scarcity: ['limited time', 'rare opportunity', 'while available']
      },
      communicationPatterns: {
        openEnded: ['what', 'how', 'why', 'tell me about'],
        clarifying: ['could you explain', 'help me understand', 'what do you mean'],
        confirming: ['so you\'re saying', 'if I understand', 'to confirm'],
        building: ['building on that', 'in addition', 'furthermore']
      }
    }
  }
  
  /**
   * Initialize conversation context for sophisticated analysis
   */
  initializeConversationContext() {
    return {
      turnAnalysis: true,
      sequencePatterns: true,
      responseQuality: true,
      strategicProgression: true
    }
  }

  // Legacy methods removed - replaced with enhanced analysis above
  // All assessment logic now uses the sophisticated parseConversationTranscript and enhanced analysis methods

  // Legacy methods removed - all functionality replaced with enhanced analysis methods above

  initializeFrameworks() {
    return {
      claimingValue: {
        maxScore: 100,
        components: [
          { name: 'anchoring', weight: 0.2 },
          { name: 'batna_usage', weight: 0.15 },
          { name: 'concession_strategy', weight: 0.2 },
          { name: 'information_seeking', weight: 0.15 },
          { name: 'pressure_application', weight: 0.15 },
          { name: 'deal_protection', weight: 0.15 }
        ]
      },
      creatingValue: {
        maxScore: 100,
        components: [
          { name: 'interest_exploration', weight: 0.25 },
          { name: 'option_generation', weight: 0.2 },
          { name: 'tradeoff_identification', weight: 0.2 },
          { name: 'future_focus', weight: 0.15 },
          { name: 'creative_problem_solving', weight: 0.2 }
        ]
      },
      relationshipManagement: {
        maxScore: 100,
        components: [
          { name: 'active_listening', weight: 0.2 },
          { name: 'empathy', weight: 0.2 },
          { name: 'communication_style', weight: 0.2 },
          { name: 'conflict_management', weight: 0.2 },
          { name: 'trust_building', weight: 0.2 }
        ]
      }
    }
  }

  initializeNegotiationPatterns() {
    return {
      anchoring: [
        /\b(first offer|initial proposal|starting point|anchor)\b/i,
        /\b(let's start with|I propose|my opening)\b/i
      ],
      batna: [
        /\b(alternative|other options|backup plan|walk away)\b/i,
        /\b(best alternative|other opportunities)\b/i
      ],
      concessions: [
        /\b(if you|in exchange|trade.?off|give and take)\b/i,
        /\b(concede|compromise|meet in the middle)\b/i
      ],
      interests: [
        /\b(what matters|important to you|underlying need|real concern)\b/i,
        /\b(why is this|what's driving|priority)\b/i
      ],
      options: [
        /\b(what if|suppose|alternative solution|different approach)\b/i,
        /\b(brainstorm|creative solution|multiple options)\b/i
      ]
    }
  }

  initializeConversationContext() {
    return {
      speakerTracking: true,
      turnAnalysis: true,
      sequencePatterns: true,
      responsePatterns: true
    }
  }

  parseConversationTranscript(transcript) {
    if (!transcript) return []
    
    // Simple parser - assume each sentence is a turn
    // In real implementation, this would parse speaker labels
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 10)
    
    return sentences.map((sentence, index) => ({
      speaker: index % 2 === 0 ? 'user' : 'system',
      content: sentence.trim(),
      timestamp: index,
      index
    }))
  }
}

module.exports = AssessmentEngine