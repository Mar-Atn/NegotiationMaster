const db = require('../config/database')
const logger = require('../config/logger')

class EnhancedAIEngine {
  constructor() {
    this.conversationHistory = new Map()
    this.characterStates = new Map()
    this.negotiationTactics = new Map()
    
    // Initialize negotiation frameworks
    this.initializeNegotiationFrameworks()
  }

  /**
   * Initialize negotiation frameworks and tactics
   */
  initializeNegotiationFrameworks() {
    // Harvard Negotiation Project principles
    this.negotiationPrinciples = {
      separatePeopleFromProblem: {
        description: "Focus on interests, not positions",
        tactics: ['active_listening', 'empathy_building', 'reframing']
      },
      focusOnInterests: {
        description: "Identify underlying needs and concerns",
        tactics: ['probing_questions', 'interest_mapping', 'value_creation']
      },
      generateOptions: {
        description: "Create multiple solutions before deciding",
        tactics: ['brainstorming', 'package_deals', 'contingent_agreements']
      },
      useObjectiveCriteria: {
        description: "Base decisions on fair standards",
        tactics: ['market_research', 'precedent_setting', 'expert_opinions']
      }
    }

    // ZOPA (Zone of Possible Agreement) calculation
    this.zopaCalculator = {
      calculateZOPA: (buyerMax, sellerMin) => {
        return buyerMax >= sellerMin ? { exists: true, range: [sellerMin, buyerMax] } : { exists: false }
      }
    }

    // BATNA (Best Alternative to Negotiated Agreement) framework
    this.batnaFramework = {
      evaluateAlternatives: (character, scenario) => {
        const alternatives = character.interests_template?.alternatives || []
        return alternatives.map(alt => ({
          ...alt,
          strength: this.calculateAlternativeStrength(alt, scenario)
        })).sort((a, b) => b.strength - a.strength)
      }
    }
  }

  /**
   * Generate sophisticated AI response using negotiation principles
   * Now uses role2_instructions from scenario for AI character context
   */
  async generateEnhancedResponse(negotiationId, userMessage, character, scenario) {
    try {
      const startTime = Date.now()
      
      // Get scenario with AI-specific instructions (role2_instructions)
      const aiScenarioData = await this.getScenarioForAI(scenario.id)
      
      // Get or initialize character state
      const characterState = this.getCharacterState(negotiationId, character.id)
      
      // Enhance character with AI-specific scenario instructions
      const enhancedCharacter = this.enhanceCharacterWithScenarioInstructions(character, aiScenarioData)
      
      // Analyze user message for negotiation signals
      const messageAnalysis = this.analyzeUserMessage(userMessage, characterState)
      
      // Update character state based on conversation
      this.updateCharacterState(negotiationId, character.id, messageAnalysis, userMessage)
      
      // Generate response using negotiation frameworks
      const response = await this.generateFrameworkBasedResponse(
        userMessage,
        enhancedCharacter,
        aiScenarioData,
        characterState,
        messageAnalysis
      )

      // Log sophisticated interaction
      logger.info('Enhanced AI response generated', {
        negotiationId,
        characterId: character.id,
        messageAnalysis: {
          sentiment: messageAnalysis.sentiment,
          negotiationPhase: messageAnalysis.negotiationPhase,
          tacticDetected: messageAnalysis.tacticDetected
        },
        responseStrategy: response.strategy,
        latency: Date.now() - startTime
      })

      return response.text

    } catch (error) {
      logger.error('Enhanced AI response generation failed', {
        negotiationId,
        error: error.message,
        stack: error.stack
      })
      
      // Fallback to simple response
      return this.generateFallbackResponse(userMessage, character)
    }
  }

