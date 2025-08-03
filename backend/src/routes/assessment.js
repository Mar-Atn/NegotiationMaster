const express = require('express')
const router = express.Router()
const assessmentController = require('../controllers/assessmentController')
const { authenticateToken } = require('../middleware/auth')

// Demo endpoints for testing (no auth required)
router.get('/demo/feedback/:negotiationId', assessmentController.getDemoFeedback)
router.post('/demo/analyze/:negotiationId', assessmentController.getDemoFeedback)
router.get('/demo/results/:negotiationId', assessmentController.getDemoFeedback)
router.post('/demo/generate', assessmentController.generateAssessment)

// Demo routes that bypass authentication for Sprint 1 testing
router.post('/:negotiationId/analyze', (req, res, next) => {
  console.log('🎯 Assessment analyze request:', { negotiationId: req.params.negotiationId })
  // For demo purposes, return success immediately and simulate processing
  res.json({
    success: true,
    message: 'Assessment analysis started (demo mode)',
    data: {
      jobId: 'demo-job-' + Date.now(),
      estimatedCompletionTime: '30-60 seconds',
      negotiationId: req.params.negotiationId
    }
  })
})

router.get('/:negotiationId/results', assessmentController.getDemoFeedback)

// NEW: Generate comprehensive professional assessment (main endpoint) - temporarily disable auth for testing
router.post('/generate', assessmentController.generateAssessment)

// All other assessment routes require authentication
router.use(authenticateToken)

// Trigger assessment analysis for a completed conversation
router.post('/analyze/:negotiationId', assessmentController.analyzeConversation)

// Get assessment results for a specific conversation
router.get('/results/:negotiationId', assessmentController.getResults)

// Get comprehensive feedback for a conversation
router.get('/feedback/:negotiationId', assessmentController.getComprehensiveFeedback)

// Get assessment status (processing, completed, failed)
router.get('/status/:negotiationId', assessmentController.getStatus)

// Get user's assessment history
router.get('/history/:userId', assessmentController.getUserHistory)

// Get user's progress summary across all assessments
router.get('/progress/:userId', assessmentController.getUserProgress)

// Get assessment milestones for a user
router.get('/milestones/:userId', assessmentController.getUserMilestones)

// Get queue status (admin/debugging)
router.get('/queue/status', assessmentController.getQueueStatus)

// Retry failed assessment
router.post('/retry/:negotiationId', assessmentController.retryAssessment)

// Get assessment criteria for a scenario
router.get('/criteria/:scenarioId', assessmentController.getAssessmentCriteria)

// Admin routes for assessment management
router.post('/criteria/:scenarioId', assessmentController.updateAssessmentCriteria)

module.exports = router