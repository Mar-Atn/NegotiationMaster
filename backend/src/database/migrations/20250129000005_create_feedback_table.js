exports.up = function (knex) {
  return knex.schema.createTable('feedback', function (table) {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'))
    table.uuid('negotiation_id').references('id').inTable('negotiations').onDelete('CASCADE')
    table.integer('claiming_value_score').notNullable() // 1-100
    table.integer('creating_value_score').notNullable() // 1-100
    table.integer('managing_relationships_score').notNullable() // 1-100
    table.integer('overall_score').notNullable() // 1-100
    table.text('claiming_value_feedback')
    table.text('creating_value_feedback')
    table.text('managing_relationships_feedback')
    table.text('overall_feedback')
    table.json('detailed_analysis') // Structured feedback data
    table.timestamps(true, true)
    
    table.index(['negotiation_id'])
    table.index(['overall_score'])
  })
}

exports.down = function (knex) {
  return knex.schema.dropTable('feedback')
}