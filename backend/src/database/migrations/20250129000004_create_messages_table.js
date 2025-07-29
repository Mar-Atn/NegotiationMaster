exports.up = function (knex) {
  return knex.schema.createTable('messages', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('negotiation_id').references('id').inTable('negotiations').onDelete('CASCADE')
    table.enum('sender_type', ['user', 'ai']).notNullable()
    table.text('content').notNullable()
    table.json('metadata') // Additional data like AI reasoning, message type
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