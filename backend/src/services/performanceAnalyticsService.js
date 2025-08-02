const logger = require('../config/logger')
const db = require('../config/database')

class PerformanceAnalyticsService {
  constructor() {
    // Performance evaluation criteria weights
    this.performanceWeights = {
      claiming_value: 0.35,      // 35% - Competitive negotiation effectiveness
      creating_value: 0.35,      // 35% - Collaborative problem-solving
      managing_relationships: 0.30 // 30% - Interpersonal dynamics
    }

    // Scenario-specific evaluation criteria
    this.scenarioEvaluationCriteria = {
      'executive_compensation': {
        claiming_value: {
          excellent: { threshold: 90, description: 'Negotiated 15%+ above initial offer with enhanced terms' },
          good: { threshold: 75, description: 'Achieved 8-15% improvement with favorable conditions' },  
          average: { threshold: 60, description: 'Modest gains 3-8% with standard terms' },
          poor: { threshold: 0, description: 'Failed to achieve meaningful improvements' }
        },
        creating_value: {
          excellent: { threshold: 90, description: 'Innovative compensation structures with mutual benefit' },
          good: { threshold: 75, description: 'Meaningful value alignment and shared incentives' },
          average: { threshold: 60, description: 'Some performance-based elements created' },
          poor: { threshold: 0, description: 'Only focused on extracting maximum value' }
        },
        managing_relationships: {
          excellent: { threshold: 90, description: 'Strong foundation for executive leadership partnership' },
          good: { threshold: 75, description: 'Positive relationship with demonstrated leadership' },
          average: { threshold: 60, description: 'Professional relationship with mutual respect' },
          poor: { threshold: 0, description: 'Adversarial dynamics or damaged relationships' }
        }
      }
    }

    // Conversation analysis patterns
    this.conversationPatterns = {
      competitive_indicators: [
        'anchoring high', 'pressure tactics', 'ultimatums', 'aggressive demands',
        'win-lose framing', 'information withholding', 'deadline pressure'
      ],
      collaborative_indicators: [
        'interest exploration', 'option generation', 'mutual benefit', 'relationship building',
        'information sharing', 'creative solutions', 'win-win proposals'
      ],
      relationship_indicators: [
        'active listening', 'empathy expression', 'respect demonstration', 'trust building',
        'cultural sensitivity', 'professional courtesy', 'future orientation'
      ]
    }
  }

  /**
   * Analyze conversation transcript and calculate performance scores
   */
  async analyzeNegotiationPerformance(negotiationId, transcript, scenarioId, userId) {
    try {
      logger.info(`Analyzing performance for negotiation ${negotiationId}`)

      // Get scenario context for evaluation
      const scenario = await this.getScenarioContext(scenarioId)
      
      // Analyze conversation content
      const conversationAnalysis = this.analyzeConversationContent(transcript)
      
      // Calculate dimensional scores
      const claimingValueScore = this.calculateClaimingValueScore(conversationAnalysis, scenario)
      const creatingValueScore = this.calculateCreatingValueScore(conversationAnalysis, scenario)
      const relationshipScore = this.calculateRelationshipScore(conversationAnalysis, scenario)
      
      // Calculate overall performance
      const overallScore = this.calculateOverallScore({
        claiming_value: claimingValueScore.score,
        creating_value: creatingValueScore.score,
        managing_relationships: relationshipScore.score
      })

      // Generate ratings and feedback
      const scenarioType = this.getScenarioType(scenario)
      const performanceRatings = this.generatePerformanceRatings(
        claimingValueScore.score,
        creatingValueScore.score, 
        relationshipScore.score,
        overallScore,
        scenarioType
      )

      // Identify key milestones and moments
      const milestones = this.identifyPerformanceMilestones(transcript, conversationAnalysis)

      // Generate improvement suggestions
      const improvements = this.generateImprovementSuggestions(
        claimingValueScore,
        creatingValueScore,
        relationshipScore,
        conversationAnalysis
      )

      // Calculate session metrics
      const sessionMetrics = this.calculateSessionMetrics(transcript)

      // Store performance data
      const performanceRecord = await this.storePerformanceAnalysis({
        negotiationId,
        userId,
        scenarioId,
        scores: {
          claiming_value: claimingValueScore.score,
          creating_value: creatingValueScore.score,
          managing_relationships: relationshipScore.score,
          overall: overallScore
        },
        ratings: performanceRatings,
        analysis: {
          claiming_value: claimingValueScore.analysis,
          creating_value: creatingValueScore.analysis,
          managing_relationships: relationshipScore.analysis,
          overall: this.generateOverallFeedback(performanceRatings, improvements)
        },
        sessionMetrics,
        conversationAnalysis,
        milestones,
        improvements
      })

      // Update user progress tracking
      await this.updateUserProgress(userId, performanceRecord)

      logger.info(`Performance analysis completed for negotiation ${negotiationId}`)
      return performanceRecord

    } catch (error) {
      logger.error(`Failed to analyze negotiation performance:`, error)
      throw new Error(`Performance analysis failed: ${error.message}`)
    }
  }

