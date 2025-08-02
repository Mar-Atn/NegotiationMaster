exports.up = function (knex) {
  return knex.schema.createTable('user_progress', function (table) {
    table.string('id').primary()
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.integer('total_negotiations').defaultTo(0)
    table.integer('completed_negotiations').defaultTo(0)
    table.integer('successful_deals').defaultTo(0)
    table.decimal('avg_claiming_value_score', 5, 2).defaultTo(0)
    table.decimal('avg_creating_value_score', 5, 2).defaultTo(0)
    table.decimal('avg_managing_relationships_score', 5, 2).defaultTo(0)
    table.decimal('avg_overall_score', 5, 2).defaultTo(0)
    table.integer('highest_scenario_completed').defaultTo(0) // Track progression through scenarios
    table.timestamp('last_activity')
    table.timestamps(true, true)
    
    table.index(['user_id'])
    table.index(['avg_overall_score'])
    table.index(['highest_scenario_completed'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('user_progress')
}