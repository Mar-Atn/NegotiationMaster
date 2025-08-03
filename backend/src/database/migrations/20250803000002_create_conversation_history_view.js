/**
 * Conversation History View - Comprehensive conversation tracking and export
 * Creates views and tables for complete conversation history management
 * @param { import("knex").Knex } knex  
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    // First create conversation sessions table for better organization
    .createTable('conversation_sessions', function(table) {
      table.uuid('id').primary();
      table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('negotiation_id').references('id').inTable('negotiations').onDelete('CASCADE');
      table.uuid('assessment_id').references('id').inTable('conversation_assessments').onDelete('SET NULL');
      
      // Session metadata
      table.string('session_title').nullable();
      table.text('session_notes').nullable();
      table.string('session_type').defaultTo('practice'); // practice, assessment, challenge
      table.string('difficulty_level').nullable(); // beginner, intermediate, advanced, expert
      
      // Timing information
      table.timestamp('session_started').defaultTo(knex.fn.now());
      table.timestamp('session_ended').nullable();
      table.integer('duration_seconds').nullable();
      table.integer('total_messages').defaultTo(0);
      table.integer('user_messages').defaultTo(0);
      table.integer('ai_messages').defaultTo(0);
      
      // Performance summary
      table.decimal('session_score', 5, 2).nullable();
      table.boolean('deal_reached').defaultTo(false);
      table.text('deal_summary').nullable();
      table.json('key_moments').nullable(); // Important conversation turns
      
      // Export and sharing
      table.boolean('is_bookmarked').defaultTo(false);
      table.boolean('is_shareable').defaultTo(false);
      table.timestamp('last_exported').nullable();
      table.json('export_history').nullable(); // Track export events
      
      table.timestamps(true, true);
      
      // Indexes for efficient queries
      table.index(['user_id', 'session_started']);
      table.index(['session_type', 'difficulty_level']);
      table.index(['is_bookmarked']);
      table.index(['deal_reached']);
    })
    .then(function() {
      // Create conversation exports table for tracking exports
      return knex.schema.createTable('conversation_exports', function(table) {
        table.uuid('id').primary();
        table.string('user_id').references('id').inTable('users').onDelete('CASCADE');
        table.uuid('session_id').references('id').inTable('conversation_sessions').onDelete('CASCADE');
        
        // Export details
        table.string('export_type'); // pdf, json, txt, summary
        table.string('export_format'); // full_transcript, summary_only, assessment_only
        table.json('export_options').nullable(); // Include scores, timestamps, etc.
        table.text('file_path').nullable(); // Where the export is stored
        table.integer('file_size_bytes').nullable();
        
        // Export metadata
        table.timestamp('exported_at').defaultTo(knex.fn.now());
        table.string('export_status').defaultTo('pending'); // pending, completed, failed
        table.text('export_notes').nullable();
        table.timestamp('expires_at').nullable(); // For temporary exports
        
        table.timestamps(true, true);
        
        table.index(['user_id', 'exported_at']);
        table.index(['export_status']);
        table.index(['export_type']);
      });
    })
    .then(function() {
      // Create the main conversation history view
      return knex.raw(`
        CREATE VIEW conversation_history AS
        SELECT 
          cs.id as conversation_id,
          cs.user_id,
          cs.session_title,
          cs.session_type,
          cs.difficulty_level,
          
          -- Scenario information
          s.id as scenario_id,
          s.title as scenario_name,
          s.difficulty as scenario_difficulty,
          s.estimated_duration,
          
          -- Character information  
          ac.id as character_id,
          ac.name as character_name,
          ac.role as character_role,
          
          -- Timing information
          cs.session_started as conversation_date,
          cs.duration_seconds as duration,
          cs.total_messages,
          cs.user_messages,
          cs.ai_messages,
          
          -- Performance data
          cs.session_score as overall_score,
          ca.claiming_value_score,
          ca.creating_value_score,
          ca.relationship_management_score,
          ca.overall_assessment_score,
          
          -- Outcome information
          cs.deal_reached,
          cs.deal_summary,
          n.deal_terms,
          
          -- Assessment details
          ca.personalized_feedback,
          ca.skill_level_achieved,
          ca.milestone_reached,
          
          -- Transcript preview (first 200 chars)
          LEFT(ca.conversation_transcript, 200) as transcript_preview,
          
          -- Flags and metadata
          cs.is_bookmarked,
          cs.is_shareable,
          cs.last_exported,
          ca.status as assessment_status,
          
          -- Timestamps
          cs.created_at,
          cs.updated_at
          
        FROM conversation_sessions cs
        LEFT JOIN negotiations n ON cs.negotiation_id = n.id
        LEFT JOIN scenarios s ON n.scenario_id = s.id
        LEFT JOIN ai_characters ac ON s.ai_character_id = ac.id
        LEFT JOIN conversation_assessments ca ON cs.assessment_id = ca.id
        ORDER BY cs.session_started DESC
      `);
    });
};

exports.down = function(knex) {
  return knex.raw('DROP VIEW IF EXISTS conversation_history')
    .then(function() {
      return knex.schema
        .dropTableIfExists('conversation_exports')
        .dropTableIfExists('conversation_sessions');
    });
};