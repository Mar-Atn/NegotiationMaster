exports.up = function (knex) {
  return knex.schema.createTable('negotiations', function (table) {
    table.string('id').primary()
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.string('scenario_id').references('id').inTable('scenarios').onDelete('CASCADE')
    table.string('status', ['in_progress', 'completed', 'abandoned']).defaultTo('in_progress')
    table.timestamp('started_at').defaultTo(knex.fn.now())
    table.timestamp('completed_at')
    table.text('deal_terms') // JSON string - Final deal if completed
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