const db = require('../config/database')
const logger = require('../config/logger')

class CharactersController {
  async getAllCharacters (req, res, next) {
    try {
      const characters = await db('ai_characters')
        .where('is_active', true)
        .select([
          'id',
          'name',
          'description',
          'role',
          'personality_profile',
          'behavior_parameters',
          'interests_template',
          'batna_range_min',
          'batna_range_max',
          'communication_style',
          'negotiation_tactics',
          'created_at'
        ])

      // Parse JSON strings back to objects for the response
      const charactersWithParsedData = characters.map(character => ({
        ...character,
        personality_profile: JSON.parse(character.personality_profile),
        behavior_parameters: JSON.parse(character.behavior_parameters),
        interests_template: JSON.parse(character.interests_template),
        negotiation_tactics: JSON.parse(character.negotiation_tactics)
      }))

      res.json({
        success: true,
        data: charactersWithParsedData
      })
    } catch (error) {
      next(error)
    }
  }

  async getCharacterById (req, res, next) {
    try {
      const { id } = req.params

      const character = await db('ai_characters')
        .where({ id, is_active: true })
        .first()

      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'AI character not found',
          code: 'CHARACTER_NOT_FOUND'
        })
      }

      // Parse JSON strings back to objects
      const characterWithParsedData = {
        ...character,
        personality_profile: JSON.parse(character.personality_profile),
        behavior_parameters: JSON.parse(character.behavior_parameters),
        interests_template: JSON.parse(character.interests_template),
        negotiation_tactics: JSON.parse(character.negotiation_tactics)
      }

      res.json({
        success: true,
        data: characterWithParsedData
      })
    } catch (error) {
      next(error)
    }
  }

  async testCharacterInteraction (req, res, next) {
    try {
      const { characterId, message } = req.body

      if (!characterId || !message) {
        return res.status(400).json({
          success: false,
          error: 'Character ID and message are required',
          code: 'MISSING_PARAMETERS'
        })
      }

      const character = await db('ai_characters')
        .where({ id: characterId, is_active: true })
        .first()

      if (!character) {
        return res.status(404).json({
          success: false,
          error: 'AI character not found',
          code: 'CHARACTER_NOT_FOUND'
        })
      }

      // Parse character data
      const behaviorParams = JSON.parse(character.behavior_parameters)
      const personalityProfile = JSON.parse(character.personality_profile)
      const negotiationTactics = JSON.parse(character.negotiation_tactics)

      // Generate a test response based on character personality
      // For now, this is a simple mock response - we'll enhance with AI later
      const testResponse = this.generateTestResponse(character, message, {
        behaviorParams,
        personalityProfile,
        negotiationTactics
      })

      logger.info('Test character interaction', {
        characterId,
        userId: req.user?.userId,
        messageLength: message.length
      })

      res.json({
        success: true,
        data: {
          character: {
            id: character.id,
            name: character.name,
            role: character.role
          },
          user_message: message,
          ai_response: testResponse,
          response_metadata: {
            response_type: 'test',
            personality_influence: personalityProfile.negotiation_style,
            confidence_score: 0.85
          }
        }
      })
    } catch (error) {
      next(error)
    }
  }

  generateTestResponse (character, userMessage, characterData) {
    const { behaviorParams, personalityProfile, negotiationTactics } = characterData

    // Simple rule-based response generation for testing
    // This will be replaced with AI integration later

    const isHighAggressiveness = behaviorParams.aggressiveness > 0.6
    const isCollaborative = personalityProfile.negotiation_style === 'collaborative'
    const isCompetitive = personalityProfile.negotiation_style.includes('competitive')

    let responseStyle = ''
    let responseContent = ''

    if (isHighAggressiveness && isCompetitive) {
      responseStyle = 'aggressive'
      responseContent = `Look, ${userMessage.toLowerCase().includes('price') ? 'this price is firm - I\'ve got other buyers interested' : 'I don\'t have time for games'}. ${negotiationTactics.signature_moves[0] || 'Take it or leave it'}.`
    } else if (isCollaborative) {
      responseStyle = 'collaborative'
      responseContent = `I appreciate you bringing that up. ${userMessage.toLowerCase().includes('price') ? 'Let me see what we can work out together' : 'I\'d like to understand your perspective better'}. What\'s most important to you in this situation?`
    } else {
      responseStyle = 'professional'
      responseContent = `I understand your position. ${userMessage.toLowerCase().includes('price') ? 'The pricing reflects the current market conditions' : 'Let me address your concerns'}. How can we find a solution that works for both of us?`
    }

    return `${responseContent} [${character.name} - ${responseStyle} response based on ${personalityProfile.negotiation_style} style]`
  }

  async getCharactersByRole (req, res, next) {
    try {
      const { role } = req.params

      const characters = await db('ai_characters')
        .where({ role, is_active: true })
        .select([
          'id',
          'name',
          'description',
          'personality_profile',
          'behavior_parameters',
          'communication_style',
          'created_at'
        ])

      const charactersWithParsedData = characters.map(character => ({
        ...character,
        personality_profile: JSON.parse(character.personality_profile),
        behavior_parameters: JSON.parse(character.behavior_parameters)
      }))

      res.json({
        success: true,
        data: charactersWithParsedData
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new CharactersController()
