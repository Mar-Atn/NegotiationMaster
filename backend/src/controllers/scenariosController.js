const db = require('../config/database')
const logger = require('../config/logger')

class ScenariosController {
  async getAllScenarios (req, res, next) {
    try {
      const scenarios = await db('scenarios')
        .where('is_active', true)
        .select([
          'id',
          'title',
          'description',
          'difficulty_level',
          'ai_character_config',
          'scenario_context',
          'evaluation_criteria',
          'role1_instructions',
          'teaching_notes'
          // Note: role2_instructions excluded - only for AI character access
        ])
        .orderBy('difficulty_level', 'asc')

      // Parse JSON strings back to objects
      const scenariosWithParsedData = scenarios.map(scenario => ({
        ...scenario,
        ai_character_config: typeof scenario.ai_character_config === 'string'
          ? JSON.parse(scenario.ai_character_config)
          : scenario.ai_character_config,
        scenario_context: typeof scenario.scenario_context === 'string'
          ? JSON.parse(scenario.scenario_context)
          : scenario.scenario_context,
        evaluation_criteria: typeof scenario.evaluation_criteria === 'string'
          ? JSON.parse(scenario.evaluation_criteria)
          : scenario.evaluation_criteria,
        teaching_notes: typeof scenario.teaching_notes === 'string' && scenario.teaching_notes
          ? JSON.parse(scenario.teaching_notes)
          : scenario.teaching_notes
      }))

      res.json({
        success: true,
        data: scenariosWithParsedData
      })
    } catch (error) {
      next(error)
    }
  }

  async getScenarioById (req, res, next) {
    try {
      const { id } = req.params

      const scenario = await db('scenarios')
        .where({ id, is_active: true })
        .select([
          'id',
          'title',
          'description',
          'difficulty_level',
          'ai_character_config',
          'scenario_context',
          'evaluation_criteria',
          'role1_instructions',
          'teaching_notes'
          // Note: role2_instructions excluded for user access
        ])
        .first()

      if (!scenario) {
        return res.status(404).json({
          success: false,
          error: 'Scenario not found',
          code: 'SCENARIO_NOT_FOUND'
        })
      }

      // Parse JSON strings back to objects
      const scenarioWithParsedData = {
        ...scenario,
        ai_character_config: typeof scenario.ai_character_config === 'string'
          ? JSON.parse(scenario.ai_character_config)
          : scenario.ai_character_config,
        scenario_context: typeof scenario.scenario_context === 'string'
          ? JSON.parse(scenario.scenario_context)
          : scenario.scenario_context,
        evaluation_criteria: typeof scenario.evaluation_criteria === 'string'
          ? JSON.parse(scenario.evaluation_criteria)
          : scenario.evaluation_criteria,
        teaching_notes: typeof scenario.teaching_notes === 'string' && scenario.teaching_notes
          ? JSON.parse(scenario.teaching_notes)
          : scenario.teaching_notes
      }

      res.json({
        success: true,
        data: scenarioWithParsedData
      })
    } catch (error) {
      next(error)
    }
  }

  async getScenariosByDifficulty (req, res, next) {
    try {
      const { level } = req.params
      const difficultyLevel = parseInt(level)

      if (isNaN(difficultyLevel) || difficultyLevel < 1 || difficultyLevel > 7) {
        return res.status(400).json({
          success: false,
          error: 'Difficulty level must be between 1 and 7',
          code: 'INVALID_DIFFICULTY'
        })
      }

      const scenarios = await db('scenarios')
        .where({
          difficulty_level: difficultyLevel,
          is_active: true
        })
        .select([
          'id',
          'title',
          'description',
          'difficulty_level',
          'ai_character_config'
        ])

      const scenariosWithParsedData = scenarios.map(scenario => ({
        ...scenario,
        ai_character_config: typeof scenario.ai_character_config === 'string'
          ? JSON.parse(scenario.ai_character_config)
          : scenario.ai_character_config
      }))

      res.json({
        success: true,
        data: scenariosWithParsedData
      })
    } catch (error) {
      next(error)
    }
  }

