exports.up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.string('id').primary()
    table.string('email').unique().notNullable()
    table.string('username').unique().notNullable()
    table.string('password_hash').notNullable()
    table.string('first_name').notNullable()
    table.string('last_name').notNullable()
    table.boolean('email_verified').defaultTo(false)
    table.string('verification_token')
    table.timestamp('last_login')
    table.timestamps(true, true)
    
    table.index(['email'])
    table.index(['username'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('users')
}