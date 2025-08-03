const logger = require('../config/logger');
const db = require('../config/database');

/**
 * Achievement Service
 * Handles achievement tracking, unlock conditions, and milestone management
 */
class AchievementService {
  
  /**
   * Check and unlock achievements after a conversation assessment
   */
  async checkAchievements(userId, assessment, updatedScores) {
    try {
      logger.info(`Checking achievements for user ${userId} after assessment ${assessment.id}`);
      
      const userProgress = await db('user_progress').where('user_id', userId).first();
      const unlockedAchievements = [];
      
      // Get all active achievements that user hasn't unlocked yet
      const availableAchievements = await db('achievement_definitions as ad')
        .leftJoin('user_achievements as ua', function() {
          this.on('ad.id', '=', 'ua.achievement_id')
              .andOn('ua.user_id', '=', db.raw('?', [userId]));
        })
        .where('ad.is_active', true)
        .whereNull('ua.id') // Not yet unlocked
        .select('ad.*');
      
      for (const achievement of availableAchievements) {
        const unlocked = await this.checkAchievementCondition(
          achievement, 
          userId, 
          assessment, 
          updatedScores, 
          userProgress
        );
        
        if (unlocked) {
          await this.unlockAchievement(userId, achievement.id, assessment.id, updatedScores);
          unlockedAchievements.push(achievement);
        }
      }
      
      // Update achievement counters
      if (unlockedAchievements.length > 0) {
        await db('user_progress')
          .where('user_id', userId)
          .increment('achievements_unlocked', unlockedAchievements.length);
      }
      
      logger.info(`Unlocked ${unlockedAchievements.length} achievements for user ${userId}`);
      return unlockedAchievements;
      
    } catch (error) {
      logger.error('Error checking achievements:', error);
      throw error;
    }
  }
  
  /**
   * Check if a specific achievement condition is met
   */
  async checkAchievementCondition(achievement, userId, assessment, updatedScores, userProgress) {
    const criteria = achievement.unlock_criteria;
    
    switch (achievement.achievement_code) {
      case 'FIRST_NEGOTIATION':
        return this.checkFirstNegotiation(userProgress);
        
      case 'DEAL_MAKER_5':
        return this.checkSuccessfulDeals(userId, 5);
        
      case 'DEAL_MAKER_10':
        return this.checkSuccessfulDeals(userId, 10);
        
      case 'DEAL_MAKER_25':
        return this.checkSuccessfulDeals(userId, 25);
        
      case 'CONSISTENT_PERFORMER':
        return this.checkConsistentPerformance(userId, updatedScores);
        
      case 'STREAK_WARRIOR_7':
        return this.checkPracticeStreak(userProgress, 7);
        
      case 'STREAK_WARRIOR_30':
        return this.checkPracticeStreak(userProgress, 30);
        
      case 'SKILL_BREAKTHROUGH_70':
        return this.checkSkillBreakthrough(updatedScores, 70);
        
      case 'SKILL_BREAKTHROUGH_85':
        return this.checkSkillBreakthrough(updatedScores, 85);
        
      case 'MASTER_NEGOTIATOR':
        return this.checkMasterNegotiator(updatedScores, userProgress);
        
      case 'VALUE_CREATOR':
        return this.checkValueCreator(updatedScores);
        
      case 'RELATIONSHIP_BUILDER':
        return this.checkRelationshipBuilder(updatedScores);
        
      case 'CLAIMING_EXPERT':
        return this.checkClaimingExpert(updatedScores);
        
      case 'IMPROVEMENT_CHAMPION':
        return this.checkImprovementChampion(userId, updatedScores);
        
      case 'SCENARIO_EXPLORER':
        return this.checkScenarioExplorer(userId, 5);
        
      case 'MARATHON_NEGOTIATOR':
        return this.checkMarathonNegotiator(assessment);
        
      case 'PERFECT_SCORE':
        return this.checkPerfectScore(updatedScores);
        
      case 'COMEBACK_KING':
        return this.checkComeback(userId, updatedScores);
        
      default:
        // Generic condition checking
        return this.checkGenericCondition(criteria, userId, assessment, updatedScores, userProgress);
    }
  }
  
