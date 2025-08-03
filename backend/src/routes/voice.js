const express = require('express')
const router = express.Router()
const voiceController = require('../controllers/voiceController')
const { authenticateToken } = require('../middleware/auth')
const { body, param } = require('express-validator')
const { handleValidationErrors } = require('../middleware/validation')
const { voiceErrorHandler } = require('../middleware/voiceErrorHandler')

// Public routes (no authentication required)
const publicRoutes = ['/create-agent-session']

// Apply authentication to authenticated routes only
router.use((req, res, next) => {
  if (publicRoutes.includes(req.path) || req.path.startsWith('/transcript/')) {
    return next()
  }
  return authenticateToken(req, res, next)
})

/**
 * @route POST /api/voice/generate
 * @desc Generate speech audio for a character message
 * @access Private
 */
router.post('/generate',
  [
    body('characterId').isUUID().withMessage('Valid character ID is required'),
    body('text').isLength({ min: 1, max: 2000 }).withMessage('Text must be between 1 and 2000 characters'),
    body('options').optional().isObject().withMessage('Options must be an object'),
    body('options.modelId').optional().isString().withMessage('Model ID must be a string'),
    body('options.outputFormat').optional().isString().withMessage('Output format must be a string')
  ],
  handleValidationErrors,
  voiceController.generateCharacterSpeech
)

/**
 * @route POST /api/voice/stream
 * @desc Stream real-time speech for character
 * @access Private
 */
router.post('/stream',
  [
    body('characterId').isUUID().withMessage('Valid character ID is required'),
    body('text').isLength({ min: 1, max: 2000 }).withMessage('Text must be between 1 and 2000 characters'),
    body('options').optional().isObject().withMessage('Options must be an object')
  ],
  handleValidationErrors,
  voiceController.streamCharacterSpeech
)

/**
 * @route GET /api/voice/metrics
 * @desc Get voice service metrics and performance data
 * @access Private
 */
router.get('/metrics', voiceController.getVoiceMetrics)

/**
 * @route POST /api/voice/test
 * @desc Test voice generation for a specific character
 * @access Private
 */
router.post('/test',
  [
    body('characterId').isUUID().withMessage('Valid character ID is required'),
    body('testText').optional().isLength({ min: 1, max: 500 }).withMessage('Test text must be between 1 and 500 characters')
  ],
  handleValidationErrors,
  voiceController.testCharacterVoice
)

/**
 * @route GET /api/voice/voices
 * @desc Get available ElevenLabs voices
 * @access Private
 */
router.get('/voices', voiceController.getAvailableVoices)

/**
 * @route GET /api/voice/character-configs
 * @desc Get character voice mappings and configurations
 * @access Private
 */
router.get('/character-configs', voiceController.getCharacterVoiceConfigs)

/**
 * @route POST /api/voice/negotiations/:negotiationId/messages/:messageId
 * @desc Generate speech for negotiation message with context
 * @access Private
 */
router.post('/negotiations/:negotiationId/messages/:messageId',
  [
    param('negotiationId').isUUID().withMessage('Valid negotiation ID is required'),
    param('messageId').isUUID().withMessage('Valid message ID is required'),
    body('options').optional().isObject().withMessage('Options must be an object')
  ],
  handleValidationErrors,
  voiceController.generateNegotiationSpeech
)

/**
 * @route POST /api/voice/batch
 * @desc Batch generate speech for multiple messages
 * @access Private
 */
router.post('/batch',
  [
    body('messages').isArray({ min: 1, max: 10 }).withMessage('Messages must be an array with 1-10 items'),
    body('messages.*.characterId').isUUID().withMessage('Each message must have a valid character ID'),
    body('messages.*.text').isLength({ min: 1, max: 2000 }).withMessage('Each message text must be between 1 and 2000 characters'),
    body('messages.*.index').optional().isInt().withMessage('Message index must be an integer'),
    body('options').optional().isObject().withMessage('Options must be an object')
  ],
  handleValidationErrors,
  voiceController.batchGenerateSpeech
)

/**
 * @route POST /api/voice/conversational/initialize
 * @desc Initialize conversational AI session
 * @access Private
 */
router.post('/conversational/initialize',
  [
    body('negotiationId').isUUID().withMessage('Valid negotiation ID is required'),
    body('characterId').isUUID().withMessage('Valid character ID is required'),
    body('options').optional().isObject().withMessage('Options must be an object'),
    body('options.firstMessage').optional().isString().withMessage('First message must be a string'),
    body('options.scenarioContext').optional().isString().withMessage('Scenario context must be a string')
  ],
  handleValidationErrors,
  voiceController.initializeConversationalSession
)

/**
 * @route DELETE /api/voice/conversational/:sessionId
 * @desc End conversational AI session
 * @access Private
 */