  /**
   * Analyze conversation content for patterns and indicators
   */
  analyzeConversationContent(transcript) {
    const analysis = {
      total_messages: transcript.length,
      user_messages: transcript.filter(msg => msg.speaker === 'user').length,
      ai_messages: transcript.filter(msg => msg.speaker !== 'user').length,
      competitive_indicators: 0,
      collaborative_indicators: 0,
      relationship_indicators: 0,
      negotiation_moves: [],
      key_phrases: [],
      sentiment_progression: [],
      information_shared: 0,
      questions_asked: 0,
      concessions_made: 0,
      value_creation_attempts: 0
    }

    // Analyze each message for patterns
    transcript.forEach((message, index) => {
      if (message.speaker === 'user') {
        const text = message.text.toLowerCase()
        
        // Count pattern indicators
        this.conversationPatterns.competitive_indicators.forEach(indicator => {
          if (text.includes(indicator.toLowerCase())) {
            analysis.competitive_indicators++
            analysis.negotiation_moves.push({
              type: 'competitive',
              indicator,
              message_index: index,
              context: text.substring(0, 100)
            })
          }
        })

        this.conversationPatterns.collaborative_indicators.forEach(indicator => {
          if (text.includes(indicator.toLowerCase())) {
            analysis.collaborative_indicators++
            analysis.negotiation_moves.push({
              type: 'collaborative',
              indicator,
              message_index: index,
              context: text.substring(0, 100)
            })
          }
        })

        this.conversationPatterns.relationship_indicators.forEach(indicator => {
          if (text.includes(indicator.toLowerCase())) {
            analysis.relationship_indicators++
            analysis.negotiation_moves.push({
              type: 'relationship',
              indicator,
              message_index: index,
              context: text.substring(0, 100)
            })
          }
        })

        // Count questions
        if (text.includes('?')) analysis.questions_asked++

        // Identify information sharing
        const infoKeywords = ['because', 'since', 'my situation', 'i need', 'we have', 'our goal']
        if (infoKeywords.some(keyword => text.includes(keyword))) {
          analysis.information_shared++
        }

        // Identify value creation attempts
        const valueKeywords = ['both', 'mutual', 'together', 'win-win', 'creative', 'alternative']
        if (valueKeywords.some(keyword => text.includes(keyword))) {
          analysis.value_creation_attempts++
        }
      }
    })

    return analysis
  }

  /**
   * Calculate claiming value score based on competitive effectiveness
   */
  calculateClaimingValueScore(conversationAnalysis, scenario) {
    let score = 50 // Base score
    let analysis = []

    // Competitive negotiation indicators
    const competitiveRatio = conversationAnalysis.competitive_indicators / Math.max(1, conversationAnalysis.user_messages)
    if (competitiveRatio > 0.3) {
      score += 20
      analysis.push('Demonstrated strong competitive negotiation tactics')
    } else if (competitiveRatio > 0.1) {
      score += 10
      analysis.push('Some competitive elements present')
    } else {
      score -= 10
      analysis.push('Limited competitive negotiation approach')
    }

    // Information management
    if (conversationAnalysis.information_shared < conversationAnalysis.user_messages * 0.3) {
      score += 15
      analysis.push('Good information management and strategic disclosure')
    }

    // Question asking for leverage
    const questionRatio = conversationAnalysis.questions_asked / Math.max(1, conversationAnalysis.user_messages)
    if (questionRatio > 0.2) {
      score += 10
      analysis.push('Effective use of questions to gain information advantage')
    }

    // Negotiation moves quality
    const competitiveMoves = conversationAnalysis.negotiation_moves.filter(move => move.type === 'competitive')
    if (competitiveMoves.length > 3) {
      score += 15
      analysis.push('Multiple sophisticated competitive negotiation moves')
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      analysis: analysis.join('. ')
    }
  }