  // Achievement condition checkers
  
  checkFirstNegotiation(userProgress) {
    return userProgress.total_conversations === 1;
  }
  
  async checkSuccessfulDeals(userId, targetCount) {
    const dealCount = await db('conversation_sessions')
      .where('user_id', userId)
      .where('deal_reached', true)
      .count('* as count')
      .first();
    
    return dealCount.count >= targetCount;
  }
  
  checkConsistentPerformance(userId, updatedScores) {
    // Consistent performance = consistency score > 85 and at least 5 sessions
    return updatedScores.consistency_score > 85 && 
           updatedScores.overall && 
           updatedScores.overall.rolling_average >= 70;
  }
  
  checkPracticeStreak(userProgress, targetDays) {
    return userProgress.streak_days >= targetDays;
  }
  
  checkSkillBreakthrough(updatedScores, threshold) {
    return Object.values(updatedScores).some(skill => 
      skill.current_score && skill.current_score >= threshold && skill.is_new_best
    );
  }
  
  checkMasterNegotiator(updatedScores, userProgress) {
    return updatedScores.overall.rolling_average >= 90 && 
           userProgress.total_conversations >= 20 &&
           userProgress.consistency_score >= 80;
  }
  
  checkValueCreator(updatedScores) {
    return updatedScores.creating_value && 
           updatedScores.creating_value.rolling_average >= 85 &&
           updatedScores.creating_value.is_new_best;
  }
  
  checkRelationshipBuilder(updatedScores) {
    return updatedScores.relationship && 
           updatedScores.relationship.rolling_average >= 85 &&
           updatedScores.relationship.is_new_best;
  }
  
  checkClaimingExpert(updatedScores) {
    return updatedScores.claiming_value && 
           updatedScores.claiming_value.rolling_average >= 85 &&
           updatedScores.claiming_value.is_new_best;
  }
  
  async checkImprovementChampion(userId, updatedScores) {
    // Check if user improved by 20+ points in any skill over last 5 sessions
    const recentHistory = await db('skill_history')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(5);
    
    if (recentHistory.length < 5) return false;
    
    const skillGroups = {};
    recentHistory.forEach(h => {
      if (!skillGroups[h.skill_dimension]) {
        skillGroups[h.skill_dimension] = [];
      }
      skillGroups[h.skill_dimension].push(h.current_score);
    });
    
    for (const [skill, scores] of Object.entries(skillGroups)) {
      if (scores.length >= 5) {
        const improvement = scores[0] - scores[scores.length - 1]; // Latest - oldest
        if (improvement >= 20) return true;
      }
    }
    
    return false;
  }
  
  async checkScenarioExplorer(userId, targetCount) {
    const scenarioCount = await db('conversation_assessments')
      .where('user_id', userId)
      .distinct('scenario_id')
      .count('* as count')
      .first();
    
    return scenarioCount.count >= targetCount;
  }
  
  checkMarathonNegotiator(assessment) {
    // Marathon = conversation longer than 30 minutes
    return assessment.conversation_metadata && 
           assessment.conversation_metadata.duration_seconds > 1800;
  }
  
  checkPerfectScore(updatedScores) {
    return Object.values(updatedScores).some(skill => 
      skill.current_score === 100
    );
  }
  
  async checkComeback(userId, updatedScores) {
    // Comeback = score increased by 15+ points from lowest in last 3 sessions
    const recentHistory = await db('skill_history')
      .where('user_id', userId)
      .where('skill_dimension', 'overall')
      .orderBy('created_at', 'desc')
      .limit(3);
    
    if (recentHistory.length < 3) return false;
    
    const scores = recentHistory.map(h => h.current_score);
    const lowestScore = Math.min(...scores);
    const latestScore = scores[0];
    
    return latestScore - lowestScore >= 15;
  }
  
