exports.up = function (knex) {
  return knex.schema.createTable('negotiation_moves', function (table) {
    table.string('id').primary()
    table.string('negotiation_id').references('id').inTable('negotiations').onDelete('CASCADE')
    table.string('message_id').references('id').inTable('messages').onDelete('CASCADE')
    table.string('actor_type') // 'user' or 'ai_character'
    table.string('actor_id') // user_id or ai_character_id
    table.string('move_type') // 'anchor', 'concession', 'question', etc.
    table.string('move_category') // 'claiming_value', 'creating_value', 'managing_relationships'
    table.string('theory_concept') // Specific negotiation theory concept
    table.text('move_details').notNullable() // JSON string - Specific parameters of the move
    table.decimal('effectiveness_score', 3, 2) // 0.00 to 1.00 based on theory
    table.text('analysis_notes') // AI analysis of the move's quality
    table.timestamps(true, true)
    
    table.index(['negotiation_id'])
    table.index(['move_type'])
    table.index(['move_category'])
    table.index(['actor_type'])
    table.index(['created_at'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('negotiation_moves')
}