  /**
   * Analyze user message for negotiation patterns and intent
   */
  analyzeUserMessage(message, characterState) {
    const lowerMessage = message.toLowerCase()
    
    // Sentiment analysis (simplified)
    const sentiment = this.analyzeSentiment(message)
    
    // Detect negotiation phase
    const negotiationPhase = this.detectNegotiationPhase(lowerMessage, characterState)
    
    // Detect negotiation tactics
    const tacticDetected = this.detectNegotiationTactic(lowerMessage)
    
    // Identify concessions or movement
    const concessionIndicators = this.detectConcessions(lowerMessage)
    
    // Analyze urgency and pressure
    const urgencyLevel = this.analyzeUrgency(lowerMessage)
    
    // Detect information seeking
    const informationSeeking = this.detectInformationSeeking(lowerMessage)

    return {
      sentiment,
      negotiationPhase,
      tacticDetected,
      concessionIndicators,
      urgencyLevel,
      informationSeeking,
      messageLength: message.length,
      questionCount: (message.match(/\?/g) || []).length
    }
  }

  /**
   * Generate response based on negotiation frameworks
   */
  async generateFrameworkBasedResponse(message, character, scenario, characterState, analysis) {
    const personality = character.personality_profile
    const behaviorParams = character.behavior_parameters
    const negotiationTactics = character.negotiation_tactics
    
    let strategy = 'collaborative' // default
    let responseText = ''

    // Determine response strategy based on character and situation
    if (analysis.tacticDetected === 'anchoring' && behaviorParams.aggressiveness > 0.6) {
      strategy = 'counter_anchor'
      responseText = this.generateCounterAnchorResponse(message, character, analysis)
    } else if (analysis.negotiationPhase === 'information_gathering') {
      strategy = 'strategic_disclosure'
      responseText = this.generateInformationResponse(message, character, analysis)
    } else if (analysis.concessionIndicators.length > 0) {
      strategy = 'reciprocal_concession'
      responseText = this.generateConcessionResponse(message, character, analysis)
    } else if (analysis.urgencyLevel === 'high' && personality.negotiation_style.includes('collaborative')) {
      strategy = 'collaborative_urgency'
      responseText = this.generateCollaborativeUrgencyResponse(message, character, analysis)
    } else {
      // Use interest-based approach (Harvard method)
      strategy = 'interest_based'
      responseText = this.generateInterestBasedResponse(message, character, scenario, analysis)
    }

    // Apply character personality modifiers
    responseText = this.applyPersonalityModifiers(responseText, character, analysis)

    return {
      text: responseText,
      strategy,
      reasoning: this.generateResponseReasoning(strategy, analysis, character)
    }
  }

  /**
   * Generate interest-based response using Harvard principles
   * Now incorporates scenario-specific AI instructions (role2_instructions)
   */
  generateInterestBasedResponse(message, character, scenario, analysis) {
    const lowerMessage = message.toLowerCase()
    const interests = character.contextual_interests || character.interests_template
    
    // Use scenario-specific instructions if available
    const scenarioInstructions = character.scenario_specific_instructions
    
    // Focus on underlying interests, not positions
    if (lowerMessage.includes('price') || lowerMessage.includes('cost')) {
      return this.generateInterestBasedPriceResponse(character, interests, analysis, scenarioInstructions)
    }
    
    if (lowerMessage.includes('time') || lowerMessage.includes('deadline')) {
      return this.generateTimeInterestResponse(character, interests, analysis, scenarioInstructions)
    }
    
    if (lowerMessage.includes('quality') || lowerMessage.includes('condition')) {
      return this.generateQualityInterestResponse(character, interests, analysis, scenarioInstructions)
    }

    // Enhanced default response using scenario-specific context
    let baseResponses = [
      `I understand your position. Let me share what's important to me in this situation, and I'd like to understand what matters most to you. That way we can find a solution that works for both of us.`,
      `You raise a good point. Rather than focusing on our positions, let's talk about what we're both trying to achieve here. What would make this deal valuable for you?`,
      `I appreciate you being direct. I have some key interests I need to address, and I'm sure you do too. Can we explore how to meet both our needs?`
    ]

    // Modify response based on scenario-specific instructions
    if (scenarioInstructions) {
      const contextualResponse = this.incorporateScenarioContext(baseResponses[0], scenarioInstructions, character)
      return contextualResponse
    }
    
    return baseResponses[Math.floor(Math.random() * baseResponses.length)]
  }

