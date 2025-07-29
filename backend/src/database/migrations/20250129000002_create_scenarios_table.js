exports.up = function (knex) {
  return knex.schema.createTable('scenarios', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.string('title').notNullable()
    table.text('description').notNullable()
    table.integer('difficulty_level').notNullable() // 1-7
    table.json('ai_character_config').notNullable() // AI character settings
    table.json('scenario_context').notNullable() // Background, stakes, constraints
    table.json('evaluation_criteria').notNullable() // Scoring rubric
    table.boolean('is_active').defaultTo(true)
    table.timestamps(true, true)
    
    table.index(['difficulty_level'])
    table.index(['is_active'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('scenarios')
}