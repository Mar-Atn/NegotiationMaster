const logger = require('../config/logger');
const db = require('../config/database');
const achievementService = require('./achievementService');

/**
 * Progress Calculation Service
 * Handles skill progression calculation, trend analysis, and automatic progress updates
 */
class ProgressCalculationService {
  
  /**
   * Update user progress after a conversation assessment
   * This is the main method called after each assessment is completed
   */
  async updateUserProgress(userId, assessmentId) {
    try {
      logger.info(`Updating progress for user ${userId} with assessment ${assessmentId}`);
      
      // Get the assessment data
      const assessment = await db('conversation_assessments')
        .where('id', assessmentId)
        .where('user_id', userId)
        .first();
      
      if (!assessment || assessment.status !== 'completed') {
        throw new Error('Assessment not found or not completed');
      }
      
      // Get or create user progress record
      let userProgress = await db('user_progress')
        .where('user_id', userId)
        .first();
      
      if (!userProgress) {
        userProgress = await this.createInitialProgress(userId);
      }
      
      // Calculate new scores and trends
      const updatedScores = await this.calculateUpdatedScores(userId, assessment, userProgress);
      
      // Update skill history
      await this.updateSkillHistory(userId, assessment, updatedScores);
      
      // Update main progress record
      await this.updateMainProgress(userId, updatedScores);
      
      // Check for achievements and milestones
      await achievementService.checkAchievements(userId, assessment, updatedScores);
      
      // Update session counters
      await this.updateSessionCounters(userId);
      
      logger.info(`Progress updated successfully for user ${userId}`);
      return updatedScores;
      
    } catch (error) {
      logger.error('Error updating user progress:', error);
      throw error;
    }
  }
  
  /**
   * Calculate rolling averages and trends for skill scores
   */
  async calculateUpdatedScores(userId, assessment, currentProgress) {
    const sessionHistory = await db('skill_history')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(10); // Last 10 sessions for rolling average
    
    const scores = {
      claiming_value: assessment.claiming_value_score,
      creating_value: assessment.creating_value_score,
      relationship: assessment.relationship_management_score,
      overall: assessment.overall_assessment_score
    };
    
    const updatedScores = {};
    
    for (const [skill, newScore] of Object.entries(scores)) {
      const skillHistory = sessionHistory.filter(h => h.skill_dimension === skill);
      
      // Calculate rolling average
      const recentScores = [newScore, ...skillHistory.map(h => h.current_score)].slice(0, 10);
      const rollingAverage = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length;
      
      // Calculate trend (improvement velocity)
      let trend = 0;
      if (skillHistory.length >= 2) {
        const oldestScore = skillHistory[skillHistory.length - 1].current_score;
        const sessionsSpan = skillHistory.length;
        trend = (newScore - oldestScore) / sessionsSpan;
      }
      
      // Determine best score
      const currentBestKey = `best_${skill === 'overall' ? 'overall' : skill}_score`;
      const currentBest = currentProgress[currentBestKey] || 0;
      const bestScore = Math.max(newScore, currentBest);
      
      updatedScores[skill] = {
        current_score: newScore,
        rolling_average: Math.round(rollingAverage * 100) / 100,
        trend: Math.round(trend * 100) / 100,
        best_score: bestScore,
        is_new_best: newScore > currentBest,
        previous_score: currentProgress[`avg_${skill === 'overall' ? 'overall' : skill}_score`] || 0
      };
    }
    
    // Calculate consistency score (how consistent recent performance is)
    const overallScores = sessionHistory
      .filter(h => h.skill_dimension === 'overall')
      .map(h => h.current_score)
      .slice(0, 5);
    
    if (overallScores.length >= 3) {
      const avg = overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length;
      const variance = overallScores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / overallScores.length;
      const standardDeviation = Math.sqrt(variance);
      
      // Lower standard deviation = higher consistency (invert and normalize to 0-100)
      const consistencyScore = Math.max(0, 100 - (standardDeviation * 2));
      updatedScores.consistency_score = Math.round(consistencyScore * 100) / 100;
    }
    
    // Calculate improvement velocity (overall trend across all skills)
    const allTrends = Object.values(updatedScores).map(s => s.trend).filter(t => !isNaN(t));
    if (allTrends.length > 0) {
      const avgTrend = allTrends.reduce((sum, trend) => sum + trend, 0) / allTrends.length;
      updatedScores.improvement_velocity = Math.round(avgTrend * 100) / 100;
    }
    
    return updatedScores;
  }
  