  /**
   * Calculate creating value score based on collaborative problem-solving
   */
  calculateCreatingValueScore(conversationAnalysis, scenario) {
    let score = 50 // Base score
    let analysis = []

    // Value creation attempts
    if (conversationAnalysis.value_creation_attempts > 2) {
      score += 25
      analysis.push('Multiple value creation and mutual benefit proposals')
    } else if (conversationAnalysis.value_creation_attempts > 0) {
      score += 15
      analysis.push('Some attempt at value creation')
    } else {
      score -= 15
      analysis.push('Limited focus on mutual value creation')
    }

    // Collaborative indicators
    const collaborativeRatio = conversationAnalysis.collaborative_indicators / Math.max(1, conversationAnalysis.user_messages)
    if (collaborativeRatio > 0.3) {
      score += 20
      analysis.push('Strong collaborative negotiation approach')
    } else if (collaborativeRatio > 0.1) {
      score += 10
      analysis.push('Moderate collaborative elements')
    }

    // Information sharing for joint problem solving
    if (conversationAnalysis.information_shared > conversationAnalysis.user_messages * 0.4) {
      score += 15
      analysis.push('Good information sharing to enable joint problem solving')
    }

    // Question asking for understanding
    if (conversationAnalysis.questions_asked > 2) {
      score += 10
      analysis.push('Effective questioning to understand underlying interests')
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      analysis: analysis.join('. ')
    }
  }

  /**
   * Calculate relationship management score
   */
  calculateRelationshipScore(conversationAnalysis, scenario) {
    let score = 50 // Base score
    let analysis = []

    // Relationship building indicators
    const relationshipRatio = conversationAnalysis.relationship_indicators / Math.max(1, conversationAnalysis.user_messages)
    if (relationshipRatio > 0.3) {
      score += 25
      analysis.push('Excellent relationship building throughout conversation')
    } else if (relationshipRatio > 0.1) {
      score += 15
      analysis.push('Good attention to relationship dynamics')
    } else {
      score -= 10
      analysis.push('Limited focus on relationship management')
    }

    // Professional communication
    const relationshipMoves = conversationAnalysis.negotiation_moves.filter(move => move.type === 'relationship')
    if (relationshipMoves.length > 2) {
      score += 15
      analysis.push('Multiple relationship-building moves and professional courtesy')
    }

    // Balance of competitive and collaborative (shows sophistication)
    const balanceScore = Math.abs(conversationAnalysis.competitive_indicators - conversationAnalysis.collaborative_indicators)
    if (balanceScore < 3) {
      score += 10
      analysis.push('Good balance of competitive and collaborative approaches')
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      analysis: analysis.join('. ')
    }
  }

  /**
   * Calculate overall weighted performance score
   */
  calculateOverallScore(dimensionalScores) {
    return (
      dimensionalScores.claiming_value * this.performanceWeights.claiming_value +
      dimensionalScores.creating_value * this.performanceWeights.creating_value +
      dimensionalScores.managing_relationships * this.performanceWeights.managing_relationships
    )
  }

  /**
   * Generate performance ratings based on scores
   */
  generatePerformanceRatings(claimingScore, creatingScore, relationshipScore, overallScore, scenarioType) {
    const getRating = (score) => {
      if (score >= 85) return 'excellent'
      if (score >= 70) return 'good'
      if (score >= 55) return 'average'
      return 'poor'
    }

    return {
      claiming_value_rating: getRating(claimingScore),
      creating_value_rating: getRating(creatingScore),
      managing_relationships_rating: getRating(relationshipScore),
      overall_rating: getRating(overallScore)
    }
  }

