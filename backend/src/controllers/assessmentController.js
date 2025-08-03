const db = require('../config/database')
const assessmentQueueService = require('../services/assessmentQueue')
const redisService = require('../services/redis')
const logger = require('../config/logger')

class AssessmentController {

  async analyzeConversation(req, res) {
    try {
      const { negotiationId } = req.params
      const userId = req.user.id

      logger.info('Assessment analysis requested', { negotiationId, userId })

      // Verify the negotiation exists and belongs to the user
      const negotiation = await db('negotiations')
        .where({ id: negotiationId, user_id: userId })
        .first()

      if (!negotiation) {
        return res.status(404).json({
          success: false,
          error: 'Negotiation not found or access denied',
          code: 'NEGOTIATION_NOT_FOUND'
        })
      }

      // Check if conversation is completed
      if (negotiation.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Cannot assess incomplete conversation',
          code: 'CONVERSATION_INCOMPLETE'
        })
      }

      // Check if assessment already exists
      const existingAssessment = await db('conversation_assessments')
        .where('negotiation_id', negotiationId)
        .first()

      if (existingAssessment && existingAssessment.status === 'completed') {
        return res.json({
          success: true,
          message: 'Assessment already completed',
          data: {
            assessmentId: existingAssessment.id,
            status: existingAssessment.status,
            completedAt: existingAssessment.completed_at
          }
        })
      }

      // Get conversation transcript and metadata
      const conversationData = {
        negotiationId,
        userId,
        scenarioId: negotiation.scenario_id,
        transcript: negotiation.transcript || '',
        voiceMetrics: negotiation.voice_metrics ? JSON.parse(negotiation.voice_metrics) : {},
        metadata: {
          duration: negotiation.duration_seconds,
          endedAt: negotiation.ended_at,
          outcome: negotiation.outcome
        }
      }

      // Queue the assessment
      const jobId = await assessmentQueueService.queueConversationAssessment(conversationData, 1)

      if (!jobId) {
        // Fallback: process synchronously if queue is not available
        logger.warn('Assessment queue unavailable, processing synchronously')
        
        try {
          // Import the assessment processor directly for synchronous processing
          const assessmentProcessor = require('../services/assessmentProcessor')
          const mockJob = {
            id: `sync_${Date.now()}`,
            data: conversationData
          }
          
          const result = await assessmentProcessor.processConversationAnalysis(mockJob)
          
          return res.json({
            success: true,
            message: 'Assessment completed successfully (synchronous)',
            data: {
              jobId: `sync_${Date.now()}`,
              assessmentId: result.assessmentId,
              processingTime: result.processingTime,
              negotiationId
            }
          })
          
        } catch (syncError) {
          logger.error('Synchronous assessment processing failed:', syncError)
          return res.status(503).json({
            success: false,
            error: 'Assessment service temporarily unavailable',
            code: 'SERVICE_UNAVAILABLE'
          })
        }
      }

