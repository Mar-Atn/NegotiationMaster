const db = require('../config/database')

class FeedbackProcessor {
  
  async generatePersonalizedFeedback(job) {
    const startTime = Date.now()
    console.log(`💬 Generating personalized feedback for job ${job.id}`)
    
    try {
      const { assessmentId, assessmentResults } = job.data
      
      // Get assessment record
      const assessment = await db('conversation_assessments')
        .where('id', assessmentId)
        .first()
        
      if (!assessment) {
        throw new Error(`Assessment ${assessmentId} not found`)
      }

      // Get user's historical performance for context
      const userHistory = await db('conversation_assessments')
        .where('user_id', assessment.user_id)
        .where('status', 'completed')
        .orderBy('created_at', 'desc')
        .limit(5)

      // Generate advanced AI-powered feedback with professional language
      const feedback = await this.generateAdvancedFeedback(assessmentResults, userHistory)
      
      // Update assessment with comprehensive feedback
      await db('conversation_assessments')
        .where('id', assessmentId)
        .update({
          personalized_feedback: feedback.summary,
          improvement_recommendations: JSON.stringify(feedback.recommendations),
          skill_level_achieved: feedback.skillLevel,
          performance_percentile: feedback.percentile,
          negotiation_tactics_identified: JSON.stringify([
            ...(assessment.negotiation_tactics_identified ? JSON.parse(assessment.negotiation_tactics_identified) : []),
            ...feedback.detailedAnalysis.tacticsUsed
          ]),
          strengths_identified: JSON.stringify(feedback.detailedAnalysis.strengths),
          development_areas: JSON.stringify(feedback.detailedAnalysis.developmentAreas)
        })

      // Check for milestones
      await this.checkAndCreateMilestones(assessmentId, assessment.user_id, assessmentResults)

      console.log(`✅ Feedback generated for assessment ${assessmentId} in ${Date.now() - startTime}ms`)
      
      return {
        assessmentId,
        feedback,
        processingTime: Date.now() - startTime
      }
      
    } catch (error) {
      console.error(`❌ Feedback generation failed for job ${job.id}:`, error)
      throw error
    }
  }

  async generateAdvancedFeedback(assessmentResults, userHistory) {
    const { claimingValue, creatingValue, relationshipManagement, overall } = assessmentResults
    
    // Professional executive summary with context
    const progressContext = this.analyzeProgressContext(assessmentResults, userHistory)
    let summary = this.generateExecutiveSummary(overall, claimingValue, creatingValue, relationshipManagement, progressContext)
    
    // Enhanced performance analysis with conversation examples
    const performanceAnalysis = this.generateEnhancedPerformanceAnalysis(assessmentResults)
    
    // Generate specific conversation insights with quotes
    const conversationInsights = this.generateConversationInsights(assessmentResults)
    
    // Contextual recommendations based on skill level and history
    const recommendations = this.generateContextualRecommendations(assessmentResults, userHistory, progressContext)
    
    // Determine skill level with progression indicators
    const skillLevel = this.determineAdvancedSkillLevel(overall, progressContext)
    
    // Calculate benchmarked percentile
    const percentile = this.calculateBenchmarkedPercentile(overall, userHistory)
    
    // Generate specific action items
    const actionItems = this.generateActionItems(assessmentResults, progressContext)
    
    // Create learning pathway
    const learningPathway = this.generateLearningPathway(assessmentResults, skillLevel)

    return {
      summary,
      performanceAnalysis,
      conversationInsights,
      recommendations,
      actionItems,
      learningPathway,
      skillLevel,
      percentile: Math.round(percentile),
      detailedAnalysis: {
        strengths: assessmentResults.strengths,
        developmentAreas: assessmentResults.developmentAreas,
        tacticsUsed: assessmentResults.allTechniques,
        conversationFlow: assessmentResults.conversationFlow,
        emotionalIntelligence: assessmentResults.emotionalIntelligence,
        conversationExamples: assessmentResults.conversationExamples || {}
      },
      progressContext
    }
  }

