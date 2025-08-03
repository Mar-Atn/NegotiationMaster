/**
 * Enhanced User Progress Tracking - Persistent Progress and History Infrastructure
 * Provides comprehensive skill tracking, conversation history, and achievement milestones
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // Enhanced user progress table
    .alterTable('user_progress', function(table) {
      // Add new skill tracking columns
      table.decimal('best_claiming_value_score', 5, 2).defaultTo(0);
      table.decimal('best_creating_value_score', 5, 2).defaultTo(0);
      table.decimal('best_managing_relationships_score', 5, 2).defaultTo(0);
      table.decimal('best_overall_score', 5, 2).defaultTo(0);
      
      // Progression tracking
      table.decimal('claiming_value_trend', 5, 2).defaultTo(0); // Rate of improvement
      table.decimal('creating_value_trend', 5, 2).defaultTo(0);
      table.decimal('relationship_trend', 5, 2).defaultTo(0);
      table.decimal('overall_trend', 5, 2).defaultTo(0);
      
      // Session tracking
      table.integer('total_conversations').defaultTo(0);
      table.integer('sessions_this_week').defaultTo(0);
      table.integer('sessions_this_month').defaultTo(0);
      table.timestamp('first_session_date').nullable();
      table.timestamp('last_score_update').nullable();
      
      // Achievement tracking
      table.integer('achievements_unlocked').defaultTo(0);
      table.integer('milestones_reached').defaultTo(0);
      table.json('skill_badges').nullable(); // Array of earned badges
      
      // Performance metrics
      table.decimal('consistency_score', 5, 2).defaultTo(0); // How consistent performance is
      table.decimal('improvement_velocity', 5, 2).defaultTo(0); // Speed of improvement
      table.integer('streak_days').defaultTo(0); // Current practice streak
      table.integer('longest_streak').defaultTo(0);
      
      // Add indexes for performance
      table.index(['best_overall_score']);
      table.index(['improvement_velocity']);
      table.index(['streak_days']);
      table.index(['last_score_update']);
    })
    .then(function() {
      // Create skill history table for tracking progression over time
      return knex.schema.createTable('skill_history', function(table) {
        table.uuid('id').primary();
        table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('conversation_assessment_id').references('id').inTable('conversation_assessments').onDelete('CASCADE');
        
        // Skill dimension tracking
        table.string('skill_dimension'); // claiming_value, creating_value, relationship, overall
        table.decimal('current_score', 5, 2);
        table.decimal('previous_score', 5, 2).nullable();
        table.decimal('score_change', 5, 2).defaultTo(0);
        table.decimal('rolling_average', 5, 2).nullable(); // Last 10 sessions average
        
        // Context information
        table.string('scenario_id').references('id').inTable('scenarios');
        table.string('scenario_difficulty').nullable(); // beginner, intermediate, advanced, expert
        table.integer('session_number'); // User's nth conversation
        table.text('improvement_notes').nullable();
        
        // Milestone tracking
        table.boolean('new_personal_best').defaultTo(false);
        table.boolean('milestone_achieved').defaultTo(false);
        table.string('milestone_type').nullable(); // breakthrough, consistency, mastery, etc.
        
        table.timestamps(true, true);
        
        // Indexes for efficient queries
        table.index(['user_id', 'skill_dimension', 'created_at']);
        table.index(['user_id', 'session_number']);
        table.index(['new_personal_best']);
        table.index(['milestone_achieved']);
      });
    })
    .then(function() {
      // Create achievement definitions table
      return knex.schema.createTable('achievement_definitions', function(table) {
        table.uuid('id').primary();
        table.string('achievement_code').unique(); // FIRST_NEGOTIATION, STREAK_7_DAYS, etc.
        table.string('name');
        table.text('description');
        table.string('category'); // progression, consistency, mastery, special
        table.string('skill_dimension').nullable(); // null for general achievements
        
        // Unlock criteria
        table.json('unlock_criteria'); // Complex conditions for unlocking
        table.integer('points_value').defaultTo(0);
        table.string('badge_icon').nullable();
        table.string('rarity'); // common, rare, epic, legendary
        
        // Display configuration
        table.boolean('is_active').defaultTo(true);
        table.integer('display_order').defaultTo(0);
        table.boolean('is_hidden').defaultTo(false); // Secret achievements
        
        table.timestamps(true, true);
        
        table.index(['category']);
        table.index(['skill_dimension']);
        table.index(['is_active']);
      });
    })
    .then(function() {
      // Create user achievements table
      return knex.schema.createTable('user_achievements', function(table) {
        table.uuid('id').primary();
        table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('achievement_id').references('id').inTable('achievement_definitions').onDelete('CASCADE');
        table.uuid('conversation_assessment_id').references('id').inTable('conversation_assessments').onDelete('SET NULL');
        
        // Achievement details
        table.timestamp('unlocked_at').defaultTo(knex.fn.now());
        table.json('unlock_context').nullable(); // What triggered the achievement
        table.decimal('trigger_score', 5, 2).nullable(); // Score that unlocked it
        table.boolean('is_new').defaultTo(true); // Has user seen this achievement?
        
        // Progress tracking (for progressive achievements)
        table.integer('progress_current').defaultTo(0);
        table.integer('progress_target').nullable();
        table.decimal('progress_percentage', 5, 2).defaultTo(0);
        
        table.timestamps(true, true);
        
        // Unique constraint - user can only unlock each achievement once
        table.unique(['user_id', 'achievement_id']);
        table.index(['user_id', 'unlocked_at']);
        table.index(['is_new']);
      });
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('user_achievements')
    .dropTableIfExists('achievement_definitions')  
    .dropTableIfExists('skill_history')
    .then(function() {
      // Remove added columns from user_progress table
      return knex.schema.alterTable('user_progress', function(table) {
        table.dropColumn('best_claiming_value_score');
        table.dropColumn('best_creating_value_score');
        table.dropColumn('best_managing_relationships_score');
        table.dropColumn('best_overall_score');
        table.dropColumn('claiming_value_trend');
        table.dropColumn('creating_value_trend');
        table.dropColumn('relationship_trend');
        table.dropColumn('overall_trend');
        table.dropColumn('total_conversations');
        table.dropColumn('sessions_this_week');
        table.dropColumn('sessions_this_month');
        table.dropColumn('first_session_date');
        table.dropColumn('last_score_update');
        table.dropColumn('achievements_unlocked');
        table.dropColumn('milestones_reached');
        table.dropColumn('skill_badges');
        table.dropColumn('consistency_score');
        table.dropColumn('improvement_velocity');
        table.dropColumn('streak_days');
        table.dropColumn('longest_streak');
      });
    });
};