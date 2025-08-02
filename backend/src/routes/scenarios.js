const express = require('express')
const router = express.Router()
const scenariosController = require('../controllers/scenariosController')
const { authenticateToken } = require('../middleware/auth')

// Get all scenarios
router.get('/', scenariosController.getAllScenarios)

// Get scenarios by difficulty level
router.get('/difficulty/:level', scenariosController.getScenariosByDifficulty)

// Get specific scenario by ID (user access - excludes role2_instructions)
router.get('/:id', scenariosController.getScenarioById)

// Get scenario data for AI character access (excludes role1_instructions)
router.get('/:id/ai-access', scenariosController.getScenarioForAI)

// Admin: Get complete scenario data including all 3 parts (requires admin auth)
router.get('/:id/complete', authenticateToken, scenariosController.getScenarioComplete)

// Admin: Update scenario with 3-part structure (requires admin auth)
router.put('/:id', authenticateToken, scenariosController.updateScenario)

// Start a new negotiation session (requires authentication)
router.post('/:id/start', authenticateToken, scenariosController.startScenario)

module.exports = router
