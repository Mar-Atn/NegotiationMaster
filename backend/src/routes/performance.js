const express = require('express')
const router = express.Router()
const performanceAnalyticsService = require('../services/performanceAnalyticsService')
const { authenticateToken: auth } = require('../middleware/auth')
const logger = require('../config/logger')
const db = require('../config/database')

/**
 * POST /api/performance/negotiations/:id/analyze
 * Analyze negotiation performance and generate feedback
 */
router.post('/negotiations/:id/analyze', auth, async (req, res) => {
  try {
    const { id: negotiationId } = req.params
    const { transcript } = req.body
    const userId = req.user.id

    // Get negotiation details
    const negotiation = await db('negotiations')
      .where('id', negotiationId)
      .where('user_id', userId)
      .first()

    if (!negotiation) {
      return res.status(404).json({ 
        error: 'Negotiation not found or access denied' 
      })
    }

    // Analyze performance
    const performanceAnalysis = await performanceAnalyticsService.analyzeNegotiationPerformance(
      negotiationId,
      transcript,
      negotiation.scenario_id,
      userId
    )

    logger.info(`Performance analysis completed for negotiation ${negotiationId}`)

    res.json({
      message: 'Performance analysis completed',
      data: performanceAnalysis
    })

  } catch (error) {
    logger.error('Failed to analyze negotiation performance:', error)
    res.status(500).json({ 
      error: 'Failed to analyze performance',
      details: error.message
    })
  }
})

/**
 * GET /api/performance/negotiations/:id
 * Get performance analysis for a negotiation
 */
router.get('/negotiations/:id', auth, async (req, res) => {
  try {
    const { id: negotiationId } = req.params
    const userId = req.user.id

    // Get performance data
    const performance = await db('negotiation_performance')
      .where('negotiation_id', negotiationId)
      .where('user_id', userId)
      .first()

    if (!performance) {
      return res.status(404).json({ 
        error: 'Performance analysis not found' 
      })
    }

    // Get associated milestones
    const milestones = await db('performance_milestones')
      .where('negotiation_performance_id', performance.id)
      .orderBy('timestamp_seconds', 'asc')

    // Parse JSON fields
    const responseData = {
      ...performance,
      conversation_analysis: performance.conversation_analysis ? 
        JSON.parse(performance.conversation_analysis) : null,
      negotiation_moves: performance.negotiation_moves ? 
        JSON.parse(performance.negotiation_moves) : [],
      improvement_suggestions: performance.improvement_suggestions ? 
        JSON.parse(performance.improvement_suggestions) : [],
      milestones
    }

    res.json({ data: responseData })

  } catch (error) {
    logger.error('Failed to get performance data:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve performance data',
      details: error.message
    })
  }
})

/**
 * GET /api/performance/users/analytics
 * Get user's overall performance analytics and trends
 */
router.get('/users/analytics', auth, async (req, res) => {
  try {
    const userId = req.user.id

    const analytics = await performanceAnalyticsService.getUserPerformanceAnalytics(userId)

    res.json({ data: analytics })

  } catch (error) {
    logger.error('Failed to get user performance analytics:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve performance analytics',
      details: error.message
    })
  }
})

/**
 * GET /api/performance/scenarios/:id/criteria
 * Get evaluation criteria for a specific scenario
 */
router.get('/scenarios/:id/criteria', auth, async (req, res) => {
  try {
    const { id: scenarioId } = req.params

    // Get scenario details
    const scenario = await db('scenarios').where('id', scenarioId).first()

    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' })
    }

    // Parse evaluation criteria from scenario
    const evaluationCriteria = scenario.evaluation_criteria ? 
      JSON.parse(scenario.evaluation_criteria) : null

    const successCriteria = scenario.success_criteria ?
      JSON.parse(scenario.success_criteria) : null

    res.json({
      data: {
        scenario_id: scenarioId,
        title: scenario.title,
        evaluation_criteria: evaluationCriteria,
        success_criteria: successCriteria,
        difficulty_level: scenario.difficulty_level
      }
    })

  } catch (error) {
    logger.error('Failed to get scenario performance criteria:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve performance criteria',
      details: error.message
    })
  }
})

/**
 * POST /api/performance/milestone
 * Record a performance milestone during active negotiation
 */
router.post('/milestone', auth, async (req, res) => {
  try {
    const { 
      negotiation_id,
      milestone_type,
      description,
      timestamp_seconds,
      impact_score,
      context
    } = req.body
    const userId = req.user.id

    // Verify negotiation ownership
    const negotiation = await db('negotiations')
      .where('id', negotiation_id)
      .where('user_id', userId)
      .first()

    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' })
    }

    // Find or create performance record
    let performance = await db('negotiation_performance')
      .where('negotiation_id', negotiation_id)
      .first()

    if (!performance) {
      // Create preliminary performance record
      const performanceId = require('crypto').randomUUID()
      await db('negotiation_performance').insert({
        id: performanceId,
        negotiation_id,
        user_id: userId,
        scenario_id: negotiation.scenario_id
      })
      performance = { id: performanceId }
    }

    // Record milestone
    const milestoneId = require('crypto').randomUUID()
    await db('performance_milestones').insert({
      id: milestoneId,
      negotiation_performance_id: performance.id,
      milestone_type,
      description,
      timestamp_seconds,
      impact_score: impact_score || 0,
      context: context ? JSON.stringify(context) : null
    })

    logger.info(`Performance milestone recorded for negotiation ${negotiation_id}`)

    res.json({
      message: 'Milestone recorded successfully',
      data: { milestone_id: milestoneId }
    })

  } catch (error) {
    logger.error('Failed to record performance milestone:', error)
    res.status(500).json({ 
      error: 'Failed to record milestone',
      details: error.message
    })
  }
})

/**
 * GET /api/performance/leaderboard
 * Get performance leaderboard for gamification
 */
router.get('/leaderboard', auth, async (req, res) => {
  try {
    const { timeframe = '30', scenario_id } = req.query

    let query = db('user_performance_progress')
      .join('users', 'user_performance_progress.user_id', 'users.id')
      .select(
        'users.id',
        'users.first_name',
        'users.last_name',
        'user_performance_progress.average_performance',
        'user_performance_progress.total_negotiations',
        'user_performance_progress.current_level'
      )
      .where('user_performance_progress.total_negotiations', '>', 0)
      .orderBy('user_performance_progress.average_performance', 'desc')
      .limit(20)

    // Add timeframe filter if specified
    if (timeframe !== 'all') {
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(timeframe))
      query = query.where('user_performance_progress.last_session_date', '>=', 
        daysAgo.toISOString().split('T')[0])
    }

    const leaderboard = await query

    res.json({ data: leaderboard })

  } catch (error) {
    logger.error('Failed to get performance leaderboard:', error)
    res.status(500).json({ 
      error: 'Failed to retrieve leaderboard',
      details: error.message
    })
  }
})

module.exports = router