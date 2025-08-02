exports.up = function (knex) {
  return knex.schema.createTable('refresh_tokens', function (table) {
    table.string('id').primary()
    table.string('user_id').references('id').inTable('users').onDelete('CASCADE')
    table.string('token_hash').notNullable()
    table.timestamp('expires_at').notNullable()
    table.boolean('is_revoked').defaultTo(false)
    table.string('device_info')
    table.timestamps(true, true)
    
    table.index(['user_id'])
    table.index(['token_hash'])
    table.index(['expires_at'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('refresh_tokens')
}