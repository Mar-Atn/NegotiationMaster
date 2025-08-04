const express = require('express');
const router = express.Router();
const progressController = require('../controllers/progressController');
const { authenticateToken } = require('../middleware/auth');
const { validateProgressQuery, validateAchievementParams } = require('../middleware/validation');

/**
 * Progress Tracking Routes
 * Handles user skill progression, achievements, and milestone tracking
 */

/**
 * @route GET /api/progress/user/:userId
 * @desc Get comprehensive user skill progression data
 * @access Private (Admin or own data)
 * @query {string} timeframe - Time period for data (7d, 30d, 90d, 1y)
 * @query {string} skillDimension - Specific skill or 'all' (claiming_value, creating_value, relationship, overall, all)
 */
router.get('/user/:userId', 
  authenticateToken,
  validateProgressQuery,
  progressController.getUserProgress.bind(progressController)
);

/**
 * @route GET /api/progress/achievements
 * @desc Get user's achievement progress and available achievements  
 * @access Private
 * @query {string} category - Filter by category (progression, consistency, mastery, special, all)
 * @query {boolean} includeHidden - Include hidden/secret achievements
 */
router.get('/achievements',
  authenticateToken,
  progressController.getAchievements.bind(progressController)
);

/**
 * @route POST /api/progress/achievement/:achievementId/mark-seen
 * @desc Mark an achievement as seen (remove 'new' flag)
 * @access Private
 */
router.post('/achievement/:achievementId/mark-seen',
  authenticateToken,
  validateAchievementParams,
  progressController.markAchievementSeen.bind(progressController)
);

module.exports = router;