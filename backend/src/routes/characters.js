const express = require('express')
const router = express.Router()
const charactersController = require('../controllers/charactersController')
const { authenticateToken } = require('../middleware/auth')

// Get all AI characters
router.get('/', charactersController.getAllCharacters)

// Get specific AI character by ID
router.get('/:id', charactersController.getCharacterById)

// Get characters by role (buyer, seller, etc.)
router.get('/role/:role', charactersController.getCharactersByRole)

// Test character interaction (requires authentication)
router.post('/test', authenticateToken, charactersController.testCharacterInteraction)

module.exports = router
