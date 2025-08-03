/**
 * Seed file for achievement definitions
 * Initializes the default achievement system
 */

const { v4: uuidv4 } = require('uuid');

exports.seed = async function(knex) {
  // Clear existing entries
  await knex('achievement_definitions').del();
  
  // Insert default achievements
  const achievements = [
    {
      id: uuidv4(),
      achievement_code: 'FIRST_NEGOTIATION',
      name: 'First Steps',
      description: 'Complete your first negotiation session',
      category: 'progression',
      unlock_criteria: JSON.stringify({ type: 'first_session' }),
      points_value: 10,
      badge_icon: 'play_circle',
      rarity: 'common',
      is_active: true,
      display_order: 1,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'DEAL_MAKER_5',
      name: 'Deal Maker',
      description: 'Successfully reach 5 deals',
      category: 'progression',
      unlock_criteria: JSON.stringify({ type: 'successful_deals', target: 5 }),
      points_value: 25,
      badge_icon: 'handshake',
      rarity: 'common',
      is_active: true,
      display_order: 10,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'DEAL_MAKER_10',
      name: 'Seasoned Negotiator',
      description: 'Successfully reach 10 deals',
      category: 'progression',
      unlock_criteria: JSON.stringify({ type: 'successful_deals', target: 10 }),
      points_value: 50,
      badge_icon: 'business_center',
      rarity: 'rare',
      is_active: true,
      display_order: 11,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'DEAL_MAKER_25',
      name: 'Master Deal Maker',
      description: 'Successfully reach 25 deals',
      category: 'progression',
      unlock_criteria: JSON.stringify({ type: 'successful_deals', target: 25 }),
      points_value: 100,
      badge_icon: 'workspace_premium',
      rarity: 'epic',
      is_active: true,
      display_order: 12,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'STREAK_WARRIOR_7',
      name: 'Streak Warrior',
      description: 'Maintain a 7-day practice streak',
      category: 'consistency',
      unlock_criteria: JSON.stringify({ type: 'practice_streak', target: 7 }),
      points_value: 30,
      badge_icon: 'local_fire_department',
      rarity: 'rare',
      is_active: true,
      display_order: 20,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'STREAK_WARRIOR_30',
      name: 'Dedication Master',
      description: 'Maintain a 30-day practice streak',
      category: 'consistency',
      unlock_criteria: JSON.stringify({ type: 'practice_streak', target: 30 }),
      points_value: 150,
      badge_icon: 'military_tech',
      rarity: 'legendary',
      is_active: true,
      display_order: 21,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'SKILL_BREAKTHROUGH_70',
      name: 'Breakthrough',
      description: 'Achieve a score of 70+ in any skill',
      category: 'mastery',
      unlock_criteria: JSON.stringify({ type: 'skill_score', threshold: 70 }),
      points_value: 40,
      badge_icon: 'trending_up',
      rarity: 'rare',
      is_active: true,
      display_order: 30,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'SKILL_BREAKTHROUGH_85',
      name: 'Excellence',
      description: 'Achieve a score of 85+ in any skill',
      category: 'mastery',
      unlock_criteria: JSON.stringify({ type: 'skill_score', threshold: 85 }),
      points_value: 75,
      badge_icon: 'workspace_premium',
      rarity: 'epic',
      is_active: true,
      display_order: 31,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'PERFECT_SCORE',
      name: 'Perfection',
      description: 'Achieve a perfect score of 100 in any skill',
      category: 'mastery',
      unlock_criteria: JSON.stringify({ type: 'perfect_score' }),
      points_value: 200,
      badge_icon: 'emoji_events',
      rarity: 'legendary',
      is_active: true,
      display_order: 32,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'VALUE_CREATOR',
      name: 'Value Creator',
      description: 'Excel at creating mutual value (85+ average)',
      category: 'mastery',
      skill_dimension: 'creating_value',
      unlock_criteria: JSON.stringify({ skill: 'creating_value', threshold: 85, type: 'rolling_average' }),
      points_value: 60,
      badge_icon: 'lightbulb',
      rarity: 'epic',
      is_active: true,
      display_order: 40,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'RELATIONSHIP_BUILDER',
      name: 'Relationship Builder',
      description: 'Master relationship management (85+ average)',
      category: 'mastery',
      skill_dimension: 'relationship',
      unlock_criteria: JSON.stringify({ skill: 'relationship', threshold: 85, type: 'rolling_average' }),
      points_value: 60,
      badge_icon: 'people',
      rarity: 'epic',
      is_active: true,
      display_order: 41,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'CLAIMING_EXPERT',
      name: 'Value Claimer',
      description: 'Master value claiming techniques (85+ average)',
      category: 'mastery',
      skill_dimension: 'claiming_value',
      unlock_criteria: JSON.stringify({ skill: 'claiming_value', threshold: 85, type: 'rolling_average' }),
      points_value: 60,
      badge_icon: 'gavel',
      rarity: 'epic',
      is_active: true,
      display_order: 42,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'MASTER_NEGOTIATOR',
      name: 'Master Negotiator',
      description: 'Achieve mastery across all skills (90+ overall, 20+ sessions)',
      category: 'mastery',
      unlock_criteria: JSON.stringify({ 
        skill: 'overall', 
        threshold: 90, 
        type: 'rolling_average',
        min_sessions: 20,
        consistency_required: 80
      }),
      points_value: 300,
      badge_icon: 'workspace_premium',
      rarity: 'legendary',
      is_active: true,
      display_order: 50,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'IMPROVEMENT_CHAMPION',
      name: 'Improvement Champion',
      description: 'Improve by 20+ points in any skill over 5 sessions',
      category: 'special',
      unlock_criteria: JSON.stringify({ type: 'improvement', threshold: 20, sessions: 5 }),
      points_value: 80,
      badge_icon: 'trending_up',
      rarity: 'epic',
      is_active: true,
      display_order: 60,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'COMEBACK_KING',
      name: 'Comeback King',
      description: 'Recover from a low score with a 15+ point improvement',
      category: 'special',
      unlock_criteria: JSON.stringify({ type: 'comeback', threshold: 15 }),
      points_value: 50,
      badge_icon: 'restore',
      rarity: 'rare',
      is_active: true,
      display_order: 61,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'SCENARIO_EXPLORER',
      name: 'Scenario Explorer',
      description: 'Practice with 5 different negotiation scenarios',
      category: 'progression',
      unlock_criteria: JSON.stringify({ type: 'scenario_variety', target: 5 }),
      points_value: 35,
      badge_icon: 'explore',
      rarity: 'rare',
      is_active: true,
      display_order: 70,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'MARATHON_NEGOTIATOR',
      name: 'Marathon Negotiator',
      description: 'Complete a negotiation session longer than 30 minutes',
      category: 'special',
      unlock_criteria: JSON.stringify({ type: 'duration', threshold: 1800 }),
      points_value: 40,
      badge_icon: 'timer',
      rarity: 'rare',
      is_active: true,
      display_order: 80,
      is_hidden: false
    },
    {
      id: uuidv4(),
      achievement_code: 'CONSISTENT_PERFORMER',
      name: 'Consistent Performer',
      description: 'Maintain high consistency in your negotiation performance',
      category: 'consistency',
      unlock_criteria: JSON.stringify({ type: 'consistency', threshold: 85, min_sessions: 5 }),
      points_value: 65,
      badge_icon: 'assignment_turned_in',
      rarity: 'epic',
      is_active: true,
      display_order: 90,
      is_hidden: false
    }
  ];
  
  // Insert achievements
  await knex('achievement_definitions').insert(achievements);
  
  console.log(`✅ Seeded ${achievements.length} achievement definitions`);
};