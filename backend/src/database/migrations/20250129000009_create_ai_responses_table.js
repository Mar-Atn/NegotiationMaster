exports.up = function (knex) {
  return knex.schema.createTable('ai_responses', function (table) {
    table.string('id').primary()
    table.string('negotiation_id').references('id').inTable('negotiations').onDelete('CASCADE')
    table.string('message_id').references('id').inTable('messages').onDelete('CASCADE')
    table.string('ai_character_id').references('id').inTable('ai_characters').onDelete('CASCADE')
    table.text('user_message').notNullable() // The message AI is responding to
    table.text('ai_response').notNullable() // AI's generated response
    table.text('context_analysis').notNullable() // JSON string - AI's analysis of negotiation state
    table.text('decision_factors').notNullable() // JSON string - What influenced the response
    table.string('response_type') // 'offer', 'counteroffer', 'question', 'statement', 'acceptance', 'rejection'
    table.decimal('confidence_score', 3, 2) // 0.00 to 1.00
    table.integer('generation_time_ms') // Response generation time
    table.text('openai_metadata') // JSON string - Token usage, model version, etc.
    table.timestamps(true, true)
    
    table.index(['negotiation_id'])
    table.index(['ai_character_id'])
    table.index(['response_type'])
    table.index(['created_at'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('ai_responses')
}