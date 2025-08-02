const express = require('express')
const router = express.Router()
const negotiationsController = require('../controllers/negotiationsController')
const { authenticateToken } = require('../middleware/auth')

// All negotiation routes require authentication
router.use(authenticateToken)

// Get all negotiations for the authenticated user
router.get('/', negotiationsController.getUserNegotiations)

// Get specific negotiation details
router.get('/:id', negotiationsController.getNegotiationById)

// Update negotiation state (status, deal terms, etc.)
router.put('/:id/state', negotiationsController.updateNegotiationState)

// Send a message in the negotiation
router.post('/:id/messages', negotiationsController.sendMessage)

// Complete a negotiation
router.put('/:id/complete', negotiationsController.completeNegotiation)

module.exports = router