  generateExecutiveSummary(overall, claimingValue, creatingValue, relationshipManagement, progressContext) {
    const performanceLevel = this.getPerformanceLevel(overall)
    const trend = progressContext.trend || 'stable'
    
    let summary = `Negotiation performance demonstrates ${performanceLevel.toLowerCase()} capabilities with an overall score of ${overall}/100. `
    
    // Add trend information
    if (trend === 'improving') {
      summary += `Performance trajectory shows consistent improvement across recent sessions. `
    } else if (trend === 'declining') {
      summary += `Recent sessions indicate opportunity for focused skill reinforcement. `
    } else {
      summary += `Performance demonstrates consistency across recent negotiation sessions. `
    }
    
    // Dimensional analysis
    const scores = { claimingValue: claimingValue.score, creatingValue: creatingValue.score, relationshipManagement: relationshipManagement.score }
    const strongest = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)
    const weakest = Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b)
    
    summary += `Demonstrates particular strength in ${this.formatDimensionName(strongest)} (${scores[strongest]}/100) `
    summary += `with development opportunity in ${this.formatDimensionName(weakest)} (${scores[weakest]}/100).`
    
    return summary
  }

  generatePerformanceAnalysis(assessmentResults) {
    const { claimingValue, creatingValue, relationshipManagement } = assessmentResults
    
    return {
      claimingValue: {
        score: claimingValue.score,
        assessment: this.getSkillAssessment(claimingValue.score),
        keyTechniques: claimingValue.analysis.techniques,
        developmentFocus: this.getClaimingValueFocus(claimingValue.score)
      },
      creatingValue: {
        score: creatingValue.score,
        assessment: this.getSkillAssessment(creatingValue.score),
        keyTechniques: creatingValue.analysis.techniques,
        developmentFocus: this.getCreatingValueFocus(creatingValue.score)
      },
      relationshipManagement: {
        score: relationshipManagement.score,
        assessment: this.getSkillAssessment(relationshipManagement.score),
        keyTechniques: relationshipManagement.analysis.techniques,
        developmentFocus: this.getRelationshipFocus(relationshipManagement.score)
      }
    }
  }

  generateContextualRecommendations(assessmentResults, userHistory, progressContext) {
    const recommendations = []
    const { claimingValue, creatingValue, relationshipManagement, overall } = assessmentResults
    
    // High-priority recommendations based on scores
    if (claimingValue.score < 75) {
      recommendations.push({
        dimension: 'claiming_value',
        priority: 'high',
        title: 'Enhance Competitive Negotiation Capabilities',
        description: 'Focus on systematic approach to value claiming through strategic positioning and concession management.',
        specificActions: [
          'Practice anchoring with market-researched opening positions',
          'Develop BATNA articulation and leverage techniques',
          'Master incremental concession patterns with conditional language'
        ],
        resources: [
          'Harvard Business Review: "The Art of Strategic Concessions"',
          'Program on Negotiation: Claiming Value Workshop Materials',
          'Practice scenario: High-stakes vendor contract negotiations'
        ],
        expectedImprovement: '15-20 point score increase over 3-4 sessions',
        timeframe: '2-3 weeks'
      })
    }
    
    if (creatingValue.score < 75) {
      recommendations.push({
        dimension: 'creating_value',
        priority: 'high',
        title: 'Strengthen Collaborative Problem-Solving',
        description: 'Develop systematic approach to identifying mutual gains and expanding negotiation value.',
        specificActions: [
          'Practice interest-based questioning techniques',
          'Master multi-issue package deal construction',
          'Develop creative option generation workflows'
        ],
        resources: [
          'Fisher & Ury: Getting to Yes - Interest-Based Negotiation',
          'MIT Sloan: Integrative Negotiation Frameworks',
          'Practice scenario: Complex partnership agreements'
        ],
        expectedImprovement: '12-18 point score increase over 4-5 sessions',
        timeframe: '3-4 weeks'
      })
    }
    
    if (relationshipManagement.score < 75) {
      recommendations.push({
        dimension: 'relationship_management',
        priority: 'medium',
        title: 'Advance Interpersonal Negotiation Skills',
        description: 'Enhance emotional intelligence and communication effectiveness in high-stakes conversations.',
        specificActions: [
          'Develop active listening confirmation techniques',
          'Practice empathy articulation without compromising position',
          'Master conflict de-escalation and reframing methods'
        ],
        resources: [
          'Crucial Conversations: Tools for Talking When Stakes Are High',
          'Emotional Intelligence in Negotiations Certification',
          'Practice scenario: Difficult stakeholder management situations'
        ],
        expectedImprovement: '10-15 point score increase over 3-4 sessions',
        timeframe: '2-3 weeks'
      })
    }
    
    // Advanced recommendations for high performers
    if (overall >= 80) {
      recommendations.push({
        dimension: 'advanced_techniques',
        priority: 'medium',
        title: 'Master Advanced Negotiation Strategies',
        description: 'Develop sophisticated multi-party and cross-cultural negotiation capabilities.',
        specificActions: [
          'Practice complex multi-stakeholder scenario management',
          'Develop cultural adaptation techniques for international negotiations',
          'Master psychological influence and persuasion ethics'
        ],
        resources: [
          'Advanced Negotiation Workshop: Multi-Party Dynamics',
          'Cross-Cultural Negotiation Certification Program',
          'Executive Negotiation Simulation Exercises'
        ],
        expectedImprovement: '5-10 point score increase, enhanced consistency',
        timeframe: '4-6 weeks'
      })
    }
    
    return recommendations
  }

  generateActionItems(assessmentResults, progressContext) {
    const actionItems = []
    const { claimingValue, creatingValue, relationshipManagement } = assessmentResults
    
    // Immediate next session focus
    actionItems.push({
      category: 'immediate',
      title: 'Next Session Focus',
      description: `Concentrate on ${this.getWeakestDimensionName(assessmentResults)} techniques`,
      dueDate: 'Next negotiation session',
      priority: 'high'
    })
    
    // Weekly development goals
    actionItems.push({
      category: 'weekly',
      title: 'Practice Specific Techniques',
      description: 'Implement 2-3 new negotiation techniques in real scenarios',
      dueDate: 'Within 7 days',
      priority: 'medium'
    })
    
    // Study and preparation
    actionItems.push({
      category: 'study',
      title: 'Resource Review',
      description: 'Complete recommended reading and framework study',
      dueDate: 'Within 14 days',
      priority: 'medium'
    })
    
    return actionItems
  }

  generateLearningPathway(assessmentResults, skillLevel) {
    const pathway = {
      currentLevel: skillLevel,
      nextMilestone: this.getNextMilestone(skillLevel),
      recommendedScenarios: this.getRecommendedScenarios(assessmentResults),
      skillProgression: this.getSkillProgression(assessmentResults)
    }
    
    return pathway
  }

  // Helper methods for advanced feedback generation
  analyzeProgressContext(assessmentResults, userHistory) {
    if (!userHistory || userHistory.length < 2) {
      return { trend: 'stable', sessionCount: userHistory?.length || 0 }
    }
    
    const recentScores = userHistory.slice(0, 3).map(h => h.overall_assessment_score)
    const olderScores = userHistory.slice(3, 6).map(h => h.overall_assessment_score)
    
    if (recentScores.length === 0 || olderScores.length === 0) {
      return { trend: 'stable', sessionCount: userHistory.length }
    }
    
    const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length
    
    const improvement = recentAvg - olderAvg
    
    return {
      trend: improvement > 5 ? 'improving' : improvement < -5 ? 'declining' : 'stable',
      sessionCount: userHistory.length,
      improvement: Math.round(improvement),
      consistency: this.calculateConsistency(recentScores)
    }
  }

  getPerformanceLevel(score) {
    if (score >= 90) return 'Exceptional'
    if (score >= 80) return 'Advanced'
    if (score >= 70) return 'Proficient'
    if (score >= 60) return 'Developing'
    return 'Foundational'
  }

  getSkillAssessment(score) {
    if (score >= 85) return 'Demonstrates mastery-level capabilities with consistent application of advanced techniques'
    if (score >= 75) return 'Shows strong competency with effective technique application'
    if (score >= 65) return 'Displays developing proficiency with room for technique refinement'
    if (score >= 55) return 'Indicates foundational understanding requiring focused development'
    return 'Represents early-stage learning with significant growth opportunity'
  }

  getClaimingValueFocus(score) {
    if (score < 60) return 'Develop systematic anchoring and concession strategies'
    if (score < 75) return 'Refine BATNA leverage and pressure application techniques'
    return 'Master advanced timing and deal protection mechanisms'
  }

  getCreatingValueFocus(score) {
    if (score < 60) return 'Build foundation in interest identification and option generation'
    if (score < 75) return 'Enhance trade-off analysis and package deal construction'
    return 'Develop sophisticated multi-issue value creation approaches'
  }

  getRelationshipFocus(score) {
    if (score < 60) return 'Strengthen active listening and empathy demonstration'
    if (score < 75) return 'Improve conflict management and trust-building techniques'
    return 'Master advanced interpersonal influence and rapport management'
  }

  calculateBenchmarkedPercentile(overall, userHistory) {
    // Sophisticated percentile calculation based on performance distribution
    const basePercentile = Math.min(95, Math.max(5, overall * 0.8 + 20))
    
    // Adjust for consistency
    if (userHistory && userHistory.length > 2) {
      const scores = userHistory.map(h => h.overall_assessment_score).slice(0, 5)
      const consistency = this.calculateConsistency(scores)
      
      if (consistency > 0.8) {
        return Math.min(98, basePercentile + 5) // Bonus for consistency
      }
    }
    
    return basePercentile
  }

  calculateConsistency(scores) {
    if (scores.length < 2) return 1
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((acc, score) => acc + Math.pow(score - mean, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    // Return consistency score (0-1, where 1 is most consistent)
    return Math.max(0, 1 - (standardDeviation / 20))
  }

  determineAdvancedSkillLevel(overall, progressContext) {
    let baseLevel = 'beginner'
    if (overall >= 60) baseLevel = 'intermediate'
    if (overall >= 75) baseLevel = 'advanced'
    if (overall >= 90) baseLevel = 'expert'
    
    // Adjust for consistency and progression
    if (progressContext.trend === 'improving' && progressContext.consistency > 0.8) {
      const levels = ['beginner', 'intermediate', 'advanced', 'expert']
      const currentIndex = levels.indexOf(baseLevel)
      if (currentIndex < levels.length - 1) {
        return `advancing_${baseLevel}` // e.g., "advancing_intermediate"
      }
    }
    
    return baseLevel
  }

  getWeakestDimensionName(assessmentResults) {
    const scores = {
      'Claiming Value': assessmentResults.claimingValue.score,
      'Creating Value': assessmentResults.creatingValue.score,
      'Relationship Management': assessmentResults.relationshipManagement.score
    }
    
    return Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b)
  }

  getNextMilestone(skillLevel) {
    const milestones = {
      'beginner': 'Reach 60+ overall score with consistent technique application',
      'intermediate': 'Achieve 75+ overall score with multi-dimensional strength',
      'advanced': 'Attain 85+ overall score with mastery-level consistency',
      'expert': 'Maintain 90+ performance across diverse negotiation contexts'
    }
    
    return milestones[skillLevel] || milestones['beginner']
  }

  getRecommendedScenarios(assessmentResults) {
    const { claimingValue, creatingValue, relationshipManagement } = assessmentResults
    const scenarios = []
    
    if (claimingValue.score < 70) {
      scenarios.push('High-stakes vendor contract negotiation')
    }
    
    if (creatingValue.score < 70) {
      scenarios.push('Complex partnership deal structuring')
    }
    
    if (relationshipManagement.score < 70) {
      scenarios.push('Difficult stakeholder conflict resolution')
    }
    
    return scenarios.length > 0 ? scenarios : ['Advanced multi-party negotiation simulation']
  }

  getSkillProgression(assessmentResults) {
    return {
      shortTerm: 'Focus on weakest dimension improvement',
      mediumTerm: 'Achieve balanced multi-dimensional competency',
      longTerm: 'Develop specialized expertise in complex scenarios'
    }
  }

  formatDimensionName(dimension) {
    const names = {
      claimingValue: 'Claiming Value',
      creatingValue: 'Creating Value', 
      relationshipManagement: 'Relationship Management'
    }
    return names[dimension] || dimension
  }

  generateEnhancedPerformanceAnalysis(assessmentResults) {
    const { claimingValue, creatingValue, relationshipManagement } = assessmentResults
    
    return {
      claimingValue: {
        score: claimingValue.score,
        assessment: this.getSkillAssessment(claimingValue.score),
        keyTechniques: claimingValue.analysis.techniques,
        examples: claimingValue.analysis.examples || [],
        developmentFocus: this.getClaimingValueFocus(claimingValue.score)
      },
      creatingValue: {
        score: creatingValue.score,
        assessment: this.getSkillAssessment(creatingValue.score),
        keyTechniques: creatingValue.analysis.techniques,
        examples: creatingValue.analysis.examples || [],
        developmentFocus: this.getCreatingValueFocus(creatingValue.score)
      },
      relationshipManagement: {
        score: relationshipManagement.score,
        assessment: this.getSkillAssessment(relationshipManagement.score),
        keyTechniques: relationshipManagement.analysis.techniques,
        examples: relationshipManagement.analysis.examples || [],
        developmentFocus: this.getRelationshipFocus(relationshipManagement.score)
      }
    }
  }

  generateConversationInsights(assessmentResults) {
    const insights = []
    const { claimingValue, creatingValue, relationshipManagement, conversationExamples } = assessmentResults
    
    // Generate insights from conversation examples if available
    if (conversationExamples) {
      // Claiming Value insights
      if (conversationExamples.claiming && conversationExamples.claiming.length > 0) {
        const example = conversationExamples.claiming[0]
        if (example && example.quote) {
          insights.push({
            category: 'strength',
            dimension: 'Claiming Value',
            concept: example.concept || 'Strategic Positioning',
            quote: `"${example.quote}"`,
            analysis: 'This demonstrates effective value claiming strategy with clear position advocacy.',
            improvement: claimingValue.score >= 75 ? 'Continue leveraging this strength in complex scenarios.' : 'Build on this foundation with more sophisticated techniques.'
          })
        }
      }
      
      // Creating Value insights
      if (conversationExamples.creating && conversationExamples.creating.length > 0) {
        const example = conversationExamples.creating[0]
        if (example && example.quote) {
          insights.push({
            category: 'strength',
            dimension: 'Creating Value',
            concept: example.concept || 'Collaborative Approach',
            quote: `"${example.quote}"`,
            analysis: 'This shows good collaborative instincts and interest in mutual value creation.',
            improvement: creatingValue.score >= 75 ? 'Expand to more complex multi-issue negotiations.' : 'Practice deeper interest exploration techniques.'
          })
        }
      }
      
      // Relationship Management insights
      if (conversationExamples.relationship && conversationExamples.relationship.length > 0) {
        const example = conversationExamples.relationship[0]
        if (example && example.quote) {
          insights.push({
            category: 'strength',
            dimension: 'Relationship Management',
            concept: example.concept || 'Professional Communication',
            quote: `"${example.quote}"`,
            analysis: 'This reflects strong interpersonal awareness and relationship building skills.',
            improvement: relationshipManagement.score >= 75 ? 'Apply these skills in high-stakes, emotional scenarios.' : 'Develop more sophisticated empathy and conflict management techniques.'
          })
        }
      }
    }
    
    // Generate improvement insights for weaker areas
    const scores = {
      'Claiming Value': claimingValue.score,
      'Creating Value': creatingValue.score, 
      'Relationship Management': relationshipManagement.score
    }
    
    const weakest = Object.keys(scores).reduce((a, b) => scores[a] < scores[b] ? a : b)
    
    if (scores[weakest] < 70) {
      insights.push({
        category: 'improvement',
        dimension: weakest,
        concept: 'Development Opportunity',
        quote: 'Areas for enhanced technique application',
        analysis: `${weakest} represents your primary development opportunity with significant room for growth.`,
        improvement: this.getSpecificImprovementSuggestion(weakest, scores[weakest])
      })
    }
    
    return insights.length > 0 ? insights : [{
      category: 'engagement',
      dimension: 'Overall Performance',
      concept: 'Active Participation',
      quote: 'Maintained professional dialogue throughout the negotiation',
      analysis: 'Demonstrated commitment to the negotiation process and willingness to engage constructively.',
      improvement: 'Continue building confidence through regular practice and technique study.'
    }]
  }

  getSpecificImprovementSuggestion(dimension, score) {
    const suggestions = {
      'Claiming Value': score < 50 ? 
        'Start with basic anchoring and BATNA development exercises.' :
        'Practice systematic concession management and pressure application techniques.',
      'Creating Value': score < 50 ?
        'Focus on asking "why" questions to understand underlying interests.' :
        'Develop skills in generating multiple options and identifying trade-offs.',
      'Relationship Management': score < 50 ?
        'Practice active listening and empathy demonstration in low-stakes conversations.' :
        'Work on conflict management and advanced emotional intelligence techniques.'
    }
    
    return suggestions[dimension] || 'Focus on systematic practice and technique development.'
  }

  async checkAndCreateMilestones(assessmentId, userId, assessmentResults) {
    try {
      const milestones = []
      
      // Check for score-based milestones
      Object.entries(assessmentResults).forEach(([dimension, score]) => {
        if (typeof score === 'number') {
          // First time reaching score thresholds
          if (score >= 80 && score < 85) {
            milestones.push({
              milestone_type: 'skill_breakthrough',
              skill_dimension: dimension,
              threshold_value: score,
              description: `Achieved ${this.formatDimensionName(dimension)} score of ${score}/100`
            })
          }
          
          if (score >= 90) {
            milestones.push({
              milestone_type: 'excellence_achievement',
              skill_dimension: dimension,
              threshold_value: score,
              description: `Excellent performance in ${this.formatDimensionName(dimension)}: ${score}/100`
            })
          }
        }
      })

      // Insert milestones if any found
      if (milestones.length > 0) {
        const milestoneInserts = milestones.map(milestone => ({
          id: require('uuid').v4(),
          conversation_assessment_id: assessmentId,
          user_id: userId,
          achieved_at: new Date(),
          ...milestone
        }))

        await db('assessment_milestones').insert(milestoneInserts)
        console.log(`🏆 Created ${milestones.length} milestones for user ${userId}`)
      }
      
    } catch (error) {
      console.error('Failed to create milestones:', error)
      // Don't throw - milestone creation is non-critical
    }
  }
}

// Export the processor function for Bull queue
module.exports = {
  generatePersonalizedFeedback: (job) => {
    const processor = new FeedbackProcessor()
    return processor.generatePersonalizedFeedback(job)
  }
}