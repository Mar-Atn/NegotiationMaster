/**
 * Sprint 1: Assessment & Feedback Engine - Core Assessment Tables
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('conversation_assessments', function(table) {
    table.uuid('id').primary()
    table.uuid('negotiation_id').references('id').inTable('negotiations').onDelete('CASCADE')
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.uuid('scenario_id').references('id').inTable('scenarios').onDelete('CASCADE')
    
    // Assessment processing metadata
    table.string('status').defaultTo('pending') // pending, processing, completed, failed
    table.timestamp('started_at').nullable()
    table.timestamp('completed_at').nullable()
    table.integer('processing_time_ms').nullable()
    
    // Raw conversation data for analysis
    table.text('conversation_transcript').nullable()
    table.json('voice_metrics').nullable() // Audio analysis data
    table.json('conversation_metadata').nullable() // Turn timing, interruptions, etc.
    
    // Assessment results
    table.float('claiming_value_score').nullable() // 0-100
    table.float('creating_value_score').nullable() // 0-100  
    table.float('relationship_management_score').nullable() // 0-100
    table.float('overall_assessment_score').nullable() // Weighted average
    
    // Detailed analysis
    table.json('negotiation_tactics_identified').nullable()
    table.json('conversation_flow_analysis').nullable()
    table.json('emotional_intelligence_metrics').nullable()
    table.json('language_pattern_analysis').nullable()
    
    // Feedback generation
    table.text('personalized_feedback').nullable()
    table.json('improvement_recommendations').nullable()
    table.json('strengths_identified').nullable()
    table.json('development_areas').nullable()
    
    // Performance tracking
    table.string('skill_level_achieved').nullable() // beginner, intermediate, advanced, expert
    table.float('performance_percentile').nullable() // Relative to other users
    table.boolean('milestone_reached').defaultTo(false)
    
    table.timestamps(true, true)
    
    // Indexes for fast queries
    table.index(['user_id', 'created_at'])
    table.index(['scenario_id', 'overall_assessment_score'])
    table.index(['status'])
    table.index(['completed_at'])
  })
  .then(function() {
    return knex.schema.createTable('assessment_milestones', function(table) {
      table.uuid('id').primary()
      table.uuid('conversation_assessment_id').references('id').inTable('conversation_assessments').onDelete('CASCADE')
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      // Milestone details
      table.string('milestone_type') // skill_breakthrough, consistency_achievement, scenario_mastery, etc.
      table.string('skill_dimension') // claiming_value, creating_value, relationship_management, overall
      table.float('threshold_value') // Score that triggered milestone
      table.text('description')
      table.json('achievement_context').nullable()
      
      // Achievement tracking
      table.timestamp('achieved_at')
      table.integer('sessions_to_achieve').nullable()
      table.boolean('first_time_achievement').defaultTo(true)
      
      table.timestamps(true, true)
      
      table.index(['user_id', 'achieved_at'])
      table.index(['milestone_type'])
      table.index(['skill_dimension'])
    })
  })
  .then(function() {
    return knex.schema.createTable('assessment_criteria', function(table) {
      table.uuid('id').primary()
      table.uuid('scenario_id').references('id').inTable('scenarios').onDelete('CASCADE')
      
      // Scenario-specific assessment configuration
      table.string('criteria_type') // claiming_value, creating_value, relationship_management
      table.json('evaluation_framework').nullable() // Specific criteria for this scenario
      table.json('scoring_weights').nullable() // How to weight different factors
      table.json('benchmark_thresholds').nullable() // Score ranges for ratings
      
      // Assessment prompts
      table.text('assessment_prompt').nullable() // AI prompt for scoring this dimension
      table.text('feedback_prompt').nullable() // AI prompt for generating feedback
      
      // Configuration
      table.boolean('is_active').defaultTo(true)
      table.float('difficulty_multiplier').defaultTo(1.0)
      table.json('special_conditions').nullable() // Scenario-specific rules
      
      table.timestamps(true, true)
      
      table.index(['scenario_id', 'criteria_type'])
      table.index(['is_active'])
    })
  })
  .then(function() {
    return knex.schema.createTable('assessment_queue_jobs', function(table) {
      table.uuid('id').primary()
      table.uuid('conversation_assessment_id').references('id').inTable('conversation_assessments').onDelete('CASCADE')
      
      // Job queue management
      table.string('job_type') // analysis, feedback_generation, milestone_check
      table.string('status').defaultTo('pending') // pending, processing, completed, failed, retrying
      table.integer('priority').defaultTo(0) // Higher number = higher priority
      table.integer('retry_count').defaultTo(0)
      table.integer('max_retries').defaultTo(3)
      
      // Job execution tracking
      table.timestamp('scheduled_at')
      table.timestamp('started_at').nullable()
      table.timestamp('completed_at').nullable()
      table.text('error_message').nullable()
      table.json('job_data').nullable() // Input data for processing
      table.json('result_data').nullable() // Output data from processing
      
      // Performance metrics
      table.integer('processing_duration_ms').nullable()
      table.string('processed_by_worker').nullable() // Worker instance identifier
      
      table.timestamps(true, true)
      
      table.index(['status', 'priority', 'scheduled_at'])
      table.index(['conversation_assessment_id'])
      table.index(['job_type'])
    })
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('assessment_queue_jobs')
    .dropTableIfExists('assessment_criteria')
    .dropTableIfExists('assessment_milestones')
    .dropTableIfExists('conversation_assessments')
}