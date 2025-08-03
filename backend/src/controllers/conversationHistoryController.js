const logger = require('../config/logger');
const db = require('../config/database');
const fs = require('fs').promises;
const path = require('path');

/**
 * Conversation History Controller - Manages conversation history and exports
 * Provides comprehensive conversation tracking, search, and export functionality
 */
class ConversationHistoryController {
  
  /**
   * GET /api/conversations/history
   * Get paginated conversation history with filtering and search
   */
  async getConversationHistory(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const {
        page = 1,
        limit = 20,
        search = '',
        scenario = 'all',
        dateFrom = null,
        dateTo = null,
        dealReached = 'all',
        sortBy = 'conversation_date',
        sortOrder = 'desc'
      } = req.query;
      
      logger.info(`Fetching conversation history for user ${userId}`, {
        page, limit, search, scenario, dateFrom, dateTo
      });
      
      // Build base query
      let query = db('conversation_history')
        .where('user_id', userId);
      
      // Apply filters
      if (search) {
        query = query.where(function() {
          this.where('scenario_name', 'like', `%${search}%`)
              .orWhere('character_name', 'like', `%${search}%`)
              .orWhere('session_title', 'like', `%${search}%`)
              .orWhere('transcript_preview', 'like', `%${search}%`);
        });
      }
      
      if (scenario !== 'all') {
        query = query.where('scenario_id', scenario);
      }
      
      if (dateFrom) {
        query = query.where('conversation_date', '>=', dateFrom);
      }
      
      if (dateTo) {
        query = query.where('conversation_date', '<=', dateTo);
      }
      
      if (dealReached !== 'all') {
        query = query.where('deal_reached', dealReached === 'true');
      }
      
      // Get total count for pagination
      const totalQuery = query.clone();
      const [{ count: totalCount }] = await totalQuery.count('* as count');
      
      // Apply sorting and pagination
      const validSortFields = [
        'conversation_date', 'duration', 'overall_score', 
        'scenario_name', 'character_name'
      ];
      const sortField = validSortFields.includes(sortBy) ? sortBy : 'conversation_date';
      const order = sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc';
      
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const conversations = await query
        .orderBy(sortField, order)
        .limit(parseInt(limit))
        .offset(offset);
      
      // Calculate summary statistics
      const stats = await this.getConversationStats(userId, {
        search, scenario, dateFrom, dateTo, dealReached
      });
      
      const response = {
        success: true,
        data: {
          conversations,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            totalPages: Math.ceil(totalCount / parseInt(limit)),
            hasNext: offset + parseInt(limit) < totalCount,
            hasPrev: parseInt(page) > 1
          },
          stats
        }
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error fetching conversation history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation history',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * GET /api/conversations/:id/details
   * Get full conversation details with transcript and assessment
   */
  async getConversationDetails(req, res) {
    try {
      const { id: conversationId } = req.params;
      const userId = req.user.id;
      
      logger.info(`Fetching conversation details for ${conversationId}`);
      
      // Get conversation overview
      const conversation = await db('conversation_history')
        .where('conversation_id', conversationId)
        .where('user_id', userId)
        .first();
      
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      // Get full transcript from messages
      const messages = await db('messages')
        .where('negotiation_id', conversation.negotiation_id)
        .orderBy('sent_at', 'asc')
        .select('sender_type', 'content', 'sent_at', 'metadata');
      
      // Get detailed assessment if available
      let detailedAssessment = null;
      if (conversation.assessment_status === 'completed') {
        detailedAssessment = await db('conversation_assessments')
          .where('negotiation_id', conversation.negotiation_id)
          .first();
      }
      
      // Get conversation session details
      const sessionDetails = await db('conversation_sessions')
        .where('negotiation_id', conversation.negotiation_id)
        .first();
      
      // Format the response
      const response = {
        success: true,
        data: {
          conversation: {
            ...conversation,
            session_details: sessionDetails
          },
          transcript: {
            messages: messages.map(msg => ({
              sender: msg.sender_type,
              content: msg.content,
              timestamp: msg.sent_at,
              metadata: msg.metadata ? JSON.parse(msg.metadata) : null
            })),
            total_messages: messages.length,
            user_messages: messages.filter(m => m.sender_type === 'user').length,
            ai_messages: messages.filter(m => m.sender_type === 'ai').length
          },
          assessment: detailedAssessment ? {
            scores: {
              claiming_value: detailedAssessment.claiming_value_score,
              creating_value: detailedAssessment.creating_value_score,
              relationship_management: detailedAssessment.relationship_management_score,
              overall: detailedAssessment.overall_assessment_score
            },
            feedback: detailedAssessment.personalized_feedback,
            recommendations: detailedAssessment.improvement_recommendations ? 
              JSON.parse(detailedAssessment.improvement_recommendations) : null,
            strengths: detailedAssessment.strengths_identified ? 
              JSON.parse(detailedAssessment.strengths_identified) : null,
            development_areas: detailedAssessment.development_areas ? 
              JSON.parse(detailedAssessment.development_areas) : null,
            tactics_identified: detailedAssessment.negotiation_tactics_identified ? 
              JSON.parse(detailedAssessment.negotiation_tactics_identified) : null,
            skill_level: detailedAssessment.skill_level_achieved,
            milestone_reached: detailedAssessment.milestone_reached
          } : null
        }
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error fetching conversation details:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch conversation details',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * POST /api/conversations/:id/export
   * Export conversation data in various formats
   */
  async exportConversation(req, res) {
    try {
      const { id: conversationId } = req.params;
      const userId = req.user.id;
      const {
        format = 'json', // json, pdf, txt, summary
        include_assessment = true,
        include_timestamps = true,
        include_metadata = false
      } = req.body;
      
      logger.info(`Exporting conversation ${conversationId} in ${format} format`);
      
      // Get conversation details
      const conversationDetails = await this.getConversationForExport(
        conversationId, userId
      );
      
      if (!conversationDetails) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      // Generate export based on format
      let exportData;
      let contentType;
      let filename;
      
      switch (format.toLowerCase()) {
        case 'json':
          exportData = await this.generateJSONExport(
            conversationDetails, 
            { include_assessment, include_timestamps, include_metadata }
          );
          contentType = 'application/json';
          filename = `conversation_${conversationId}.json`;
          break;
          
        case 'txt':
          exportData = await this.generateTextExport(
            conversationDetails,
            { include_assessment, include_timestamps }
          );
          contentType = 'text/plain';
          filename = `conversation_${conversationId}.txt`;
          break;
          
        case 'summary':
          exportData = await this.generateSummaryExport(conversationDetails);
          contentType = 'application/json';
          filename = `conversation_summary_${conversationId}.json`;
          break;
          
        default:
          return res.status(400).json({
            success: false,
            message: 'Unsupported export format'
          });
      }
      
      // Log export event
      await this.logExportEvent(userId, conversationId, format, {
        include_assessment,
        include_timestamps,
        include_metadata
      });
      
      // Send response with appropriate headers
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      if (typeof exportData === 'string') {
        res.send(exportData);
      } else {
        res.json(exportData);
      }
      
    } catch (error) {
      logger.error('Error exporting conversation:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export conversation',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * POST /api/conversations/:id/bookmark
   * Toggle bookmark status for a conversation
   */
  async toggleBookmark(req, res) {
    try {
      const { id: conversationId } = req.params;
      const userId = req.user.id;
      
      // Check if conversation exists and belongs to user
      const session = await db('conversation_sessions')
        .where('id', conversationId)
        .where('user_id', userId)
        .first();
      
      if (!session) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }
      
      // Toggle bookmark status
      const newBookmarkStatus = !session.is_bookmarked;
      
      await db('conversation_sessions')
        .where('id', conversationId)
        .update({ is_bookmarked: newBookmarkStatus });
      
      res.json({
        success: true,
        data: {
          conversation_id: conversationId,
          is_bookmarked: newBookmarkStatus
        }
      });
      
    } catch (error) {
      logger.error('Error toggling bookmark:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update bookmark status'
      });
    }
  }
  
  // Helper methods
  
  async getConversationStats(userId, filters) {
    let query = db('conversation_history')
      .where('user_id', userId);
    
    // Apply same filters as main query
    if (filters.search) {
      query = query.where(function() {
        this.where('scenario_name', 'like', `%${filters.search}%`)
            .orWhere('character_name', 'like', `%${filters.search}%`)
            .orWhere('session_title', 'like', `%${filters.search}%`);
      });
    }
    
    if (filters.scenario !== 'all') {
      query = query.where('scenario_id', filters.scenario);
    }
    
    if (filters.dateFrom) {
      query = query.where('conversation_date', '>=', filters.dateFrom);
    }
    
    if (filters.dateTo) {
      query = query.where('conversation_date', '<=', filters.dateTo);
    }
    
    if (filters.dealReached !== 'all') {
      query = query.where('deal_reached', filters.dealReached === 'true');
    }
    
    const stats = await query
      .select(
        db.raw('COUNT(*) as total_conversations'),
        db.raw('COUNT(CASE WHEN deal_reached = true THEN 1 END) as successful_deals'),
        db.raw('AVG(overall_score) as average_score'),
        db.raw('AVG(duration) as average_duration'),
        db.raw('COUNT(CASE WHEN is_bookmarked = true THEN 1 END) as bookmarked_count')
      )
      .first();
    
    return {
      total_conversations: parseInt(stats.total_conversations) || 0,
      successful_deals: parseInt(stats.successful_deals) || 0,
      success_rate: stats.total_conversations ? 
        Math.round((stats.successful_deals / stats.total_conversations) * 100) : 0,
      average_score: stats.average_score ? Math.round(stats.average_score * 100) / 100 : 0,
      average_duration: stats.average_duration ? Math.round(stats.average_duration / 60) : 0, // Convert to minutes
      bookmarked_count: parseInt(stats.bookmarked_count) || 0
    };
  }
  
  async getConversationForExport(conversationId, userId) {
    const conversation = await db('conversation_history')
      .where('conversation_id', conversationId)
      .where('user_id', userId)
      .first();
    
    if (!conversation) return null;
    
    const messages = await db('messages')
      .where('negotiation_id', conversation.negotiation_id)
      .orderBy('sent_at', 'asc');
    
    return { conversation, messages };
  }
  
  async generateJSONExport(data, options) {
    const { conversation, messages } = data;
    
    const exportData = {
      conversation_info: {
        id: conversation.conversation_id,
        scenario: conversation.scenario_name,
        character: conversation.character_name,
        date: conversation.conversation_date,
        duration: conversation.duration,
        deal_reached: conversation.deal_reached
      },
      transcript: messages.map(msg => {
        const msgData = {
          sender: msg.sender_type,
          content: msg.content
        };
        
        if (options.include_timestamps) {
          msgData.timestamp = msg.sent_at;
        }
        
        if (options.include_metadata && msg.metadata) {
          msgData.metadata = JSON.parse(msg.metadata);
        }
        
        return msgData;
      })
    };
    
    if (options.include_assessment && conversation.assessment_status === 'completed') {
      exportData.assessment = {
        overall_score: conversation.overall_score,
        claiming_value_score: conversation.claiming_value_score,
        creating_value_score: conversation.creating_value_score,
        relationship_score: conversation.relationship_management_score,
        feedback: conversation.personalized_feedback,
        skill_level: conversation.skill_level_achieved
      };
    }
    
    exportData.export_metadata = {
      exported_at: new Date().toISOString(),
      format: 'json',
      options
    };
    
    return exportData;
  }
  
  async generateTextExport(data, options) {
    const { conversation, messages } = data;
    
    let text = `NEGOTIATION CONVERSATION TRANSCRIPT\n`;
    text += `=====================================\n\n`;
    text += `Scenario: ${conversation.scenario_name}\n`;
    text += `Character: ${conversation.character_name}\n`;
    text += `Date: ${new Date(conversation.conversation_date).toLocaleString()}\n`;
    text += `Duration: ${Math.round(conversation.duration / 60)} minutes\n`;
    text += `Deal Reached: ${conversation.deal_reached ? 'Yes' : 'No'}\n\n`;
    
    if (options.include_assessment && conversation.overall_score) {
      text += `ASSESSMENT SCORES:\n`;
      text += `- Overall: ${conversation.overall_score}/100\n`;
      text += `- Claiming Value: ${conversation.claiming_value_score}/100\n`;
      text += `- Creating Value: ${conversation.creating_value_score}/100\n`;
      text += `- Relationship Management: ${conversation.relationship_management_score}/100\n\n`;
    }
    
    text += `CONVERSATION TRANSCRIPT:\n`;
    text += `=======================\n\n`;
    
    messages.forEach((msg, index) => {
      const sender = msg.sender_type === 'user' ? 'You' : conversation.character_name;
      const timestamp = options.include_timestamps ? 
        ` [${new Date(msg.sent_at).toLocaleTimeString()}]` : '';
      
      text += `${sender}${timestamp}:\n${msg.content}\n\n`;
    });
    
    text += `\n--- End of Transcript ---\n`;
    text += `Exported on: ${new Date().toLocaleString()}\n`;
    
    return text;
  }
  
  async generateSummaryExport(data) {
    const { conversation, messages } = data;
    
    return {
      summary: {
        conversation_id: conversation.conversation_id,
        scenario: conversation.scenario_name,
        character: conversation.character_name,
        date: conversation.conversation_date,
        duration_minutes: Math.round(conversation.duration / 60),
        total_messages: messages.length,
        user_messages: messages.filter(m => m.sender_type === 'user').length,
        outcome: {
          deal_reached: conversation.deal_reached,
          deal_terms: conversation.deal_terms
        },
        performance: {
          overall_score: conversation.overall_score,
          skill_level: conversation.skill_level_achieved,
          milestone_reached: conversation.milestone_reached
        }
      },
      exported_at: new Date().toISOString()
    };
  }
  
  async logExportEvent(userId, conversationId, format, options) {
    try {
      await db('conversation_exports').insert({
        id: db.raw('gen_random_uuid()'),
        user_id: userId,
        session_id: conversationId,
        export_type: format,
        export_format: 'api_request',
        export_options: JSON.stringify(options),
        export_status: 'completed'
      });
    } catch (error) {
      logger.error('Failed to log export event:', error);
      // Don't throw - this is just logging
    }
  }
}

module.exports = new ConversationHistoryController();