router.delete('/conversational/:sessionId',
  [
    param('sessionId').isString().withMessage('Valid session ID is required')
  ],
  handleValidationErrors,
  voiceController.endConversationalSession
)

/**
 * @route GET /api/voice/conversational/sessions
 * @desc Get active conversational sessions
 * @access Private
 */
router.get('/conversational/sessions', voiceController.getActiveConversationalSessions)

/**
 * @route GET /api/voice/conversational/metrics
 * @desc Get conversational AI metrics
 * @access Private
 */
router.get('/conversational/metrics', voiceController.getConversationalMetrics)

/**
 * @route POST /api/voice/speech-recognition/initialize
 * @desc Initialize speech recognition session
 * @access Private
 */
router.post('/speech-recognition/initialize',
  [
    body('sessionId').isString().withMessage('Valid session ID is required'),
    body('options').optional().isObject().withMessage('Options must be an object'),
    body('options.language').optional().isString().withMessage('Language must be a string'),
    body('options.sttConfig').optional().isObject().withMessage('STT config must be an object')
  ],
  handleValidationErrors,
  voiceController.initializeSpeechRecognition
)

/**
 * @route POST /api/voice/speech-recognition/:sessionId/process
 * @desc Process audio chunk for speech recognition
 * @access Private
 */
router.post('/speech-recognition/:sessionId/process',
  [
    param('sessionId').isString().withMessage('Valid session ID is required'),
    body('audioData').isString().withMessage('Audio data (base64) is required'),
    body('options').optional().isObject().withMessage('Options must be an object')
  ],
  handleValidationErrors,
  voiceController.processAudioChunk
)

/**
 * @route GET /api/voice/conversational/:sessionId/history
 * @desc Get conversation history for a session
 * @access Private
 */
router.get('/conversational/:sessionId/history',
  [
    param('sessionId').isString().withMessage('Valid session ID is required')
  ],
  handleValidationErrors,
  voiceController.getConversationHistory
)

/**
 * @route GET /api/voice/transcript/:conversationId
 * @desc Get transcript from ElevenLabs conversation
 * @access Private
 */
router.get('/transcript/:conversationId',
  [
    param('conversationId').isString().withMessage('Valid conversation ID is required')
  ],
  handleValidationErrors,
  voiceController.getConversationTranscript
)

/**
 * @route POST /api/voice/create-agent-session
 * @desc Create case-specific agent session for conversation
 * @access Public (for now, since it's for demo)
 */
router.post('/create-agent-session', async (req, res) => {
  try {
    const { characterName, scenarioId, scenarioContext } = req.body
    const voiceService = require('../services/voiceService')
    const db = require('../config/database')
    const logger = require('../config/logger')

    if (!characterName) {
      return res.status(400).json({
        success: false,
        error: 'Character name is required'
      })
    }

    logger.info(`Creating case-specific agent session for ${characterName}`)

    // Get character data
    const character = await db('ai_characters').where('name', characterName).first()
    if (!character) {
      return res.status(404).json({
        success: false,
        error: `Character ${characterName} not found`
      })
    }

    // Get scenario data if provided
    let scenario = null
    if (scenarioId) {
      scenario = await db('scenarios').where('id', scenarioId).first()
    }

    // Build comprehensive prompt with case-specific instructions
    const caseSpecificPrompt = await voiceService.buildCharacterPrompt(
      characterName, 
      character.personality_profile ? JSON.parse(character.personality_profile) : {},
      scenario || scenarioContext
    )

    // Voice ID mapping
    const voiceMapping = {
      'Sarah Chen': '9BWtsMINqrJLrRacOk9x',
      'Marcus Thompson': 'EXAVITQu4vr4xnSDxMaL', 
      'Tony Rodriguez': 'FGY2WhTYpPnrIDTdsKH5',
      'Dr. Amanda Foster': 'IKne3meq5aSn9XLyUdCD'
    }

    const agentSessionData = {
      agentId: 'agent_7601k1g0796kfj2bzkcds0bkmw2m', // Your base agent
      characterName,
      prompt: caseSpecificPrompt,
      scenario: scenario || scenarioContext,
      voiceId: voiceMapping[characterName] || '9BWtsMINqrJLrRacOk9x'
    }

    logger.info(`✅ Created case-specific agent session for ${characterName}`)
    logger.info(`Prompt length: ${caseSpecificPrompt.length} characters`)

    res.json({
      success: true,
      data: agentSessionData
    })

  } catch (error) {
    const logger = require('../config/logger')
    logger.error('Error creating agent session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create agent session',
      details: error.message
    })
  }
})

// Apply voice-specific error handler
router.use(voiceErrorHandler)

module.exports = router