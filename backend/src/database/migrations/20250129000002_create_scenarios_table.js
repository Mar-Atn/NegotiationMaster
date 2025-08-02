exports.up = function (knex) {
  return knex.schema.createTable('scenarios', function (table) {
    table.string('id').primary()
    table.string('title').notNullable()
    table.text('description').notNullable()
    table.integer('difficulty_level').notNullable() // 1-7
    table.text('ai_character_config').notNullable() // JSON string - AI character settings
    table.text('scenario_context').notNullable() // JSON string - Background, stakes, constraints
    table.text('evaluation_criteria').notNullable() // JSON string - Scoring rubric
    table.boolean('is_active').defaultTo(true)
    table.timestamps(true, true)
    
    table.index(['difficulty_level'])
    table.index(['is_active'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('scenarios')
}