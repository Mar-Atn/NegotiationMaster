exports.up = function (knex) {
  return knex.schema.createTable('messages', function (table) {
    table.string('id').primary()
    table.string('negotiation_id').references('id').inTable('negotiations').onDelete('CASCADE')
    table.string('sender_type').notNullable() // 'user' or 'ai'
    table.text('content').notNullable()
    table.text('metadata') // JSON string - Additional data like AI reasoning, message type
    table.timestamp('sent_at').defaultTo(knex.fn.now())
    table.timestamps(true, true)
    
    table.index(['negotiation_id'])
    table.index(['sender_type'])
    table.index(['sent_at'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('messages')
}