  /**
   * Incorporate scenario-specific context into AI responses
   */
  incorporateScenarioContext(baseResponse, scenarioInstructions, character) {
    // Parse scenario instructions if it's a string
    let instructions = scenarioInstructions
    if (typeof scenarioInstructions === 'string') {
      try {
        instructions = JSON.parse(scenarioInstructions)
      } catch (e) {
        // If not JSON, treat as plain text instructions
        instructions = { context: scenarioInstructions }
      }
    }

    // Add scenario-specific context to the response
    if (instructions.primary_interests) {
      return `${baseResponse} In this situation, what's particularly important to me is ${instructions.primary_interests}. How can we work together on this?`
    }
    
    if (instructions.key_constraints) {
      return `${baseResponse} I should mention that I have some specific constraints around ${instructions.key_constraints}. What flexibility do you have?`
    }

    if (instructions.context) {
      return `${baseResponse} Given the context of this situation, I want to make sure we're both satisfied with the outcome.`
    }

    return baseResponse
  }

  /**
   * Generate counter-anchor response for aggressive tactics
   */
  generateCounterAnchorResponse(message, character, analysis) {
    const behaviorParams = character.behavior_parameters
    
    if (behaviorParams.aggressiveness > 0.7) {
      return `I see you're starting with an aggressive position. Let me give you the real numbers based on market data. My research shows the fair range is quite different from what you're suggesting. Here's what the facts tell us...`
    } else {
      return `I understand that's your starting position. Based on my analysis of comparable situations, there's room for us to find middle ground. Let me share some objective criteria that might help us both.`
    }
  }

  /**
   * Generate information-gathering response
   */
  generateInformationResponse(message, character, analysis) {
    const questions = [
      `That's helpful context. To make sure I understand your needs fully, can you tell me more about what's driving that requirement?`,
      `I appreciate you sharing that. What would happen if we couldn't meet that specific point? Are there alternatives that might work?`,
      `Good question. Let me think about that. Before I answer, it would help to know what flexibility you might have on other aspects of this deal.`
    ]
    
    return questions[Math.floor(Math.random() * questions.length)]
  }

