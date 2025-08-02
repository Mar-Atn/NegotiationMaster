/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('negotiation_performance', function(table) {
    table.uuid('id').primary()
    table.uuid('negotiation_id').references('id').inTable('negotiations').onDelete('CASCADE')
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.uuid('scenario_id').references('id').inTable('scenarios').onDelete('CASCADE')
    
    // Performance dimensions
    table.float('claiming_value_score').nullable() // Competitive negotiation effectiveness (0-100)
    table.text('claiming_value_analysis').nullable()
    table.string('claiming_value_rating').nullable() // poor, average, good, excellent
    
    table.float('creating_value_score').nullable() // Collaborative problem-solving (0-100)
    table.text('creating_value_analysis').nullable()
    table.string('creating_value_rating').nullable()
    
    table.float('managing_relationships_score').nullable() // Interpersonal dynamics (0-100)
    table.text('managing_relationships_analysis').nullable()
    table.string('managing_relationships_rating').nullable()
    
    // Overall performance
    table.float('overall_score').nullable() // Weighted average (0-100)
    table.string('overall_rating').nullable() // poor, average, good, excellent
    table.text('overall_feedback').nullable()
    
    // Session metrics
    table.integer('conversation_duration_seconds').nullable()
    table.integer('turn_count').nullable()
    table.integer('interruption_count').nullable()
    table.float('speaking_time_percentage').nullable()
    
    // Advanced metrics
    table.json('conversation_analysis').nullable() // Detailed conversation analytics
    table.json('negotiation_moves').nullable() // Specific tactics and strategies used
    table.json('improvement_suggestions').nullable() // Personalized recommendations
    
    // Academic research fields
    table.string('negotiation_style_identified').nullable() // competitive, collaborative, accommodating, etc.
    table.json('personality_insights').nullable() // Big 5 traits inferred from behavior
    table.json('learning_objectives_met').nullable() // Progress on scenario-specific goals
    
    table.timestamps(true, true)
    
    // Indexes for analytics
    table.index(['user_id', 'scenario_id'])
    table.index(['overall_score'])
    table.index(['created_at'])
  })
  .then(function() {
    return knex.schema.createTable('performance_milestones', function(table) {
      table.uuid('id').primary()
      table.uuid('negotiation_performance_id').references('id').inTable('negotiation_performance').onDelete('CASCADE')
      table.string('milestone_type') // breakthrough, setback, key_moment, etc.
      table.text('description')
      table.integer('timestamp_seconds') // Time within conversation
      table.float('impact_score') // How significant this moment was (-100 to 100)
      table.json('context').nullable() // Additional context data
      table.timestamps(true, true)
      
      table.index(['negotiation_performance_id'])
    })
  })
  .then(function() {
    return knex.schema.createTable('user_performance_progress', function(table) {
      table.uuid('id').primary()
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
      
      // Skill progression tracking
      table.float('claiming_value_trend').nullable() // Trend slope over time
      table.float('creating_value_trend').nullable()
      table.float('managing_relationships_trend').nullable()
      
      // Competency levels
      table.string('current_level').nullable() // beginner, intermediate, advanced, expert
      table.json('strengths').nullable() // Identified strengths
      table.json('development_areas').nullable() // Areas for improvement
      
      // Learning path
      table.json('recommended_scenarios').nullable() // Next scenarios to attempt
      table.json('skill_priorities').nullable() // Focus areas for development
      
      // Achievements
      table.json('badges_earned').nullable() // Gamification elements
      table.integer('total_negotiations').defaultTo(0)
      table.float('average_performance').nullable()
      table.date('last_session_date').nullable()
      
      table.timestamps(true, true)
      table.unique(['user_id'])
    })
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('user_performance_progress')
    .dropTableIfExists('performance_milestones')
    .dropTableIfExists('negotiation_performance')
}