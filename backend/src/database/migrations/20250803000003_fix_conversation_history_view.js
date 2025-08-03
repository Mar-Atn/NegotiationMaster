/**
 * Fix conversation history view - correct column names
 * @param { import("knex").Knex } knex  
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.raw('DROP VIEW IF EXISTS conversation_history')
    .then(function() {
      // Recreate the conversation history view with correct column names
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
          s.difficulty_level as scenario_difficulty,
          s.estimated_duration_minutes as estimated_duration,
          
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
          SUBSTR(ca.conversation_transcript, 1, 200) as transcript_preview,
          
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
  return knex.raw('DROP VIEW IF EXISTS conversation_history');
};