  /**
   * Update skill history table with new assessment data
   */
  async updateSkillHistory(userId, assessment, updatedScores) {
    const sessionNumber = await this.getNextSessionNumber(userId);
    const scenarioInfo = await db('scenarios')
      .where('id', assessment.scenario_id)
      .select('difficulty')
      .first();
    
    const historyEntries = [];
    
    for (const [skill, scoreData] of Object.entries(updatedScores)) {
      if (skill === 'consistency_score' || skill === 'improvement_velocity') continue;
      
      historyEntries.push({
        id: db.raw('gen_random_uuid()'),
        user_id: userId,
        conversation_assessment_id: assessment.id,
        skill_dimension: skill,
        current_score: scoreData.current_score,
        previous_score: scoreData.previous_score,
        score_change: scoreData.current_score - scoreData.previous_score,
        rolling_average: scoreData.rolling_average,
        scenario_id: assessment.scenario_id,
        scenario_difficulty: scenarioInfo?.difficulty || 'unknown',
        session_number: sessionNumber,
        new_personal_best: scoreData.is_new_best,
        milestone_achieved: false // Will be updated by achievement service
      });
    }
    
    await db('skill_history').insert(historyEntries);
  }
  
  /**
   * Update main user progress record
   */
  async updateMainProgress(userId, updatedScores) {
    const updateData = {
      avg_claiming_value_score: updatedScores.claiming_value.rolling_average,
      avg_creating_value_score: updatedScores.creating_value.rolling_average,
      avg_managing_relationships_score: updatedScores.relationship.rolling_average,
      avg_overall_score: updatedScores.overall.rolling_average,
      
      best_claiming_value_score: updatedScores.claiming_value.best_score,
      best_creating_value_score: updatedScores.creating_value.best_score,
      best_managing_relationships_score: updatedScores.relationship.best_score,
      best_overall_score: updatedScores.overall.best_score,
      
      claiming_value_trend: updatedScores.claiming_value.trend,
      creating_value_trend: updatedScores.creating_value.trend,
      relationship_trend: updatedScores.relationship.trend,
      overall_trend: updatedScores.overall.trend,
      
      consistency_score: updatedScores.consistency_score || 0,
      improvement_velocity: updatedScores.improvement_velocity || 0,
      
      last_score_update: new Date(),
      last_activity: new Date()
    };
    
    // Increment conversation counters
    await db('user_progress')
      .where('user_id', userId)
      .update(updateData)
      .increment('total_conversations', 1)
      .increment('completed_negotiations', 1);
  }
  
  /**
   * Update session counters (daily, weekly, monthly)
   */
  async updateSessionCounters(userId) {
    const now = new Date();
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Count sessions this week
    const sessionsThisWeek = await db('conversation_assessments')
      .where('user_id', userId)
      .where('completed_at', '>=', weekStart)
      .count('* as count')
      .first();
    
    // Count sessions this month  
    const sessionsThisMonth = await db('conversation_assessments')
      .where('user_id', userId)
      .where('completed_at', '>=', monthStart)
      .count('* as count')
      .first();
    
    // Update streak information
    const streakInfo = await this.calculateStreakDays(userId);
    
    await db('user_progress')
      .where('user_id', userId)
      .update({
        sessions_this_week: sessionsThisWeek.count,
        sessions_this_month: sessionsThisMonth.count,
        streak_days: streakInfo.current_streak,
        longest_streak: Math.max(streakInfo.current_streak, streakInfo.longest_streak || 0)
      });
  }
  
