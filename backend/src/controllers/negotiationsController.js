const db = require('../config/database')
const logger = require('../config/logger')
const assessmentQueueService = require('../services/assessmentQueue')

// AI Response Generation Function
async function generateAIResponse (negotiationId, userMessage, userId, io) {
  try {
    // Emit typing indicator to the negotiation room
    io.to(`negotiation-${negotiationId}`).emit('ai-typing', {
      negotiationId,
      isTyping: true
    })

    // Add a small delay to simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Get negotiation and scenario data for context
    const negotiation = await db('negotiations')
      .leftJoin('scenarios', 'negotiations.scenario_id', 'scenarios.id')
      .where('negotiations.id', negotiationId)
      .select([
        'negotiations.*',
        'scenarios.title as scenario_title',
        'scenarios.ai_character_config',
        'scenarios.scenario_context'
      ])
      .first()

    if (!negotiation) {
      logger.error('Negotiation not found for AI response', { negotiationId })
      // Stop typing indicator
      io.to(`negotiation-${negotiationId}`).emit('ai-typing', {
        negotiationId,
        isTyping: false
      })
      return
    }

    // Parse character config
    const characterConfig = typeof negotiation.ai_character_config === 'string'
      ? JSON.parse(negotiation.ai_character_config)
      : negotiation.ai_character_config

    // Generate response based on character and user message
    const aiResponse = generateContextualResponse(userMessage, characterConfig, negotiation)

    // Generate message ID for AI response
    const aiMessageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}_ai`

    // Store AI response
    await db('messages').insert({
      id: aiMessageId,
      negotiation_id: negotiationId,
      sender_type: 'ai',
      content: aiResponse,
      metadata: JSON.stringify({
        message_type: 'response',
        character_name: characterConfig?.name,
        response_to: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '')
      }),
      sent_at: new Date()
    })

    const messageData = {
      id: aiMessageId,
      negotiation_id: negotiationId,
      sender_type: 'ai',
      content: aiResponse,
      metadata: {
        message_type: 'response',
        character_name: characterConfig?.name,
        response_to: userMessage.substring(0, 50) + (userMessage.length > 50 ? '...' : '')
      },
      sent_at: new Date()
    }

    // Stop typing indicator and broadcast the new message
    io.to(`negotiation-${negotiationId}`).emit('ai-typing', {
      negotiationId,
      isTyping: false
    })

    io.to(`negotiation-${negotiationId}`).emit('new-message', messageData)

    logger.info('AI response generated and broadcasted', {
      negotiationId,
      aiMessageId,
      characterName: characterConfig?.name,
      userMessageLength: userMessage.length,
      aiResponseLength: aiResponse.length
    })
  } catch (error) {
    logger.error('Failed to generate AI response', {
      negotiationId,
      error: error.message,
      stack: error.stack
    })

    // Stop typing indicator on error
    io.to(`negotiation-${negotiationId}`).emit('ai-typing', {
      negotiationId,
      isTyping: false
    })
  }
}

function generateContextualResponse (userMessage, characterConfig, negotiation) {
  const characterName = characterConfig?.name || 'AI Assistant'
  const characterRole = characterConfig?.role || 'Negotiator'
  const negotiationStyle = characterConfig?.negotiation_style || 'collaborative'
  const personality = characterConfig?.personality || 'professional'
  const initialPosition = characterConfig?.initial_position || ''
  const scenarioTitle = negotiation.scenario_title || ''

  // Parse scenario context if available
  let scenarioContext = null
  try {
    if (negotiation.scenario_context) {
      scenarioContext = typeof negotiation.scenario_context === 'string'
        ? JSON.parse(negotiation.scenario_context)
        : negotiation.scenario_context
    }
  } catch (error) {
    console.warn('Failed to parse scenario context:', error.message)
  }

  const lowerMessage = userMessage.toLowerCase()
  let response = ''

  // Generate scenario-specific responses
  if (scenarioTitle.includes('Used Car')) {
    response = generateCarNegotiationResponse(userMessage, lowerMessage, characterConfig, scenarioContext)
  } else if (scenarioTitle.includes('Salary')) {
    response = generateSalaryNegotiationResponse(userMessage, lowerMessage, characterConfig, scenarioContext)
  } else {
    response = generateGenericResponse(userMessage, lowerMessage, characterConfig, scenarioContext)
  }

  return response
}

function generateCarNegotiationResponse (userMessage, lowerMessage, characterConfig, scenarioContext) {
  const characterName = characterConfig?.name || 'Car Dealer'
  const personality = characterConfig?.personality || 'professional'
  const negotiationStyle = characterConfig?.negotiation_style || 'collaborative'
  const isAggressive = negotiationStyle.includes('aggressive') || negotiationStyle.includes('manipulative')

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('start')) {
    if (isAggressive) {
      return `Hey there! I'm ${characterName}, and you've come to the right place. This ${scenarioContext?.situation?.includes('Honda Civic') ? '2019 Honda Civic' : 'vehicle'} is flying off our lot - I've got three other people coming to look at it today. What brings you in? Looking for reliable transportation? Let me show you why this is the perfect car for you!`
    } else {
      return `Hello! I'm ${characterName}. Welcome to our dealership. I understand you're interested in ${scenarioContext?.situation?.includes('Honda Civic') ? 'the 2019 Honda Civic with 45,000 miles' : 'one of our vehicles'}. It's a fantastic car with clean maintenance records. What questions can I answer for you?`
    }
  }

  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('$') || lowerMessage.includes('budget')) {
    if (isAggressive) {
      return 'Look, I\'ll be straight with you - this car is priced at $11,500, and that\'s already below market value. I\'ve got KBB showing similar cars at $12,500 or more. I can maybe work with you a little, but I need to know you\'re serious. What were you thinking of putting down today? Time is money, and I\'ve got other customers interested.'
    } else {
      return 'I understand price is important. The car is listed at $11,500, which reflects its excellent condition and clean maintenance history. Based on current market conditions, similar vehicles are selling between $9,500 and $12,500. I\'m willing to work with you - what budget range were you considering? Maybe we can find some common ground.'
    }
  }

  if (lowerMessage.includes('warranty') || lowerMessage.includes('guarantee')) {
    return 'Good question about warranty coverage. We offer a 90-day limited warranty on all our used vehicles, and you can extend that if you\'d like additional peace of mind. This Honda has been well-maintained, but I understand wanting that extra protection. What kind of warranty coverage are you looking for?'
  }

  if (lowerMessage.includes('condition') || lowerMessage.includes('maintenance') || lowerMessage.includes('history')) {
    return `You're asking the right questions! This ${scenarioContext?.situation?.includes('Honda Civic') ? 'Honda Civic' : 'vehicle'} has a clean maintenance record - all services done on time, no accidents, single owner. I can show you the CarFax report. The previous owner was meticulous about upkeep. Would you like to take it for a test drive?`
  }

  if (lowerMessage.includes('think') || lowerMessage.includes('consider') || lowerMessage.includes('time')) {
    if (isAggressive) {
      return 'I hear you, but here\'s the thing - good cars like this don\'t sit around. I\'ve already had two calls about it this morning. If you\'re serious, we should move forward today. What\'s it going to take to get you driving this car home tonight? I can probably find another $500 of wiggle room, but that\'s it.'
    } else {
      return 'I understand you want to think it over - that\'s a smart approach for a major purchase. This car will likely still be here tomorrow, though I can\'t guarantee it. Take your time, do your research. If you have any other questions or want to bring someone else to look at it, just let me know.'
    }
  }

  // Default car dealer response
  if (isAggressive) {
    const responses = [
      'Listen, I like you, so I\'m going to make this simple. This car is priced to move, and I can see you behind the wheel. What\'s it going to take to make this happen today?',
      'Here\'s what I can do - and this is only because I see you\'re serious. Let me talk to my manager and see if we can work something out. But I need to know you\'re ready to buy today.',
      'You know what? I\'ve been in this business for years, and I can tell when someone knows a good deal. This Honda won\'t last the weekend at this price. What are your main concerns?'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  } else {
    const responses = [
      'That\'s a fair point. As an experienced dealer, I want to make sure you\'re completely comfortable with your decision. What other information would help you feel confident about this purchase?',
      'I appreciate your thoughtfulness. This Honda really is a great value at $11,500 - the market supports that price. Is there anything specific about the car or deal structure I can address?',
      'Good question. Let me be transparent with you - we price our cars competitively because we want satisfied customers who refer their friends. What aspects of the deal are most important to you?'
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
}

function generateSalaryNegotiationResponse (userMessage, lowerMessage, characterConfig, scenarioContext) {
  const characterName = characterConfig?.name || 'HR Manager'
  const personality = characterConfig?.personality || 'professional'

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('start')) {
    return `Hello! I'm ${characterName}, and I'm excited to discuss your offer with TechStart Inc. Congratulations again on making it through our interview process - we were impressed with your background and potential. I understand you'd like to discuss the compensation package. What aspects would you like to talk about?`
  }

  if (lowerMessage.includes('salary') || lowerMessage.includes('pay') || lowerMessage.includes('$') || lowerMessage.includes('compensation')) {
    return 'I understand you want to discuss the salary component. Our initial offer of $65,000 reflects the entry-level nature of the position and our budget parameters. However, I recognize your strong academic record and internship experience. The market range for similar positions is typically $60,000 to $75,000. What were you thinking in terms of compensation?'
  }

  if (lowerMessage.includes('experience') || lowerMessage.includes('internship') || lowerMessage.includes('skills')) {
    return 'You\'re absolutely right to bring up your experience. Your internship at [Previous Company] and your academic achievements do set you apart from other entry-level candidates. We value that experience, and it\'s part of why we wanted to hire you. How do you see your background adding value to our team?'
  }

  if (lowerMessage.includes('benefits') || lowerMessage.includes('package') || lowerMessage.includes('vacation') || lowerMessage.includes('health')) {
    return 'Great question about the full package. Beyond the base salary, we offer comprehensive health insurance, 401k matching up to 4%, two weeks PTO to start, professional development budget, and flexible work arrangements. The total compensation value is quite competitive. Are there specific benefits that are particularly important to you?'
  }

  if (lowerMessage.includes('market') || lowerMessage.includes('research') || lowerMessage.includes('comparable')) {
    return 'I appreciate that you\'ve done your market research - that shows professionalism. You\'re correct that the range varies, and location, company size, and specific skills all factor in. Our offer is positioned thoughtfully within the market range for entry-level positions. What data points are you using for comparison?'
  }

  // Default HR response
  const responses = [
    'That\'s a valid point. We want to be fair and competitive while working within our budget constraints. Our goal is to build a long-term relationship where you can grow with the company. What would make this offer work for you?',
    'I hear you. Let me be transparent - we have some flexibility, but as an entry-level position, there are constraints. Your potential for growth here is significant though. What are your priorities in terms of the overall package?',
    'Good thinking. We structured this offer based on internal equity and market data, but I\'m open to discussing it further. What aspects of the role or compensation are most important to your decision?'
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

function generateGenericResponse (userMessage, lowerMessage, characterConfig, scenarioContext) {
  const characterName = characterConfig?.name || 'AI Assistant'
  const characterRole = characterConfig?.role || 'Negotiator'
  const negotiationStyle = characterConfig?.negotiation_style || 'collaborative'
  const personality = characterConfig?.personality || 'professional'

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('start')) {
    return `Hello! I'm ${characterName}. ${personality.includes('friendly') ? 'I believe we can find a great solution together!' : 'Let\'s get down to business.'} What would you like to discuss first?`
  }

  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('$')) {
    if (negotiationStyle.includes('aggressive') || negotiationStyle.includes('competitive')) {
      return 'I understand you\'re focused on price, but let me be clear - this is a fair market value. I\'ve got other interested parties, so I can\'t go much lower. What specific budget constraints are you working with?'
    } else {
      return 'I appreciate you bringing up pricing. Let\'s work together to find a solution that works for both of us. Can you tell me more about your budget parameters and what would make this deal valuable for you?'
    }
  }

  // Generic thoughtful response
  const responses = [
    `That's an interesting point. From my perspective as ${characterRole.toLowerCase()}, I see this differently. Let me explain my position...`,
    'I hear what you\'re saying. In my experience with similar situations, we need to consider the broader implications. What\'s your main concern here?',
    'Thank you for sharing that. I want to make sure I understand your position fully. Can you elaborate on what would make this work better for you?',
    'I appreciate your directness. Let me think about how we can address that while also meeting my needs. What alternatives have you considered?'
  ]
  return responses[Math.floor(Math.random() * responses.length)]
}

class NegotiationsController {
  async getUserNegotiations (req, res, next) {
    try {
      const userId = req.user.userId

      const negotiations = await db('negotiations')
        .leftJoin('scenarios', 'negotiations.scenario_id', 'scenarios.id')
        .where('negotiations.user_id', userId)
        .select([
          'negotiations.id',
          'negotiations.status',
          'negotiations.started_at',
          'negotiations.completed_at',
          'negotiations.deal_reached',
          'scenarios.title as scenario_title',
          'scenarios.difficulty_level',
          'scenarios.estimated_duration_minutes'
        ])
        .orderBy('negotiations.started_at', 'desc')

      res.json({
        success: true,
        data: negotiations
      })
    } catch (error) {
      next(error)
    }
  }

  async getNegotiationById (req, res, next) {
    try {
      const { id } = req.params
      const userId = req.user.userId

      const negotiation = await db('negotiations')
        .leftJoin('scenarios', 'negotiations.scenario_id', 'scenarios.id')
        .leftJoin('ai_characters', 'scenarios.ai_character_id', 'ai_characters.id')
        .where({
          'negotiations.id': id,
          'negotiations.user_id': userId
        })
        .select([
          'negotiations.*',
          'scenarios.title as scenario_title',
          'scenarios.description as scenario_description',
          'scenarios.difficulty_level',
          'scenarios.scenario_context',
          'scenarios.scenario_variables',
          'scenarios.system_prompt',
          'ai_characters.name as character_name',
          'ai_characters.role as character_role',
          'ai_characters.personality_profile',
          'ai_characters.behavior_parameters'
        ])
        .first()

      if (!negotiation) {
        return res.status(404).json({
          success: false,
          error: 'Negotiation not found',
          code: 'NEGOTIATION_NOT_FOUND'
        })
      }

      // Get messages for this negotiation
      const messages = await db('messages')
        .where('negotiation_id', id)
        .orderBy('sent_at', 'asc')
        .select('*')

      // Parse JSON strings
      const negotiationWithParsedData = {
        ...negotiation,
        deal_terms: negotiation.deal_terms ? JSON.parse(negotiation.deal_terms) : null,
        scenario_context: negotiation.scenario_context ? JSON.parse(negotiation.scenario_context) : null,
        scenario_variables: negotiation.scenario_variables ? JSON.parse(negotiation.scenario_variables) : null,
        character_details: negotiation.character_name
          ? {
              name: negotiation.character_name,
              role: negotiation.character_role,
              personality_profile: negotiation.personality_profile ? JSON.parse(negotiation.personality_profile) : null,
              behavior_parameters: negotiation.behavior_parameters ? JSON.parse(negotiation.behavior_parameters) : null
            }
          : null,
        messages: messages.map(msg => ({
          ...msg,
          metadata: msg.metadata ? JSON.parse(msg.metadata) : null
        }))
      }

      // Clean up duplicate fields
      delete negotiationWithParsedData.character_name
      delete negotiationWithParsedData.character_role
      delete negotiationWithParsedData.personality_profile
      delete negotiationWithParsedData.behavior_parameters

      res.json({
        success: true,
        data: negotiationWithParsedData
      })
    } catch (error) {
      next(error)
    }
  }

  async updateNegotiationState (req, res, next) {
    try {
      const { id } = req.params
      const userId = req.user.userId
      const { status, deal_terms, deal_reached } = req.body

      // Verify negotiation belongs to user
      const negotiation = await db('negotiations')
        .where({ id, user_id: userId })
        .first()

      if (!negotiation) {
        return res.status(404).json({
          success: false,
          error: 'Negotiation not found',
          code: 'NEGOTIATION_NOT_FOUND'
        })
      }

      // Prepare update data
      const updateData = {}
      if (status) updateData.status = status
      if (deal_terms) updateData.deal_terms = JSON.stringify(deal_terms)
      if (deal_reached !== undefined) updateData.deal_reached = deal_reached
      if (status === 'completed') updateData.completed_at = new Date()

      // Update negotiation
      await db('negotiations')
        .where({ id })
        .update(updateData)

      logger.info('Negotiation state updated', {
        negotiationId: id,
        userId,
        status,
        dealReached: deal_reached
      })

      res.json({
        success: true,
        message: 'Negotiation state updated successfully'
      })
    } catch (error) {
      next(error)
    }
  }

  async sendMessage (req, res, next) {
    try {
      const { id } = req.params
      const userId = req.user.userId
      const { content, message_type = 'text' } = req.body

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Message content is required',
          code: 'EMPTY_MESSAGE'
        })
      }

      // Verify negotiation exists and belongs to user
      const negotiation = await db('negotiations')
        .where({ id, user_id: userId })
        .first()

      if (!negotiation) {
        return res.status(404).json({
          success: false,
          error: 'Negotiation not found',
          code: 'NEGOTIATION_NOT_FOUND'
        })
      }

      if (negotiation.status !== 'in_progress') {
        return res.status(400).json({
          success: false,
          error: 'Cannot send messages to completed negotiation',
          code: 'NEGOTIATION_NOT_ACTIVE'
        })
      }

      // Generate message ID
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`

      // Store user message
      await db('messages').insert({
        id: messageId,
        negotiation_id: id,
        sender_type: 'user',
        content: content.trim(),
        metadata: JSON.stringify({
          message_type,
          user_id: userId
        }),
        sent_at: new Date()
      })

      logger.info('User message sent', {
        negotiationId: id,
        messageId,
        userId,
        contentLength: content.length
      })

      res.status(201).json({
        success: true,
        data: {
          message_id: messageId,
          negotiation_id: id,
          content: content.trim(),
          sender_type: 'user',
          sent_at: new Date().toISOString(),
          message: 'Message sent successfully'
        }
      })

      // Generate AI response asynchronously
      setImmediate(async () => {
        try {
          // Get io instance from request (will be attached by middleware)
          const io = req.app.get('io')
          
          logger.info('Starting AI response generation', {
            negotiationId: id,
            userId,
            messageContent: content.trim().substring(0, 50),
            hasIoInstance: !!io
          })
          
          await generateAIResponse(id, content.trim(), userId, io)
          
          logger.info('AI response generation completed', {
            negotiationId: id
          })
        } catch (error) {
          logger.error('Failed to trigger AI response', {
            negotiationId: id,
            error: error.message,
            stack: error.stack
          })
        }
      })
    } catch (error) {
      next(error)
    }
  }

  async completeNegotiation (req, res, next) {
    try {
      const { id } = req.params
      const userId = req.user.userId
      const { deal_terms, deal_reached, user_satisfaction } = req.body

      // Verify negotiation exists and belongs to user
      const negotiation = await db('negotiations')
        .where({ id, user_id: userId })
        .first()

      if (!negotiation) {
        return res.status(404).json({
          success: false,
          error: 'Negotiation not found',
          code: 'NEGOTIATION_NOT_FOUND'
        })
      }

      if (negotiation.status === 'completed') {
        return res.status(400).json({
          success: false,
          error: 'Negotiation already completed',
          code: 'ALREADY_COMPLETED'
        })
      }

      // Update negotiation as completed
      await db('negotiations')
        .where({ id })
        .update({
          status: 'completed',
          deal_terms: deal_terms ? JSON.stringify(deal_terms) : null,
          deal_reached: deal_reached || false,
          completed_at: new Date()
        })

      // Create basic feedback record
      const feedbackId = `feedback_${Date.now()}_${Math.random().toString(36).substring(7)}`

      await db('feedback').insert({
        id: feedbackId,
        negotiation_id: id,
        user_id: userId,
        overall_score: 0, // Will be calculated later
        claiming_value_score: 0,
        creating_value_score: 0,
        managing_relationships_score: 0,
        feedback_text: 'Negotiation completed - detailed feedback pending analysis',
        user_satisfaction: user_satisfaction || null,
        created_at: new Date()
      })

      // Trigger automatic assessment after completion
      try {
        const completedNegotiation = await db('negotiations')
          .where('id', id)
          .first()

        if (completedNegotiation) {
          const conversationData = {
            negotiationId: id,
            userId,
            scenarioId: completedNegotiation.scenario_id,
            transcript: completedNegotiation.transcript || '',
            voiceMetrics: completedNegotiation.voice_metrics ? JSON.parse(completedNegotiation.voice_metrics) : {},
            metadata: {
              duration: completedNegotiation.duration_seconds,
              endedAt: new Date(),
              outcome: deal_reached ? 'deal_reached' : 'no_deal',
              dealTerms: deal_terms,
              userSatisfaction: user_satisfaction
            }
          }

          // Queue assessment with high priority
          const assessmentJobId = await assessmentQueueService.queueConversationAssessment(conversationData, 2)
          
          if (assessmentJobId) {
            logger.info('Assessment queued for completed negotiation', {
              negotiationId: id,
              userId,
              assessmentJobId
            })
          } else {
            logger.warn('Failed to queue assessment - assessment service may be unavailable', {
              negotiationId: id,
              userId
            })
          }
        }
      } catch (assessmentError) {
        logger.error('Error triggering assessment for completed negotiation:', assessmentError)
        // Don't fail the completion if assessment trigger fails
      }

      logger.info('Negotiation completed', {
        negotiationId: id,
        userId,
        dealReached: deal_reached,
        feedbackId
      })

      res.json({
        success: true,
        data: {
          negotiation_id: id,
          status: 'completed',
          deal_reached: deal_reached || false,
          deal_terms: deal_terms || null,
          completed_at: new Date().toISOString(),
          feedback_id: feedbackId,
          assessment_triggered: true
        },
        message: 'Negotiation completed successfully - assessment analysis initiated'
      })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = new NegotiationsController()