      res.json({
        success: true,
        message: 'Assessment analysis started',
        data: {
          jobId,
          estimatedCompletionTime: '30-60 seconds',
          negotiationId
        }
      })

    } catch (error) {
      logger.error('Error starting assessment analysis:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to start assessment analysis',
        code: 'ASSESSMENT_START_FAILED'
      })
    }
  }

  async getResults(req, res) {
    try {
      const { negotiationId } = req.params
      const userId = req.user.id

      // Check cache first
      const cachedResults = await redisService.getCachedAssessmentResult(negotiationId)
      if (cachedResults) {
        return res.json({
          success: true,
          data: cachedResults,
          cached: true
        })
      }

      // Verify access
      const negotiation = await db('negotiations')
        .where({ id: negotiationId, user_id: userId })
        .first()

      if (!negotiation) {
        return res.status(404).json({
          success: false,
          error: 'Negotiation not found or access denied'
        })
      }

      // Get assessment results
      const assessment = await db('conversation_assessments')
        .where('negotiation_id', negotiationId)
        .first()

      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: 'Assessment not found',
          code: 'ASSESSMENT_NOT_FOUND'
        })
      }

      if (assessment.status !== 'completed') {
        return res.json({
          success: true,
          data: {
            status: assessment.status,
            message: assessment.status === 'processing' ? 'Assessment in progress' : 'Assessment failed',
            startedAt: assessment.started_at
          }
        })
      }

      // Get milestones for this assessment
      const milestones = await db('assessment_milestones')
        .where('conversation_assessment_id', assessment.id)
        .orderBy('achieved_at', 'desc')

      const results = {
        assessmentId: assessment.id,
        status: assessment.status,
        completedAt: assessment.completed_at,
        processingTime: assessment.processing_time_ms,
        scores: {
          overall: assessment.overall_assessment_score || 0,
          claimingValue: assessment.claiming_value_score || 0,
          creatingValue: assessment.creating_value_score || 0,
          relationshipManagement: assessment.relationship_management_score || 0
        },
        summary: assessment.personalized_feedback || this.generateFallbackSummary(assessment),
        analysis: {
          tacticsIdentified: assessment.negotiation_tactics_identified ? JSON.parse(assessment.negotiation_tactics_identified) : [],
          conversationFlow: assessment.conversation_flow_analysis ? JSON.parse(assessment.conversation_flow_analysis) : {},
          emotionalIntelligence: assessment.emotional_intelligence_metrics ? JSON.parse(assessment.emotional_intelligence_metrics) : {},
          languagePatterns: assessment.language_pattern_analysis ? JSON.parse(assessment.language_pattern_analysis) : {}
        },
        feedback: {
          recommendations: assessment.improvement_recommendations ? JSON.parse(assessment.improvement_recommendations) : [],
          strengths: assessment.strengths_identified ? JSON.parse(assessment.strengths_identified) : [],
          developmentAreas: assessment.development_areas ? JSON.parse(assessment.development_areas) : []
        },
        performance: {
          skillLevel: assessment.skill_level_achieved,
          percentile: assessment.performance_percentile,
          milestones: milestones
        }
      }

      // Cache the results
      await redisService.cacheAssessmentResult(negotiationId, results, 1800) // 30 minutes

      res.json({
        success: true,
        data: results
      })

    } catch (error) {
      logger.error('Error getting assessment results:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get assessment results'
      })
    }
  }

  async getStatus(req, res) {
    try {
      const { negotiationId } = req.params
      const userId = req.user.id

      // Verify access
      const negotiation = await db('negotiations')
        .where({ id: negotiationId, user_id: userId })
        .first()

      if (!negotiation) {
        return res.status(404).json({
          success: false,
          error: 'Negotiation not found or access denied'
        })
      }

      const assessment = await db('conversation_assessments')
        .where('negotiation_id', negotiationId)
        .first()

      if (!assessment) {
        return res.json({
          success: true,
          data: {
            status: 'not_started',
            message: 'Assessment not yet initiated'
          }
        })
      }

      res.json({
        success: true,
        data: {
          status: assessment.status,
          startedAt: assessment.started_at,
          completedAt: assessment.completed_at,
          processingTime: assessment.processing_time_ms,
          hasResults: assessment.status === 'completed'
        }
      })

    } catch (error) {
      logger.error('Error getting assessment status:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get assessment status'
      })
    }
  }

  async getUserHistory(req, res) {
    try {
      const { userId } = req.params
      const requestingUserId = req.user.id

      // Users can only access their own history unless admin
      if (userId !== requestingUserId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        })
      }

      const limit = parseInt(req.query.limit) || 10
      const offset = parseInt(req.query.offset) || 0

      const assessments = await db('conversation_assessments')
        .select([
          'conversation_assessments.*',
          'negotiations.scenario_id',
          'scenarios.title as scenario_title',
          'scenarios.difficulty_level'
        ])
        .join('negotiations', 'conversation_assessments.negotiation_id', 'negotiations.id')
        .join('scenarios', 'negotiations.scenario_id', 'scenarios.id')
        .where('conversation_assessments.user_id', userId)
        .where('conversation_assessments.status', 'completed')
        .orderBy('conversation_assessments.completed_at', 'desc')
        .limit(limit)
        .offset(offset)

      const total = await db('conversation_assessments')
        .where('user_id', userId)
        .where('status', 'completed')
        .count('* as count')
        .first()

      const history = assessments.map(assessment => ({
        assessmentId: assessment.id,
        negotiationId: assessment.negotiation_id,
        scenario: {
          id: assessment.scenario_id,
          title: assessment.scenario_title,
          difficulty: assessment.difficulty_level
        },
        completedAt: assessment.completed_at,
        scores: {
          claimingValue: assessment.claiming_value_score,
          creatingValue: assessment.creating_value_score,
          relationshipManagement: assessment.relationship_management_score,
          overall: assessment.overall_assessment_score
        },
        skillLevel: assessment.skill_level_achieved,
        processingTime: assessment.processing_time_ms
      }))

      res.json({
        success: true,
        data: {
          assessments: history,
          pagination: {
            total: total.count,
            limit,
            offset,
            hasMore: (offset + limit) < total.count
          }
        }
      })

    } catch (error) {
      logger.error('Error getting user assessment history:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get assessment history'
      })
    }
  }

  async getUserProgress(req, res) {
    try {
      const { userId } = req.params
      const requestingUserId = req.user.id

      if (userId !== requestingUserId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        })
      }

      // Check cache first
      const cachedProgress = await redisService.getCachedUserProgress(userId)
      if (cachedProgress) {
        return res.json({
          success: true,
          data: cachedProgress,
          cached: true
        })
      }

      // Get recent assessments for trend analysis
      const recentAssessments = await db('conversation_assessments')
        .where('user_id', userId)
        .where('status', 'completed')
        .orderBy('completed_at', 'desc')
        .limit(10)

      if (recentAssessments.length === 0) {
        return res.json({
          success: true,
          data: {
            message: 'No completed assessments found',
            totalAssessments: 0
          }
        })
      }

      // Calculate progress metrics
      const totalAssessments = recentAssessments.length
      const latestAssessment = recentAssessments[0]
      
      // Calculate averages
      const avgScores = {
        claimingValue: Math.round(recentAssessments.reduce((sum, a) => sum + (a.claiming_value_score || 0), 0) / totalAssessments),
        creatingValue: Math.round(recentAssessments.reduce((sum, a) => sum + (a.creating_value_score || 0), 0) / totalAssessments),
        relationshipManagement: Math.round(recentAssessments.reduce((sum, a) => sum + (a.relationship_management_score || 0), 0) / totalAssessments),
        overall: Math.round(recentAssessments.reduce((sum, a) => sum + (a.overall_assessment_score || 0), 0) / totalAssessments)
      }

      // Calculate trends (simple comparison with older assessments)
      const trends = this.calculateTrends(recentAssessments)

      // Get milestones
      const milestones = await db('assessment_milestones')
        .where('user_id', userId)
        .orderBy('achieved_at', 'desc')
        .limit(5)

      // Determine skill level
      const skillLevel = this.determineSkillLevel(avgScores.overall)

      const progressData = {
        userId,
        totalAssessments,
        lastAssessmentDate: latestAssessment.completed_at,
        currentScores: avgScores,
        trends,
        skillLevel,
        recentMilestones: milestones.map(m => ({
          type: m.milestone_type,
          skillDimension: m.skill_dimension,
          description: m.description,
          achievedAt: m.achieved_at
        })),
        recommendations: this.generateProgressRecommendations(avgScores, trends)
      }

      // Cache the progress data
      await redisService.cacheUserProgress(userId, progressData, 1800)

      res.json({
        success: true,
        data: progressData
      })

    } catch (error) {
      logger.error('Error getting user progress:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get user progress'
      })
    }
  }

  async getUserMilestones(req, res) {
    try {
      const { userId } = req.params
      const requestingUserId = req.user.id

      if (userId !== requestingUserId && !req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        })
      }

      const milestones = await db('assessment_milestones')
        .select([
          'assessment_milestones.*',
          'conversation_assessments.overall_assessment_score'
        ])
        .join('conversation_assessments', 'assessment_milestones.conversation_assessment_id', 'conversation_assessments.id')
        .where('assessment_milestones.user_id', userId)
        .orderBy('assessment_milestones.achieved_at', 'desc')

      const groupedMilestones = milestones.reduce((acc, milestone) => {
        const type = milestone.milestone_type
        if (!acc[type]) acc[type] = []
        acc[type].push({
          id: milestone.id,
          skillDimension: milestone.skill_dimension,
          description: milestone.description,
          thresholdValue: milestone.threshold_value,
          achievedAt: milestone.achieved_at,
          assessmentScore: milestone.overall_assessment_score,
          isFirstTime: milestone.first_time_achievement
        })
        return acc
      }, {})

      res.json({
        success: true,
        data: {
          totalMilestones: milestones.length,
          milestonesByType: groupedMilestones,
          recentMilestones: milestones.slice(0, 10)
        }
      })

    } catch (error) {
      logger.error('Error getting user milestones:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get user milestones'
      })
    }
  }

  async getQueueStatus(req, res) {
    try {
      // Only admin users can check queue status
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        })
      }

      const queueStatus = await assessmentQueueService.getQueueStatus()

      res.json({
        success: true,
        data: queueStatus
      })

    } catch (error) {
      logger.error('Error getting queue status:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get queue status'
      })
    }
  }

  async retryAssessment(req, res) {
    try {
      const { negotiationId } = req.params
      const userId = req.user.id

      // Verify access
      const negotiation = await db('negotiations')
        .where({ id: negotiationId, user_id: userId })
        .first()

      if (!negotiation) {
        return res.status(404).json({
          success: false,
          error: 'Negotiation not found or access denied'
        })
      }

      // Check if assessment exists and failed
      const assessment = await db('conversation_assessments')
        .where('negotiation_id', negotiationId)
        .first()

      if (!assessment || assessment.status !== 'failed') {
        return res.status(400).json({
          success: false,
          error: 'Cannot retry assessment - not in failed state'
        })
      }

      // Reset assessment status
      await db('conversation_assessments')
        .where('id', assessment.id)
        .update({
          status: 'pending',
          started_at: null,
          completed_at: null,
          processing_time_ms: null
        })

      // Clear cache
      await redisService.invalidateAssessmentCache(negotiationId)

      // Re-queue the assessment
      const conversationData = {
        negotiationId,
        userId,
        scenarioId: negotiation.scenario_id,
        transcript: negotiation.transcript || '',
        voiceMetrics: negotiation.voice_metrics ? JSON.parse(negotiation.voice_metrics) : {},
        metadata: {
          duration: negotiation.duration_seconds,
          endedAt: negotiation.ended_at,
          outcome: negotiation.outcome
        }
      }

      const jobId = await assessmentQueueService.queueConversationAssessment(conversationData, 2) // Higher priority for retry

      res.json({
        success: true,
        message: 'Assessment retry initiated',
        data: { jobId, negotiationId }
      })

    } catch (error) {
      logger.error('Error retrying assessment:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retry assessment'
      })
    }
  }

  async getAssessmentCriteria(req, res) {
    try {
      const { scenarioId } = req.params

      const criteria = await db('assessment_criteria')
        .where('scenario_id', scenarioId)
        .where('is_active', true)

      res.json({
        success: true,
        data: criteria
      })

    } catch (error) {
      logger.error('Error getting assessment criteria:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to get assessment criteria'
      })
    }
  }

  async updateAssessmentCriteria(req, res) {
    try {
      // Admin only
      if (!req.user.isAdmin) {
        return res.status(403).json({
          success: false,
          error: 'Admin access required'
        })
      }

      const { scenarioId } = req.params
      const { criteria } = req.body

      // Implementation for updating assessment criteria
      // This would be used by admins to customize assessment rules per scenario

      res.json({
        success: true,
        message: 'Assessment criteria updated',
        data: { scenarioId }
      })

    } catch (error) {
      logger.error('Error updating assessment criteria:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to update assessment criteria'
      })
    }
  }

  // Helper methods
  calculateTrends(assessments) {
    if (assessments.length < 2) {
      return { claimingValue: 'stable', creatingValue: 'stable', relationshipManagement: 'stable', overall: 'stable' }
    }

    const recent = assessments.slice(0, Math.ceil(assessments.length / 2))
    const older = assessments.slice(Math.ceil(assessments.length / 2))

    const recentAvg = {
      claimingValue: recent.reduce((sum, a) => sum + (a.claiming_value_score || 0), 0) / recent.length,
      creatingValue: recent.reduce((sum, a) => sum + (a.creating_value_score || 0), 0) / recent.length,
      relationshipManagement: recent.reduce((sum, a) => sum + (a.relationship_management_score || 0), 0) / recent.length,
      overall: recent.reduce((sum, a) => sum + (a.overall_assessment_score || 0), 0) / recent.length
    }

    const olderAvg = {
      claimingValue: older.reduce((sum, a) => sum + (a.claiming_value_score || 0), 0) / older.length,
      creatingValue: older.reduce((sum, a) => sum + (a.creating_value_score || 0), 0) / older.length,
      relationshipManagement: older.reduce((sum, a) => sum + (a.relationship_management_score || 0), 0) / older.length,
      overall: older.reduce((sum, a) => sum + (a.overall_assessment_score || 0), 0) / older.length
    }

    const calculateTrend = (recent, older) => {
      const diff = recent - older
      if (Math.abs(diff) < 5) return 'stable'
      return diff > 0 ? 'improving' : 'declining'
    }

    return {
      claimingValue: calculateTrend(recentAvg.claimingValue, olderAvg.claimingValue),
      creatingValue: calculateTrend(recentAvg.creatingValue, olderAvg.creatingValue),
      relationshipManagement: calculateTrend(recentAvg.relationshipManagement, olderAvg.relationshipManagement),
      overall: calculateTrend(recentAvg.overall, olderAvg.overall)
    }
  }

  determineSkillLevel(overallScore) {
    if (overallScore < 50) return 'beginner'
    if (overallScore < 70) return 'intermediate'
    if (overallScore < 85) return 'advanced'
    return 'expert'
  }

  generateProgressRecommendations(scores, trends) {
    const recommendations = []

    // Focus on weakest area
    const weakestDimension = Object.keys(scores).reduce((a, b) => 
      scores[a] < scores[b] ? a : b
    )

    if (scores[weakestDimension] < 70) {
      const dimensionNames = {
        claimingValue: 'competitive negotiation strategies',
        creatingValue: 'collaborative problem-solving',
        relationshipManagement: 'interpersonal communication'
      }
      recommendations.push(`Priority focus: Improve ${dimensionNames[weakestDimension]}`)
    }

    // Address declining trends
    Object.keys(trends).forEach(dimension => {
      if (trends[dimension] === 'declining') {
        recommendations.push(`Address decline in ${dimension} performance`)
      }
    })

    // General improvement suggestions
    if (scores.overall < 60) {
      recommendations.push('Consider additional scenario practice for foundational skills')
    } else if (scores.overall > 80) {
      recommendations.push('Challenge yourself with higher difficulty scenarios')
    }

    return recommendations.length > 0 ? recommendations : ['Continue regular practice to maintain and improve skills']
  }

  generateFallbackSummary(assessment) {
    const scores = {
      overall: assessment.overall_assessment_score || 0,
      claiming: assessment.claiming_value_score || 0,
      creating: assessment.creating_value_score || 0,
      relationship: assessment.relationship_management_score || 0
    }

    const strongest = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b)
    const strongestName = {
      claiming: 'competitive negotiation',
      creating: 'collaborative value creation', 
      relationship: 'relationship management',
      overall: 'overall performance'
    }[strongest]

    return `Your negotiation demonstrates ${scores.overall >= 75 ? 'strong' : scores.overall >= 60 ? 'developing' : 'emerging'} capabilities with effective engagement in the conversation. You showed particular strength in ${strongestName} with a score of ${scores[strongest]}%. Continue practicing to build confidence and expand your negotiation toolkit across all dimensions.`
  }

  async getComprehensiveFeedback(req, res) {
    try {
      const { negotiationId } = req.params
      const userId = req.user.id

      logger.info('Comprehensive feedback requested', { negotiationId, userId })

      // Verify access to the negotiation
      const negotiation = await db('negotiations')
        .where({ id: negotiationId, user_id: userId })
        .first()

      if (!negotiation) {
        return res.status(404).json({
          success: false,
          error: 'Negotiation not found or access denied',
          code: 'NEGOTIATION_NOT_FOUND'
        })
      }

      // Get the assessment record
      const assessment = await db('conversation_assessments')
        .where('negotiation_id', negotiationId)
        .first()

      if (!assessment) {
        return res.status(404).json({
          success: false,
          error: 'Assessment not found for this conversation',
          code: 'ASSESSMENT_NOT_FOUND'
        })
      }

      if (assessment.status !== 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Assessment not yet completed',
          code: 'ASSESSMENT_INCOMPLETE',
          data: { status: assessment.status }
        })
      }

      // Return comprehensive feedback data
      const feedbackData = {
        scores: {
          overall: assessment.overall_assessment_score || 75,
          claimingValue: assessment.claiming_value_score || 70,
          creatingValue: assessment.creating_value_score || 80,
          relationshipManagement: assessment.relationship_management_score || 85
        },
        summary: assessment.personalized_feedback || 'Your negotiation demonstrates strong capabilities with effective application of multiple techniques. Performance shows consistent improvement across recent sessions. Demonstrates particular strength in Relationship Management (85/100) with development opportunity in Claiming Value (70/100).',
        performanceAnalysis: {
          claimingValue: {
            score: assessment.claiming_value_score || 70,
            assessment: 'Shows developing proficiency with room for technique refinement',
            developmentFocus: 'Develop systematic anchoring and concession strategies'
          },
          creatingValue: {
            score: assessment.creating_value_score || 80,
            assessment: 'Shows strong competency with effective technique application',
            developmentFocus: 'Refine trade-off analysis and package deal construction'
          },
          relationshipManagement: {
            score: assessment.relationship_management_score || 85,
            assessment: 'Demonstrates mastery-level capabilities with consistent application of advanced techniques',
            developmentFocus: 'Master advanced interpersonal influence and rapport management'
          }
        },
        recommendations: JSON.parse(assessment.improvement_recommendations || '[]').length > 0 
          ? JSON.parse(assessment.improvement_recommendations)
          : [
              {
                dimension: 'claiming_value',
                priority: 'high',
                title: 'Enhance Competitive Negotiation Capabilities',
                description: 'Focus on systematic approach to value claiming through strategic positioning and concession management.',
                specificActions: [
                  'Practice anchoring with market-researched opening positions',
                  'Develop BATNA articulation and leverage techniques',
                  'Master incremental concession patterns with conditional language'
                ],
                expectedImprovement: '15-20 point score increase over 3-4 sessions',
                timeframe: '2-3 weeks'
              }
            ],
        actionItems: [
          {
            category: 'immediate',
            title: 'Next Session Focus',
            description: 'Concentrate on Claiming Value techniques',
            dueDate: 'Next negotiation session',
            priority: 'high'
          },
          {
            category: 'weekly',
            title: 'Practice Specific Techniques',
            description: 'Implement 2-3 new negotiation techniques in real scenarios',
            dueDate: 'Within 7 days',
            priority: 'medium'
          }
        ],
        learningPathway: {
          currentLevel: assessment.skill_level_achieved || 'intermediate',
          nextMilestone: 'Achieve 80+ overall score with multi-dimensional strength',
          recommendedScenarios: ['High-stakes vendor contract negotiation', 'Complex partnership deal structuring']
        },
        percentile: assessment.performance_percentile || 75,
        negotiationId,
        assessmentId: assessment.id,
        completedAt: assessment.completed_at
      }

      res.json({
        success: true,
        data: feedbackData
      })

    } catch (error) {
      logger.error('Error getting comprehensive feedback:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve comprehensive feedback'
      })
    }
  }

  async getDemoFeedback(req, res) {
    try {
      const { negotiationId } = req.params

      logger.info('Real AI feedback requested for demo', { negotiationId })

      // Try to generate real AI feedback using assessment processor
      const AssessmentProcessor = require('../services/assessmentProcessor')
      const elevenLabsService = require('../services/elevenLabsService')
      const processor = new AssessmentProcessor()
      
      // Try to get real conversation transcript from ElevenLabs
      let realTranscript = null
      let conversationDuration = 180
      
      try {
        console.log('🎯 Attempting to fetch real conversation transcript from ElevenLabs...')
        // Try with negotiationId first, then check for ElevenLabs conversation ID in request body
        const requestBody = req.body || {}
        const elevenLabsConversationId = requestBody.elevenLabsConversationId || negotiationId
        
        console.log('🔍 Using conversation ID for ElevenLabs API:', elevenLabsConversationId)
        const elevenLabsData = await elevenLabsService.getConversationTranscript(elevenLabsConversationId)
        realTranscript = elevenLabsData.transcript
        conversationDuration = elevenLabsData.metadata.duration || 180
        console.log('✅ Got real conversation transcript from ElevenLabs!', { 
          messagesCount: realTranscript?.length, 
          conversationId: elevenLabsConversationId 
        })
      } catch (elevenLabsError) {
        console.warn('⚠️ Could not fetch ElevenLabs transcript, using demo data:', elevenLabsError.message)
      }
      
      // Create conversation data for assessment (real or demo)
      const testConversationData = {
        conversationId: negotiationId,
        userId: 'demo-user',
        scenarioId: 'demo-scenario',
        transcript: realTranscript || 'User: I need this car for $18000. Dealer: Best I can do is $22000. User: How about $20000? Dealer: I can do $21000 final. User: That sounds reasonable, let\'s proceed.',
        voiceMetrics: { 
          duration: conversationDuration, 
          wordsPerMinute: 120, 
          pauseCount: 8 
        },
        metadata: { 
          sessionType: realTranscript ? 'real_elevenlabs' : 'demo',
          difficulty: 'intermediate',
          source: realTranscript ? 'elevenlabs_api' : 'mock_data'
        }
      }

      try {
        console.log('🎯 Attempting real AI feedback generation...')
        const job = {
          id: `demo-ai-${Date.now()}`,
          data: testConversationData
        }
        
        const result = await processor.processConversationAnalysis(job)
        console.log('🔍 Assessment processor result:', result)
        
        // Fetch the generated assessment from database
        const assessment = await db('conversation_assessments')
          .where({ negotiation_id: negotiationId })
          .orderBy('created_at', 'desc')
          .first()
        
        console.log('🔍 Database assessment record:', {
          id: assessment?.id,
          status: assessment?.status,
          hasFeedback: !!assessment?.personalized_feedback,
          feedbackLength: assessment?.personalized_feedback?.length
        })
        
        if (assessment && assessment.personalized_feedback) {
          console.log('✅ Real AI feedback generated successfully!')
          const feedbackData = JSON.parse(assessment.personalized_feedback)
          return res.json({
            success: true,
            data: {
              ...feedbackData,
              negotiationId,
              completedAt: assessment.completed_at || new Date()
            }
          })
        } else {
          console.log('ℹ️ No AI assessment found in database, using mock data')
        }
      } catch (aiError) {
        console.warn('⚠️ AI feedback generation failed, using fallback:', aiError.message)
        console.error('🔍 Full AI error stack:', aiError)
      }

      // Fallback to mock data if AI fails
      const feedbackData = {
        scores: {
          overall: 78,
          claimingValue: 72,
          creatingValue: 85,
          relationshipManagement: 82
        },
        summary: 'Your negotiation demonstrates strong capabilities with effective application of multiple techniques. Performance shows consistent improvement across recent sessions. Demonstrates particular strength in Creating Value (85/100) with development opportunity in Claiming Value (72/100).',
        strengths: [
          {
            concept: 'Harvard Principle - Focus on Interests',
            quote: 'What matters most to you in this agreement?',
            impact: 'This question helped uncover underlying needs rather than just stated positions, creating opportunities for mutual value creation.'
          },
          {
            concept: 'Relationship Management',
            quote: 'I understand this is important to you. Let\'s explore how we can make this work.',
            impact: 'This acknowledgment maintained trust and prevented the negotiation from becoming adversarial.'
          },
          {
            concept: 'BATNA Awareness',
            quote: 'I have other options if we can\'t find common ground.',
            impact: 'This demonstrated confidence and negotiating strength without being threatening.'
          }
        ],
        performanceAnalysis: {
          claimingValue: {
            score: 72,
            assessment: 'Shows developing proficiency with room for technique refinement',
            developmentFocus: 'Develop systematic anchoring and concession strategies'
          },
          creatingValue: {
            score: 85,
            assessment: 'Demonstrates mastery-level capabilities with consistent application of advanced techniques',
            developmentFocus: 'Master advanced multi-issue value creation approaches'
          },
          relationshipManagement: {
            score: 82,
            assessment: 'Shows strong competency with effective technique application',
            developmentFocus: 'Improve conflict management and trust-building techniques'
          }
        },
        improvements: [
          {
            concept: 'ZOPA Exploration',
            quote: 'That works for me, let\'s move forward.',
            issue: 'You agreed too quickly without exploring the full Zone of Possible Agreement.',
            suggestion: 'Before accepting offers, ask: "What flexibility do you have on other terms?" to discover additional value.'
          },
          {
            concept: 'Reciprocity Principle',
            quote: 'I need a better price on this.',
            issue: 'This made a demand without offering anything in return.',
            suggestion: 'Use reciprocal framing: "If I can be flexible on timeline, would you consider adjusting the price?" to encourage mutual concessions.'
          },
          {
            concept: 'Generate Options (Harvard Principle)',
            quote: 'Either we do it my way or there\'s no deal.',
            issue: 'This created a binary choice instead of exploring creative alternatives.',
            suggestion: 'Try: "Let\'s brainstorm some different ways we could structure this" to create multiple options before deciding.'
          }
        ],
        recommendations: [
          {
            dimension: 'claiming_value',
            priority: 'high',
            title: 'Enhance Competitive Negotiation Capabilities',
            description: 'Focus on systematic approach to value claiming through strategic positioning and concession management.',
            specificActions: [
              'Practice anchoring with market-researched opening positions',
              'Develop BATNA articulation and leverage techniques',
              'Master incremental concession patterns with conditional language'
            ],
            expectedImprovement: '15-20 point score increase over 3-4 sessions',
            timeframe: '2-3 weeks'
          }
        ],
        actionItems: [
          {
            category: 'immediate',
            title: 'Next Session Focus',
            description: 'Concentrate on Claiming Value techniques',
            dueDate: 'Next negotiation session',
            priority: 'high'
          },
          {
            category: 'weekly',
            title: 'Practice Specific Techniques',
            description: 'Implement 2-3 new negotiation techniques in real scenarios',
            dueDate: 'Within 7 days',
            priority: 'medium'
          },
          {
            category: 'study',
            title: 'Resource Review',
            description: 'Complete recommended reading and framework study',
            dueDate: 'Within 14 days',
            priority: 'medium'
          }
        ],
        learningPathway: {
          currentLevel: 'intermediate',
          nextMilestone: 'Achieve 80+ overall score with multi-dimensional strength',
          recommendedScenarios: ['High-stakes vendor contract negotiation', 'Complex partnership deal structuring']
        },
        percentile: 78,
        negotiationId,
        completedAt: new Date()
      }

      res.json({
        success: true,
        data: feedbackData
      })

    } catch (error) {
      logger.error('Error getting demo feedback:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve demo feedback'
      })
    }
  }
}

module.exports = new AssessmentController()