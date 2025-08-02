const express = require('express')
const voiceService = require('../services/voiceService')
const db = require('../config/database')
const logger = require('../config/logger')

const router = express.Router()

/**
 * Create a case-specific ElevenLabs agent session
 * POST /api/voice/create-agent-session
 */
router.post('/create-agent-session', async (req, res) => {
  try {
    const { characterName, scenarioId, scenarioContext } = req.body

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

    // Create a case-specific agent using ElevenLabs API
    const agentConfig = {
      name: `${characterName} - Case Specific`,
      prompt: caseSpecificPrompt,
      voice_id: getVoiceIdForCharacter(characterName),
      language: 'en'
    }

    // For now, we'll use the existing agent but with override instructions
    // In production, you might want to create truly dynamic agents
    const agentSessionData = {
      agentId: 'agent_7601k1g0796kfj2bzkcds0bkmw2m', // Your base agent
      characterName,
      prompt: caseSpecificPrompt,
      scenario: scenario || scenarioContext,
      voiceId: getVoiceIdForCharacter(characterName)
    }

    logger.info(`✅ Created case-specific agent session for ${characterName}`)

    res.json({
      success: true,
      data: agentSessionData
    })

  } catch (error) {
    logger.error('Error creating agent session:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create agent session',
      details: error.message
    })
  }
})

/**
 * Get voice ID for character
 */
function getVoiceIdForCharacter(characterName) {
  const voiceMapping = {
    'Sarah Chen': '9BWtsMINqrJLrRacOk9x',
    'Marcus Thompson': 'EXAVITQu4vr4xnSDxMaL', 
    'Tony Rodriguez': 'FGY2WhTYpPnrIDTdsKH5',
    'Dr. Amanda Foster': 'IKne3meq5aSn9XLyUdCD'
  }
  
  return voiceMapping[characterName] || '9BWtsMINqrJLrRacOk9x'
}

module.exports = router