  checkGenericCondition(criteria, userId, assessment, updatedScores, userProgress) {
    // Handle generic criteria-based achievements
    if (!criteria) return false;
    
    try {
      // Example criteria format:
      // { "skill": "overall", "threshold": 80, "type": "rolling_average" }
      
      if (criteria.skill && criteria.threshold && criteria.type) {
        const skillData = updatedScores[criteria.skill];
        if (!skillData) return false;
        
        switch (criteria.type) {
          case 'rolling_average':
            return skillData.rolling_average >= criteria.threshold;
          case 'current_score':
            return skillData.current_score >= criteria.threshold;
          case 'best_score':
            return skillData.best_score >= criteria.threshold;
          case 'improvement':
            return skillData.current_score - skillData.previous_score >= criteria.threshold;
        }
      }
      
      return false;
    } catch (error) {
      logger.error('Error checking generic achievement condition:', error);
      return false;
    }
  }
  
  /**
   * Unlock an achievement for a user
   */
  async unlockAchievement(userId, achievementId, assessmentId, updatedScores) {
    const triggerScore = updatedScores.overall ? updatedScores.overall.current_score : 0;
    
    await db('user_achievements').insert({
      id: db.raw('gen_random_uuid()'),
      user_id: userId,
      achievement_id: achievementId,
      conversation_assessment_id: assessmentId,
      trigger_score: triggerScore,
      unlock_context: JSON.stringify({
        session_scores: updatedScores,
        timestamp: new Date().toISOString()
      }),
      is_new: true
    });
    
    logger.info(`Achievement unlocked: ${achievementId} for user ${userId}`);
  }
  