  /**
   * Identify key performance milestones during conversation
   */
  identifyPerformanceMilestones(transcript, analysis) {
    const milestones = []

    // Look for breakthrough moments
    analysis.negotiation_moves.forEach((move, index) => {
      if (move.type === 'collaborative' && move.indicator.includes('creative')) {
        milestones.push({
          type: 'breakthrough',
          description: `Creative solution proposed: ${move.context}`,
          timestamp_seconds: index * 30, // Rough estimate
          impact_score: 75
        })
      }

      if (move.type === 'competitive' && move.indicator.includes('anchor')) {
        milestones.push({
          type: 'key_moment',
          description: `Strong position established: ${move.context}`,
          timestamp_seconds: index * 30,
          impact_score: 60
        })
      }
    })

    return milestones
  }

  /**
   * Generate personalized improvement suggestions
   */
  generateImprovementSuggestions(claimingScore, creatingScore, relationshipScore, analysis) {
    const suggestions = []

    // Claiming value improvements
    if (claimingScore.score < 70) {
      suggestions.push({
        dimension: 'claiming_value',
        priority: 'high',
        suggestion: 'Practice stronger anchoring techniques and strategic information disclosure',
        specific_actions: [
          'Start with higher initial offers',
          'Ask more probing questions before revealing your position',
          'Use market data and objective criteria to support your positions'
        ]
      })
    }

    // Creating value improvements  
    if (creatingScore.score < 70) {
      suggestions.push({
        dimension: 'creating_value',
        priority: 'high',
        suggestion: 'Focus more on identifying mutual interests and generating creative options',
        specific_actions: [
          'Ask "what if" questions to explore alternatives',
          'Look for ways both parties can benefit beyond the obvious trade-offs',
          'Share your underlying interests, not just your positions'
        ]
      })
    }

    // Relationship improvements
    if (relationshipScore.score < 70) {
      suggestions.push({
        dimension: 'managing_relationships',
        priority: 'medium',
        suggestion: 'Invest more in relationship building and professional rapport',
        specific_actions: [
          'Show more empathy and understanding of the other party\'s perspective',
          'Use collaborative language like "we" and "together"',
          'Acknowledge good points made by the other party'
        ]
      })
    }

    return suggestions
  }

  /**
   * Calculate session performance metrics
   */
  calculateSessionMetrics(transcript) {
    const userMessages = transcript.filter(msg => msg.speaker === 'user')
    const totalMessages = transcript.length

    return {
      conversation_duration_seconds: transcript.length * 30, // Rough estimate
      turn_count: Math.floor(totalMessages / 2),
      speaking_time_percentage: (userMessages.length / totalMessages) * 100,
      interruption_count: 0 // Would need more sophisticated analysis
    }
  }

  /**
   * Store performance analysis in database
   */
  async storePerformanceAnalysis(performanceData) {
    const performanceId = require('crypto').randomUUID()

    const record = {
      id: performanceId,
      negotiation_id: performanceData.negotiationId,
      user_id: performanceData.userId,
      scenario_id: performanceData.scenarioId,
      claiming_value_score: performanceData.scores.claiming_value,
      claiming_value_analysis: performanceData.analysis.claiming_value,
      claiming_value_rating: performanceData.ratings.claiming_value_rating,
      creating_value_score: performanceData.scores.creating_value,
      creating_value_analysis: performanceData.analysis.creating_value,
      creating_value_rating: performanceData.ratings.creating_value_rating,
      managing_relationships_score: performanceData.scores.managing_relationships,
      managing_relationships_analysis: performanceData.analysis.managing_relationships,
      managing_relationships_rating: performanceData.ratings.managing_relationships_rating,
      overall_score: performanceData.scores.overall,
      overall_rating: performanceData.ratings.overall_rating,
      overall_feedback: performanceData.analysis.overall,
      conversation_duration_seconds: performanceData.sessionMetrics.conversation_duration_seconds,
      turn_count: performanceData.sessionMetrics.turn_count,
      speaking_time_percentage: performanceData.sessionMetrics.speaking_time_percentage,
      conversation_analysis: JSON.stringify(performanceData.conversationAnalysis),
      negotiation_moves: JSON.stringify(performanceData.conversationAnalysis.negotiation_moves),
      improvement_suggestions: JSON.stringify(performanceData.improvements)
    }

    await db('negotiation_performance').insert(record)

    // Store milestones
    if (performanceData.milestones && performanceData.milestones.length > 0) {
      const milestoneRecords = performanceData.milestones.map(milestone => ({
        id: require('crypto').randomUUID(),
        negotiation_performance_id: performanceId,
        ...milestone
      }))
      await db('performance_milestones').insert(milestoneRecords)
    }

    return { ...record, milestones: performanceData.milestones }
  }

