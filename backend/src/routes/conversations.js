const express = require('express');
const router = express.Router();
const conversationHistoryController = require('../controllers/conversationHistoryController');
const { authenticateToken } = require('../middleware/auth');
const { validateConversationQuery, validateExportRequest, validateConversationId } = require('../middleware/validation');

/**
 * Conversation History Routes
 * Handles conversation history, search, export, and management
 */

/**
 * @route GET /api/conversations/history
 * @desc Get paginated conversation history with filtering
 * @access Private
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 20, max: 100)
 * @query {string} search - Search in scenario names, character names, or transcript
 * @query {string} scenario - Filter by scenario ID or 'all'
 * @query {string} dateFrom - Start date filter (ISO string)
 * @query {string} dateTo - End date filter (ISO string)  
 * @query {string} dealReached - Filter by deal outcome (true, false, all)
 * @query {string} sortBy - Sort field (conversation_date, duration, overall_score, scenario_name, character_name)
 * @query {string} sortOrder - Sort direction (asc, desc)
 */
router.get('/history',
  authenticateToken,
  validateConversationQuery,
  conversationHistoryController.getConversationHistory
);

/**
 * @route GET /api/conversations/:id/details
 * @desc Get full conversation details with transcript and assessment
 * @access Private (own conversations only)
 */
router.get('/:id/details',
  authenticateToken,
  validateConversationId,
  conversationHistoryController.getConversationDetails
);

/**
 * @route POST /api/conversations/:id/export
 * @desc Export conversation data in various formats
 * @access Private (own conversations only)
 * @body {string} format - Export format (json, txt, summary)
 * @body {boolean} include_assessment - Include assessment data
 * @body {boolean} include_timestamps - Include message timestamps  
 * @body {boolean} include_metadata - Include message metadata
 */
router.post('/:id/export',
  authenticateToken,
  validateConversationId,
  validateExportRequest,
  conversationHistoryController.exportConversation
);

/**
 * @route POST /api/conversations/:id/bookmark
 * @desc Toggle bookmark status for a conversation
 * @access Private (own conversations only)
 */
router.post('/:id/bookmark',
  authenticateToken,
  validateConversationId,
  conversationHistoryController.toggleBookmark
);

module.exports = router;