  /**
   * Calculate user's current practice streak
   */
  async calculateStreakDays(userId) {
    const dailySessions = await db('conversation_assessments')
      .where('user_id', userId)
      .where('status', 'completed')
      .select(db.raw('DATE(completed_at) as session_date'))
      .groupBy(db.raw('DATE(completed_at)'))
      .orderBy('session_date', 'desc')
      .limit(365); // Look back up to 1 year
    
    if (dailySessions.length === 0) {
      return { current_streak: 0, longest_streak: 0 };
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let expectedDate = new Date(today);
    
    for (const session of dailySessions) {
      const sessionDate = new Date(session.session_date);
      sessionDate.setHours(0, 0, 0, 0);
      
      if (sessionDate.getTime() === expectedDate.getTime()) {
        tempStreak++;
        if (currentStreak === 0) currentStreak = tempStreak; // First streak is current
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else if (sessionDate.getTime() < expectedDate.getTime()) {
        // Gap in streak
        longestStreak = Math.max(longestStreak, tempStreak);
        if (currentStreak === 0) currentStreak = 0; // No current streak
        tempStreak = 1;
        expectedDate = new Date(sessionDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak);
    
    // If user didn't practice today or yesterday, current streak is 0
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const latestSession = new Date(dailySessions[0].session_date);
    latestSession.setHours(0, 0, 0, 0);
    
    if (latestSession.getTime() < yesterday.getTime()) {
      currentStreak = 0;
    }
    
    return { current_streak: currentStreak, longest_streak: longestStreak };
  }
  
  /**
   * Create initial progress record for new user
   */
  async createInitialProgress(userId) {
    const initialProgress = {
      id: db.raw('gen_random_uuid()'),
      user_id: userId,
      total_negotiations: 0,
      completed_negotiations: 0,
      successful_deals: 0,
      avg_claiming_value_score: 50.0,
      avg_creating_value_score: 50.0,
      avg_managing_relationships_score: 50.0,
      avg_overall_score: 50.0,
      best_claiming_value_score: 50.0,
      best_creating_value_score: 50.0,
      best_managing_relationships_score: 50.0,
      best_overall_score: 50.0,
      claiming_value_trend: 0,
      creating_value_trend: 0,
      relationship_trend: 0,
      overall_trend: 0,
      total_conversations: 0,
      sessions_this_week: 0,
      sessions_this_month: 0,
      first_session_date: new Date(),
      achievements_unlocked: 0,
      milestones_reached: 0,
      consistency_score: 0,
      improvement_velocity: 0,
      streak_days: 0,
      longest_streak: 0,
      last_activity: new Date()
    };
    
    await db('user_progress').insert(initialProgress);
    return initialProgress;
  }
  
  /**
   * Get next session number for user
   */
  async getNextSessionNumber(userId) {
    const result = await db('skill_history')
      .where('user_id', userId)
      .max('session_number as max_session')
      .first();
    
    return (result.max_session || 0) + 1;
  }
  
  /**
   * Recalculate all progress data for a user (admin function)
   */
  async recalculateUserProgress(userId) {
    try {
      logger.info(`Recalculating all progress for user ${userId}`);
      
      // Get all completed assessments in chronological order
      const assessments = await db('conversation_assessments')
        .where('user_id', userId)
        .where('status', 'completed')
        .orderBy('completed_at', 'asc');
      
      // Clear existing progress data
      await db('skill_history').where('user_id', userId).del();
      await db('user_progress').where('user_id', userId).del();
      
      // Recreate progress step by step
      for (const assessment of assessments) {
        await this.updateUserProgress(userId, assessment.id);
      }
      
      logger.info(`Progress recalculation complete for user ${userId}`);
      return true;
      
    } catch (error) {
      logger.error('Error recalculating user progress:', error);
      throw error;
    }
  }
  
  /**
   * Get performance insights for a user
   */
  async getPerformanceInsights(userId, timeframeDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);
    
    const recentHistory = await db('skill_history')
      .where('user_id', userId)
      .where('created_at', '>=', cutoffDate)
      .orderBy('created_at', 'asc');
    
    const insights = {
      improvement_areas: [],
      strengths: [],
      recommendations: [],
      trends: {}
    };
    
    // Analyze trends by skill
    const skills = ['claiming_value', 'creating_value', 'relationship', 'overall'];
    
    for (const skill of skills) {
      const skillData = recentHistory.filter(h => h.skill_dimension === skill);
      
      if (skillData.length >= 3) {
        const firstScore = skillData[0].current_score;
        const lastScore = skillData[skillData.length - 1].current_score;
        const improvement = lastScore - firstScore;
        const avgScore = skillData.reduce((sum, h) => sum + h.current_score, 0) / skillData.length;
        
        insights.trends[skill] = {
          improvement,
          average_score: Math.round(avgScore * 100) / 100,
          sessions: skillData.length,
          trend_direction: improvement > 2 ? 'improving' : improvement < -2 ? 'declining' : 'stable'
        };
        
        // Identify strengths and improvement areas
        if (avgScore >= 80) {
          insights.strengths.push({
            skill: skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
            score: avgScore,
            reason: 'Consistently high performance'
          });
        } else if (avgScore < 60) {
          insights.improvement_areas.push({
            skill: skill.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),  
            score: avgScore,
            recommendation: this.getSkillRecommendation(skill, avgScore)
          });
        }
      }
    }
    
    // Generate general recommendations
    if (recentHistory.length < 5) {
      insights.recommendations.push({
        type: 'practice_frequency',
        message: 'Consider practicing more frequently to build momentum and see faster improvement.',
        priority: 'medium'
      });
    }
    
    return insights;
  }
  
  getSkillRecommendation(skill, score) {
    const recommendations = {
      claiming_value: 'Focus on identifying and articulating your value proposition more clearly. Practice quantifying benefits.',
      creating_value: 'Work on finding mutually beneficial solutions. Look for win-win opportunities in negotiations.',
      relationship: 'Develop active listening skills and show more empathy. Build rapport before discussing terms.',
      overall: 'Work on foundational negotiation skills. Consider reviewing negotiation theory and tactics.'
    };
    
    return recommendations[skill] || 'Continue practicing to improve this skill area.';
  }
}

module.exports = new ProgressCalculationService();