  /**
   * Initialize default achievements in the system
   */
  async initializeDefaultAchievements() {
    const defaultAchievements = [
      {
        achievement_code: 'FIRST_NEGOTIATION',
        name: 'First Steps',
        description: 'Complete your first negotiation session',
        category: 'progression',
        unlock_criteria: { type: 'first_session' },
        points_value: 10,
        rarity: 'common',
        is_active: true,
        display_order: 1
      },
      {
        achievement_code: 'DEAL_MAKER_5',
        name: 'Deal Maker',
        description: 'Successfully reach 5 deals',
        category: 'progression',
        unlock_criteria: { type: 'successful_deals', target: 5 },
        points_value: 25,
        rarity: 'common',
        is_active: true,
        display_order: 10
      },
      {
        achievement_code: 'DEAL_MAKER_10',
        name: 'Seasoned Negotiator',
        description: 'Successfully reach 10 deals',
        category: 'progression',
        unlock_criteria: { type: 'successful_deals', target: 10 },
        points_value: 50,
        rarity: 'rare',
        is_active: true,
        display_order: 11
      },
      {
        achievement_code: 'DEAL_MAKER_25',
        name: 'Master Deal Maker',
        description: 'Successfully reach 25 deals',
        category: 'progression',
        unlock_criteria: { type: 'successful_deals', target: 25 },
        points_value: 100,
        rarity: 'epic',
        is_active: true,
        display_order: 12
      },
      {
        achievement_code: 'STREAK_WARRIOR_7',
        name: 'Streak Warrior',
        description: 'Maintain a 7-day practice streak',
        category: 'consistency',
        unlock_criteria: { type: 'practice_streak', target: 7 },
        points_value: 30,
        rarity: 'rare',
        is_active: true,
        display_order: 20
      },
      {
        achievement_code: 'STREAK_WARRIOR_30',
        name: 'Dedication Master',
        description: 'Maintain a 30-day practice streak',
        category: 'consistency',
        unlock_criteria: { type: 'practice_streak', target: 30 },
        points_value: 150,
        rarity: 'legendary',
        is_active: true,
        display_order: 21
      },
      {
        achievement_code: 'SKILL_BREAKTHROUGH_70',
        name: 'Breakthrough',
        description: 'Achieve a score of 70+ in any skill',
        category: 'mastery',
        unlock_criteria: { type: 'skill_score', threshold: 70 },
        points_value: 40,
        rarity: 'rare',
        is_active: true,
        display_order: 30
      },
      {
        achievement_code: 'SKILL_BREAKTHROUGH_85',
        name: 'Excellence',
        description: 'Achieve a score of 85+ in any skill',
        category: 'mastery',
        unlock_criteria: { type: 'skill_score', threshold: 85 },
        points_value: 75,
        rarity: 'epic',
        is_active: true,
        display_order: 31
      },
      {
        achievement_code: 'PERFECT_SCORE',
        name: 'Perfection',
        description: 'Achieve a perfect score of 100 in any skill',
        category: 'mastery',
        unlock_criteria: { type: 'perfect_score' },
        points_value: 200,
        rarity: 'legendary',
        is_active: true,
        display_order: 32
      },
      {
        achievement_code: 'VALUE_CREATOR',
        name: 'Value Creator',
        description: 'Excel at creating mutual value (85+ average)',
        category: 'mastery',
        skill_dimension: 'creating_value',
        unlock_criteria: { skill: 'creating_value', threshold: 85, type: 'rolling_average' },
        points_value: 60,
        rarity: 'epic',
        is_active: true,
        display_order: 40
      },
      {
        achievement_code: 'RELATIONSHIP_BUILDER',
        name: 'Relationship Builder',
        description: 'Master relationship management (85+ average)',
        category: 'mastery',
        skill_dimension: 'relationship',
        unlock_criteria: { skill: 'relationship', threshold: 85, type: 'rolling_average' },
        points_value: 60,
        rarity: 'epic',
        is_active: true,
        display_order: 41
      },
      {
        achievement_code: 'CLAIMING_EXPERT',
        name: 'Value Claimer',
        description: 'Master value claiming techniques (85+ average)',
        category: 'mastery',
        skill_dimension: 'claiming_value',
        unlock_criteria: { skill: 'claiming_value', threshold: 85, type: 'rolling_average' },
        points_value: 60,
        rarity: 'epic',
        is_active: true,
        display_order: 42
      },
      {
        achievement_code: 'MASTER_NEGOTIATOR',
        name: 'Master Negotiator',
        description: 'Achieve mastery across all skills (90+ overall, 20+ sessions)',
        category: 'mastery',
        unlock_criteria: { 
          skill: 'overall', 
          threshold: 90, 
          type: 'rolling_average',
          min_sessions: 20,
          consistency_required: 80
        },
        points_value: 300,
        rarity: 'legendary',
        is_active: true,
        display_order: 50
      },
      {
        achievement_code: 'IMPROVEMENT_CHAMPION',
        name: 'Improvement Champion',
        description: 'Improve by 20+ points in any skill over 5 sessions',
        category: 'special',
        unlock_criteria: { type: 'improvement', threshold: 20, sessions: 5 },
        points_value: 80,
        rarity: 'epic',
        is_active: true,
        display_order: 60
      },
      {
        achievement_code: 'COMEBACK_KING',
        name: 'Comeback King',
        description: 'Recover from a low score with a 15+ point improvement',
        category: 'special',
        unlock_criteria: { type: 'comeback', threshold: 15 },
        points_value: 50,
        rarity: 'rare',
        is_active: true,
        display_order: 61
      }
    ];
    
    for (const achievement of defaultAchievements) {
      // Check if achievement already exists
      const existing = await db('achievement_definitions')
        .where('achievement_code', achievement.achievement_code)
        .first();
      
      if (!existing) {
        await db('achievement_definitions').insert({
          id: db.raw('gen_random_uuid()'),
          ...achievement,
          unlock_criteria: JSON.stringify(achievement.unlock_criteria)
        });
        
        logger.info(`Created achievement: ${achievement.name}`);
      }
    }
  }
  
  /**
   * Get achievement progress for a specific user
   */
  async getAchievementProgress(userId) {
    const achievements = await db('achievement_definitions as ad')
      .leftJoin('user_achievements as ua', function() {
        this.on('ad.id', '=', 'ua.achievement_id')
            .andOn('ua.user_id', '=', db.raw('?', [userId]));
      })
      .select(
        'ad.*',
        'ua.unlocked_at',
        'ua.is_new',
        'ua.trigger_score'
      )
      .where('ad.is_active', true)
      .orderBy('ad.display_order');
    
    return achievements.map(achievement => ({
      ...achievement,
      unlocked: !!achievement.unlocked_at,
      unlock_criteria: JSON.parse(achievement.unlock_criteria || '{}')
    }));
  }
}

module.exports = new AchievementService();