  /**
   * Apply personality modifiers to response
   */
  applyPersonalityModifiers(response, character, analysis) {
    const personality = character.personality_profile
    const behaviorParams = character.behavior_parameters
    const communicationStyle = character.communication_style
    
    let modified = response
    
    // Apply aggressiveness modifier
    if (behaviorParams.aggressiveness > 0.7) {
      modified = modified.replace(/I understand/g, 'Look, I get')
      modified = modified.replace(/perhaps/g, 'definitely')
      modified = modified.replace(/might/g, 'will')
    }
    
    // Apply patience modifier
    if (behaviorParams.patience < 0.3) {
      modified += ' We need to move on this quickly.'
    }
    
    // Apply formality from communication style
    if (communicationStyle.includes('formal')) {
      modified = modified.replace(/you're/g, 'you are')
      modified = modified.replace(/I'm/g, 'I am')
      modified = modified.replace(/can't/g, 'cannot')
    }
    
    return modified
  }

  /**
   * Get or initialize character state for conversation
   */
  getCharacterState(negotiationId, characterId) {
    const stateKey = `${negotiationId}_${characterId}`
    
    if (!this.characterStates.has(stateKey)) {
      this.characterStates.set(stateKey, {
        conversationTurns: 0,
        concessionsOffered: 0,
        concessionsReceived: 0,
        currentPhase: 'opening',
        detectedUserTactics: [],
        revealedInformation: [],
        trustLevel: 0.5, // neutral
        urgencyLevel: 0.3,
        lastUpdate: new Date()
      })
    }
    
    return this.characterStates.get(stateKey)
  }

  /**
   * Update character state based on conversation
   */
  updateCharacterState(negotiationId, characterId, analysis, userMessage) {
    const state = this.getCharacterState(negotiationId, characterId)
    
    state.conversationTurns++
    state.lastUpdate = new Date()
    
    // Update based on analysis
    if (analysis.concessionIndicators.length > 0) {
      state.concessionsReceived++
    }
    
    if (analysis.tacticDetected && !state.detectedUserTactics.includes(analysis.tacticDetected)) {
      state.detectedUserTactics.push(analysis.tacticDetected)
    }
    
    // Adjust trust level based on user behavior
    if (analysis.sentiment === 'positive') {
      state.trustLevel = Math.min(1.0, state.trustLevel + 0.1)
    } else if (analysis.sentiment === 'negative') {
      state.trustLevel = Math.max(0.0, state.trustLevel - 0.05)
    }
    
    // Update negotiation phase
    if (state.conversationTurns > 5 && state.currentPhase === 'opening') {
      state.currentPhase = 'bargaining'
    } else if (state.conversationTurns > 10 && state.currentPhase === 'bargaining') {
      state.currentPhase = 'closing'
    }
  }

  /**
   * Simplified sentiment analysis
   */
  analyzeSentiment(message) {
    const positive = ['good', 'great', 'excellent', 'perfect', 'wonderful', 'fantastic', 'appreciate', 'thank']
    const negative = ['bad', 'terrible', 'awful', 'horrible', 'disappointed', 'frustrated', 'unacceptable']
    
    const words = message.toLowerCase().split(/\W+/)
    const positiveCount = words.filter(word => positive.includes(word)).length
    const negativeCount = words.filter(word => negative.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
  }

  /**
   * Detect negotiation phase
   */
  detectNegotiationPhase(lowerMessage, characterState) {
    if (lowerMessage.includes('hello') || lowerMessage.includes('start') || characterState.conversationTurns < 3) {
      return 'opening'
    }
    
    if (lowerMessage.includes('deal') || lowerMessage.includes('agreement') || lowerMessage.includes('close')) {
      return 'closing'
    }
    
    return 'bargaining'
  }

  /**
   * Detect negotiation tactics
   */
  detectNegotiationTactic(lowerMessage) {
    const tactics = {
      anchoring: ['first offer', 'starting point', 'initial price'],
      deadline: ['deadline', 'time limit', 'expire', 'limited time'],
      scarcity: ['last one', 'limited quantity', 'rare opportunity', 'won\'t last'],
      authority: ['my boss', 'company policy', 'not authorized'],
      reciprocity: ['favor', 'help you out', 'return the favor']
    }
    
    for (const [tactic, indicators] of Object.entries(tactics)) {
      if (indicators.some(indicator => lowerMessage.includes(indicator))) {
        return tactic
      }
    }
    
    return null
  }

  /**
   * Detect concessions in message
   */
  detectConcessions(lowerMessage) {
    const concessionIndicators = [
      'willing to', 'could consider', 'might accept', 'flexible on',
      'open to', 'compromise', 'meet you halfway', 'work with you'
    ]
    
    return concessionIndicators.filter(indicator => lowerMessage.includes(indicator))
  }

  /**
   * Analyze urgency level
   */
  analyzeUrgency(lowerMessage) {
    const urgentWords = ['urgent', 'immediate', 'asap', 'quickly', 'rush', 'deadline', 'today']
    const urgentCount = urgentWords.filter(word => lowerMessage.includes(word)).length
    
    if (urgentCount >= 2) return 'high'
    if (urgentCount === 1) return 'medium'
    return 'low'
  }

  /**
   * Detect information seeking
   */
  detectInformationSeeking(lowerMessage) {
    const questionWords = ['what', 'how', 'when', 'where', 'why', 'which', 'who']
    const questionCount = questionWords.filter(word => lowerMessage.includes(word)).length
    
    return questionCount > 0
  }

  /**
   * Generate fallback response for errors
   */
  generateFallbackResponse(message, character) {
    const responses = [
      `I appreciate you sharing that with me. Let me think about how we can move forward in a way that works for both of us.`,
      `That's an interesting perspective. I'd like to understand your thinking better so we can find common ground.`,
      `Thank you for being direct. I want to make sure we're both comfortable with whatever we decide here.`
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  /**
   * Generate response reasoning for debugging
   */
  generateResponseReasoning(strategy, analysis, character) {
    return {
      strategy,
      triggers: {
        sentiment: analysis.sentiment,
        negotiationPhase: analysis.negotiationPhase,
        tacticDetected: analysis.tacticDetected,
        urgencyLevel: analysis.urgencyLevel
      },
      characterInfluence: {
        aggressiveness: character.behavior_parameters.aggressiveness,
        negotiationStyle: character.personality_profile.negotiation_style
      }
    }
  }

  /**
   * Calculate alternative strength for BATNA
   */
  calculateAlternativeStrength(alternative, scenario) {
    // Simplified calculation - in real implementation, this would be more sophisticated
    const baseStrength = alternative.value || 0.5
    const scenarioModifier = scenario.difficulty_level === 'easy' ? 0.1 : scenario.difficulty_level === 'hard' ? -0.1 : 0
    
    return Math.max(0, Math.min(1, baseStrength + scenarioModifier))
  }

  /**
   * Clear conversation history and states (for cleanup)
   */
  cleanup() {
    this.conversationHistory.clear()
    this.characterStates.clear()
    this.negotiationTactics.clear()
  }

  /**
   * Get scenario data specifically for AI character access
   * Fetches role2_instructions and excludes role1_instructions
   */
  async getScenarioForAI(scenarioId) {
    try {
      const scenario = await db('scenarios')
        .where({ id: scenarioId, is_active: true })
        .select([
          'id',
          'title',
          'description',
          'difficulty_level',
          'ai_character_config',
          'scenario_context',
          'evaluation_criteria',
          'role2_instructions'
          // Note: role1_instructions excluded for AI access
        ])
        .first()

      if (!scenario) {
        throw new Error(`Scenario ${scenarioId} not found for AI access`)
      }

      // Parse JSON strings back to objects
      return {
        ...scenario,
        ai_character_config: typeof scenario.ai_character_config === 'string'
          ? JSON.parse(scenario.ai_character_config)
          : scenario.ai_character_config,
        scenario_context: typeof scenario.scenario_context === 'string'
          ? JSON.parse(scenario.scenario_context)
          : scenario.scenario_context,
        evaluation_criteria: typeof scenario.evaluation_criteria === 'string'
          ? JSON.parse(scenario.evaluation_criteria)
          : scenario.evaluation_criteria
      }
    } catch (error) {
      logger.error('Failed to fetch scenario for AI', {
        scenarioId,
        error: error.message
      })
      throw error
    }
  }

  /**
   * Enhance character with scenario-specific AI instructions (role2_instructions)
   * This replaces generic character instructions with scenario-specific context
   */
  enhanceCharacterWithScenarioInstructions(character, aiScenarioData) {
    const enhancedCharacter = { ...character }

    // Use role2_instructions from scenario if available
    if (aiScenarioData.role2_instructions) {
      enhancedCharacter.scenario_specific_instructions = aiScenarioData.role2_instructions
      
      // Log that we're using scenario-specific instructions
      logger.debug('Enhanced character with scenario-specific instructions', {
        characterId: character.id,
        scenarioId: aiScenarioData.id,
        hasRole2Instructions: !!aiScenarioData.role2_instructions
      })
    }

    // Merge scenario context with character interests
    if (aiScenarioData.scenario_context && character.interests_template) {
      enhancedCharacter.contextual_interests = {
        ...character.interests_template,
        scenario_context: aiScenarioData.scenario_context,
        scenario_stakes: aiScenarioData.scenario_context.stakes || {},
        scenario_constraints: aiScenarioData.scenario_context.constraints || {}
      }
    }

    return enhancedCharacter
  }

  /**
   * Get analytics about AI engine performance
   */
  getAnalytics() {
    return {
      activeConversations: this.conversationHistory.size,
      activeCharacterStates: this.characterStates.size,
      totalInteractions: Array.from(this.characterStates.values())
        .reduce((sum, state) => sum + state.conversationTurns, 0),
      averageTrustLevel: Array.from(this.characterStates.values())
        .reduce((sum, state) => sum + state.trustLevel, 0) / this.characterStates.size || 0
    }
  }
}

module.exports = new EnhancedAIEngine()