  /**
   * Update user progress and skill tracking
   */
  async updateUserProgress(userId, performanceRecord) {
    try {
      // Get existing progress or create new
      let progress = await db('user_performance_progress').where('user_id', userId).first()
      
      if (!progress) {
        progress = {
          id: require('crypto').randomUUID(),
          user_id: userId,
          total_negotiations: 0,
          average_performance: 0
        }
        await db('user_performance_progress').insert(progress)
      }

      // Update progress metrics
      const newTotal = progress.total_negotiations + 1
      const newAverage = ((progress.average_performance || 0) * progress.total_negotiations + performanceRecord.overall_score) / newTotal

      await db('user_performance_progress')
        .where('user_id', userId)
        .update({
          total_negotiations: newTotal,
          average_performance: newAverage,
          last_session_date: new Date().toISOString().split('T')[0]
        })

    } catch (error) {
      logger.error('Failed to update user progress:', error)
    }
  }

  /**
   * Get scenario context for evaluation
   */
  async getScenarioContext(scenarioId) {
    try {
      return await db('scenarios').where('id', scenarioId).first()
    } catch (error) {
      logger.error('Failed to get scenario context:', error)
      return null
    }
  }

  /**
   * Determine scenario type for evaluation criteria
   */
  getScenarioType(scenario) {
    if (!scenario) return 'general'
    if (scenario.title.toLowerCase().includes('executive') || scenario.title.toLowerCase().includes('compensation')) {
      return 'executive_compensation'
    }
    return 'general'
  }

  /**
   * Generate overall performance feedback
   */
  generateOverallFeedback(ratings, improvements) {
    const excellentCount = Object.values(ratings).filter(rating => rating === 'excellent').length
    const goodCount = Object.values(ratings).filter(rating => rating === 'good').length
    
    let feedback = ''
    
    if (excellentCount >= 2) {
      feedback = 'Outstanding negotiation performance demonstrating mastery across multiple dimensions. '
    } else if (goodCount >= 2) {
      feedback = 'Strong negotiation performance with solid skills in key areas. '
    } else {
      feedback = 'Developing negotiation skills with room for improvement in core areas. '
    }

    if (improvements.length > 0) {
      feedback += `Focus on ${improvements[0].dimension.replace('_', ' ')} to accelerate your development.`
    }

    return feedback
  }

  /**
   * Get user performance analytics
   */
  async getUserPerformanceAnalytics(userId) {
    try {
      const performances = await db('negotiation_performance')
        .where('user_id', userId)
        .orderBy('created_at', 'desc')
        .limit(10)

      const progress = await db('user_performance_progress')
        .where('user_id', userId)
        .first()

      return {
        recent_performances: performances,
        progress_summary: progress,
        skill_trends: this.calculateSkillTrends(performances)
      }
    } catch (error) {
      logger.error('Failed to get user analytics:', error)
      throw error
    }
  }

  /**
   * Calculate skill development trends
   */
  calculateSkillTrends(performances) {
    if (performances.length < 2) return null

    const claiming = performances.map(p => p.claiming_value_score).filter(Boolean)
    const creating = performances.map(p => p.creating_value_score).filter(Boolean)
    const relationships = performances.map(p => p.managing_relationships_score).filter(Boolean)

    return {
      claiming_value_trend: this.calculateTrend(claiming),
      creating_value_trend: this.calculateTrend(creating),
      managing_relationships_trend: this.calculateTrend(relationships)
    }
  }

  /**
   * Calculate linear trend for skill progression
   */
  calculateTrend(values) {
    if (values.length < 2) return 0
    
    const n = values.length
    const sumX = n * (n - 1) / 2
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0)
    const sumX2 = n * (n - 1) * (2 * n - 1) / 6

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  }
}

module.exports = new PerformanceAnalyticsService()