  async startScenario (req, res, next) {
    try {
      const { id } = req.params
      const userId = req.user.userId

      // Verify scenario exists and is active
      const scenario = await db('scenarios')
        .where({ id, is_active: true })
        .first()

      if (!scenario) {
        return res.status(404).json({
          success: false,
          error: 'Scenario not found',
          code: 'SCENARIO_NOT_FOUND'
        })
      }

      // Generate unique negotiation ID
      const negotiationId = `neg_${Date.now()}_${Math.random().toString(36).substring(7)}`

      // Create new negotiation session
      const [negotiation] = await db('negotiations')
        .insert({
          id: negotiationId,
          user_id: userId,
          scenario_id: id,
          status: 'in_progress',
          started_at: new Date(),
          deal_reached: false
        })
        .returning('*')

      logger.info('Negotiation started', {
        negotiationId,
        userId,
        scenarioId: id,
        scenarioTitle: scenario.title
      })

      res.status(201).json({
        success: true,
        data: {
          negotiation_id: negotiationId,
          scenario: {
            id: scenario.id,
            title: scenario.title,
            description: scenario.description,
            difficulty_level: scenario.difficulty_level,
            estimated_duration_minutes: scenario.estimated_duration_minutes
          },
          status: 'in_progress',
          started_at: new Date().toISOString(),
          message: 'Negotiation session started successfully'
        }
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Get scenario data specifically for AI character access
   * Returns role2_instructions and scenario context, excludes role1_instructions
   */
  async getScenarioForAI (req, res, next) {
    try {
      const { id } = req.params

      const scenario = await db('scenarios')
        .where({ id, is_active: true })
        .select([
          'id',
          'title',
          'description',
          'difficulty_level',
          'ai_character_config',
          'scenario_context',
          'evaluation_criteria',
          'role2_instructions'
          // Note: role1_instructions and teaching_notes excluded for AI access
        ])
        .first()

      if (!scenario) {
        return res.status(404).json({
          success: false,
          error: 'Scenario not found',
          code: 'SCENARIO_NOT_FOUND'
        })
      }

      // Parse JSON strings back to objects
      const scenarioForAI = {
        ...scenario,
        ai_character_config: typeof scenario.ai_character_config === 'string'
          ? JSON.parse(scenario.ai_character_config)
          : scenario.ai_character_config,
        scenario_context: typeof scenario.scenario_context === 'string'
          ? JSON.parse(scenario.scenario_context)
          : scenario.scenario_context,
        evaluation_criteria: typeof scenario.evaluation_criteria === 'string'
          ? JSON.parse(scenario.evaluation_criteria)
          : scenario.evaluation_criteria
      }

      logger.info('Scenario data accessed for AI character', {
        scenarioId: id,
        aiAccess: true
      })

      res.json({
        success: true,
        data: scenarioForAI
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Admin endpoint to get complete scenario data including all 3 parts
   * Requires admin authentication
   */
  async getScenarioComplete (req, res, next) {
    try {
      const { id } = req.params

      // Check if user has admin privileges
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          code: 'INSUFFICIENT_PRIVILEGES'
        })
      }

      const scenario = await db('scenarios')
        .where({ id, is_active: true })
        .first()

      if (!scenario) {
        return res.status(404).json({
          success: false,
          error: 'Scenario not found',
          code: 'SCENARIO_NOT_FOUND'
        })
      }

      // Parse JSON strings back to objects
      const completeScenario = {
        ...scenario,
        ai_character_config: typeof scenario.ai_character_config === 'string'
          ? JSON.parse(scenario.ai_character_config)
          : scenario.ai_character_config,
        scenario_context: typeof scenario.scenario_context === 'string'
          ? JSON.parse(scenario.scenario_context)
          : scenario.scenario_context,
        evaluation_criteria: typeof scenario.evaluation_criteria === 'string'
          ? JSON.parse(scenario.evaluation_criteria)
          : scenario.evaluation_criteria,
        teaching_notes: typeof scenario.teaching_notes === 'string' && scenario.teaching_notes
          ? JSON.parse(scenario.teaching_notes)
          : scenario.teaching_notes
      }

      logger.info('Complete scenario data accessed by admin', {
        scenarioId: id,
        adminUserId: req.user.userId
      })

      res.json({
        success: true,
        data: completeScenario
      })
    } catch (error) {
      next(error)
    }
  }

  /**
   * Admin endpoint to update scenario with 3-part structure
   * Requires admin authentication
   */
  async updateScenario (req, res, next) {
    try {
      const { id } = req.params
      const {
        title,
        description,
        difficulty_level,
        ai_character_config,
        scenario_context,
        evaluation_criteria,
        role1_instructions,
        role2_instructions,
        teaching_notes
      } = req.body

      // Check if user has admin privileges
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'Admin access required',
          code: 'INSUFFICIENT_PRIVILEGES'
        })
      }

      // Validate required fields
      if (!title || !description || !difficulty_level) {
        return res.status(400).json({
          success: false,
          error: 'Title, description, and difficulty level are required',
          code: 'MISSING_REQUIRED_FIELDS'
        })
      }

      // Prepare update data with JSON stringification where needed
      const updateData = {
        title,
        description,
        difficulty_level,
        updated_at: new Date()
      }

      if (ai_character_config) {
        updateData.ai_character_config = typeof ai_character_config === 'object'
          ? JSON.stringify(ai_character_config)
          : ai_character_config
      }

      if (scenario_context) {
        updateData.scenario_context = typeof scenario_context === 'object'
          ? JSON.stringify(scenario_context)
          : scenario_context
      }

      if (evaluation_criteria) {
        updateData.evaluation_criteria = typeof evaluation_criteria === 'object'
          ? JSON.stringify(evaluation_criteria)
          : evaluation_criteria
      }

      if (role1_instructions !== undefined) {
        updateData.role1_instructions = role1_instructions
      }

      if (role2_instructions !== undefined) {
        updateData.role2_instructions = role2_instructions
      }

      if (teaching_notes !== undefined) {
        updateData.teaching_notes = typeof teaching_notes === 'object'
          ? JSON.stringify(teaching_notes)
          : teaching_notes
      }

      const [updatedScenario] = await db('scenarios')
        .where({ id, is_active: true })
        .update(updateData)
        .returning('*')

      if (!updatedScenario) {
        return res.status(404).json({
          success: false,
          error: 'Scenario not found',
          code: 'SCENARIO_NOT_FOUND'
        })
      }

      logger.info('Scenario updated by admin', {
        scenarioId: id,
        adminUserId: req.user.userId,
        fieldsUpdated: Object.keys(updateData)
      })

      res.json({
        success: true,
        data: updatedScenario,
        message: 'Scenario updated successfully'
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new ScenariosController()
