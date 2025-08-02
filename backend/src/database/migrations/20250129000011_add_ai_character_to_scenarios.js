exports.up = function (knex) {
  return knex.schema.alterTable('scenarios', function (table) {
    table.string('ai_character_id').references('id').inTable('ai_characters').onDelete('SET NULL')
    table.text('scenario_variables') // JSON string - Dynamic values for this scenario instance
    table.text('system_prompt') // Base system prompt for AI character in this scenario
    table.integer('estimated_duration_minutes') // Expected negotiation length
    table.text('success_criteria') // JSON string - What constitutes a successful negotiation
    
    table.index(['ai_character_id'])
  })
}

exports.down = function (knex) {
  return knex.schema.alterTable('scenarios', function (table) {
    table.dropColumn('ai_character_id')
    table.dropColumn('scenario_variables') 
    table.dropColumn('system_prompt')
    table.dropColumn('estimated_duration_minutes')
    table.dropColumn('success_criteria')
  })
}