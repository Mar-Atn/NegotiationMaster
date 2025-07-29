exports.up = function (knex) {
  return knex.schema.createTable('negotiations', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.uuid('scenario_id').references('id').inTable('scenarios').onDelete('CASCADE')
    table.enum('status', ['in_progress', 'completed', 'abandoned']).defaultTo('in_progress')
    table.timestamp('started_at').defaultTo(knex.fn.now())
    table.timestamp('completed_at')
    table.json('deal_terms') // Final deal if completed
    table.boolean('deal_reached').defaultTo(false)
    table.timestamps(true, true)
    
    table.index(['user_id'])
    table.index(['scenario_id'])
    table.index(['status'])
    table.index(['started_at'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('negotiations')
}