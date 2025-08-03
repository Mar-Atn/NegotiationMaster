const logger = require('../config/logger');
const db = require('../config/database');

/**
 * Progress Controller - Handles user skill progression and achievement tracking
 * Provides comprehensive progress analytics and milestone management
 */
class ProgressController {
  
  /**
   * GET /api/progress/user/:userId
   * Get comprehensive user skill progression data
   */
  async getUserProgress(req, res) {
    try {
      const { userId } = req.params;
      const { timeframe = '30d', skillDimension = 'all' } = req.query;
      
      logger.info(`Fetching progress data for user ${userId}, timeframe: ${timeframe}`);
      
      // Get current progress overview
      const currentProgress = await db('user_progress')
        .where('user_id', userId)
        .first();
      
      if (!currentProgress) {
        return res.status(404).json({
          success: false,
          message: 'Progress data not found for user'
        });
      }
      
      // Get historical skill progression
      const timeframeDays = this.parseTimeframe(timeframe);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);
      
      let skillHistoryQuery = db('skill_history')
        .where('user_id', userId)
        .where('created_at', '>=', cutoffDate)
        .orderBy('created_at', 'asc');
        
      if (skillDimension !== 'all') {
        skillHistoryQuery = skillHistoryQuery.where('skill_dimension', skillDimension);
      }
      
      const skillHistory = await skillHistoryQuery;
      
      // Get recent achievements
      const recentAchievements = await db('user_achievements as ua')
        .join('achievement_definitions as ad', 'ua.achievement_id', 'ad.id')
        .where('ua.user_id', userId)
        .where('ua.unlocked_at', '>=', cutoffDate)
        .select(
          'ad.name',
          'ad.description',
          'ad.category',
          'ad.badge_icon',
          'ad.rarity',
          'ua.unlocked_at',
          'ua.trigger_score',
          'ua.unlock_context'
        )
        .orderBy('ua.unlocked_at', 'desc');
      
      // Calculate improvement trends
      const trends = await this.calculateImprovementTrends(userId, timeframeDays);
      
      // Get milestone progress
      const milestoneProgress = await this.getMilestoneProgress(userId);
      
      // Get performance insights
      const insights = await this.generateProgressInsights(userId, skillHistory, currentProgress);
      
      const response = {
        success: true,
        data: {
          currentProgress: {
            scores: {
              claiming_value: {
                current: currentProgress.avg_claiming_value_score,
                best: currentProgress.best_claiming_value_score,
                trend: currentProgress.claiming_value_trend
              },
              creating_value: {
                current: currentProgress.avg_creating_value_score,
                best: currentProgress.best_creating_value_score,
                trend: currentProgress.creating_value_trend
              },
              relationship: {
                current: currentProgress.avg_managing_relationships_score,
                best: currentProgress.best_managing_relationships_score,
                trend: currentProgress.relationship_trend
              },
              overall: {
                current: currentProgress.avg_overall_score,
                best: currentProgress.best_overall_score,
                trend: currentProgress.overall_trend
              }
            },
            stats: {
              total_conversations: currentProgress.total_conversations,
              sessions_this_week: currentProgress.sessions_this_week,
              sessions_this_month: currentProgress.sessions_this_month,
              current_streak: currentProgress.streak_days,
              longest_streak: currentProgress.longest_streak,
              achievements_unlocked: currentProgress.achievements_unlocked,
              consistency_score: currentProgress.consistency_score,
              improvement_velocity: currentProgress.improvement_velocity
            }
          },
          skillHistory,
          trends,
          recentAchievements,
          milestoneProgress,
          insights
        }
      };
      
      res.json(response);
      
    } catch (error) {
      logger.error('Error fetching user progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch progress data',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * GET /api/progress/achievements
   * Get user's achievement progress and available achievements
   */
  async getAchievements(req, res) {
    try {
      const userId = req.user.id; // From auth middleware
      const { category = 'all', includeHidden = false } = req.query;
      
      logger.info(`Fetching achievements for user ${userId}`);
      
      // Get all achievement definitions
      let achievementQuery = db('achievement_definitions')
        .where('is_active', true);
        
      if (category !== 'all') {
        achievementQuery = achievementQuery.where('category', category);
      }
      
      if (!includeHidden) {
        achievementQuery = achievementQuery.where('is_hidden', false);
      }
      
      const allAchievements = await achievementQuery.orderBy('display_order', 'asc');
      
      // Get user's unlocked achievements
      const userAchievements = await db('user_achievements')
        .where('user_id', userId)
        .select('achievement_id', 'unlocked_at', 'progress_current', 'progress_target', 'is_new');
      
      // Combine achievement definitions with user progress
      const achievementsWithProgress = allAchievements.map(achievement => {
        const userProgress = userAchievements.find(ua => ua.achievement_id === achievement.id);
        
        return {
          ...achievement,
          unlocked: !!userProgress,
          unlocked_at: userProgress?.unlocked_at || null,
          progress_current: userProgress?.progress_current || 0,
          progress_target: userProgress?.progress_target || achievement.unlock_criteria?.target || null,
          is_new: userProgress?.is_new || false,
          progress_percentage: userProgress ? 
            Math.min(100, (userProgress.progress_current / (userProgress.progress_target || 1)) * 100) : 0
        };
      });
      
      // Get achievement statistics
      const stats = {
        total_achievements: allAchievements.length,
        unlocked_count: userAchievements.length,
        unlock_percentage: Math.round((userAchievements.length / allAchievements.length) * 100),
        new_achievements: userAchievements.filter(ua => ua.is_new).length,
        categories: await this.getAchievementCategoryStats(userId)
      };
      
      res.json({
        success: true,
        data: {
          achievements: achievementsWithProgress,
          stats
        }
      });
      
    } catch (error) {
      logger.error('Error fetching achievements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch achievements',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  
  /**
   * POST /api/progress/achievement/:achievementId/mark-seen
   * Mark an achievement as seen (no longer new)
   */
  async markAchievementSeen(req, res) {
    try {
      const userId = req.user.id;
      const { achievementId } = req.params;
      
      await db('user_achievements')
        .where('user_id', userId)
        .where('achievement_id', achievementId)
        .update({ is_new: false });
      
      res.json({
        success: true,
        message: 'Achievement marked as seen'
      });
      
    } catch (error) {
      logger.error('Error marking achievement as seen:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update achievement status'
      });
    }
  }
  
  // Helper methods
  
  parseTimeframe(timeframe) {
    const match = timeframe.match(/^(\d+)([dwmy])$/);
    if (!match) return 30; // Default to 30 days
    
    const [, amount, unit] = match;
    const multipliers = { d: 1, w: 7, m: 30, y: 365 };
    return parseInt(amount) * (multipliers[unit] || 1);
  }
  
  async calculateImprovementTrends(userId, days) {
    const trends = {};
    const skills = ['claiming_value', 'creating_value', 'relationship', 'overall'];
    
    for (const skill of skills) {
      const history = await db('skill_history')
        .where('user_id', userId)
        .where('skill_dimension', skill)
        .where('created_at', '>=', new Date(Date.now() - days * 24 * 60 * 60 * 1000))
        .orderBy('created_at', 'asc');
      
      if (history.length >= 2) {
        const firstScore = history[0].current_score;
        const lastScore = history[history.length - 1].current_score;
        const improvement = lastScore - firstScore;
        const sessionsCount = history.length;
        
        trends[skill] = {
          total_improvement: improvement,
          average_per_session: improvement / sessionsCount,
          sessions_analyzed: sessionsCount,
          trend_direction: improvement > 0 ? 'improving' : improvement < 0 ? 'declining' : 'stable'
        };
      } else {
        trends[skill] = {
          total_improvement: 0,
          average_per_session: 0,
          sessions_analyzed: history.length,
          trend_direction: 'insufficient_data'
        };
      }
    }
    
    return trends;
  }
  
  async getMilestoneProgress(userId) {
    // Define milestone thresholds
    const milestones = [
      { skill: 'overall', threshold: 60, name: 'Competent Negotiator' },
      { skill: 'overall', threshold: 75, name: 'Skilled Negotiator' },
      { skill: 'overall', threshold: 85, name: 'Expert Negotiator' },
      { skill: 'overall', threshold: 95, name: 'Master Negotiator' }
    ];
    
    const currentProgress = await db('user_progress')
      .where('user_id', userId)
      .first();
    
    if (!currentProgress) return [];
    
    return milestones.map(milestone => ({
      ...milestone,
      current_score: currentProgress.avg_overall_score,
      achieved: currentProgress.avg_overall_score >= milestone.threshold,
      progress_percentage: Math.min(100, (currentProgress.avg_overall_score / milestone.threshold) * 100)
    }));
  }
  
  async generateProgressInsights(userId, skillHistory, currentProgress) {
    const insights = [];
    
    // Analyze improvement patterns
    if (skillHistory.length >= 5) {
      const recentSessions = skillHistory.slice(-5);
      const improvementCount = recentSessions.filter((session, index) => 
        index > 0 && session.current_score > recentSessions[index - 1].current_score
      ).length;
      
      if (improvementCount >= 3) {
        insights.push({
          type: 'positive_trend',
          message: 'You\'re on an upward trajectory! Your recent sessions show consistent improvement.',
          icon: 'trending_up'
        });
      }
    }
    
    // Check for streaks
    if (currentProgress.streak_days >= 7) {
      insights.push({
        type: 'consistency',
        message: `Excellent consistency! You've maintained a ${currentProgress.streak_days}-day practice streak.`,
        icon: 'local_fire_department'
      });
    }
    
    // Identify strength areas
    const scores = [
      { skill: 'Claiming Value', score: currentProgress.avg_claiming_value_score },
      { skill: 'Creating Value', score: currentProgress.avg_creating_value_score },
      { skill: 'Relationship Management', score: currentProgress.avg_managing_relationships_score }
    ];
    
    const strongestSkill = scores.reduce((max, current) => 
      current.score > max.score ? current : max
    );
    
    if (strongestSkill.score >= 75) {
      insights.push({
        type: 'strength',
        message: `${strongestSkill.skill} is your strongest area with a score of ${strongestSkill.score}.`,
        icon: 'star'
      });
    }
    
    return insights;
  }
  
  async getAchievementCategoryStats(userId) {
    const categories = await db('achievement_definitions')
      .select('category')
      .count('* as total')
      .where('is_active', true)
      .groupBy('category');
    
    const unlockedByCategory = await db('user_achievements as ua')
      .join('achievement_definitions as ad', 'ua.achievement_id', 'ad.id')
      .where('ua.user_id', userId)
      .select('ad.category')
      .count('* as unlocked')
      .groupBy('ad.category');
    
    return categories.map(cat => {
      const unlocked = unlockedByCategory.find(u => u.category === cat.category);
      return {
        category: cat.category,
        total: cat.total,
        unlocked: unlocked ? unlocked.unlocked : 0,
        percentage: unlocked ? Math.round((unlocked.unlocked / cat.total) * 100) : 0
      };
    });
  }
}

module.exports = new ProgressController();